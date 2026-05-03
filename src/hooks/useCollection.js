/**
 * useCollection — manages the sticker collection.
 *
 * Authenticated users: reads from and writes directly to Supabase.
 *   - Fetches all rows on mount
 *   - Upserts on every change (debounced 800ms)
 *   - No localStorage, no merge logic, no sync queue
 *
 * Guest users: plain in-memory state, no persistence.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/useAuth.js';
import { supabase } from '../lib/supabaseClient.js';

const DEBOUNCE_MS = 800;
const VALID_STICKER_ID = /^[A-Z]{2,4}-\d{2}$/;

function rowsToCollection(rows) {
  const col = {};
  for (const row of rows) col[row.sticker_id] = row.quantity;
  return col;
}

function collectionToRows(collection, userId) {
  return Object.entries(collection)
    .filter(([id]) => VALID_STICKER_ID.test(id))
    .map(([sticker_id, quantity]) => ({ user_id: userId, sticker_id, quantity }));
}

export default function useCollection() {
  const { user } = useAuth();
  const [collection, setCollectionState] = useState({});
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);
  // Always keep a ref to the latest user so persist() never has a stale closure
  const userRef = useRef(user);
  userRef.current = user;

  // Fetch from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setCollectionState({});
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('collections')
      .select('sticker_id, quantity')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setCollectionState(rowsToCollection(data));
        setLoading(false);
      });
  }, [user?.id]);

  // Upsert to Supabase (debounced)
  const persist = useCallback((next, userId) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const rows = collectionToRows(next, userId);
      if (rows.length === 0) return;
      const { error } = await supabase
        .from('collections')
        .upsert(rows, { onConflict: 'user_id,sticker_id', ignoreDuplicates: false });
      if (error) {
        // Surface upsert errors so they're visible in DevTools console
        console.error('[useCollection] upsert failed:', error.message, error);
      }
    }, DEBOUNCE_MS);
  }, []);

  const setSticker = useCallback((id, qty) => {
    setCollectionState(prev => {
      const next = { ...prev, [id]: Math.max(0, qty) };
      const currentUser = userRef.current;
      if (currentUser) persist(next, currentUser.id);
      return next;
    });
  }, [persist]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return { collection, setSticker, loading };
}
