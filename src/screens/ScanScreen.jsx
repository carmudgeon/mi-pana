import React, { useState } from 'react';
import QrGenerator from '../components/QrGenerator.jsx';
import QrScanner from '../components/QrScanner.jsx';
import TabBar from '../components/TabBar.jsx';
import { t } from '../i18n.js';
import './ScanScreen.css';

export default function ScanScreen({ collection, lang, onNavigate }) {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '8px 18px 12px' }}>
        <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>
          {t(lang, 'scanTitle')}
        </b>
      </div>

      {/* Tab toggle */}
      <div className="scan-tabs">
        <button
          className={`scan-tab ${activeTab === 'generate' ? 'on' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          {t(lang, 'generateTab')}
        </button>
        <button
          className={`scan-tab ${activeTab === 'scan' ? 'on' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          {t(lang, 'scanTab')}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 16 }}>
        {activeTab === 'generate'
          ? <QrGenerator collection={collection} lang={lang} />
          : <QrScanner collection={collection} lang={lang} />
        }
      </div>

      <TabBar active="scan" onNavigate={onNavigate} />
    </div>
  );
}
