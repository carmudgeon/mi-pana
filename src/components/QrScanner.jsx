import React, { useState, useRef, useEffect, useCallback } from 'react';
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

function CameraScanner({ onDetected, lang }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        function scan() {
          if (!mounted || video.readyState !== video.HAVE_ENOUGH_DATA) {
            rafRef.current = requestAnimationFrame(scan);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code?.data) {
            onDetected(code.data);
            return;
          }

          rafRef.current = requestAnimationFrame(scan);
        }

        rafRef.current = requestAnimationFrame(scan);
      } catch (err) {
        if (mounted) setCameraError(err.message || 'Camera not available');
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [onDetected, stopCamera]);

  if (cameraError) {
    return (
      <div style={{
        padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 12,
        background: 'rgba(13,16,36,0.04)', borderRadius: 'var(--r-card)',
      }}>
        {cameraError}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ width: '100%', display: 'block', borderRadius: 'var(--r-card)' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* Scan overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 180, height: 180,
          border: '3px solid var(--c-yellow)',
          borderRadius: 16,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  );
}

export default function QrScanner({ collection, lang, onProposeTrade }) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const runAnalysis = useCallback((text) => {
    const payload = text.trim();
    setError(null);
    setResult(null);

    const decoded = decode(payload);
    if (!decoded) {
      setError(t(lang, 'invalidQr'));
      return;
    }

    const { canGive, canGet } = computeMatches(collection, decoded);
    setResult({ canGive, canGet });
  }, [collection, lang]);

  const handleAnalyze = () => runAnalysis(inputText);

  const handleCameraDetected = useCallback((data) => {
    setCameraOpen(false);
    setInputText(data);
    runAnalysis(data);
  }, [runAnalysis]);

  const totalMatches = result ? result.canGive.length + result.canGet.length : 0;

  return (
    <div style={{ padding: '0 var(--screen-margin)' }}>
      {/* Camera */}
      {cameraOpen ? (
        <div style={{ marginBottom: 12 }}>
          <CameraScanner onDetected={handleCameraDetected} lang={lang} />
          <button onClick={() => setCameraOpen(false)} style={{
            width: '100%', marginTop: 8, padding: 10, borderRadius: 'var(--r-button)',
            background: '#fff', color: 'var(--ink)',
            border: '1px solid var(--line-strong)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}>
            {t(lang, 'closeCamera')}
          </button>
        </div>
      ) : (
        <>
          {/* Open camera button */}
          <button onClick={() => { setCameraOpen(true); setError(null); setResult(null); }} style={{
            width: '100%', padding: 12, borderRadius: 'var(--r-button)',
            background: 'var(--ink)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            {t(lang, 'openCamera')}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            O
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

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

          <button onClick={handleAnalyze} disabled={!inputText.trim()} style={{
            width: '100%', marginTop: 8, padding: 10, borderRadius: 'var(--r-button)',
            background: inputText.trim() ? 'var(--c-blue)' : 'rgba(13,16,36,0.08)',
            color: inputText.trim() ? '#fff' : 'var(--muted)', border: 'none',
            fontSize: 12, fontWeight: 800, cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)',
          }}>
            {t(lang, 'analyze')}
          </button>
        </>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 'var(--r-sticker)',
          background: 'rgba(230,30,60,0.08)', color: 'var(--c-red)',
          fontSize: 12, fontWeight: 700, textAlign: 'center',
        }}>{error}</div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 16 }}>
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
