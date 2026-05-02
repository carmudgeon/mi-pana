/**
 * match-trades — Supabase Edge Function
 *
 * Finds trade partners for the authenticated caller by comparing their
 * duplicate/needs bitmaps against all other users' snapshots.
 *
 * Request body (JSON):
 *   { dup_bitmap: number[], need_bitmap: number[] }
 *   Each array is 108 numbers (one byte per element, 864 sticker bits total).
 *
 * Response (JSON):
 *   TradeMatch[]  — sorted by score descending, zero-score candidates excluded
 *
 * Requirements: 7.7, 8.3, 8.4
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Sticker ID ordering (mirrors qrCodec.js) ────────────────────────────────

const TEAMS = [
  'BRA', 'ARG', 'FRA', 'MEX', 'USA', 'ESP', 'CAN', 'COL', 'GER', 'ENG',
  'POR', 'NED', 'URU', 'CRO', 'MAR', 'JPN', 'KOR', 'SEN', 'ECU', 'SUI',
  'NOR', 'PAN', 'PAR', 'CUW', 'HAI', 'BEL', 'AUT', 'SCO', 'SWE', 'TUR',
  'CZE', 'BIH', 'ALG', 'CPV', 'EGY', 'GHA', 'CIV', 'RSA', 'TUN', 'COD',
  'AUS', 'IRN', 'JOR', 'KSA', 'QAT', 'UZB', 'IRQ', 'NZL',
]

const STICKERS_PER_TEAM = 18
const TOTAL_BITS = TEAMS.length * STICKERS_PER_TEAM  // 864
const BYTES_PER_MAP = Math.ceil(TOTAL_BITS / 8)       // 108

/**
 * Convert a bit index (0-based) to a sticker ID string.
 * Mirrors bitIndexToId() in qrCodec.js.
 */
function bitIndexToId(bitIdx: number): string {
  const teamIdx = Math.floor(bitIdx / STICKERS_PER_TEAM)
  const num = (bitIdx % STICKERS_PER_TEAM) + 1
  return `${TEAMS[teamIdx]}-${String(num).padStart(2, '0')}`
}

/**
 * Compute the intersection of two bitmaps and return the sticker IDs
 * corresponding to bits that are set in BOTH bitmaps.
 *
 * @param bitmapA - 108-byte array
 * @param bitmapB - 108-byte array
 * @returns Array of sticker ID strings
 */
function bitmapIntersectionIds(bitmapA: number[], bitmapB: number[]): string[] {
  const ids: string[] = []
  for (let byteIdx = 0; byteIdx < BYTES_PER_MAP; byteIdx++) {
    const intersection = (bitmapA[byteIdx] ?? 0) & (bitmapB[byteIdx] ?? 0)
    if (intersection === 0) continue
    for (let bit = 0; bit < 8; bit++) {
      if (intersection & (1 << (7 - bit))) {
        const bitIdx = byteIdx * 8 + bit
        if (bitIdx < TOTAL_BITS) {
          ids.push(bitIndexToId(bitIdx))
        }
      }
    }
  }
  return ids
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TradeMatch {
  userId: string
  username: string
  canGive: string[]
  canGet: string[]
  score: number
}

interface CollectionSnapshot {
  user_id: string
  dup_bitmap: number[]
  need_bitmap: number[]
}

interface Profile {
  id: string
  username: string
}

// ─── CORS headers ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── 1. Validate caller JWT (Req 7.7) ────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid Authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const jwt = authHeader.replace('Bearer ', '')

  // Use the anon key client to verify the JWT by calling getUser()
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  // Verify the caller's JWT using the anon client
  const anonClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })

  const { data: { user: callerUser }, error: authError } = await anonClient.auth.getUser()

  if (authError || !callerUser) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired JWT' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const callerId = callerUser.id

  // ── 2. Parse request body ────────────────────────────────────────────────────
  let body: { dup_bitmap?: unknown; need_bitmap?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { dup_bitmap, need_bitmap } = body

  if (
    !Array.isArray(dup_bitmap) ||
    !Array.isArray(need_bitmap) ||
    dup_bitmap.length !== BYTES_PER_MAP ||
    need_bitmap.length !== BYTES_PER_MAP
  ) {
    return new Response(
      JSON.stringify({
        error: `dup_bitmap and need_bitmap must each be arrays of ${BYTES_PER_MAP} numbers`,
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const callerDupBitmap = dup_bitmap as number[]
  const callerNeedBitmap = need_bitmap as number[]

  // ── 3. Query all snapshots excluding the caller (service role bypasses RLS) ──
  const serviceClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: snapshots, error: snapshotError } = await serviceClient
    .from('collection_snapshots')
    .select('user_id, dup_bitmap, need_bitmap')
    .neq('user_id', callerId)

  if (snapshotError) {
    return new Response(
      JSON.stringify({ error: `Failed to query snapshots: ${snapshotError.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!snapshots || snapshots.length === 0) {
    return new Response(
      JSON.stringify([]),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // ── 4. Score each candidate ──────────────────────────────────────────────────
  const scored: Array<{ userId: string; canGive: string[]; canGet: string[]; score: number }> = []

  for (const snapshot of snapshots as CollectionSnapshot[]) {
    const candidateDupBitmap = snapshot.dup_bitmap
    const candidateNeedBitmap = snapshot.need_bitmap

    // canGive: stickers caller can give = caller dups ∩ candidate needs (Req 8.3)
    const canGive = bitmapIntersectionIds(callerDupBitmap, candidateNeedBitmap)

    // canGet: stickers caller can get = candidate dups ∩ caller needs (Req 8.4)
    const canGet = bitmapIntersectionIds(candidateDupBitmap, callerNeedBitmap)

    const score = canGive.length + canGet.length

    // Filter out zero-score candidates
    if (score > 0) {
      scored.push({ userId: snapshot.user_id, canGive, canGet, score })
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return new Response(
      JSON.stringify([]),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // ── 5. Join with profiles for username ───────────────────────────────────────
  const userIds = scored.map(s => s.userId)

  const { data: profiles, error: profilesError } = await serviceClient
    .from('profiles')
    .select('id, username')
    .in('id', userIds)

  if (profilesError) {
    return new Response(
      JSON.stringify({ error: `Failed to query profiles: ${profilesError.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const profileMap = new Map<string, string>()
  for (const profile of (profiles ?? []) as Profile[]) {
    profileMap.set(profile.id, profile.username)
  }

  // ── 6. Build and return TradeMatch array ─────────────────────────────────────
  const matches: TradeMatch[] = scored.map(s => ({
    userId: s.userId,
    username: profileMap.get(s.userId) ?? 'Unknown',
    canGive: s.canGive,
    canGet: s.canGet,
    score: s.score,
  }))

  return new Response(
    JSON.stringify(matches),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
