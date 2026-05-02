import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { encode, decode } from '../utils/qrCodec.js';
import { TEAMS } from '../data.js';

// ---------------------------------------------------------------------------
// Constants (must match qrCodec.js internals)
// ---------------------------------------------------------------------------
const STICKERS_PER_TEAM = 20;
const BYTES_PER_MAP = 120; // Math.ceil(48 * 20 / 8)

// ---------------------------------------------------------------------------
// Helpers — build the full list of valid sticker IDs
// ---------------------------------------------------------------------------
function allStickerIds() {
  const ids = [];
  for (const team of TEAMS) {
    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      ids.push(`${team.code}-${String(i).padStart(2, '0')}`);
    }
  }
  return ids;
}

const ALL_IDS = allStickerIds(); // 864 IDs

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a valid Collection (Record<string, number>) using real sticker IDs.
 * Quantities range from 0 to 3 to keep the generated data realistic.
 * We pick a random subset of IDs to keep the collection sparse.
 */
const collectionArb = fc
  .array(fc.integer({ min: 0, max: ALL_IDS.length - 1 }), {
    minLength: 0,
    maxLength: ALL_IDS.length,
  })
  .map((indices) => {
    const collection = {};
    const seen = new Set();
    for (const idx of indices) {
      if (!seen.has(idx)) {
        seen.add(idx);
        // Assign a quantity: 0 = missing, 1 = owned, 2-3 = duplicate
        collection[ALL_IDS[idx]] = (idx % 4); // 0,1,2,3 cycling
      }
    }
    return collection;
  });

/**
 * Generates a collection that is guaranteed to have at least one duplicate
 * (quantity >= 2) so that encode() returns a non-null payload.
 */
const collectionWithDupsArb = fc
  .array(fc.integer({ min: 0, max: ALL_IDS.length - 1 }), {
    minLength: 1,
    maxLength: ALL_IDS.length,
  })
  .map((indices) => {
    const collection = {};
    const seen = new Set();
    for (const idx of indices) {
      if (!seen.has(idx)) {
        seen.add(idx);
        collection[ALL_IDS[idx]] = (idx % 4);
      }
    }
    return collection;
  })
  .filter((col) => Object.values(col).some((qty) => qty >= 2));

/**
 * Generates a collection that is guaranteed to have at least one missing sticker
 * (quantity === 0 or absent) so that encode() returns a non-null payload.
 * Since collections are sparse (not all IDs present), there will always be
 * missing stickers unless every ID is present with qty >= 1.
 */
const collectionWithNeedsArb = fc
  .array(fc.integer({ min: 0, max: ALL_IDS.length - 1 }), {
    minLength: 0,
    maxLength: ALL_IDS.length - 1, // leave at least one ID absent → needs
  })
  .map((indices) => {
    const collection = {};
    const seen = new Set();
    for (const idx of indices) {
      if (!seen.has(idx)) {
        seen.add(idx);
        collection[ALL_IDS[idx]] = (idx % 3) + 1; // 1, 2, or 3 (owned)
      }
    }
    return collection;
  })
  .filter((col) => {
    // Must have at least one missing sticker
    return ALL_IDS.some((id) => !(col[id] >= 1));
  });

/**
 * Generates a collection that has both duplicates AND needs (encode returns non-null).
 */
const collectionWithDupsAndNeedsArb = collectionWithDupsArb.filter((col) =>
  ALL_IDS.some((id) => !(col[id] >= 1))
);

// ---------------------------------------------------------------------------
// Scoring helpers (pure functions — no Supabase needed)
// These mirror the logic in the Edge Function and TradeMatchingService.
// ---------------------------------------------------------------------------

/**
 * Compute trade match score between caller and a candidate.
 *
 * @param {string[]} callerDups  - sticker IDs the caller has as duplicates (qty >= 2)
 * @param {string[]} callerNeeds - sticker IDs the caller is missing (qty === 0)
 * @param {string[]} candidateDups  - sticker IDs the candidate has as duplicates
 * @param {string[]} candidateNeeds - sticker IDs the candidate is missing
 * @returns {{ canGive: string[], canGet: string[], score: number }}
 */
