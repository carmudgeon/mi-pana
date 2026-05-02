import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mergeCollections } from './mergeCollections.js';

// ---------------------------------------------------------------------------
// Arbitrary: generates a Collection (Record<string, number>)
// Sticker IDs are short strings; quantities are non-negative integers.
// ---------------------------------------------------------------------------
const stickerIdArb = fc.stringMatching(/^[A-Z]{2,3}-\d{2}$/).filter(s => s.length >= 4);

const collectionArb = fc.dictionary(
  stickerIdArb,
  fc.integer({ min: 0, max: 10 }),
);

// ---------------------------------------------------------------------------
// Unit tests — specific examples
// ---------------------------------------------------------------------------
describe('mergeCollections — unit tests', () => {
  it('returns empty object when both inputs are empty', () => {
    expect(mergeCollections({}, {})).toEqual({});
  });

  it('returns a copy of local when remote is empty', () => {
    const local = { 'ARG-01': 2, 'BRA-05': 1 };
    const result = mergeCollections(local, {});
    expect(result).toEqual(local);
    expect(result).not.toBe(local); // must be a new object
  });

  it('returns a copy of remote when local is empty', () => {
    const remote = { 'ARG-01': 3, 'ESP-07': 1 };
    const result = mergeCollections({}, remote);
    expect(result).toEqual(remote);
    expect(result).not.toBe(remote);
  });

  it('takes the max quantity for overlapping sticker IDs', () => {
    const local  = { 'ARG-01': 2, 'BRA-05': 1 };
    const remote = { 'ARG-01': 5, 'BRA-05': 0 };
    expect(mergeCollections(local, remote)).toEqual({ 'ARG-01': 5, 'BRA-05': 1 });
  });

  it('includes sticker IDs present only in local', () => {
    const local  = { 'ARG-01': 2 };
    const remote = { 'BRA-05': 3 };
    const result = mergeCollections(local, remote);
    expect(result['ARG-01']).toBe(2);
    expect(result['BRA-05']).toBe(3);
  });

  it('includes sticker IDs present only in remote', () => {
    const local  = {};
    const remote = { 'MEX-03': 4 };
    expect(mergeCollections(local, remote)).toEqual({ 'MEX-03': 4 });
  });
});

// ---------------------------------------------------------------------------
// Property 7: mergeCollections — no data loss (max-wins)
// Validates: Requirements 6.2, 6.3
// ---------------------------------------------------------------------------
describe('Property 7: mergeCollections — no data loss (max-wins)', () => {
  /**
   * **Validates: Requirements 6.2, 6.3**
   *
   * For any two valid Collections A and B and any sticker ID id,
   * mergeCollections(A, B)[id] SHALL equal Math.max(A[id] ?? 0, B[id] ?? 0),
   * and every sticker ID present in either A or B SHALL appear in the result.
   */
  it('result[id] >= local[id] for all id in local', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (A, B) => {
        const result = mergeCollections(A, B);

        // Every id in A must appear in result with quantity >= A[id]
        for (const [id, qty] of Object.entries(A)) {
          expect(result[id]).toBeGreaterThanOrEqual(qty);
        }

        // Every id in B must appear in result with quantity >= B[id]
        for (const [id, qty] of Object.entries(B)) {
          expect(result[id]).toBeGreaterThanOrEqual(qty);
        }

        // result[id] must equal Math.max(A[id] ?? 0, B[id] ?? 0)
        const allIds = new Set([...Object.keys(A), ...Object.keys(B)]);
        for (const id of allIds) {
          expect(result[id]).toBe(Math.max(A[id] ?? 0, B[id] ?? 0));
        }
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: mergeCollections — commutativity
// Validates: Requirements 6.6
// ---------------------------------------------------------------------------
describe('Property 8: mergeCollections — commutativity', () => {
  /**
   * **Validates: Requirements 6.6**
   *
   * For any two valid Collections A and B,
   * mergeCollections(A, B) SHALL produce a result equal to mergeCollections(B, A).
   */
  it('mergeCollections(A, B) equals mergeCollections(B, A)', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (A, B) => {
        expect(mergeCollections(A, B)).toEqual(mergeCollections(B, A));
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: mergeCollections — idempotency
// Validates: Requirements 6.5
// ---------------------------------------------------------------------------
describe('Property 9: mergeCollections — idempotency', () => {
  /**
   * **Validates: Requirements 6.5**
   *
   * For any valid Collection A,
   * mergeCollections(A, A) SHALL produce a result equal to A.
   */
  it('mergeCollections(A, A) equals A', () => {
    fc.assert(
      fc.property(collectionArb, (A) => {
        expect(mergeCollections(A, A)).toEqual(A);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: mergeCollections — no mutation
// Validates: Requirements 6.4
// ---------------------------------------------------------------------------
describe('Property 10: mergeCollections — no mutation', () => {
  /**
   * **Validates: Requirements 6.4**
   *
   * For any two valid Collections A and B,
   * calling mergeCollections(A, B) SHALL NOT modify the contents of A or B.
   */
  it('inputs are unchanged after call', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (A, B) => {
        const snapshotA = JSON.stringify(A);
        const snapshotB = JSON.stringify(B);

        mergeCollections(A, B);

        expect(JSON.stringify(A)).toBe(snapshotA);
        expect(JSON.stringify(B)).toBe(snapshotB);
      }),
      { numRuns: 200 },
    );
  });
});
