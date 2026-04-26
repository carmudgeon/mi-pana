import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { encode, countDuplicates, countMissing } from '../utils/qrCodec.js';
import { t } from '../i18n.js';

export default function QrGenerator({ collection, lang }) {
  const [copied, setCopied] = useState(false);

  const payload = encode(collection);
  const dups = countDuplicates(collection);
  const missing = countMissing(collection);

  const descriptionKey = dups > 0 && missing > 0
    ? 'qrBoth'
    : dups > 0 ? 'qrOnlyDups' : 'qrOnlyMissing';

  const handleCopy = () => {
    if (!payload) return;
    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '0 var(--screen-margin)' }}>
      {/* Summary pills */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center',
      }}>
        <div style={{
          padding: '6px 12px', borderRadius: 'var(--r-pill)',
          background: dups > 0 ? 'rgba(216,30,120,0.1)' : 'rgba(13,16,36,0.05)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: dups > 0 ? 'var(--c-magenta)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-magenta)' }} />
          {t(lang, 'duplicateCount', dups)}
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 'var(--r-pill)',
          background: missing > 0 ? 'rgba(255,106,26,0.1)' : 'rgba(13,16,36,0.05)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: missing > 0 ? 'var(--c-orange)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-orange)' }} />
          {t(lang, 'missingCount', missing)}
        </div>
      </div>

      {payload ? (
        <>
          {/* Context-aware description */}
          <div style={{
            textAlign: 'center', fontSize: 11, color: 'var(--muted)',
            marginBottom: 12, lineHeight: 1.4,
          }}>
            {t(lang, descriptionKey)}
          </div>

          <div style={{
            background: '#fff', borderRadius: 'var(--r-card)',
            border: '1px solid var(--line)', padding: 24,
            display: 'flex', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)', marginBottom: 12,
          }}>
            <QRCodeSVG value={payload} size={220} level="L" />
          </div>

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
            width: '100%', padding: 10, borderRadius: 'var(--r-button)',
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
