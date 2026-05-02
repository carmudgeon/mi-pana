import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/useAuth.js';
import { syncQueue } from '../lib/SyncQueue.js';
import { supabase } from '../lib/supabaseClient.js';

/**
 * useSupabaseSync — drop-in replacement for usePersistentState that adds
 * Supabase sync on top of localStorage.
 *
 * @template T
 * @param {string} key - localStorage key (e.g. 'panini2026-collection')
 * @param {T} defaultValue - value to use when localStorage has no entry
 * @param {{ debounceMs?: number, mergeStrategy?: 'local-wins' | 'remote-wins' | 'merge-fn', mergeFn?: (local: T, remote: T) => T }} [options]
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, 'idle' | 'syncing' | 'error' | 'offline']}
 */
export default function useSupabaseSync(key, defaultValue, options = {}) {
  const { debounceMs = 1000, mergeStrategy = 'local-wins', mergeFn } = options;

  const { session } = useAuth();
  const user = session?.user ?? null;

  // ── 1. Synchronous initialisation from localStorage (Req 4.2, 9.1) ──────────
  const [state, setStateInternal] = useState(() => {
    try {
      const stored = window.localStorage?.getItem(key);
      if (stored !== null && stored !== undefined) return JSON.parse(stored);
    } catch (e) {
      console.error('[useSupabaseSync] Error loading from localStorage:', key, e);
    }
    return defaultValue;
  });

  // ── 2. Sync status ────────────────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState('idle');

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const debounceTimerRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Helpers ───────────────────────────────────────────────────────────────────

  /**
   * Write a value to localStorage. Returns true on success.
   * On quota exceeded: logs a warning and returns false (Req 11.4).
   */
  const writeLocalStorage = useCallback((value) => {
    try {
      window.localStorage?.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[useSupabaseSync] localStorage write failed (quota?):', key, e);
      return false;
    }
  }, [key]);

  /**
   * Convert a Collection (Record<string, number>) to the rows format expected
   * by the Supabase `collections` table.
   * Only includes sticker IDs that match the canonical TEAM-NN format
   * (e.g. ARG-01, USA-18) to prevent legacy or malformed IDs from being synced.
   */
  const VALID_STICKER_ID = /^[A-Z]{2,4}-\d{2}$/;
  const collectionToRows = useCallback((collection, userId) => {
    return Object.entries(collection)
      .filter(([sticker_id]) => VALID_STICKER_ID.test(sticker_id))
      .map(([sticker_id, quantity]) => ({
        user_id: userId,
        sticker_id,
        quantity,
      }));
  }, []);

  /**
   * Convert rows from the Supabase `collections` table back to a Collection.
   */
  const rowsToCollection = useCallback((rows) => {
    const collection = {};
    for (const row of rows) {
      collection[row.sticker_id] = row.quantity;
    }
    return collection;
  }, []);

  /**
   * Apply the configured merge strategy to combine local and remote state.
   */
  const applyMerge = useCallback((local, remote) => {
    if (mergeFn) return mergeFn(local, remote);
    if (mergeStrategy === 'remote-wins') return remote;
    if (mergeStrategy === 'local-wins') return local;
    // 'merge-fn' without a mergeFn falls back to local-wins
    return local;
  }, [mergeFn, mergeStrategy]);

  /**
   * Upsert all collection rows to Supabase, including quantity-0 entries
   * (soft delete — preserves history and avoids DELETE permission issues).
   * Retries once after 1.5 s on FK violation (profile row not ready yet).
   * Returns an error object or null.
   */
  const syncToSupabase = useCallback(async (nextValue, _prevValue, userId) => {
    const rows = collectionToRows(nextValue, userId);
    if (rows.length === 0) return null;

    const attempt = async () => {
      const { error } = await supabase
        .from('collections')
        .upsert(rows, { onConflict: 'user_id,sticker_id', ignoreDuplicates: false });
      return error ?? null;
    };

    let error = await attempt();

    // FK violation (23503) — profile row not ready yet, retry once
    if (error && (error.code === '23503' || error.message?.includes('foreign key'))) {
      await new Promise(r => setTimeout(r, 1500));
      error = await attempt();
    }

    return error;
  }, [collectionToRows]);

  // Convenience alias used by the mount-sync path
  const upsertToSupabase = useCallback((value, userId) => {
    return syncToSupabase(value, null, userId);
  }, [syncToSupabase]);

  /**
   * Determine whether a Supabase error is auth-related.
   */
  const isAuthError = (error) => {
    if (!error) return false;
    const code = error.code ?? '';
    const status = error.status ?? 0;
    const msg = (error.message ?? '').toLowerCase();
    return (
      status === 401 ||
      status === 403 ||
      code === 'PGRST301' ||
      msg.includes('jwt') ||
      msg.includes('auth') ||
      msg.includes('unauthorized') ||
      msg.includes('forbidden')
    );
  };

  // ── 3. Post-mount remote fetch and merge (Req 4.3, 9.2, 9.3) ─────────────────
  useEffect(() => {
    if (!user) return; // guest mode — no Supabase calls (Req 1.1, 12.3)

    let cancelled = false;

    const syncOnMount = async () => {
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');

      try {
        const { data, error } = await supabase
          .from('collections')
          .select('sticker_id, quantity')
          .eq('user_id', user.id);

        if (cancelled) return;

        if (error) {
          console.error('[useSupabaseSync] Fetch error:', error);
          setSyncStatus('error');
          return;
        }

        const remote = rowsToCollection(data ?? []);
        const local = stateRef.current;
        const merged = applyMerge(local, remote);

        // Write merged state back to localStorage and React state
        writeLocalStorage(merged);
        setStateInternal(merged);

        // Upsert merged state to Supabase (Req 9.3)
        const upsertError = await upsertToSupabase(merged, user.id);
        if (cancelled) return;

        if (upsertError) {
          setSyncStatus('error');
        } else {
          setSyncStatus('idle');
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[useSupabaseSync] Sync on mount failed:', e);
          setSyncStatus('error');
        }
      }
    };

    syncOnMount();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── 4. Realtime subscription (Req 12.1, 12.2, 12.3) ─────────────────────────
  useEffect(() => {
    if (!user) return; // no session — no Realtime (Req 12.3)

    // Debounce the re-fetch so rapid successive DB changes don't cause a
    // request storm (e.g. bulk mark-all writes fire many row events at once).
    let refetchTimer = null;

    const handleChange = () => {
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(() => {
        supabase
          .from('collections')
          .select('sticker_id, quantity')
          .eq('user_id', user.id)
          .then(({ data, error }) => {
            if (error || !data) return;
            const remote = rowsToCollection(data);
            const local = stateRef.current;
            const merged = applyMerge(local, remote);

            // Only update state if the remote data actually differs from local.
            // This breaks the upsert → change → re-fetch → upsert loop.
            if (JSON.stringify(merged) === JSON.stringify(local)) return;

            // Write merged state to localStorage and React state only —
            // do NOT upsert back to Supabase here to avoid the feedback loop.
            writeLocalStorage(merged);
            setStateInternal(merged);
          });
      }, 500); // wait 500 ms for burst of row events to settle
    };

    const channelName = `collections:${user.id}:${key}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=eq.${user.id}`,
        },
        handleChange,
      )
      .subscribe();

    return () => {
      if (refetchTimer) clearTimeout(refetchTimer);
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, key]);

  // ── 5. Online event → flush SyncQueue (Req 4.7, 11.2, 11.3) ─────────────────
  useEffect(() => {
    const handleOnline = async () => {
      if (!user) return;
      setSyncStatus('syncing');
      try {
        await syncQueue.flush(supabase);
        setSyncStatus('idle');
      } catch (e) {
        console.error('[useSupabaseSync] SyncQueue flush failed:', e);
        setSyncStatus('error');
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  // ── 6. setState — the public setter ──────────────────────────────────────────
  const setState = useCallback((valueOrUpdater) => {
    setStateInternal((prev) => {
      const next =
        typeof valueOrUpdater === 'function'
          ? valueOrUpdater(prev)
          : valueOrUpdater;

      // Write to localStorage immediately (Req 4.4)
      writeLocalStorage(next);

      if (!user) {
        // Guest mode: localStorage only, no queue entry (Req 1.4)
        return next;
      }

      if (!navigator.onLine) {
        // Offline + authenticated: enqueue (Req 4.6)
        setSyncStatus('offline');
        syncQueue.enqueue({
          table: 'collections',
          userId: user.id,
          payload: collectionToRows(next, user.id),
        });
        return next;
      }

      // Online + authenticated: debounced sync (Req 4.5)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Capture prev at schedule time so the delete diff is correct
      const prevSnapshot = prev;

      debounceTimerRef.current = setTimeout(async () => {
        setSyncStatus('syncing');
        try {
          const syncError = await syncToSupabase(next, prevSnapshot, user.id);
          if (syncError) {
            if (isAuthError(syncError)) {
              setSyncStatus('error');
            } else {
              setSyncStatus('error');
              syncQueue.enqueue({
                table: 'collections',
                userId: user.id,
                payload: collectionToRows(next, user.id),
              });
            }
          } else {
            setSyncStatus('idle');
          }
        } catch (e) {
          console.error('[useSupabaseSync] Sync failed:', e);
          setSyncStatus('error');
          syncQueue.enqueue({
            table: 'collections',
            userId: user.id,
            payload: collectionToRows(next, user.id),
          });
        }
      }, debounceMs);

      return next;
    });
  }, [user, debounceMs, writeLocalStorage, collectionToRows, syncToSupabase]);

  // ── 7. Cleanup debounce timer on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return [state, setState, syncStatus];
}
