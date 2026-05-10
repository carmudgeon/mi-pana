export function buildPrintableMissingList(collection, teams, stickersPerTeam) {
  const entries = [];
  for (const team of teams) {
    const missingNums = [];
    for (let i = 1; i <= stickersPerTeam; i++) {
      const num = String(i).padStart(2, '0');
      const id = `${team.code}-${num}`;
      const qty = collection[id] || 0;
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
