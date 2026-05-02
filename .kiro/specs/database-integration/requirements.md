# Requirements Document

## Introduction

This document captures the requirements for the Mi Pana database integration feature. The feature replaces the current `localStorage`-only persistence with a Supabase-backed sync layer, enabling user accounts, cross-device collection sync, and real-user trade matching — while preserving full offline functionality and identical behavior for unauthenticated (guest) users.

## Glossary

- **App**: The Mi Pana React application
- **AuthContext**: The React context that manages Supabase session state and exposes auth actions
- **AuthModal**: The UI component that presents sign-in and sign-up forms
- **Collection**: A `Record<string, number>` mapping sticker IDs to owned quantities
- **Guest**: An unauthenticated user with no Supabase session
- **SyncQueue**: The localStorage-backed queue that persists pending Supabase writes across page reloads
- **SyncStatus**: The sync state indicator: `'idle' | 'syncing' | 'error' | 'offline'`
- **TradeMatchingService**: The client-side service that calls the Supabase Edge Function to find real trade partners
- **useSupabaseSync**: The React hook that replaces `usePersistentState` and adds Supabase sync on top of localStorage
- **mergeCollections**: The algorithm that combines a local and remote Collection using max-wins semantics
- **Edge_Function**: The Supabase Edge Function `match-trades` that scores trade matches server-side
- **Snapshot**: A row in `collection_snapshots` containing the user's duplicate and needs bitmaps for trade discovery

---

## Requirements

### Requirement 1: Guest Mode Parity

**User Story:** As a guest user, I want the app to work exactly as it does today without signing in, so that I am not forced to create an account to use the core features.

#### Acceptance Criteria

1. WHILE no Supabase session exists, THE useSupabaseSync SHALL read and write state exclusively from localStorage, with no network requests to Supabase
2. WHILE no Supabase session exists, THE App SHALL render all screens (album, team detail, trade matches, full grid) without degradation
3. WHILE no Supabase session exists, THE useSupabaseSync SHALL return a SyncStatus of `'idle'`
4. WHEN a guest user modifies the collection, THE useSupabaseSync SHALL persist the change to localStorage immediately without enqueuing a SyncQueue entry

---

### Requirement 2: Authentication — Sign-Up and Sign-In

**User Story:** As a new or returning user, I want to create an account or sign in with email/password or Google OAuth, so that my collection is backed up and synced across devices.

#### Acceptance Criteria

1. WHEN a user submits valid email and password in sign-up mode, THE AuthContext SHALL call `supabase.auth.signUp` and create a profile row in the `profiles` table
2. WHEN a user submits valid email and password in sign-in mode, THE AuthContext SHALL call `supabase.auth.signInWithPassword` and establish a session
3. WHEN a user taps the Google OAuth button, THE AuthContext SHALL call `supabase.auth.signInWithOAuth` with provider `'google'`
4. IF sign-in credentials are invalid, THEN THE AuthModal SHALL display an inline error message without navigating away
5. IF the network is unavailable during sign-in, THEN THE AuthModal SHALL display an offline error message
6. WHEN a user signs out, THE AuthContext SHALL call `supabase.auth.signOut` and clear the session
7. THE AuthContext SHALL expose `session`, `user`, `isLoading`, `signIn`, `signUp`, `signOut`, and `signInWithOAuth` to all descendant components via React context
8. WHEN the App mounts, THE AuthContext SHALL call `supabase.auth.getSession()` and set `isLoading` to `false` once the session check completes
9. THE AuthContext SHALL subscribe to `supabase.auth.onAuthStateChange` and update the exposed session on every auth event

---

### Requirement 3: AuthModal UI

**User Story:** As a user, I want a modal dialog to sign in or sign up, so that I can authenticate without leaving the current screen.

#### Acceptance Criteria

1. WHEN `isOpen` is `true`, THE AuthModal SHALL render an email input, a password input, and a submit button
2. WHEN `isOpen` is `true`, THE AuthModal SHALL render a Google OAuth button
3. THE AuthModal SHALL support toggling between `'sign-in'` and `'sign-up'` modes within the same modal
4. WHILE a sign-in or sign-up request is in flight, THE AuthModal SHALL display a loading indicator and disable the submit button
5. WHEN `onClose` is called, THE AuthModal SHALL unmount or hide without submitting any form data
6. WHERE the `initialMode` prop is provided, THE AuthModal SHALL open in that mode

---

### Requirement 4: useSupabaseSync Hook

