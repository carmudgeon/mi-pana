import React, { useState } from 'react';
import usePersistentState from './hooks/usePersistentState.js';
import AlbumOverviewScreen from './screens/AlbumOverviewScreen.jsx';
import TeamDetailScreen from './screens/TeamDetailScreen.jsx';
import TradeMatchesScreen from './screens/TradeMatchesScreen.jsx';
import ScanScreen from './screens/ScanScreen.jsx';

export default function App() {
  const [collection, setCollection] = usePersistentState('panini2026-collection', {});
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [pendingTrade, setPendingTrade] = useState(null);
  const lang = 'es';
  const userName = 'Diego';

  const setSticker = (id, qty) => {
    setCollection(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const handleNavigate = (tab) => {
    if (tab === 'home' || tab === 'teams') { setView('home'); setSelectedTeam(null); }
    else if (tab === 'trade') setView('trade');
    else if (tab === 'scan') setView('scan');
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setView('team');
  };

  if (view === 'team' && selectedTeam) {
    return (
      <TeamDetailScreen team={selectedTeam} collection={collection} setSticker={setSticker}
        lang={lang} onBack={() => { setView('home'); setSelectedTeam(null); }} onNavigate={handleNavigate} />
    );
  }

  if (view === 'trade') {
    return <TradeMatchesScreen lang={lang} pendingTrade={pendingTrade}
      onClearTrade={() => setPendingTrade(null)} onNavigate={handleNavigate} />;
  }

  if (view === 'scan') {
    return <ScanScreen collection={collection} lang={lang} onNavigate={handleNavigate}
      onProposeTrade={(proposal) => { setPendingTrade(proposal); setView('trade'); }} />;
  }

  return (
    <AlbumOverviewScreen collection={collection} setSticker={setSticker} lang={lang} userName={userName}
      onSelectTeam={handleSelectTeam} onNavigate={handleNavigate} />
  );
}
