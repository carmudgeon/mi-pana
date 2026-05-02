import { supabase as defaultSupabase } from '../lib/supabaseClient.js';
import * as qrCodec from '../utils/qrCodec.js';

// Timeout for the match-trades Edge Function call (ms)
const EDGE_FUNCTION_TIMEOUT_MS = 10_000;

/**
 * Encodes a collection into separate duplicate and needs bitmaps (Uint8Array, 108 bytes each).
 *
 * Duplicates: stickers with quantity >= 2 (the user has extras to trade)
 * Needs:      stickers with quantity === 0 (the user is missing these)
 *
 * Reuses qrCodec.encode which produces a combined payload of 216 bytes
 * (first 108 = dup bitmap, next 108 = need bitmap).
 *
 * @param {Record<string, number>} collection
 * @returns {{ dupBitmap: Uint8Array, needBitmap: Uint8Array } | null}
 *   null when the collection has neither duplicates nor needs (fully complete, no extras)
 */
function encodeBitmaps(collection) {
  const payload = qrCodec.encode(collection);
  if (!payload) return null;

  // payload format: "MP26:T:<base64url of 216 bytes>"
  const parts = payload.split(':');
  if (parts.length < 3) return null;

  const b64url = parts.slice(2).join(':');
  // Convert base64url → base64
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';

  let raw;
  try {
    raw = atob(b64);
  } catch {
    return null;
  }

  const BYTES_PER_MAP = 108;
  if (raw.length < BYTES_PER_MAP * 2) return null;

  const dupBitmap = new Uint8Array(BYTES_PER_MAP);
  const needBitmap = new Uint8Array(BYTES_PER_MAP);
  for (let i = 0; i < BYTES_PER_MAP; i++) {
    dupBitmap[i] = raw.charCodeAt(i);
    needBitmap[i] = raw.charCodeAt(BYTES_PER_MAP + i);
  }

  return { dupBitmap, needBitmap };
}

/**
 * Checks whether the user has any duplicate stickers (quantity >= 2).
 *
 * @param {Record<string, number>} collection
 * @returns {boolean}
 */
function hasDuplicates(collection) {
  return Object.values(collection).some(qty => qty >= 2);
}

export class TradeMatchingService {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} [supabase]
   *   Optional Supabase client — defaults to the shared singleton. Accepts a
   *   custom client for testing.
   */
  constructor(supabase) {
    this._supabase = supabase ?? defaultSupabase;
  }

  /**
   * Encodes the user's collection into duplicate and needs bitmaps and upserts
   * them into the `collection_snapshots` table so other users can discover this
   * user as a trade partner.
   *
   * Duplicates: stickers with quantity >= 2
   * Needs:      stickers with quantity === 0
   *
   * @param {string} userId
   * @param {Record<string, number>} collection
   * @returns {Promise<void>}
   */
  async publishCollection(userId, collection) {
    const bitmaps = encodeBitmaps(collection);

    // If there are no duplicates and no needs, upsert zero-filled bitmaps so
    // the snapshot row exists but signals nothing to trade.
    const BYTES_PER_MAP = 108;
    const dupBitmap = bitmaps?.dupBitmap ?? new Uint8Array(BYTES_PER_MAP);
    const needBitmap = bitmaps?.needBitmap ?? new Uint8Array(BYTES_PER_MAP);

    const { error } = await this._supabase
      .from('collection_snapshots')
      .upsert(
        {
          user_id: userId,
          dup_bitmap: Array.from(dupBitmap),
          need_bitmap: Array.from(needBitmap),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      throw new Error(`publishCollection failed: ${error.message}`);
    }
  }

  /**
   * Calls the `match-trades` Edge Function with the user's bitmaps and returns
   * a list of trade matches sorted by score descending.
   *
   * Returns an empty array (with an explanatory `message` property) when:
   *   - The user has no duplicate stickers (Req 8.7)
   *   - The Edge Function times out (Req 8.6)
   *
   * @param {Record<string, number>} myCollection
   * @returns {Promise<Array<{userId: string, username: string, canGive: string[], canGet: string[], score: number, message?: string}>>}
   */
  async findMatches(myCollection) {
    // Req 8.7 — no duplicates → return empty with message
    if (!hasDuplicates(myCollection)) {
      const empty = [];
      empty.message = 'No tienes figuritas repetidas para intercambiar.';
      return empty;
    }

    const bitmaps = encodeBitmaps(myCollection);
    if (!bitmaps) {
      const empty = [];
      empty.message = 'No se pudo codificar tu colección.';
      return empty;
    }

    const supabaseUrl = this._getSupabaseUrl();
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/match-trades`;

    // Retrieve the current session token to authenticate the Edge Function call
    const {
      data: { session },
    } = await this._supabase.auth.getSession();

    const headers = {
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Req 8.6 — timeout → return empty array
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        EDGE_FUNCTION_TIMEOUT_MS
      );

      response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dup_bitmap: Array.from(bitmaps.dupBitmap),
          need_bitmap: Array.from(bitmaps.needBitmap),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (err) {
      // AbortError = timeout; any other fetch error also returns empty
      const empty = [];
      empty.message =
        err.name === 'AbortError'
          ? 'La búsqueda tardó demasiado. Intenta de nuevo.'
          : 'Error al conectar con el servidor.';
      return empty;
    }

    if (!response.ok) {
      const empty = [];
      empty.message = `Error del servidor: ${response.status}`;
      return empty;
    }

    let matches;
    try {
      matches = await response.json();
    } catch {
      const empty = [];
      empty.message = 'Respuesta inválida del servidor.';
      return empty;
    }

    if (!Array.isArray(matches)) {
      const empty = [];
      empty.message = 'Respuesta inválida del servidor.';
      return empty;
    }

    // Req 8.2 — sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Resolves the Supabase project URL from the client instance.
   * Falls back to the VITE env var when running in a browser context.
   *
   * @returns {string}
   */
  _getSupabaseUrl() {
    // The Supabase JS client exposes the URL via supabaseUrl property
    if (this._supabase.supabaseUrl) {
      return this._supabase.supabaseUrl;
    }
    // Fallback for environments where the property isn't directly accessible
    return import.meta.env?.VITE_SUPABASE_URL ?? '';
  }
}

// Default singleton instance using the shared Supabase client
export default new TradeMatchingService();
