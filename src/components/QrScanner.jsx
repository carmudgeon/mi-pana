import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { decode, computeMatches } from '../utils/qrCodec.js';
import { getTeamAccent } from '../data.js';
import { t } from '../i18n.js';

export default function QrScanner({ collection, lang }) {
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

    const matches = computeMatches(collection, decoded.stickers, decoded.mode);
    setResult({ matches, mode: decoded.mode, total: decoded.stickers.length });
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
        let w = img.width;
        let h = img.height;
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
        } catch (err) {
          setError(t(lang, 'invalidQr'));
        }
        setScanning(false);
      };
      img.onerror = () => {
        setError(t(lang, 'invalidQr'));
        setScanning(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  };

  const groupByTeam = (ids) => {
    const grouped = {};
    for (const id of ids) {
      const [team, num] = id.split('-');
      if (!grouped[team]) grouped[team] = [];
      grouped[team].push(num);
    }
    return Object.entries(grouped);
  };

  return (
    <div style={{ padding: '0 var(--screen-margin)' }}>
      {/* Text input */}
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

      {/* Actions */}
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
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload}
          style={{ display: 'none' }} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 'var(--r-sticker)',
          background: 'rgba(230,30,60,0.08)', color: 'var(--c-red)',
          fontSize: 12, fontWeight: 700, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
              {result.mode === 'D' ? t(lang, 'theyHaveYouNeed') : t(lang, 'youCanGive')}
            </div>
            <div style={{
              background: result.matches.length > 0 ? 'var(--c-green)' : 'var(--muted)',
              color: '#fff', padding: '4px 10px', borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            }}>
              {t(lang, 'matchesFound', result.matches.length)}
            </div>
          </div>

          {result.matches.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 32, color: 'var(--muted)',
              fontSize: 13, background: 'rgba(13,16,36,0.03)',
              borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
            }}>
              {t(lang, 'noMatches')}
            </div>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 'var(--r-card)',
              border: '1px solid var(--line)', padding: 14,
              boxShadow: 'var(--shadow-card)',
            }}>
              {groupByTeam(result.matches).map(([team, nums]) => (
                <div key={team} style={{ marginBottom: 10 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                    color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: 6,
                  }}>
                    {team}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {nums.map(num => (
                      <div key={num} style={{
                        height: 28, padding: '0 8px', borderRadius: 7,
                        background: getTeamAccent(team),
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 800, color: '#fff',
                      }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, opacity: 0.8 }}>{team}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
