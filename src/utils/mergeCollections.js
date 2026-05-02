/**
 * Merges two Collection objects using max-wins semantics.
 *
 * A Collection is a Record<string, number> mapping sticker IDs to owned quantities,
 * e.g. { 'ARG-01': 2, 'BRA-05': 1 }.
 *
 * For every sticker ID present in either input, the result quantity is
 * Math.max(local[id] ?? 0, remote[id] ?? 0). Neither input is mutated.
 *
 * @param {Record<string, number>} local  - Collection from localStorage (may be {})
 * @param {Record<string, number>} remote - Collection from Supabase (may be {})
 * @returns {Record<string, number>} A new merged Collection
 */
export function mergeCollections(local, remote) {
  const merged = {};

  // Copy all local entries into merged
  for (const [stickerId, qty] of Object.entries(local)) {
    merged[stickerId] = qty;
  }

  // For each remote entry, take the max of local and remote quantities
  for (const [stickerId, remoteQty] of Object.entries(remote)) {
    const localQty = merged[stickerId] ?? 0;
    merged[stickerId] = Math.max(localQty, remoteQty);
  }

  return merged;
}
