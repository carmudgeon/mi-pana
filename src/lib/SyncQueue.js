/**
 * SyncQueue — persists pending Supabase writes across page reloads.
 *
 * Entries are stored in localStorage under `panini2026-sync-queue`.
 * Deduplication is performed by (table, userId): only the latest entry
 * per pair is kept.
 *
 * Works in both browser (real localStorage) and test environments
 * (mocked localStorage passed via constructor).
 */

const STORAGE_KEY = 'panini2026-sync-queue';

export class SyncQueue {
  /**
   * @param {Storage} [storage] - localStorage-compatible storage object.
   *   Defaults to `globalThis.localStorage`. Pass a mock in tests.
   */
  constructor(storage) {
    this._storage = storage ?? globalThis.localStorage;
    /** @type {import('./SyncQueue.js').SyncQueueEntry[]} */
    this._queue = this._load();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Read the persisted queue from storage. Returns [] on any error. */
  _load() {
    try {
      const raw = this._storage?.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /** Persist the current in-memory queue to storage. */
  _persist() {
    try {
      this._storage?.setItem(STORAGE_KEY, JSON.stringify(this._queue));
    } catch (err) {
      console.warn('[SyncQueue] Failed to persist queue:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Add an entry to the queue.
   *
   * Generates a UUID and ISO timestamp automatically.
   * If an entry for the same (table, userId) pair already exists it is
   * replaced with the new one (deduplication — Requirement 5.3).
   *
   * @param {{ table: string, userId: string, payload: unknown }} entry
   */
  enqueue(entry) {
    const newEntry = {
      id: crypto.randomUUID(),
      table: entry.table,
      userId: entry.userId,
      payload: entry.payload,
      enqueuedAt: new Date().toISOString(),
    };

    // Deduplicate: remove any existing entry for the same (table, userId) pair
    const idx = this._queue.findIndex(
      (e) => e.table === newEntry.table && e.userId === newEntry.userId,
    );

    if (idx !== -1) {
      // Replace in-place to preserve relative insertion order of other entries
      this._queue.splice(idx, 1, newEntry);
    } else {
      this._queue.push(newEntry);
    }

    this._persist();
  }

  /**
   * Attempt to flush all pending entries to Supabase in insertion order.
   *
   * - Successfully upserted entries are removed from the queue.
   * - On the first network error the loop stops; remaining entries are kept
   *   for the next flush (Requirement 5.5).
   * - The updated queue is persisted after the loop completes (Requirement 5.6).
   *
   * @param {import('@supabase/supabase-js').SupabaseClient} supabase
   * @returns {Promise<void>}
   */
  async flush(supabase) {
    // Work on a shallow copy of the queue so we can mutate _queue safely
    const entries = [...this._queue];

    for (const entry of entries) {
      try {
        const { error } = await supabase
          .from(entry.table)
          .upsert(entry.payload);

        if (error) {
          // Treat Supabase errors as network/server errors — stop processing
          break;
        }

        // Remove the successfully flushed entry from the in-memory queue
        const idx = this._queue.findIndex((e) => e.id === entry.id);
        if (idx !== -1) {
          this._queue.splice(idx, 1);
        }
      } catch {
        // Network-level error — stop and retry on next flush
        break;
      }
    }

    // Persist whatever remains (Requirement 5.6)
    this._persist();
  }

  /**
   * Remove all entries and persist the empty queue (Requirement 5.1).
   */
  clear() {
    this._queue = [];
    this._persist();
  }

  /**
   * Return the number of pending entries (Requirement 5.7).
   *
   * @returns {number}
   */
  size() {
    return this._queue.length;
  }
}

/** Singleton instance that uses the real localStorage. */
export const syncQueue = new SyncQueue();
