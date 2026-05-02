import React, { useState } from 'react';
import useSupabaseSync from './hooks/useSupabaseSync.js';
import { mergeCollections } from './utils/mergeCollections.js';
import { useAuth } from './context/useAuth.js';
import AlbumOverviewScreen from './screens/AlbumOverviewScreen.jsx';
import TeamDetailScreen from './screens/TeamDetailScreen.jsx';
import TradeMatchesScreen from './screens/TradeMatchesScreen.jsx';
import FullGridScreen from './screens/FullGridScreen.jsx';
import AuthModal from './components/AuthModal.jsx';

export default function App() {
  const { user } = useAuth();
  const [collection, setCollection] = useSupabaseSync('panini2026-collection', {}, { mergeFn: mergeCollections });
  const [trades, setTrades] = useSupabaseSync('panini2026-trades', []);
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const lang = 'es';
  const userName = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'Diego';

  const setSticker = (id, qty) => {
    setCollection(prev => {
      const next = { ...prev };
      // Soft-delete: keep the key with quantity 0 so Supabase stays in sync.
      // The local collection object uses 0 to mean "not owned".
      next[id] = Math.max(0, qty);
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
    else if (tab === 'grid') setView('grid');
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

  if (view === 'grid') {
    return <FullGridScreen collection={collection} setSticker={setSticker}
      lang={lang} onBack={() => setView('home')} onNavigate={handleNavigate} />;
  }

  if (view === 'trade') {
    return <TradeMatchesScreen lang={lang} collection={collection} trades={trades}
      onAcceptTrade={acceptTrade} onRejectTrade={rejectTrade} onProposeTrade={addTrade}
      onNavigate={handleNavigate} />;
  }

  return (
    <>
      <AlbumOverviewScreen collection={collection} setSticker={setSticker} lang={lang} userName={userName}
        trades={trades} onSelectTeam={handleSelectTeam} onNavigate={handleNavigate}
        isGuest={!user} onSignInClick={() => setAuthModalOpen(true)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
