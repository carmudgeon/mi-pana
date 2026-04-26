import { TEAMS } from '../data.js';

const PREFIX = 'MP26';
const STICKERS_PER_TEAM = 18;
const TOTAL_BITS = TEAMS.length * STICKERS_PER_TEAM; // 864

function allStickerIds() {
  const ids = [];
  for (const team of TEAMS) {
    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      ids.push(`${team.code}-${String(i).padStart(2, '0')}`);
    }
  }
  return ids;
}

function idToBitIndex(id) {
  const [code, numStr] = id.split('-');
  const teamIdx = TEAMS.findIndex(t => t.code === code);
  if (teamIdx === -1) return -1;
  const num = parseInt(numStr, 10);
  if (num < 1 || num > STICKERS_PER_TEAM) return -1;
  return teamIdx * STICKERS_PER_TEAM + (num - 1);
}

function bitIndexToId(bitIdx) {
  const teamIdx = Math.floor(bitIdx / STICKERS_PER_TEAM);
  const num = (bitIdx % STICKERS_PER_TEAM) + 1;
  return `${TEAMS[teamIdx].code}-${String(num).padStart(2, '0')}`;
}

function bitsToBase64(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8 && i + b < bits.length; b++) {
      if (bits[i + b]) byte |= (1 << (7 - b));
    }
    bytes.push(byte);
  }
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBits(b64, totalBits) {
  const raw = atob(b64);
  const bits = new Array(totalBits).fill(false);
  for (let i = 0; i < raw.length; i++) {
    const byte = raw.charCodeAt(i);
    for (let b = 0; b < 8; b++) {
      const idx = i * 8 + b;
      if (idx < totalBits) {
        bits[idx] = !!(byte & (1 << (7 - b)));
      }
    }
  }
  return bits;
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

  const bits = new Array(TOTAL_BITS).fill(false);
  for (const id of ids) {
    const idx = idToBitIndex(id);
    if (idx >= 0) bits[idx] = true;
  }

  return `${PREFIX}:${mode}:${bitsToBase64(bits)}`;
}

export function decode(payload) {
  if (!payload || !payload.startsWith(PREFIX + ':')) return null;

  const parts = payload.split(':');
  if (parts.length < 3) return null;

  const mode = parts[1];
  if (mode !== 'D' && mode !== 'N') return null;

  const data = parts.slice(2).join(':');
  const stickers = [];

  const bits = base64ToBits(data, TOTAL_BITS);
  for (let i = 0; i < TOTAL_BITS; i++) {
    if (bits[i]) stickers.push(bitIndexToId(i));
  }

  if (stickers.length === 0) return null;
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