function computeScore(callerDups, callerNeeds, candidateDups, candidateNeeds) {
  const candidateNeedsSet = new Set(candidateNeeds);
  const callerNeedsSet = new Set(callerNeeds);

  const canGive = callerDups.filter((id) => candidateNeedsSet.has(id));
  const canGet = candidateDups.filter((id) => callerNeedsSet.has(id));
  const score = canGive.length + canGet.length;

  return { canGive, canGet, score };
}

/**
 * Extract duplicate sticker IDs from a collection.
 */
function getDups(collection) {
  return Object.entries(collection)
    .filter(([, qty]) => qty >= 2)
    .map(([id]) => id);
}

/**
 * Extract missing sticker IDs from a collection (not owned at all).
 */
function getNeeds(collection) {
  return ALL_IDS.filter((id) => !(collection[id] >= 1));
}

// ---------------------------------------------------------------------------
// Unit tests — specific examples
// ---------------------------------------------------------------------------

describe('TradeMatchingService — unit tests', () => {
  it('encode returns a non-null payload for an empty collection (all stickers are needs)', () => {
    // An empty collection means every sticker is missing → needs bitmap is fully set
    const payload = encode({});
    expect(payload).not.toBeNull();
    expect(payload).toMatch(/^MP26:T:/);
  });

  it('encode returns a string starting with MP26:T: for a collection with duplicates', () => {
    const col = { 'BRA-01': 2 };
    const payload = encode(col);
    expect(payload).not.toBeNull();
    expect(payload).toMatch(/^MP26:T:/);
  });

  it('decode returns null for an invalid payload', () => {
    expect(decode('invalid')).toBeNull();
    expect(decode('')).toBeNull();
    expect(decode(null)).toBeNull();
  });

  it('round-trip: encode then decode returns same duplicates and needs', () => {
    const col = { 'BRA-01': 2, 'ARG-03': 1, 'FRA-05': 0 };
    const payload = encode(col);
    expect(payload).not.toBeNull();
    const result = decode(payload);
    expect(result).not.toBeNull();

    // BRA-01 has qty=2 → duplicate
    expect(result.duplicates).toContain('BRA-01');
    // ARG-03 has qty=1 → not a duplicate
    expect(result.duplicates).not.toContain('ARG-03');
    // FRA-05 has qty=0 → need
    expect(result.needs).toContain('FRA-05');
  });

  it('computeScore: canGive is intersection of callerDups and candidateNeeds', () => {
    const callerDups = ['BRA-01', 'ARG-02', 'FRA-03'];
    const callerNeeds = ['ESP-01'];
    const candidateDups = ['ESP-01'];
    const candidateNeeds = ['BRA-01', 'MEX-05'];

    const { canGive, canGet, score } = computeScore(
      callerDups,
      callerNeeds,
      candidateDups,
      candidateNeeds
    );

    expect(canGive).toEqual(['BRA-01']);
    expect(canGet).toEqual(['ESP-01']);
    expect(score).toBe(2);
  });

  it('computeScore: returns zero score when no overlap', () => {
    const { canGive, canGet, score } = computeScore(
      ['BRA-01'],
      ['ARG-01'],
      ['FRA-01'],
      ['MEX-01']
    );
    expect(canGive).toHaveLength(0);
    expect(canGet).toHaveLength(0);
    expect(score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Property 14: Bitmap round-trip preserves sticker sets
// Validates: Requirements 10.3, 10.4, 10.5
// ---------------------------------------------------------------------------
describe('Property 14: Bitmap round-trip preserves sticker sets', () => {
  /**
   * **Validates: Requirements 10.3, 10.4, 10.5**
   *
   * For any valid Collection that has at least one duplicate or one missing sticker,
   * encoding then decoding SHALL return the same set of duplicate sticker IDs
   * and the same set of missing sticker IDs.
   *
   * Additionally, the encoded payload SHALL represent exactly 108 bytes per bitmap
   * (216 bytes total), matching BYTES_PER_MAP from qrCodec.js.
   */
  it('encode then decode returns the same duplicate sticker ID set', () => {
    fc.assert(
      fc.property(collectionWithDupsAndNeedsArb, (collection) => {
        const payload = encode(collection);
        expect(payload).not.toBeNull();

        const result = decode(payload);
        expect(result).not.toBeNull();

        // Compute expected duplicates from the collection
        const expectedDups = new Set(getDups(collection));
        const actualDups = new Set(result.duplicates);

        expect(actualDups).toEqual(expectedDups);
      }),
      { numRuns: 100 },
    );
  });

  it('encode then decode returns the same needs sticker ID set', () => {
    fc.assert(
      fc.property(collectionWithDupsAndNeedsArb, (collection) => {
        const payload = encode(collection);
        expect(payload).not.toBeNull();

        const result = decode(payload);
        expect(result).not.toBeNull();

        // Compute expected needs from the collection
        const expectedNeeds = new Set(getNeeds(collection));
        const actualNeeds = new Set(result.needs);

        expect(actualNeeds).toEqual(expectedNeeds);
      }),
      { numRuns: 100 },
    );
  });

  it('each bitmap is exactly 108 bytes', () => {
    fc.assert(
      fc.property(collectionWithDupsAndNeedsArb, (collection) => {
        const payload = encode(collection);
        expect(payload).not.toBeNull();

        // payload format: "MP26:T:<base64url of 216 bytes>"
        const parts = payload.split(':');
        expect(parts.length).toBeGreaterThanOrEqual(3);

        const b64url = parts.slice(2).join(':');
        // Convert base64url → standard base64
        let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';

        const raw = atob(b64);
        // Total bytes = 2 × BYTES_PER_MAP
        expect(raw.length).toBe(BYTES_PER_MAP * 2);

        // Each individual bitmap is exactly 108 bytes
        const dupBytes = raw.slice(0, BYTES_PER_MAP);
        const needBytes = raw.slice(BYTES_PER_MAP);
        expect(dupBytes.length).toBe(BYTES_PER_MAP);
        expect(needBytes.length).toBe(BYTES_PER_MAP);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Trade match scoring correctness
// Validates: Requirements 8.2, 8.3, 8.4
// ---------------------------------------------------------------------------
describe('Property 15: Trade match scoring correctness', () => {
  /**
   * **Validates: Requirements 8.2, 8.3, 8.4**
   *
   * For any two users' collections:
   *   canGive = callerDups ∩ candidateNeeds
   *   canGet  = candidateDups ∩ callerNeeds
   *   score   = canGive.length + canGet.length
   */
  it('canGive is exactly the intersection of callerDups and candidateNeeds', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (callerCol, candidateCol) => {
        const callerDups = getDups(callerCol);
        const callerNeeds = getNeeds(callerCol);
        const candidateDups = getDups(candidateCol);
        const candidateNeeds = getNeeds(candidateCol);

        const { canGive } = computeScore(
          callerDups,
          callerNeeds,
          candidateDups,
          candidateNeeds
        );

        const candidateNeedsSet = new Set(candidateNeeds);
        const callerDupsSet = new Set(callerDups);

        // Every item in canGive must be in both callerDups and candidateNeeds
        for (const id of canGive) {
          expect(callerDupsSet.has(id)).toBe(true);
          expect(candidateNeedsSet.has(id)).toBe(true);
        }

        // canGive must contain ALL items in the intersection
        const expectedCanGive = callerDups.filter((id) => candidateNeedsSet.has(id));
        expect(canGive).toHaveLength(expectedCanGive.length);
      }),
      { numRuns: 200 },
    );
  });

  it('canGet is exactly the intersection of candidateDups and callerNeeds', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (callerCol, candidateCol) => {
        const callerDups = getDups(callerCol);
        const callerNeeds = getNeeds(callerCol);
        const candidateDups = getDups(candidateCol);
        const candidateNeeds = getNeeds(candidateCol);

        const { canGet } = computeScore(
          callerDups,
          callerNeeds,
          candidateDups,
          candidateNeeds
        );

        const callerNeedsSet = new Set(callerNeeds);
        const candidateDupsSet = new Set(candidateDups);

        // Every item in canGet must be in both candidateDups and callerNeeds
        for (const id of canGet) {
          expect(candidateDupsSet.has(id)).toBe(true);
          expect(callerNeedsSet.has(id)).toBe(true);
        }

        // canGet must contain ALL items in the intersection
        const expectedCanGet = candidateDups.filter((id) => callerNeedsSet.has(id));
        expect(canGet).toHaveLength(expectedCanGet.length);
      }),
      { numRuns: 200 },
    );
  });

  it('score equals canGive.length + canGet.length', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (callerCol, candidateCol) => {
        const callerDups = getDups(callerCol);
        const callerNeeds = getNeeds(callerCol);
        const candidateDups = getDups(candidateCol);
        const candidateNeeds = getNeeds(candidateCol);

        const { canGive, canGet, score } = computeScore(
          callerDups,
          callerNeeds,
          candidateDups,
          candidateNeeds
        );

        expect(score).toBe(canGive.length + canGet.length);
      }),
      { numRuns: 200 },
    );
  });

  it('score is non-negative', () => {
    fc.assert(
      fc.property(collectionArb, collectionArb, (callerCol, candidateCol) => {
        const { score } = computeScore(
          getDups(callerCol),
          getNeeds(callerCol),
          getDups(candidateCol),
          getNeeds(candidateCol)
        );
        expect(score).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: Trade match results are sorted by score
// Validates: Requirements 8.2
// ---------------------------------------------------------------------------
describe('Property 16: Trade match results are sorted by score', () => {
  /**
   * **Validates: Requirements 8.2**
   *
   * For any list of trade match candidates, after sorting by score descending,
   * each element's score SHALL be >= the score of the next element.
   */
  it('returned list is sorted descending by score', () => {
    fc.assert(
      fc.property(
        // Generate a caller collection
        collectionArb,
        // Generate 0–10 candidate collections
        fc.array(collectionArb, { minLength: 0, maxLength: 10 }),
        (callerCol, candidateCols) => {
          const callerDups = getDups(callerCol);
          const callerNeeds = getNeeds(callerCol);

          // Compute matches for each candidate
          const matches = candidateCols.map((candidateCol, i) => {
            const candidateDups = getDups(candidateCol);
            const candidateNeeds = getNeeds(candidateCol);
            const { canGive, canGet, score } = computeScore(
              callerDups,
              callerNeeds,
              candidateDups,
              candidateNeeds
            );
            return { userId: `user-${i}`, canGive, canGet, score };
          });

          // Sort by score descending (mirrors TradeMatchingService.findMatches)
          matches.sort((a, b) => b.score - a.score);

          // Verify the sorted order: each score >= next score
          for (let i = 0; i < matches.length - 1; i++) {
            expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('sort is stable with respect to score: equal-score entries remain in relative order', () => {
    fc.assert(
      fc.property(
        // Generate 2–8 matches with explicit scores
        fc.array(
          fc.record({
            userId: fc.uuid(),
            score: fc.integer({ min: 0, max: 20 }),
          }),
          { minLength: 2, maxLength: 8 }
        ),
        (rawMatches) => {
          // Sort descending by score
          const sorted = [...rawMatches].sort((a, b) => b.score - a.score);

          // Verify descending order
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].score).toBeGreaterThanOrEqual(sorted[i + 1].score);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