**User Story:** As a developer, I want a drop-in replacement for `usePersistentState` that transparently adds Supabase sync, so that existing components require no changes.

#### Acceptance Criteria

1. THE useSupabaseSync SHALL accept the same `key` and `defaultValue` arguments as `usePersistentState` and return a tuple of `[state, setState, syncStatus]`
2. WHEN useSupabaseSync mounts, THE useSupabaseSync SHALL initialize `state` synchronously from localStorage before any Supabase network call
3. WHEN a user is authenticated and online, THE useSupabaseSync SHALL fetch the remote state from Supabase after mount and merge it with the local state using the configured merge strategy
4. WHEN `setState` is called, THE useSupabaseSync SHALL write the new state to localStorage immediately
5. WHEN `setState` is called and the user is authenticated and online, THE useSupabaseSync SHALL schedule a debounced upsert to Supabase with a default delay of 1000 ms
6. WHEN `setState` is called and the user is authenticated but offline, THE useSupabaseSync SHALL enqueue a SyncQueueEntry instead of attempting a Supabase upsert
7. WHEN the `window` online event fires, THE useSupabaseSync SHALL trigger a SyncQueue flush
8. WHERE a `mergeFn` option is provided, THE useSupabaseSync SHALL use that function to merge local and remote state; otherwise THE useSupabaseSync SHALL use the configured `mergeStrategy`
9. WHEN a Supabase upsert fails due to a network error, THE useSupabaseSync SHALL set SyncStatus to `'error'` and enqueue the write to SyncQueue
10. WHEN a Supabase upsert fails due to an auth error, THE useSupabaseSync SHALL set SyncStatus to `'error'` and discard the queue entry

---

### Requirement 5: SyncQueue

**User Story:** As a user working offline, I want my sticker updates to be saved and automatically synced when I reconnect, so that I never lose changes made without internet access.

#### Acceptance Criteria

1. THE SyncQueue SHALL persist all entries in localStorage under the key `panini2026-sync-queue`
2. WHEN `enqueue` is called with a new entry, THE SyncQueue SHALL store the entry with a generated UUID and an ISO timestamp
3. WHEN `enqueue` is called for a `(table, userId)` pair that already has a pending entry, THE SyncQueue SHALL replace the existing entry with the new one (deduplication)
4. WHEN `flush` is called, THE SyncQueue SHALL attempt each entry in insertion order and remove successfully upserted entries from the queue
5. WHEN `flush` encounters a network error on any entry, THE SyncQueue SHALL stop processing and persist the remaining entries for the next flush
6. WHEN `flush` completes, THE SyncQueue SHALL persist the updated queue to localStorage
7. THE SyncQueue SHALL expose a `size()` method returning the current number of pending entries

---

### Requirement 6: Collection Merge Algorithm

**User Story:** As a user who uses the app on multiple devices, I want my sticker counts to be merged intelligently when I sync, so that I never lose stickers I have marked on any device.

#### Acceptance Criteria

1. THE mergeCollections SHALL accept two Collection arguments (either may be empty) and return a new Collection
2. FOR ALL sticker IDs present in either input, THE mergeCollections SHALL include that sticker ID in the result
3. FOR ALL sticker IDs, THE mergeCollections SHALL set the result quantity to `Math.max(local[id] ?? 0, remote[id] ?? 0)`
4. THE mergeCollections SHALL not mutate either input Collection
5. WHEN both inputs are identical Collections, THE mergeCollections SHALL return a Collection equal to the input (idempotency)
6. THE mergeCollections SHALL produce the same result regardless of argument order (commutativity)

---

### Requirement 7: Supabase Schema and Row-Level Security

**User Story:** As a system operator, I want the database schema to enforce data ownership and enable efficient trade matching, so that users can only access their own data and trade discovery is performant.

#### Acceptance Criteria

1. THE App SHALL maintain a `profiles` table with columns `id` (uuid, PK, references `auth.users`), `username` (text, unique), and `created_at`
2. THE App SHALL maintain a `collections` table with a unique constraint on `(user_id, sticker_id)` and a `quantity` column with a `>= 0` check constraint
3. THE App SHALL maintain a `trades` table with a `status` column constrained to `'open'`, `'accepted'`, or `'rejected'`
4. THE App SHALL maintain a `collection_snapshots` table storing `dup_bitmap` and `need_bitmap` as `bytea` columns of exactly 108 bytes each
5. THE App SHALL enable Row-Level Security on all four tables so that each user can only read and write their own `profiles`, `collections`, and `trades` rows
6. THE App SHALL configure the `collection_snapshots` table so that all authenticated users can read any snapshot but only the owner can write their own snapshot
7. THE Edge_Function SHALL validate the caller's JWT before querying `collection_snapshots`

