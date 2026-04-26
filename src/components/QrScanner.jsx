import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { decode, computeMatches } from '../utils/qrCodec.js';
import { getTeamAccent } from '../data.js';
import { t } from '../i18n.js';

function StickerChips({ ids }) {
  const grouped = {};
  for (const id of ids) {
    const [team, num] = id.split('-');
    if (!grouped[team]) grouped[team] = [];
    grouped[team].push(num);
  }

  return Object.entries(grouped).map(([team, nums]) => (
    <div key={team} style={{ marginBottom: 8 }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
        color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: 4,
      }}>{team}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nums.map(num => (
          <div key={num} style={{
            height: 26, padding: '0 7px', borderRadius: 6,
            background: getTeamAccent(team),
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 9, fontWeight: 800, color: '#fff',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, opacity: 0.8 }}>{team}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>{num}</span>
          </div>
        ))}
      </div>
    </div>
  ));
}

export default function QrScanner({ collection, lang, onProposeTrade }) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef(null);

  const runAnalysis = (text) => {
    const payload = text.trim();
    setError(null);
    setResult(null);

    const decoded = decode(payload);
    if (!decoded) {
      setError(t(lang, 'invalidQr'));
      return;
    }

    const { canGive, canGet } = computeMatches(collection, decoded);
    setResult({ canGive, canGet, theirDups: decoded.duplicates.length, theirNeeds: decoded.needs.length });
  };

  const handleAnalyze = () => runAnalysis(inputText);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1024;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            setInputText(code.data);
            runAnalysis(code.data);
          } else {
            setError(t(lang, 'invalidQr'));
          }
        } catch {
          setError(t(lang, 'invalidQr'));
        }
        setScanning(false);
      };
      img.onerror = () => { setError(t(lang, 'invalidQr')); setScanning(false); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalMatches = result ? result.canGive.length + result.canGet.length : 0;

  return (
    <div style={{ padding: '0 var(--screen-margin)' }}>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={t(lang, 'pastePrompt')}
        rows={3}
        style={{
          width: '100%', padding: 12, borderRadius: 'var(--r-sticker)',
          border: '1px solid var(--line)', background: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)',
          resize: 'vertical', outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={handleAnalyze} disabled={!inputText.trim()} style={{
          flex: 1, padding: 10, borderRadius: 'var(--r-button)',
          background: inputText.trim() ? 'var(--c-blue)' : 'rgba(13,16,36,0.08)',
          color: inputText.trim() ? '#fff' : 'var(--muted)', border: 'none',
          fontSize: 12, fontWeight: 800, cursor: inputText.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-body)',
        }}>
          {t(lang, 'analyze')}
        </button>
        <button onClick={() => fileRef.current?.click()} disabled={scanning} style={{
          flex: 1, padding: 10, borderRadius: 'var(--r-button)',
          background: '#fff', color: 'var(--ink)',
          border: '1px solid var(--line-strong)',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          {scanning ? '...' : t(lang, 'uploadQr')}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      {error && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 'var(--r-sticker)',
          background: 'rgba(230,30,60,0.08)', color: 'var(--c-red)',
          fontSize: 12, fontWeight: 700, textAlign: 'center',
        }}>{error}</div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          {/* Match summary */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
              {t(lang, 'matchesFound', totalMatches)}
            </div>
          </div>

          {totalMatches === 0 ? (
            <div style={{
              textAlign: 'center', padding: 32, color: 'var(--muted)',
              fontSize: 13, background: 'rgba(13,16,36,0.03)',
              borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
            }}>{t(lang, 'noMatches')}</div>
          ) : (
            <div style={{
              background: '#0E1426', borderRadius: 'var(--r-panel)',
              overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
              {/* Can give (red ↓) */}
              {result.canGive.length > 0 && (
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: 'var(--c-red)', display: 'grid', placeItems: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v15"/><path d="M5 13l7 7 7-7"/>
                      </svg>
                    </div>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                      {t(lang, 'youCanGive')} <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>({result.canGive.length})</span>
                    </div>
                  </div>
                  <StickerChips ids={result.canGive} />
                </div>
              )}

              {result.canGive.length > 0 && result.canGet.length > 0 && (
                <div style={{
                  height: 1, margin: '0 14px',
                  background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)',
                }} />
              )}

              {/* Can get (green ↑) */}
              {result.canGet.length > 0 && (
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: 'var(--c-green)', display: 'grid', placeItems: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20V5"/><path d="M5 11l7-7 7 7"/>
                      </svg>
                    </div>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                      {t(lang, 'theyHaveYouNeed')} <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>({result.canGet.length})</span>
                    </div>
                  </div>
                  <StickerChips ids={result.canGet} />
                </div>
              )}
            </div>
          )}

          {/* Propose trade CTA */}
          {totalMatches > 0 && (
            <button
              onClick={() => onProposeTrade?.({ canGive: result.canGive, canGet: result.canGet })}
              style={{
                width: '100%', marginTop: 14, padding: 12,
                borderRadius: 'var(--r-button)',
                background: 'var(--c-green)', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ⇄ {t(lang, 'proposeTrade')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
