import React from 'react';
import { getStickerAccent } from '../data.js';
import './Sticker.css';

export default function Sticker({ sticker, state, dupCount, index, addLabel = 'Agregar', onClick }) {
  const accent = getStickerAccent(index);

  if (state === 'add') {
    return (
      <div className="sticker add" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="sticker-top"><div className="sticker-plus">＋</div></div>
        <div className="sticker-name">{addLabel}</div>
      </div>
    );
  }

  const isOwned = state === 'owned' || state === 'dup';

  return (
    <div className={`sticker ${state}${dupCount ? ' dup' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="sticker-num">{sticker.number}</div>
      <div className="sticker-top" style={{ background: isOwned ? accent : undefined }}>
        <div className="sticker-silhouette" />
      </div>
      {isOwned && <div className="sticker-owned-dot" />}
      {dupCount && <div className="sticker-dup-badge">×{dupCount}</div>}
      <div className="sticker-name">{sticker.name}</div>
    </div>
  );
}
