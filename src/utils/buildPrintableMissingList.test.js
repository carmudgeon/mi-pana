import { describe, it, expect } from 'vitest';
import { buildPrintableMissingList } from './buildPrintableMissingList.js';

const TEAMS_FIXTURE = [
  { code: 'ARG', name: 'Argentina', group: 'J' },
  { code: 'BRA', name: 'Brasil', group: 'C' },
  { code: 'MAR', name: 'Marruecos', group: 'C' },
];
const STICKERS_PER_TEAM = 5;

describe('buildPrintableMissingList', () => {
  it('returns an empty list when nothing is missing', () => {
    const collection = {};
    for (const t of TEAMS_FIXTURE) {
      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
        collection[`${t.code}-${String(i).padStart(2, '0')}`] = 1;
      }
    }
    expect(buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM)).toEqual([]);
  });

  it('omits countries with zero missing stickers', () => {
    const collection = { 'ARG-01': 1, 'ARG-02': 1, 'ARG-03': 1, 'ARG-04': 1, 'ARG-05': 1 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    expect(result.find(r => r.team.code === 'ARG')).toBeUndefined();
  });

  it('lists missing numbers as zero-padded strings in ascending order', () => {
    const collection = { 'ARG-02': 1, 'ARG-04': 2 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    const arg = result.find(r => r.team.code === 'ARG');
    expect(arg.missingNums).toEqual(['01', '03', '05']);
  });

  it('treats qty 0 and missing key the same way', () => {
    const collection = { 'ARG-01': 0 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    const arg = result.find(r => r.team.code === 'ARG');
    expect(arg.missingNums).toEqual(['01', '02', '03', '04', '05']);
  });

  it('orders results by group ascending, then by code ascending', () => {
    const collection = {};
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    expect(result.map(r => r.team.code)).toEqual(['BRA', 'MAR', 'ARG']);
  });
});
