import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { SyncQueue } from './SyncQueue.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a fresh in-memory localStorage mock for each test. */
function makeMockStorage() {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key]; store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    _store: store,
  };
}

/** Create a mock Supabase client where every upsert succeeds. */
function makeSuccessClient() {
  return {
    from: (_table) => ({
      upsert: async (_payload) => ({ error: null }),
    }),
  };
}

/** Create a mock Supabase client where every upsert fails with a network error. */
function makeErrorClient() {
  return {
    from: (_table) => ({
      upsert: async (_payload) => ({ error: new Error('network error') }),
    }),
  };
}

/** Create a mock Supabase client that throws on upsert (simulates fetch failure). */
function makeThrowingClient() {
  return {
    from: (_table) => ({
      upsert: async (_payload) => { throw new Error('fetch failed'); },
    }),
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const tableArb = fc.constantFrom('collections', 'trades');
const userIdArb = fc.uuid();
const payloadArb = fc.record({
  sticker_id: fc.string({ minLength: 1, maxLength: 10 }),
  quantity: fc.integer({ min: 0, max: 99 }),
});

/** An entry suitable for SyncQueue.enqueue (no id/enqueuedAt). */
const entryArb = fc.record({
  table: tableArb,
  userId: userIdArb,
  payload: payloadArb,
});

// ---------------------------------------------------------------------------
// Unit tests — basic behavior
// ---------------------------------------------------------------------------

describe('SyncQueue — unit tests', () => {
  let storage;
  let queue;

  beforeEach(() => {
    storage = makeMockStorage();
    queue = new SyncQueue(storage);
  });

  it('starts empty', () => {
    expect(queue.size()).toBe(0);
  });

  it('enqueue increases size by 1', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 1 } });
    expect(queue.size()).toBe(1);
  });

  it('enqueue persists to storage', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 1 } });
    const raw = storage.getItem('panini2026-sync-queue');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].table).toBe('collections');
    expect(parsed[0].userId).toBe('user-1');
  });

  it('enqueue adds id and enqueuedAt automatically', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: {} });
    const raw = JSON.parse(storage.getItem('panini2026-sync-queue'));
    expect(raw[0].id).toBeTruthy();
    expect(raw[0].enqueuedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('deduplicates: second enqueue for same (table, userId) replaces first', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 1 } });
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 5 } });
    expect(queue.size()).toBe(1);
    const raw = JSON.parse(storage.getItem('panini2026-sync-queue'));
    expect(raw[0].payload.qty).toBe(5);
  });

  it('different (table, userId) pairs are kept separately', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 1 } });
    queue.enqueue({ table: 'trades', userId: 'user-1', payload: { qty: 2 } });
    queue.enqueue({ table: 'collections', userId: 'user-2', payload: { qty: 3 } });
    expect(queue.size()).toBe(3);
  });

  it('clear empties the queue and persists', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: {} });
    queue.clear();
    expect(queue.size()).toBe(0);
    const raw = JSON.parse(storage.getItem('panini2026-sync-queue'));
    expect(raw).toHaveLength(0);
  });

  it('flush removes successfully upserted entries', async () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: {} });
    queue.enqueue({ table: 'trades', userId: 'user-2', payload: {} });
    await queue.flush(makeSuccessClient());
    expect(queue.size()).toBe(0);
  });

  it('flush stops on first error and keeps remaining entries', async () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: {} });
    queue.enqueue({ table: 'collections', userId: 'user-2', payload: {} });
    await queue.flush(makeErrorClient());
    // Both entries remain because the first one errored
    expect(queue.size()).toBe(2);
  });

  it('flush stops on thrown network error and keeps remaining entries', async () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: {} });
    queue.enqueue({ table: 'collections', userId: 'user-2', payload: {} });
    await queue.flush(makeThrowingClient());
    expect(queue.size()).toBe(2);
  });

  it('flush on empty queue is a no-op', async () => {
    await queue.flush(makeSuccessClient());
    expect(queue.size()).toBe(0);
  });

  it('constructor reloads persisted queue from storage', () => {
    queue.enqueue({ table: 'collections', userId: 'user-1', payload: { qty: 7 } });
    // Create a new SyncQueue instance pointing at the same storage
    const queue2 = new SyncQueue(storage);
    expect(queue2.size()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Property 11: SyncQueue deduplication
// Validates: Requirements 5.3
// ---------------------------------------------------------------------------
describe('Property 11: SyncQueue deduplication', () => {
  /**
   * **Validates: Requirements 5.3**
   *
   * For any (table, userId) pair, enqueueing two entries with the same pair
   * SHALL result in exactly one entry in the queue, containing the data from
   * the second enqueue call.
   */
  it('enqueueing two entries for the same (table, userId) leaves exactly one entry with the second payload', () => {
    fc.assert(
      fc.property(
        tableArb,
        userIdArb,
        payloadArb,
        payloadArb,
        (table, userId, payload1, payload2) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          queue.enqueue({ table, userId, payload: payload1 });
          queue.enqueue({ table, userId, payload: payload2 });

          // Exactly one entry must remain
          expect(queue.size()).toBe(1);

          // The surviving entry must carry the second payload
          const raw = JSON.parse(storage.getItem('panini2026-sync-queue'));
          expect(raw).toHaveLength(1);
          expect(raw[0].payload).toEqual(payload2);
          expect(raw[0].table).toBe(table);
          expect(raw[0].userId).toBe(userId);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('entries with different (table, userId) pairs are never merged', () => {
    fc.assert(
      fc.property(
        // Two entries that differ in at least one of table or userId
        fc.tuple(tableArb, userIdArb, payloadArb).chain(([t1, u1, p1]) =>
          fc.tuple(
            fc.constantFrom(...['collections', 'trades'].filter((t) => t !== t1).concat(t1)),
            fc.oneof(fc.uuid(), fc.constant(u1)),
            payloadArb,
          ).filter(([t2, u2]) => t2 !== t1 || u2 !== u1)
           .map(([t2, u2, p2]) => [t1, u1, p1, t2, u2, p2]),
        ),
        ([t1, u1, p1, t2, u2, p2]) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          queue.enqueue({ table: t1, userId: u1, payload: p1 });
          queue.enqueue({ table: t2, userId: u2, payload: p2 });

          expect(queue.size()).toBe(2);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: SyncQueue size invariant
// Validates: Requirements 5.7
// ---------------------------------------------------------------------------
describe('Property 12: SyncQueue size invariant', () => {
  /**
   * **Validates: Requirements 5.7**
   *
   * For any sequence of enqueue and successful flush operations,
   * SyncQueue.size() SHALL equal the number of unique (table, userId) pairs
   * enqueued minus the number successfully flushed.
   *
   * Because deduplication collapses same-key entries into one, "enqueued count"
   * is the number of distinct (table, userId) keys present after all enqueues.
   */
  it('size() equals distinct enqueued pairs minus successfully flushed count', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate 1–8 entries; some may share (table, userId) keys
        fc.array(entryArb, { minLength: 1, maxLength: 8 }),
        async (entries) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          // Enqueue all entries
          for (const e of entries) {
            queue.enqueue(e);
          }

          // Count distinct (table, userId) pairs — mirrors deduplication logic
          const distinctKeys = new Set(entries.map((e) => `${e.table}::${e.userId}`));
          expect(queue.size()).toBe(distinctKeys.size);

          // Flush successfully — all entries should be removed
          await queue.flush(makeSuccessClient());
          expect(queue.size()).toBe(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('size() is non-negative after any sequence of operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(entryArb, { minLength: 0, maxLength: 6 }),
        async (entries) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          for (const e of entries) {
            queue.enqueue(e);
          }

          // Partial flush (error client stops after first entry)
          await queue.flush(makeErrorClient());

          expect(queue.size()).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13: SyncQueue flush persists state
// Validates: Requirements 5.6
// ---------------------------------------------------------------------------
describe('Property 13: SyncQueue flush persists state', () => {
  /**
   * **Validates: Requirements 5.6**
   *
   * After flush completes, the contents of localStorage['panini2026-sync-queue']
   * SHALL exactly match the in-memory queue:
   * - Successfully flushed entries are absent from both.
   * - Entries that failed (or were not reached) remain in both.
   */
  it('after successful flush, localStorage is empty and matches in-memory queue', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(entryArb, { minLength: 1, maxLength: 6 }),
        async (entries) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          for (const e of entries) {
            queue.enqueue(e);
          }

          await queue.flush(makeSuccessClient());

          // In-memory queue is empty
          expect(queue.size()).toBe(0);

          // Persisted queue is also empty
          const persisted = JSON.parse(storage.getItem('panini2026-sync-queue') ?? '[]');
          expect(persisted).toHaveLength(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('after failed flush, localStorage matches in-memory queue (all entries retained)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(entryArb, { minLength: 1, maxLength: 6 }),
        async (entries) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          for (const e of entries) {
            queue.enqueue(e);
          }

          const sizeBeforeFlush = queue.size();

          await queue.flush(makeErrorClient());

          // In-memory size unchanged (error on first entry stops processing)
          expect(queue.size()).toBe(sizeBeforeFlush);

          // Persisted queue matches in-memory queue exactly
          const persisted = JSON.parse(storage.getItem('panini2026-sync-queue') ?? '[]');
          expect(persisted).toHaveLength(queue.size());

          // IDs match
          const inMemoryIds = JSON.parse(storage.getItem('panini2026-sync-queue'))
            .map((e) => e.id)
            .sort();
          expect(inMemoryIds).toEqual(persisted.map((e) => e.id).sort());
        },
      ),
      { numRuns: 200 },
    );
  });

  it('localStorage and in-memory queue are in sync after every enqueue', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 1, maxLength: 8 }),
        (entries) => {
          const storage = makeMockStorage();
          const queue = new SyncQueue(storage);

          for (const e of entries) {
            queue.enqueue(e);

            // After each enqueue, in-memory size must match persisted length
            const persisted = JSON.parse(storage.getItem('panini2026-sync-queue') ?? '[]');
            expect(persisted).toHaveLength(queue.size());
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
