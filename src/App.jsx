import React, { useState } from 'react';
import usePersistentState from './hooks/usePersistentState.js';
import AlbumOverviewScreen from './screens/AlbumOverviewScreen.jsx';
import TeamDetailScreen from './screens/TeamDetailScreen.jsx';
import TradeMatchesScreen from './screens/TradeMatchesScreen.jsx';

export default function App() {
  const [collection, setCollection] = usePersistentState('panini2026-collection', {});
  const [trades, setTrades] = usePersistentState('panini2026-trades', []);
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
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

  const addTrade = (proposal) => {
    const trade = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      canGive: proposal.canGive,
      canGet: proposal.canGet,
    };
    setTrades(prev => [trade, ...prev]);
  };

  const acceptTrade = (trade) => {
    setCollection(prev => {
      const next = { ...prev };
      for (const id of trade.canGive) {
        const qty = next[id] || 0;
        if (qty >= 2) next[id] = qty - 1;
      }
      for (const id of trade.canGet) {
        next[id] = (next[id] || 0) + 1;
      }
      return next;
    });
    setTrades(prev => prev.filter(t => t.id !== trade.id));
  };

  const rejectTrade = (tradeId) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const handleNavigate = (tab) => {
    if (tab === 'home' || tab === 'teams') { setView('home'); setSelectedTeam(null); }
    else if (tab === 'trade') setView('trade');
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
    return <TradeMatchesScreen lang={lang} collection={collection} trades={trades}
      onAcceptTrade={acceptTrade} onRejectTrade={rejectTrade} onProposeTrade={addTrade}
      onNavigate={handleNavigate} />;
  }

  return (
    <AlbumOverviewScreen collection={collection} setSticker={setSticker} lang={lang} userName={userName}
      onSelectTeam={handleSelectTeam} onNavigate={handleNavigate} />
  );
}
