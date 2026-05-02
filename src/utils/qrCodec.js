import { TEAMS } from '../data.js';

const PREFIX = 'MP26';
const STICKERS_PER_TEAM = 20;
const TOTAL_BITS = TEAMS.length * STICKERS_PER_TEAM; // 960
const BYTES_PER_MAP = Math.ceil(TOTAL_BITS / 8); // 120

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

function toBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return b64;
}

function bitsToBytes(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8 && i + b < bits.length; b++) {
      if (bits[i + b]) byte |= (1 << (7 - b));
    }
    bytes.push(byte);
  }
  return bytes;
}

function bytesToBits(bytes, totalBits) {
  const bits = new Array(totalBits).fill(false);
  for (let i = 0; i < bytes.length; i++) {
    for (let b = 0; b < 8; b++) {
      const idx = i * 8 + b;
      if (idx < totalBits) {
        bits[idx] = !!(bytes[i] & (1 << (7 - b)));
      }
    }
  }
  return bits;
}

function bitsFromIds(ids) {
  const bits = new Array(TOTAL_BITS).fill(false);
  for (const id of ids) {
    const idx = idToBitIndex(id);
    if (idx >= 0) bits[idx] = true;
  }
  return bits;
}

function idsFromBits(bits) {
  const ids = [];
  for (let i = 0; i < TOTAL_BITS; i++) {
    if (bits[i]) ids.push(bitIndexToId(i));
  }
  return ids;
}

/**
 * Encode both duplicates and missing stickers into a single QR payload.
 * Format: MP26:T:<base64url of 216 bytes>
 *   First 108 bytes = duplicates bitmap
 *   Next 108 bytes = missing/needs bitmap
 */
export function encode(collection) {
  const dupIds = Object.entries(collection)
    .filter(([, qty]) => qty >= 2)
    .map(([id]) => id);

  const needIds = allStickerIds().filter(id => !(collection[id] >= 1));

  if (dupIds.length === 0 && needIds.length === 0) return null;

  const dupBytes = bitsToBytes(bitsFromIds(dupIds));
  const needBytes = bitsToBytes(bitsFromIds(needIds));

  const allBytes = [...dupBytes, ...needBytes];
  const b64 = toBase64Url(btoa(String.fromCharCode(...allBytes)));

  return `${PREFIX}:T:${b64}`;
}

/**
 * Decode a QR payload into duplicates and needs lists.
 * Returns { duplicates: string[], needs: string[] }
 */
export function decode(payload) {
  if (!payload || !payload.startsWith(PREFIX + ':')) return null;

  const parts = payload.split(':');
  if (parts.length < 3) return null;

  const type = parts[1];
  if (type !== 'T') return null;

  const data = parts.slice(2).join(':');
  let raw;
  try {
    raw = atob(fromBase64Url(data));
  } catch {
    return null;
  }

  if (raw.length < BYTES_PER_MAP * 2) return null;

  const dupByteArr = [];
  const needByteArr = [];
  for (let i = 0; i < BYTES_PER_MAP; i++) {
    dupByteArr.push(raw.charCodeAt(i));
    needByteArr.push(raw.charCodeAt(BYTES_PER_MAP + i));
  }

  const duplicates = idsFromBits(bytesToBits(dupByteArr, TOTAL_BITS));
  const needs = idsFromBits(bytesToBits(needByteArr, TOTAL_BITS));

  if (duplicates.length === 0 && needs.length === 0) return null;

  return { duplicates, needs };
}

/**
 * Given my collection and their decoded QR data, compute trade matches.
 * Returns:
 *   canGive: stickers I have as duplicates that they need
 *   canGet: stickers they have as duplicates that I need
 */
export function computeMatches(myCollection, theirData) {
  const canGive = [];
  const canGet = [];

  for (const id of theirData.needs) {
    if ((myCollection[id] || 0) >= 2) canGive.push(id);
  }

  for (const id of theirData.duplicates) {
    if (!(myCollection[id] >= 1)) canGet.push(id);
  }

  return { canGive, canGet };
}

export function countDuplicates(collection) {
  return Object.values(collection).reduce((sum, qty) => sum + Math.max(0, qty - 1), 0);
}

export function countDuplicateStickers(collection) {
  return Object.values(collection).filter(qty => qty >= 2).length;
}

export function countMissing(collection) {
  return allStickerIds().filter(id => !(collection[id] >= 1)).length;
}
