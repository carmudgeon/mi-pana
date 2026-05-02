-- Migration: 001_initial_schema
-- Creates the initial database schema for Mi Pana
-- Tables: profiles, collections, trades, collection_snapshots

-- User profiles, linked 1-to-1 with Supabase Auth users
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  created_at  timestamptz default now()
);

-- Sticker collection: one row per (user, sticker) pair
create table collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  sticker_id  text not null,
  quantity    smallint not null default 1 check (quantity >= 0),
  updated_at  timestamptz default now(),
  unique (user_id, sticker_id)
);

-- Trade proposals: stickers a user can give and wants to get
create table trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  can_give    text[] not null,
  can_get     text[] not null,
  created_at  timestamptz default now(),
  status      text not null default 'open' check (status in ('open','accepted','rejected'))
);

-- Bitmap snapshots for fast trade-matching queries
create table collection_snapshots (
  user_id      uuid primary key references profiles(id) on delete cascade,
  dup_bitmap   bytea not null,
  need_bitmap  bytea not null,
  updated_at   timestamptz default now()
);
