-- Migration: 002_rls_policies
-- Enables Row-Level Security on all four tables and defines access policies.
--
-- Policy summary:
--   profiles            : owner-only read/write  (auth.uid() = id)
--   collections         : owner-only read/write  (auth.uid() = user_id)
--   trades              : owner-only read/write  (auth.uid() = user_id)
--   collection_snapshots: any authenticated user can read;
--                         owner-only write       (auth.uid() = user_id)
--
-- Validates: Requirements 7.5, 7.6

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────
alter table profiles enable row level security;

create policy "profiles: owner can select"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can insert"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner can update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: owner can delete"
  on profiles for delete
  using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- collections
-- ─────────────────────────────────────────────
alter table collections enable row level security;

create policy "collections: owner can select"
  on collections for select
  using (auth.uid() = user_id);

create policy "collections: owner can insert"
  on collections for insert
  with check (auth.uid() = user_id);

create policy "collections: owner can update"
  on collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collections: owner can delete"
  on collections for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- trades
-- ─────────────────────────────────────────────
alter table trades enable row level security;

create policy "trades: owner can select"
  on trades for select
  using (auth.uid() = user_id);

create policy "trades: owner can insert"
  on trades for insert
  with check (auth.uid() = user_id);

create policy "trades: owner can update"
  on trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "trades: owner can delete"
  on trades for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- collection_snapshots
-- ─────────────────────────────────────────────
alter table collection_snapshots enable row level security;

-- Any authenticated user can read snapshots (needed for trade matching)
create policy "collection_snapshots: authenticated users can select"
  on collection_snapshots for select
  using (auth.role() = 'authenticated');

-- Only the owner can write their own snapshot
create policy "collection_snapshots: owner can insert"
  on collection_snapshots for insert
  with check (auth.uid() = user_id);

create policy "collection_snapshots: owner can update"
  on collection_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collection_snapshots: owner can delete"
  on collection_snapshots for delete
  using (auth.uid() = user_id);
