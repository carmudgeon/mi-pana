import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { encode, countDuplicates, countMissing } from '../utils/qrCodec.js';
import { t } from '../i18n.js';

export default function QrGenerator({ collection, lang }) {
  const [mode, setMode] = useState('D');
  const [copied, setCopied] = useState(false);

  const payload = encode(collection, mode);
  const count = mode === 'D' ? countDuplicates(collection) : countMissing(collection);
  const summary = mode === 'D'
    ? t(lang, 'duplicateCount', count)
    : t(lang, 'missingCount', count);

  const handleCopy = () => {
    if (!payload) return;
    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '0 var(--screen-margin)' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['D', t(lang, 'modeDuplicates')], ['N', t(lang, 'modeNeeds')]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setCopied(false); }} style={{
            flex: 1, padding: '8px 12px', borderRadius: 'var(--r-pill)',
            background: mode === m ? 'var(--ink)' : '#fff',
            color: mode === m ? '#fff' : 'var(--ink)',
            border: `1px solid ${mode === m ? 'var(--ink)' : 'var(--line)'}`,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        textAlign: 'center', fontSize: 13, color: 'var(--muted)',
        fontFamily: 'var(--font-mono)', marginBottom: 16,
      }}>
        {summary}
      </div>

      {payload ? (
        <>
          {/* QR Card */}
          <div style={{
            background: '#fff', borderRadius: 'var(--r-card)',
            border: '1px solid var(--line)', padding: 24,
            display: 'flex', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)', marginBottom: 12,
          }}>
            <QRCodeSVG value={payload} size={220} level="L" />
          </div>

          {/* Payload text + copy */}
          <div style={{
            background: 'rgba(13,16,36,0.04)', borderRadius: 'var(--r-sticker)',
            padding: 12, marginBottom: 12,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)',
              wordBreak: 'break-all', lineHeight: 1.4, maxHeight: 60, overflow: 'hidden',
            }}>
              {payload}
            </div>
          </div>
          <button onClick={handleCopy} style={{
            width: '100%', padding: '10px', borderRadius: 'var(--r-button)',
            background: copied ? 'var(--c-green)' : 'var(--ink)',
            color: '#fff', border: 'none', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            {copied ? `✓ ${t(lang, 'copied')}` : t(lang, 'copyCode')}
          </button>
        </>
      ) : (
        <div style={{
          textAlign: 'center', padding: 40, color: 'var(--muted)',
          fontSize: 13, background: 'rgba(13,16,36,0.03)',
          borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
        }}>
          {t(lang, 'emptyList')}
        </div>
      )}
    </div>
  );
}
