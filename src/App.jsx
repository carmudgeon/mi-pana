import { useState } from 'react';
import useCollection from './hooks/useCollection.js';
import { useAuth } from './context/useAuth.js';
import AlbumOverviewScreen from './screens/AlbumOverviewScreen.jsx';
import TeamDetailScreen from './screens/TeamDetailScreen.jsx';
import TradeMatchesScreen from './screens/TradeMatchesScreen.jsx';
import FullGridScreen from './screens/FullGridScreen.jsx';
import AuthModal from './components/AuthModal.jsx';

export default function App() {
  const { user } = useAuth();
  const { collection, setSticker, loading } = useCollection();
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const lang = 'es';
  const userName = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'Panita';

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
    for (const id of trade.canGive) {
      const qty = collection[id] || 0;
      if (qty >= 2) setSticker(id, qty - 1);
    }
    for (const id of trade.canGet) {
      setSticker(id, (collection[id] || 0) + 1);
    }
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

  // Show a minimal loading state while fetching from Supabase
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#fff', fontFamily: 'var(--font-body)',
        color: 'var(--muted)', fontSize: 13,
      }}>
        Cargando…
      </div>
    );
  }

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
