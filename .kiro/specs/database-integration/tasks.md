# Implementation Plan: Database Integration

## Overview

Replace the `localStorage`-only `usePersistentState` hook with a Supabase-backed offline-first sync layer. The implementation adds `AuthContext`, `AuthModal`, `SyncQueue`, `mergeCollections`, `useSupabaseSync`, and `TradeMatchingService` while keeping all existing components and state shapes unchanged.

## Tasks

- [x] 1. Install dependencies and configure Supabase client
  - Add `@supabase/supabase-js` and `fast-check` (dev) to `package.json`
  - Create `src/lib/supabaseClient.js` that initialises and exports the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars
  - Create `.env.example` documenting the two required env vars
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Create Supabase database schema and RLS policies
  - [x] 2.1 Write SQL migration for `profiles`, `collections`, `trades`, and `collection_snapshots` tables
    - Include all columns, constraints, and check constraints exactly as specified in the design
    - Save as `supabase/migrations/001_initial_schema.sql`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 2.2 Write SQL migration for Row-Level Security policies
    - Enable RLS on all four tables
    - `profiles`, `collections`, `trades`: owner-only read/write
    - `collection_snapshots`: all authenticated users can read; owner-only write
    - Save as `supabase/migrations/002_rls_policies.sql`
    - _Requirements: 7.5, 7.6_

- [ ] 3. Implement `mergeCollections` algorithm
  - [x] 3.1 Create `src/utils/mergeCollections.js` implementing the max-wins merge
    - Accept two `Collection` objects (either may be `{}`)
    - Return a new object where each sticker ID maps to `Math.max(local[id] ?? 0, remote[id] ?? 0)`
    - Do not mutate either input
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x]* 3.2 Write property tests for `mergeCollections` using fast-check
    - **Property 7: mergeCollections — no data loss (max-wins)** — `mergeCollections(A, B)[id] >= A[id]` for all `id` in `A`
    - **Validates: Requirements 6.2, 6.3**
    - **Property 8: mergeCollections — commutativity** — `mergeCollections(A, B)` equals `mergeCollections(B, A)`
    - **Validates: Requirements 6.6**
    - **Property 9: mergeCollections — idempotency** — `mergeCollections(A, A)` equals `A`
    - **Validates: Requirements 6.5**
    - **Property 10: mergeCollections — no mutation** — inputs unchanged after call
    - **Validates: Requirements 6.4**
    - Save as `src/utils/mergeCollections.test.js`

- [ ] 4. Implement `SyncQueue`
  - [x] 4.1 Create `src/lib/SyncQueue.js` with `enqueue`, `flush`, `clear`, and `size` methods
    - Persist entries under `panini2026-sync-queue` in localStorage
    - `enqueue` generates a UUID and ISO timestamp; deduplicates by `(table, userId)`
    - `flush` iterates entries in order, upserts via the provided Supabase client, removes successes, stops on first network error, then persists the updated queue
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x]* 4.2 Write property tests for `SyncQueue` using fast-check
    - **Property 11: SyncQueue deduplication** — enqueueing two entries for the same `(table, userId)` leaves exactly one entry with the second payload
    - **Validates: Requirements 5.3**
    - **Property 12: SyncQueue size invariant** — `size()` equals enqueued count minus successfully flushed count
    - **Validates: Requirements 5.7**
    - **Property 13: SyncQueue flush persists state** — after flush, localStorage matches in-memory queue
    - **Validates: Requirements 5.6**
    - Save as `src/lib/SyncQueue.test.js`

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement `AuthContext` and `useAuth` hook
  - [x] 6.1 Create `src/context/AuthContext.jsx`
    - Call `supabase.auth.getSession()` on mount; set `isLoading` to `false` once complete
    - Subscribe to `supabase.auth.onAuthStateChange` and update `session` on every event
    - Expose `session`, `user`, `isLoading`, `signIn`, `signUp`, `signOut`, `signInWithOAuth` via context
    - `signUp` creates a row in `profiles` after successful auth
    - Handle silent re-auth on session expiry; set `session` to `null` if it fails
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9, 9.4_
  - [x] 6.2 Create `src/context/useAuth.js` — thin hook that reads from `AuthContext`
    - _Requirements: 2.7_

- [ ] 7. Implement `AuthModal` UI component
  - [x] 7.1 Create `src/components/AuthModal.jsx`
    - Render email input, password input, submit button, and Google OAuth button when `isOpen` is `true`
    - Support toggling between `'sign-in'` and `'sign-up'` modes
    - Show loading indicator and disable submit while request is in flight
    - Display inline error messages for invalid credentials or network failures
    - Respect `initialMode` prop; call `onClose` without submitting on dismiss
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.4, 2.5_

