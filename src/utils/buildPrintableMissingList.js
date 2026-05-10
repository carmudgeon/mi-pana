/**
 * Computes the ordered list of teams that have at least one missing sticker.
 *
 * A sticker is considered missing when its quantity in `collection` is 0
 * or the key is absent entirely.
 *
 * @param {Record<string, number>} collection     - Map of sticker ID → owned qty (e.g. { 'ARG-01': 2 })
 * @param {{ code: string, group: string }[]} teams - Team objects; must have `code` and `group`
 * @param {number} stickersPerTeam                 - Number of stickers per team (e.g. 20)
 * @returns {{ team: object, missingNums: string[] }[]}
 *   Entries for teams with ≥ 1 missing sticker, sorted by group asc then code asc.
 *   `missingNums` are zero-padded two-character strings ('01'…'20').
 */
export function buildPrintableMissingList(collection, teams, stickersPerTeam) {
  const entries = [];
  for (const team of teams) {
    const missingNums = [];
    for (let i = 1; i <= stickersPerTeam; i++) {
      const num = String(i).padStart(2, '0');
      const id = `${team.code}-${num}`;
      const qty = collection[id] ?? 0;
      if (qty === 0) missingNums.push(num);
    }
    if (missingNums.length > 0) {
      entries.push({ team, missingNums });
    }
  }
  return entries.sort((a, b) => {
    if (a.team.group !== b.team.group) return a.team.group.localeCompare(b.team.group);
    return a.team.code.localeCompare(b.team.code);
  });
}
