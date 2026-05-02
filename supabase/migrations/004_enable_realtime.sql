-- Migration: 004_enable_realtime
-- Enable Supabase Realtime publication for the collections table so that
-- Postgres Changes subscriptions in useSupabaseSync receive row-level events.
--
-- Without this, the realtime channel subscribes successfully but never fires.

alter publication supabase_realtime add table collections;
