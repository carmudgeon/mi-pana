import React, { useState } from 'react';
import QrGenerator from '../components/QrGenerator.jsx';
import QrScanner from '../components/QrScanner.jsx';
import TabBar from '../components/TabBar.jsx';
import { t } from '../i18n.js';
import './ScanScreen.css';

export default function ScanScreen({ collection, lang, onNavigate }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [tradeProposal, setTradeProposal] = useState(null);

  const handleProposeTrade = (proposal) => {
    setTradeProposal(proposal);
    // TODO: connect to real trade flow / send to trade screen
    alert(`Trueque propuesto: das ${proposal.canGive.length} cromos, recibes ${proposal.canGet.length} cromos`);
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 18px 12px' }}>
        <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>
          {t(lang, 'scanTitle')}
        </b>
      </div>

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

      <div style={{ flex: 1, paddingBottom: 16 }}>
        {activeTab === 'generate'
          ? <QrGenerator collection={collection} lang={lang} />
          : <QrScanner collection={collection} lang={lang} onProposeTrade={handleProposeTrade} />
        }
      </div>

      <TabBar active="scan" onNavigate={onNavigate} />
    </div>
  );
}
