import { TEAMS } from '../data.js';

const PREFIX = 'MP26';
const GROUPED_THRESHOLD = 2500;

function allStickerIds() {
  const ids = [];
  for (const team of TEAMS) {
    for (let i = 1; i <= 18; i++) {
      ids.push(`${team.code}-${String(i).padStart(2, '0')}`);
    }
  }
  return ids;
}

export function encode(collection, mode) {
  let ids;
  if (mode === 'D') {
    ids = Object.entries(collection)
      .filter(([, qty]) => qty >= 2)
      .map(([id]) => id);
  } else {
    ids = allStickerIds().filter(id => !(collection[id] >= 1));
  }

  if (ids.length === 0) return null;

  const flat = ids.map(id => id.replace('-', '')).join(',');
  const payload = `${PREFIX}:${mode}:${flat}`;

  if (payload.length <= GROUPED_THRESHOLD) return payload;

  const grouped = {};
  for (const id of ids) {
    const [team, num] = id.split('-');
    if (!grouped[team]) grouped[team] = [];
    grouped[team].push(num);
  }
  const parts = Object.entries(grouped).map(([team, nums]) => `${team}:${nums.join('.')}`);
  return `${PREFIX}:${mode}:${parts.join(',')}`;
}

export function decode(payload) {
  if (!payload || !payload.startsWith(PREFIX + ':')) return null;

  const parts = payload.split(':');
  if (parts.length < 3) return null;

  const mode = parts[1];
  if (mode !== 'D' && mode !== 'N') return null;

  const data = parts.slice(2).join(':');
  const stickers = [];

  if (data.includes(':')) {
    for (const chunk of data.split(',')) {
      const [team, nums] = chunk.split(':');
      if (!team || !nums) continue;
      for (const num of nums.split('.')) {
        stickers.push(`${team}-${num}`);
      }
    }
  } else {
    for (const raw of data.split(',')) {
      if (raw.length < 4) continue;
      const team = raw.slice(0, 3);
      const num = raw.slice(3);
      stickers.push(`${team}-${num}`);
    }
  }

  return { mode, stickers };
}

export function computeMatches(myCollection, theirStickers, theirMode) {
  const matches = [];

  for (const id of theirStickers) {
    if (theirMode === 'D') {
      if (!(myCollection[id] >= 1)) matches.push(id);
    } else {
      if ((myCollection[id] || 0) >= 2) matches.push(id);
    }
  }

  return matches;
}

export function countDuplicates(collection) {
  return Object.values(collection).filter(qty => qty >= 2).length;
}

export function countMissing(collection) {
  return allStickerIds().filter(id => !(collection[id] >= 1)).length;
}