---

### Requirement 8: Trade Matching Service

**User Story:** As a user, I want to discover real trade partners who have stickers I need and need stickers I have, so that I can arrange mutually beneficial trades.

#### Acceptance Criteria

1. WHEN `findMatches` is called with a Collection, THE TradeMatchingService SHALL call the `match-trades` Edge Function with the user's duplicate and needs bitmaps
2. THE TradeMatchingService SHALL return a list of TradeMatch objects sorted by `score` descending, where `score = canGive.length + canGet.length`
3. THE Edge_Function SHALL compute `canGive` as the intersection of the caller's duplicate bitmap and the candidate's needs bitmap
4. THE Edge_Function SHALL compute `canGet` as the intersection of the candidate's duplicate bitmap and the caller's needs bitmap
5. WHEN `publishCollection` is called, THE TradeMatchingService SHALL upsert the user's `dup_bitmap` and `need_bitmap` in `collection_snapshots`
6. IF the Edge Function times out, THEN THE TradeMatchingService SHALL return an empty array
7. IF the user has no duplicate stickers, THEN THE TradeMatchingService SHALL return an empty array with an explanatory message

---

### Requirement 9: App Startup and Sync Flow

**User Story:** As an authenticated user, I want my collection to load instantly from local storage and then sync with the server in the background, so that the app feels fast and my data stays up to date.

#### Acceptance Criteria

1. WHEN the App mounts, THE App SHALL render immediately using data from localStorage before any Supabase response is received
2. WHEN the App mounts and a valid session exists, THE useSupabaseSync SHALL fetch remote state and merge it with local state within one render cycle after the session is confirmed
3. WHEN the merged state differs from the local state, THE useSupabaseSync SHALL write the merged state back to localStorage and upsert it to Supabase
4. WHEN a session expires, THE AuthContext SHALL attempt a silent re-authentication; IF re-authentication fails, THEN THE AuthContext SHALL set `session` to `null` and prompt the user to sign in

---

### Requirement 10: Bitmap Serialization for Trade Discovery

**User Story:** As a developer, I want the collection snapshot bitmaps to reuse the existing QR codec format, so that no new serialization logic is needed and the encoding is consistent.

#### Acceptance Criteria

1. THE TradeMatchingService SHALL encode duplicate sticker IDs using the same bitmap format as `qrCodec.encode`
2. THE TradeMatchingService SHALL encode missing sticker IDs using the same bitmap format as `qrCodec.encode`
3. FOR ALL valid Collections, encoding then decoding the duplicate bitmap SHALL produce the same set of sticker IDs (round-trip property)
4. FOR ALL valid Collections, encoding then decoding the needs bitmap SHALL produce the same set of sticker IDs (round-trip property)
5. THE collection_snapshots bitmaps SHALL each be exactly 108 bytes, matching `BYTES_PER_MAP` from `qrCodec.js`

---

### Requirement 11: Offline Resilience

**User Story:** As a user in an area with poor connectivity, I want the app to continue working normally and sync my changes automatically when connectivity is restored, so that I never lose data.

#### Acceptance Criteria

1. WHILE the device is offline, THE App SHALL allow all collection read and write operations using localStorage without displaying error states to the user
2. WHEN the device transitions from offline to online, THE useSupabaseSync SHALL automatically flush the SyncQueue without requiring user action
3. WHEN the SyncQueue is flushed successfully, THE useSupabaseSync SHALL set SyncStatus to `'idle'`
4. IF localStorage quota is exceeded during a write, THEN THE useSupabaseSync SHALL log a warning and attempt to sync directly to Supabase without a local write

---

### Requirement 12: Realtime Updates

**User Story:** As an authenticated user with the app open on multiple devices, I want collection changes made on one device to appear on other devices automatically, so that my data stays consistent.

#### Acceptance Criteria

1. WHILE a user is authenticated, THE useSupabaseSync SHALL subscribe to a Supabase Realtime broadcast channel for the user's data
2. WHEN a remote change is received via Realtime, THE useSupabaseSync SHALL merge the remote state with the current local state and update the UI
3. WHILE no session exists, THE App SHALL not establish any Supabase Realtime WebSocket connection
