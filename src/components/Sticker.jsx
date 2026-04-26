import React from 'react';
import { getStickerAccent } from '../data.js';
import './Sticker.css';

export default function Sticker({ sticker, state, dupCount, index, qty = 0, addLabel = 'Agregar', onIncrement, onDecrement, onClick }) {
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
    <div className={`sticker ${state}${dupCount ? ' dup' : ''}`}>
      <div className="sticker-num">{sticker.number}</div>
      <div className="sticker-top" onClick={() => onIncrement?.()} style={{ background: isOwned ? accent : undefined, cursor: 'pointer' }}>
        <div className="sticker-silhouette" />
      </div>
      {isOwned && <div className="sticker-owned-dot" />}
      {dupCount > 1 && <div className="sticker-dup-badge">×{dupCount}</div>}
      <div className="sticker-name">{sticker.name}</div>
      <div className="sticker-controls">
        <button
          className="sticker-ctrl-btn"
          onClick={(e) => { e.stopPropagation(); onDecrement?.(); }}
          disabled={qty === 0}
          style={{ opacity: qty === 0 ? 0.3 : 1 }}
        >−</button>
        <span className="sticker-qty">{qty === 0 ? '—' : qty}</span>
        <button
          className="sticker-ctrl-btn sticker-ctrl-add"
          onClick={(e) => { e.stopPropagation(); onIncrement?.(); }}
        >+</button>
      </div>
    </div>
  );
}