- [ ] 8. Implement `useSupabaseSync` hook
  - [x] 8.1 Create `src/hooks/useSupabaseSync.js`
    - Accept `(key, defaultValue, options?)` — same signature as `usePersistentState` plus optional `SyncOptions`
    - Initialise state synchronously from localStorage (no flicker)
    - When authenticated and online: fetch remote state, merge via `mergeFn` or `mergeStrategy`, write merged state back to localStorage and upsert to Supabase
    - `setState` writes to localStorage immediately; debounces Supabase upsert by `debounceMs` (default 1000 ms)
    - When authenticated but offline: enqueue to `SyncQueue` instead of upsert
    - Listen to `window` online event and flush `SyncQueue` on reconnect
    - Set `syncStatus` to `'error'` on network upsert failure (enqueue); discard on auth failure
    - Subscribe to Supabase Realtime broadcast channel when authenticated; merge incoming remote changes
    - Return `[state, setState, syncStatus]`
    - _Requirements: 1.1, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 9.1, 9.2, 9.3, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3_
  - [x]* 8.2 Write property tests for `useSupabaseSync` using fast-check
    - **Property 1: Guest mode uses only localStorage** — no Supabase calls when session is null
    - **Validates: Requirements 1.1, 1.4, 12.3**
    - **Property 2: Synchronous initialization from localStorage** — initial state equals localStorage value before any async call
    - **Validates: Requirements 4.2, 9.1**
    - **Property 3: setState writes to localStorage immediately** — localStorage updated before next render
    - **Validates: Requirements 4.4**
    - **Property 4: Offline writes are enqueued, not dropped** — SyncQueue entry created when offline and authenticated
    - **Validates: Requirements 4.6, 5.1**
    - **Property 5: Custom mergeFn is always applied** — mergeFn called with local and remote values
    - **Validates: Requirements 4.8**
    - **Property 6: Merged state is written to both stores** — merged result in localStorage and Supabase after sync
    - **Validates: Requirements 9.3**
    - **Property 17: Realtime merge applies correctly** — remote Realtime change merged into local state
    - **Validates: Requirements 12.2**
    - Save as `src/hooks/useSupabaseSync.test.js`

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement bitmap serialization helpers and `TradeMatchingService`
  - [x] 10.1 Create `src/services/TradeMatchingService.js`
    - `publishCollection(userId, collection)`: encode duplicate and needs bitmaps using the existing `qrCodec` bitmap helpers and upsert to `collection_snapshots`
    - `findMatches(myCollection)`: call the `match-trades` Edge Function with the user's bitmaps; return `TradeMatch[]` sorted by `score` descending
    - Return empty array with message if user has no duplicates
    - Return empty array on Edge Function timeout
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 8.7, 10.1, 10.2, 10.5_
  - [x]* 10.2 Write property tests for bitmap round-trip and trade scoring using fast-check
    - **Property 14: Bitmap round-trip preserves sticker sets** — encode then decode duplicates/needs bitmaps returns same sticker ID sets; each bitmap is exactly 108 bytes
    - **Validates: Requirements 10.3, 10.4, 10.5**
    - **Property 15: Trade match scoring correctness** — `canGive` = caller dups ∩ candidate needs; `canGet` = candidate dups ∩ caller needs; `score = canGive.length + canGet.length`
    - **Validates: Requirements 8.2, 8.3, 8.4**
    - **Property 16: Trade match results are sorted by score** — returned list is sorted descending by `score`
    - **Validates: Requirements 8.2**
    - Save as `src/services/TradeMatchingService.test.js`

- [x] 11. Create `match-trades` Supabase Edge Function
  - Create `supabase/functions/match-trades/index.ts`
  - Validate caller JWT; reject with 401 if invalid
  - Accept caller's `dup_bitmap` and `need_bitmap` in the request body
  - Query all rows from `collection_snapshots` excluding the caller
  - For each candidate: compute `canGive` (caller dups AND candidate needs), `canGet` (candidate dups AND caller needs), and `score`
  - Filter out zero-score candidates; sort by `score` descending; join with `profiles` for `username`
  - Return JSON array of `TradeMatch` objects
  - _Requirements: 7.7, 8.3, 8.4_

- [x] 12. Wire everything into `App.jsx`
  - [x] 12.1 Wrap `App` with `AuthContext.Provider` in `src/main.jsx`
    - _Requirements: 2.7, 2.8_
  - [x] 12.2 Replace `usePersistentState` calls in `App.jsx` with `useSupabaseSync`
    - Pass `mergeFn: mergeCollections` for the collection key
    - _Requirements: 4.1, 6.1, 6.2, 6.3_
  - [x] 12.3 Add sign-in CTA and `AuthModal` to `App.jsx` (or `AlbumOverviewScreen`)
    - Show when user is a guest; open `AuthModal` on tap
    - _Requirements: 3.1, 3.2_
  - [x] 12.4 Replace mock trade data in `TradeMatchesScreen.jsx` with `TradeMatchingService.findMatches`
    - Call `publishCollection` when collection changes and user is authenticated
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The design uses JavaScript (React/Vite); all implementation files use `.js` / `.jsx`
- Property tests use `fast-check` and should be run with `vitest --run`
- The Supabase local dev stack (`supabase start`) is required for integration testing
