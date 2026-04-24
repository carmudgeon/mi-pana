import React, { useState, useEffect, useMemo } from 'react';
import { Search, Check, Plus, Minus, Trophy, Users, Building2, Shield, X, BarChart3, Filter, Sparkles, ArrowLeft, Repeat, Star } from 'lucide-react';

// ============================================
// DATOS DEL ÁLBUM PANINI FIFA WORLD CUP 2026
// 980 láminas totales: 48 equipos x 20 + secciones especiales
// ============================================

const TEAMS = [
  // CONCACAF (6)
  { code: 'CAN', name: 'Canadá', flag: '🇨🇦', confed: 'CONCACAF', group: 'B' },
  { code: 'MEX', name: 'México', flag: '🇲🇽', confed: 'CONCACAF', group: 'A' },
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', confed: 'CONCACAF', group: 'D' },
  { code: 'JAM', name: 'Jamaica', flag: '🇯🇲', confed: 'CONCACAF', group: 'F' },
  { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', confed: 'CONCACAF', group: 'E' },
  { code: 'PAN', name: 'Panamá', flag: '🇵🇦', confed: 'CONCACAF', group: 'I' },
  // CONMEBOL (6)
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', confed: 'CONMEBOL', group: 'C' },
  { code: 'BRA', name: 'Brasil', flag: '🇧🇷', confed: 'CONMEBOL', group: 'G' },
  { code: 'URU', name: 'Uruguay', flag: '🇺🇾', confed: 'CONMEBOL', group: 'H' },
  { code: 'COL', name: 'Colombia', flag: '🇨🇴', confed: 'CONMEBOL', group: 'J' },
  { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', confed: 'CONMEBOL', group: 'K' },
  { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', confed: 'CONMEBOL', group: 'L' },
  // UEFA (16)
  { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confed: 'UEFA', group: 'A' },
  { code: 'FRA', name: 'Francia', flag: '🇫🇷', confed: 'UEFA', group: 'B' },
  { code: 'CRO', name: 'Croacia', flag: '🇭🇷', confed: 'UEFA', group: 'C' },
  { code: 'NOR', name: 'Noruega', flag: '🇳🇴', confed: 'UEFA', group: 'D' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', confed: 'UEFA', group: 'E' },
  { code: 'GER', name: 'Alemania', flag: '🇩🇪', confed: 'UEFA', group: 'F' },
  { code: 'NED', name: 'Países Bajos', flag: '🇳🇱', confed: 'UEFA', group: 'G' },
  { code: 'SUI', name: 'Suiza', flag: '🇨🇭', confed: 'UEFA', group: 'H' },
  { code: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confed: 'UEFA', group: 'I' },
  { code: 'ESP', name: 'España', flag: '🇪🇸', confed: 'UEFA', group: 'J' },
  { code: 'AUT', name: 'Austria', flag: '🇦🇹', confed: 'UEFA', group: 'K' },
  { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', confed: 'UEFA', group: 'L' },
  { code: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦', confed: 'UEFA', group: 'A' },
  { code: 'SWE', name: 'Suecia', flag: '🇸🇪', confed: 'UEFA', group: 'B' },
  { code: 'TUR', name: 'Turquía', flag: '🇹🇷', confed: 'UEFA', group: 'C' },
  { code: 'CZE', name: 'Chequia', flag: '🇨🇿', confed: 'UEFA', group: 'D' },
  // CAF (9)
  { code: 'ALG', name: 'Argelia', flag: '🇩🇿', confed: 'CAF', group: 'E' },
  { code: 'CPV', name: 'Cabo Verde', flag: '🇨🇻', confed: 'CAF', group: 'F' },
  { code: 'EGY', name: 'Egipto', flag: '🇪🇬', confed: 'CAF', group: 'G' },
  { code: 'GHA', name: 'Ghana', flag: '🇬🇭', confed: 'CAF', group: 'H' },
  { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', confed: 'CAF', group: 'I' },
  { code: 'MAR', name: 'Marruecos', flag: '🇲🇦', confed: 'CAF', group: 'J' },
  { code: 'SEN', name: 'Senegal', flag: '🇸🇳', confed: 'CAF', group: 'K' },
  { code: 'RSA', name: 'Sudáfrica', flag: '🇿🇦', confed: 'CAF', group: 'L' },
  { code: 'TUN', name: 'Túnez', flag: '🇹🇳', confed: 'CAF', group: 'A' },
  // AFC (8) + Australia
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', confed: 'AFC', group: 'B' },
  { code: 'IRN', name: 'Irán', flag: '🇮🇷', confed: 'AFC', group: 'C' },
  { code: 'JPN', name: 'Japón', flag: '🇯🇵', confed: 'AFC', group: 'D' },
  { code: 'JOR', name: 'Jordania', flag: '🇯🇴', confed: 'AFC', group: 'E' },
  { code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', confed: 'AFC', group: 'F' },
  { code: 'KSA', name: 'Arabia Saudita', flag: '🇸🇦', confed: 'AFC', group: 'G' },
  { code: 'QAT', name: 'Catar', flag: '🇶🇦', confed: 'AFC', group: 'H' },
  { code: 'UZB', name: 'Uzbekistán', flag: '🇺🇿', confed: 'AFC', group: 'I' },
  // OFC (1)
  { code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', confed: 'OFC', group: 'J' },
  // Playoffs intercontinentales (2)
  { code: 'COD', name: 'RD del Congo', flag: '🇨🇩', confed: 'CAF', group: 'K' },
  { code: 'IRQ', name: 'Irak', flag: '🇮🇶', confed: 'AFC', group: 'L' },
];

const TEAM_COLORS = {
  CAN: { primary: '#FF0000', secondary: '#FFFFFF' },
  MEX: { primary: '#006847', secondary: '#CE1126' },
  USA: { primary: '#002868', secondary: '#BF0A30' },
  JAM: { primary: '#009B3A', secondary: '#FED100' },
  CRC: { primary: '#002B7F', secondary: '#CE1126' },
  PAN: { primary: '#DA121A', secondary: '#003DA5' },
  ARG: { primary: '#75AADB', secondary: '#FFFFFF' },
  BRA: { primary: '#CAAB2D', secondary: '#009739' },
  URU: { primary: '#5CBFEB', secondary: '#FFFFFF' },
  COL: { primary: '#FCD116', secondary: '#003893' },
  ECU: { primary: '#FFD100', secondary: '#034EA2' },
  PAR: { primary: '#DA121A', secondary: '#0038A8' },
  ENG: { primary: '#FFFFFF', secondary: '#CF081F' },
  FRA: { primary: '#002395', secondary: '#ED2939' },
  CRO: { primary: '#FF0000', secondary: '#FFFFFF' },
  NOR: { primary: '#EF2B2D', secondary: '#002868' },
  POR: { primary: '#006600', secondary: '#FF0000' },
  GER: { primary: '#000000', secondary: '#DD0000' },
  NED: { primary: '#FF6600', secondary: '#FFFFFF' },
  SUI: { primary: '#FF0000', secondary: '#FFFFFF' },
  SCO: { primary: '#003078', secondary: '#FFFFFF' },
  ESP: { primary: '#AA151B', secondary: '#F1BF00' },
  AUT: { primary: '#ED2939', secondary: '#FFFFFF' },
  BEL: { primary: '#ED2939', secondary: '#000000' },
  BIH: { primary: '#002395', secondary: '#FECB00' },
  SWE: { primary: '#006AA7', secondary: '#FECC00' },
  TUR: { primary: '#E30A17', secondary: '#FFFFFF' },
  CZE: { primary: '#11457E', secondary: '#D7141A' },
  ALG: { primary: '#006633', secondary: '#FFFFFF' },
  CPV: { primary: '#003893', secondary: '#CF2027' },
  EGY: { primary: '#CE1126', secondary: '#FFFFFF' },
  GHA: { primary: '#006B3F', secondary: '#FCD116' },
  CIV: { primary: '#FF8200', secondary: '#009A44' },
  MAR: { primary: '#C1272D', secondary: '#006233' },
  SEN: { primary: '#009639', secondary: '#FDEF42' },
  RSA: { primary: '#007749', secondary: '#FFB81C' },
  TUN: { primary: '#E70013', secondary: '#FFFFFF' },
  AUS: { primary: '#00843D', secondary: '#FFCD00' },
  IRN: { primary: '#239F40', secondary: '#DA0000' },
  JPN: { primary: '#000080', secondary: '#FFFFFF' },
  JOR: { primary: '#007A3D', secondary: '#CE1126' },
  KOR: { primary: '#CD2E3A', secondary: '#0047A0' },
  KSA: { primary: '#006C35', secondary: '#FFFFFF' },
  QAT: { primary: '#8A1538', secondary: '#FFFFFF' },
  UZB: { primary: '#1EB53A', secondary: '#0099B5' },
  NZL: { primary: '#000000', secondary: '#FFFFFF' },
  COD: { primary: '#007FFF', secondary: '#CE1021' },
  IRQ: { primary: '#007A3D', secondary: '#FFFFFF' },
};

const SECTION_COLORS = {
  intro:    { primary: '#1A3A5C', secondary: '#D4AF37' },
  legends:  { primary: '#1C1C1C', secondary: '#D4AF37' },
  stadium:  { primary: '#1A5C3A', secondary: '#4D7CFF' },
  special:  { primary: '#2D1B69', secondary: '#D4AF37' },
};

const getStickerColors = (sticker) => {
  if (sticker.teamCode) return TEAM_COLORS[sticker.teamCode];
  return SECTION_COLORS[sticker.category] || SECTION_COLORS.special;
};

const SILHOUETTES = {
  player: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-4 14h8a4 4 0 0 1 4 4v10l4 6-3 2-4-5v7l3 12h-4l-4-10-4 10h-4l3-12v-7l-4 5-3-2 4-6V26a4 4 0 0 1 4-4z"/>
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4L8 16v14c0 13.2 9.4 25.5 22 28.5 12.6-3 22-15.3 22-28.5V16L30 4zm0 6l16 9v11c0 10.2-7 19.7-16 22.2C21 49.7 14 40.2 14 30V19l16-9z"/>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 80 60" width="80" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14" r="6"/><rect x="14" y="22" width="12" height="20" rx="3"/>
      <circle cx="40" cy="10" r="7"/><rect x="33" y="19" width="14" height="24" rx="3"/>
      <circle cx="60" cy="14" r="6"/><rect x="54" y="22" width="12" height="20" rx="3"/>
    </svg>
  ),
  stadium: (
    <svg viewBox="0 0 80 60" width="80" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 50h72v4H4zM10 50V30l6-8h48l6 8v20H10zm8-4h44V32H18v14zM16 22l4-6h40l4 6H16zM24 16l2-4h28l2 4H24z"/>
    </svg>
  ),
  legends: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-4 14h8a4 4 0 0 1 4 4v8h-3v18h-2V42h-6v10h-2V32h-3v-8a4 4 0 0 1 4-4zm-8-8l4-6h2l-3 6h-3zm16 0l-4-6h-2l3 6h3zM22 6h16v2c0 2-3 4-8 4S22 10 22 8V6z"/>
    </svg>
  ),
  intro: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4l4 8h-2v6c6 0 12 4 14 10h-4c-2-4-6-6-10-6s-8 2-10 6h-4c2-6 8-10 14-10v-6h-2l4-8zM18 32h24v4c0 8-5 14-12 16-7-2-12-8-12-16v-4zm4 4v0c0 6 4 10 8 12 4-2 8-6 8-12H22z"/>
    </svg>
  ),
  special: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4l6.9 14h15.3l-12.4 9 4.7 14.5L30 32.3 15.5 41.5l4.7-14.5L7.8 18H23.1L30 4z"/>
    </svg>
  ),
};

const getSilhouette = (category) => SILHOUETTES[category] || SILHOUETTES.special;

const STADIUMS = [
  { code: 'MEX1', name: 'Estadio Azteca', city: 'Ciudad de México', country: 'México' },
  { code: 'MEX2', name: 'Estadio Akron', city: 'Guadalajara', country: 'México' },
  { code: 'MEX3', name: 'Estadio BBVA', city: 'Monterrey', country: 'México' },
  { code: 'CAN1', name: 'BMO Field', city: 'Toronto', country: 'Canadá' },
  { code: 'CAN2', name: 'BC Place', city: 'Vancouver', country: 'Canadá' },
  { code: 'USA1', name: 'MetLife Stadium', city: 'Nueva York/Nueva Jersey', country: 'EE.UU.' },
  { code: 'USA2', name: 'SoFi Stadium', city: 'Los Ángeles', country: 'EE.UU.' },
  { code: 'USA3', name: 'AT&T Stadium', city: 'Dallas', country: 'EE.UU.' },
  { code: 'USA4', name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'EE.UU.' },
  { code: 'USA5', name: 'NRG Stadium', city: 'Houston', country: 'EE.UU.' },
  { code: 'USA6', name: 'Hard Rock Stadium', city: 'Miami', country: 'EE.UU.' },
  { code: 'USA7', name: 'Lincoln Financial Field', city: 'Filadelfia', country: 'EE.UU.' },
  { code: 'USA8', name: 'Levi\'s Stadium', city: 'San Francisco', country: 'EE.UU.' },
  { code: 'USA9', name: 'GEHA Field', city: 'Kansas City', country: 'EE.UU.' },
  { code: 'USA10', name: 'Lumen Field', city: 'Seattle', country: 'EE.UU.' },
  { code: 'USA11', name: 'Gillette Stadium', city: 'Boston/Foxborough', country: 'EE.UU.' },
];

// Construir todas las láminas
const buildAllStickers = () => {
  const stickers = [];
  // Portada e introducción (10 láminas)
  for (let i = 1; i <= 10; i++) {
    stickers.push({ id: `INTRO-${i}`, section: 'Introducción', category: 'intro', number: i });
  }
  // Trofeo y legendarios (12 láminas)
  for (let i = 1; i <= 12; i++) {
    stickers.push({ id: `LEG-${i}`, section: 'Leyendas del Mundial', category: 'legends', number: i });
  }
  // Estadios (16 láminas, una por sede)
  STADIUMS.forEach((s, idx) => {
    stickers.push({
      id: `STAD-${s.code}`,
      section: 'Estadios',
      category: 'stadium',
      name: s.name,
      city: s.city,
      country: s.country,
      number: idx + 1,
    });
  });
  // Por cada equipo: 1 escudo + 1 foto grupal + 18 jugadores = 20 láminas
  TEAMS.forEach((team) => {
    stickers.push({
      id: `${team.code}-BADGE`,
      section: team.name,
      category: 'badge',
      teamCode: team.code,
      teamName: team.name,
      flag: team.flag,
      confed: team.confed,
      number: 1,
    });
    stickers.push({
      id: `${team.code}-TEAM`,
      section: team.name,
      category: 'team',
      teamCode: team.code,
      teamName: team.name,
      flag: team.flag,
      confed: team.confed,
      number: 2,
    });
    for (let i = 1; i <= 18; i++) {
      stickers.push({
        id: `${team.code}-P${i}`,
        section: team.name,
        category: 'player',
        teamCode: team.code,
        teamName: team.name,
        flag: team.flag,
        confed: team.confed,
        number: i + 2,
        playerNum: i,
      });
    }
  });
  // Láminas finales: mascota, balón, himno, cierre (hasta completar 980)
  const remaining = 980 - stickers.length;
  for (let i = 1; i <= remaining; i++) {
    stickers.push({ id: `EXTRA-${i}`, section: 'Especiales', category: 'special', number: i });
  }
  return stickers;
};

const ALL_STICKERS = buildAllStickers();

// ============================================
// HOOK DE PERSISTENCIA
// ============================================
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error cargando', e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Error guardando', e);
    }
  }, [state, key]);

  return [state, setState, true];
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PaniniMundial2026() {
  // collection[id] = cantidad (0 = no tiene, 1 = pegada, 2+ = repetidas)
  const [collection, setCollection] = usePersistentState('panini2026-collection', {});
  const [view, setView] = useState('home'); // home | team | section | repes
  const [selectedSection, setSelectedSection] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | missing | owned | repeated
  const [confedFilter, setConfedFilter] = useState('ALL');

  const setSticker = (id, qty) => {
    setCollection((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const stats = useMemo(() => {
    const owned = ALL_STICKERS.filter((s) => (collection[s.id] || 0) >= 1).length;
    const total = ALL_STICKERS.length;
    const repes = Object.entries(collection).reduce(
      (acc, [id, q]) => acc + Math.max(0, q - 1),
      0
    );
    const missing = total - owned;
    return { owned, total, repes, missing, pct: Math.round((owned / total) * 100) };
  }, [collection]);

  const sections = useMemo(() => {
    const map = new Map();
    ALL_STICKERS.forEach((s) => {
      if (!map.has(s.section)) {
        map.set(s.section, {
          name: s.section,
          stickers: [],
          flag: s.flag,
          confed: s.confed,
          category: s.category,
          teamCode: s.teamCode,
        });
      }
      map.get(s.section).stickers.push(s);
    });
    return Array.from(map.values()).map((sec) => {
      const owned = sec.stickers.filter((s) => (collection[s.id] || 0) >= 1).length;
      return { ...sec, owned, total: sec.stickers.length };
    });
  }, [collection]);

  const teamSections = sections.filter((s) => s.teamCode);
  const specialSections = sections.filter((s) => !s.teamCode);

  const filteredTeams = teamSections.filter((s) => {
    if (confedFilter !== 'ALL' && s.confed !== confedFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Archivo:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        :root {
          --bg: #0a0e1a;
          --bg-2: #121828;
          --bg-3: #1a2137;
          --fg: #f5f0e8;
          --fg-muted: #8a90a8;
          --accent: #ff2d55;
          --accent-2: #00d9a7;
          --accent-3: #ffb800;
          --accent-4: #4d7cff;
          --border: rgba(245, 240, 232, 0.1);
          --font-display: 'Bungee', cursive;
          --font-body: 'Archivo', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .panini-btn {
          cursor: pointer;
          border: none;
          transition: all 0.15s ease;
          font-family: var(--font-body);
          font-weight: 600;
        }
        .panini-btn:hover { transform: translateY(-1px); }
        .panini-btn:active { transform: translateY(0); }
        .sticker-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sticker-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .sticker-card:hover .holo-overlay {
          opacity: 1;
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shine-text {
          background: linear-gradient(90deg, var(--accent-3) 0%, var(--fg) 50%, var(--accent-3) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        .confetti-bg {
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,45,85,0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(0,217,167,0.08) 0%, transparent 40%),
            radial-gradient(circle at 60% 80%, rgba(255,184,0,0.08) 0%, transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(77,124,255,0.08) 0%, transparent 40%);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: slideUp 0.3s ease-out; }
        @keyframes hologram {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .sticker-flip-container {
          perspective: 800px;
        }
        @keyframes flipReveal {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(180deg); }
        }
        .sticker-flip-inner {
          position: relative;
          transform-style: preserve-3d;
        }
        .sticker-flip-inner.flipping {
          animation: flipReveal 600ms ease-in-out forwards;
        }
        .sticker-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .sticker-front {
          transform: rotateY(180deg);
        }
        .sticker-back {
          transform: rotateY(0deg);
        }
      `}</style>

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('home')}>
            <div style={{
              width: 44, height: 44, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 45, 85, 0.4)',
            }}>
              <Trophy size={22} color="#000" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1, letterSpacing: '0.02em' }}>PANINI 26</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Mundial USA · MEX · CAN</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatBadge label="Pegadas" value={`${stats.owned}/${stats.total}`} color="var(--accent-2)" />
            <StatBadge label="Faltan" value={stats.missing} color="var(--accent)" />
            <StatBadge label="Repes" value={stats.repes} color="var(--accent-3)" icon={<Repeat size={12} />} />
          </div>
        </div>
        {/* BARRA DE PROGRESO */}
        <div style={{ height: 4, background: 'var(--bg-3)' }}>
          <div style={{
            height: '100%',
            width: `${stats.pct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-3) 50%, var(--accent-2) 100%)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>
        {view === 'home' && (
          <HomeView
            stats={stats}
            teamSections={filteredTeams}
            specialSections={specialSections}
            onSelectSection={(s) => { setSelectedSection(s); setView('section'); }}
            onViewRepes={() => setView('repes')}
            search={search} setSearch={setSearch}
            confedFilter={confedFilter} setConfedFilter={setConfedFilter}
          />
        )}
        {view === 'section' && selectedSection && (
          <SectionView
            section={selectedSection}
            collection={collection}
            setSticker={setSticker}
            onBack={() => setView('home')}
            filter={filter}
            setFilter={setFilter}
          />
        )}
        {view === 'repes' && (
          <RepesView
            collection={collection}
            setSticker={setSticker}
            onBack={() => setView('home')}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--fg-muted)', fontSize: 12, borderTop: '1px solid var(--border)' }}>
        Álbum oficial Panini FIFA World Cup 2026™ · 980 láminas · Tu colección se guarda automáticamente
      </footer>
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

function StatBadge({ label, value, color, icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '6px 12px', borderRadius: 8,
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      minWidth: 72,
    }}>
      <div style={{ fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function HomeView({ stats, teamSections, specialSections, onSelectSection, onViewRepes, search, setSearch, confedFilter, setConfedFilter }) {
  const confederations = [
    { code: 'ALL', label: 'Todas', color: 'var(--fg)' },
    { code: 'CONMEBOL', label: 'Conmebol', color: 'var(--accent-3)' },
    { code: 'UEFA', label: 'UEFA', color: 'var(--accent-4)' },
    { code: 'CONCACAF', label: 'Concacaf', color: 'var(--accent-2)' },
    { code: 'CAF', label: 'CAF', color: 'var(--accent)' },
    { code: 'AFC', label: 'AFC', color: '#c084fc' },
    { code: 'OFC', label: 'OFC', color: '#60a5fa' },
  ];

  return (
    <div className="fade-in confetti-bg" style={{ borderRadius: 16, margin: -24, padding: 24 }}>
      {/* HERO */}
      <div style={{ marginBottom: 40, padding: '32px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent-3)', marginBottom: 12, textTransform: 'uppercase', fontWeight: 700 }}>
          ★ Tu colección mundialista ★
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 7vw, 72px)',
          lineHeight: 0.95, margin: 0,
          letterSpacing: '-0.02em',
        }}>
          <span className="shine-text">ÁLBUM</span>
          <br />
          <span style={{ color: 'var(--fg)' }}>MUNDIAL</span>
          <span style={{ color: 'var(--accent)' }}>26</span>
        </h1>
        <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <BigStat value={stats.owned} total={stats.total} label="pegadas" pct={stats.pct} />
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', maxWidth: 300, lineHeight: 1.6 }}>
            48 selecciones · 16 estadios · 980 láminas en total. Clasifica cada una que consigas y controla tus repetidas para cambiar con amigos.
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        <QuickAction
          icon={<Repeat size={18} />}
          title="Mis repes"
          subtitle={`${stats.repes} láminas para cambiar`}
          onClick={onViewRepes}
          accent="var(--accent-3)"
        />
        <QuickAction
          icon={<BarChart3 size={18} />}
          title="Progreso"
          subtitle={`${stats.pct}% completado`}
          onClick={() => {}}
          accent="var(--accent-2)"
        />
        <QuickAction
          icon={<Star size={18} />}
          title="Faltan"
          subtitle={`${stats.missing} láminas`}
          onClick={() => {}}
          accent="var(--accent)"
        />
      </div>

      {/* SECCIONES ESPECIALES */}
      <SectionTitle title="Secciones especiales" subtitle="Portada, leyendas y estadios" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 40 }}>
        {specialSections.map((sec) => (
          <SpecialSectionCard key={sec.name} section={sec} onClick={() => onSelectSection(sec)} />
        ))}
      </div>

      {/* FILTROS DE EQUIPOS */}
      <SectionTitle title="Selecciones" subtitle={`${teamSections.length} equipos clasificados`} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 240px', position: 'relative',
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '0 14px',
        }}>
          <Search size={16} color="var(--fg-muted)" />
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              color: 'var(--fg)', padding: '12px 10px', outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 14,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {confederations.map((c) => (
          <button
            key={c.code}
            className="panini-btn"
            onClick={() => setConfedFilter(c.code)}
            style={{
              padding: '8px 14px', borderRadius: 20,
              background: confedFilter === c.code ? c.color : 'var(--bg-2)',
              color: confedFilter === c.code ? '#000' : 'var(--fg)',
              border: `1px solid ${confedFilter === c.code ? c.color : 'var(--border)'}`,
              fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* GRID DE EQUIPOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {teamSections.map((team) => (
          <TeamCard key={team.name} team={team} onClick={() => onSelectSection(team)} />
        ))}
      </div>
      {teamSections.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-muted)' }}>
          No se encontraron equipos con ese filtro.
        </div>
      )}
    </div>
  );
}

function BigStat({ value, total, label, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, color: 'var(--accent-2)' }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-muted)' }}>
        /{total}
      </div>
      <div style={{ marginLeft: 8, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label} · {pct}%
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick, accent }) {
  return (
    <button
      className="panini-btn sticker-card"
      onClick={onClick}
      style={{
        padding: 16, borderRadius: 12, textAlign: 'left',
        background: 'var(--bg-2)',
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accent}`,
        display: 'flex', alignItems: 'center', gap: 12,
        color: 'var(--fg)',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: accent, color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{subtitle}</div>
      </div>
    </button>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, letterSpacing: '0.02em' }}>
        {title}
      </h2>
      <div style={{ fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {subtitle}
      </div>
    </div>
  );
}

function SpecialSectionCard({ section, onClick }) {
  const pct = Math.round((section.owned / section.total) * 100);
  const complete = section.owned === section.total;
  const icons = {
    intro: <Sparkles size={20} />,
    legends: <Trophy size={20} />,
    stadium: <Building2 size={20} />,
    special: <Star size={20} />,
  };
  return (
    <button
      className="panini-btn sticker-card"
      onClick={onClick}
      style={{
        padding: 16, borderRadius: 12, textAlign: 'left',
        background: complete ? 'linear-gradient(135deg, rgba(0,217,167,0.15) 0%, var(--bg-2) 100%)' : 'var(--bg-2)',
        border: `1px solid ${complete ? 'var(--accent-2)' : 'var(--border)'}`,
        color: 'var(--fg)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--bg-3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-3)',
        }}>
          {icons[section.category] || <Star size={20} />}
        </div>
        {complete && <Check size={18} color="var(--accent-2)" />}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{section.name}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginBottom: 8 }}>
        {section.owned}/{section.total} · {pct}%
      </div>
      <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: complete ? 'var(--accent-2)' : 'var(--accent-3)' }} />
      </div>
    </button>
  );
}

function TeamCard({ team, onClick }) {
  const pct = Math.round((team.owned / team.total) * 100);
  const complete = team.owned === team.total;
  const confedColors = {
    CONMEBOL: 'var(--accent-3)',
    UEFA: 'var(--accent-4)',
    CONCACAF: 'var(--accent-2)',
    CAF: 'var(--accent)',
    AFC: '#c084fc',
    OFC: '#60a5fa',
  };
  return (
    <button
      className="panini-btn sticker-card"
      onClick={onClick}
      style={{
        padding: 14, borderRadius: 12, textAlign: 'left',
        background: complete ? 'linear-gradient(135deg, rgba(0,217,167,0.2) 0%, var(--bg-2) 100%)' : 'var(--bg-2)',
        border: `1px solid ${complete ? 'var(--accent-2)' : 'var(--border)'}`,
        color: 'var(--fg)', position: 'relative', overflow: 'hidden',
      }}
    >
      {complete && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'var(--accent-2)', color: '#000',
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} strokeWidth={3} />
        </div>
      )}
      <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 8 }}>{team.flag}</div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.2 }}>{team.name}</div>
      <div style={{ fontSize: 9, color: confedColors[team.confed], textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>
        {team.confed}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6 }}>
        {team.owned}/{team.total}
      </div>
      <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: complete ? 'var(--accent-2)' : confedColors[team.confed],
          transition: 'width 0.3s',
        }} />
      </div>
    </button>
  );
}

// ============================================
// VISTA DE SECCIÓN (equipos y especiales)
// ============================================
function SectionView({ section, collection, setSticker, onBack, filter, setFilter }) {
  const ownedCount = section.stickers.filter((s) => (collection[s.id] || 0) >= 1).length;
  const filtered = section.stickers.filter((s) => {
    const qty = collection[s.id] || 0;
    if (filter === 'missing') return qty === 0;
    if (filter === 'owned') return qty >= 1;
    if (filter === 'repeated') return qty >= 2;
    return true;
  });

  return (
    <div className="fade-in">
      <button
        className="panini-btn"
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', color: 'var(--fg-muted)',
          padding: '6px 0', marginBottom: 16, fontSize: 13,
        }}
      >
        <ArrowLeft size={14} /> Volver al álbum
      </button>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {section.flag && <div style={{ fontSize: 48 }}>{section.flag}</div>}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', margin: 0, letterSpacing: '-0.01em' }}>
            {section.name}
          </h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>
            {ownedCount} / {section.total} · {Math.round((ownedCount / section.total) * 100)}% completo
          </div>
          {section.confed && (
            <div style={{ fontSize: 10, color: 'var(--accent-3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4, fontWeight: 700 }}>
              {section.confed}
            </div>
          )}
        </div>
      </div>

      {/* MARCAR TODAS / DESMARCAR */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {ownedCount < section.total ? (
          <button
            className="panini-btn"
            onClick={() => section.stickers.forEach((s) => { if (!(collection[s.id] >= 1)) setSticker(s.id, 1); })}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--accent-2)', color: '#000',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Check size={14} strokeWidth={3} /> Marcar todas
          </button>
        ) : (
          <button
            className="panini-btn"
            onClick={() => section.stickers.forEach((s) => setSticker(s.id, 0))}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--bg-3)', color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <X size={14} /> Desmarcar todas
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { code: 'all', label: 'Todas', count: section.total },
          { code: 'missing', label: 'Faltan', count: section.total - ownedCount },
          { code: 'owned', label: 'Pegadas', count: ownedCount },
          { code: 'repeated', label: 'Repes', count: Object.entries(collection).filter(([id, q]) => q >= 2 && section.stickers.some((s) => s.id === id)).length },
        ].map((f) => (
          <button
            key={f.code}
            className="panini-btn"
            onClick={() => setFilter(f.code)}
            style={{
              padding: '6px 12px', borderRadius: 16,
              background: filter === f.code ? 'var(--fg)' : 'var(--bg-2)',
              color: filter === f.code ? 'var(--bg)' : 'var(--fg)',
              border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 700,
            }}
          >
            {f.label} <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7, marginLeft: 4 }}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* GRID DE LÁMINAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10,
      }}>
        {filtered.map((s) => (
          <StickerCard
            key={s.id}
            sticker={s}
            qty={collection[s.id] || 0}
            onChange={(q) => setSticker(s.id, q)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-muted)' }}>
          No hay láminas en este filtro.
        </div>
      )}
    </div>
  );
}

function StickerCard({ sticker, qty, onChange }) {
  const owned = qty >= 1;
  const repeated = qty >= 2;
  const [justRevealed, setJustRevealed] = useState(false);
  const prevQtyRef = React.useRef(qty);

  useEffect(() => {
    if (prevQtyRef.current === 0 && qty === 1) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 650);
      return () => clearTimeout(timer);
    }
    prevQtyRef.current = qty;
  }, [qty]);

  const colors = getStickerColors(sticker);

  const getLabel = () => {
    if (sticker.category === 'badge') return 'Escudo';
    if (sticker.category === 'team') return 'Plantel';
    if (sticker.category === 'player') return `Jugador #${sticker.playerNum}`;
    if (sticker.category === 'stadium') return sticker.city;
    if (sticker.category === 'legends') return `Leyenda #${sticker.number}`;
    if (sticker.category === 'intro') return `Intro #${sticker.number}`;
    return `#${sticker.number}`;
  };

  return (
    <div className="sticker-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
      {/* BADGE DE REPETIDAS */}
      {repeated && (
        <div style={{
          position: 'absolute', top: -6, right: -6, zIndex: 10,
          minWidth: 20, height: 20, borderRadius: 10,
          background: '#ff2d55',
          color: '#fff',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 5px',
          boxShadow: '0 2px 6px rgba(255,45,85,0.5)',
        }}>
          {qty - 1}
        </div>
      )}
      {/* FLIP CONTAINER */}
      <div className="sticker-flip-container" style={{ borderRadius: 10, overflow: 'hidden' }}>
        <div
          className={`sticker-flip-inner${justRevealed ? ' flipping' : ''}`}
          style={{ minHeight: 160, position: 'relative' }}
        >
          {/* === BACK FACE: "En el sobre" === */}
          {(!owned || justRevealed) && (
          <div
            className={justRevealed ? 'sticker-face sticker-back' : undefined}
            style={{
              position: justRevealed ? 'absolute' : 'relative',
              inset: justRevealed ? 0 : undefined,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 12,
              minHeight: 160,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: `
                repeating-linear-gradient(45deg, rgba(77,124,255,0.08) 0px, rgba(77,124,255,0.08) 2px, transparent 2px, transparent 10px),
                repeating-linear-gradient(-45deg, rgba(77,124,255,0.06) 0px, rgba(77,124,255,0.06) 2px, transparent 2px, transparent 10px),
                #0d1220
              `,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.2em',
              color: 'rgba(77,124,255,0.4)', textTransform: 'uppercase', textAlign: 'center',
            }}>
              FIFA World Cup
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.15em',
              color: 'rgba(212,175,55,0.5)', textTransform: 'uppercase',
            }}>
              2026
            </div>
            <div style={{
              width: 40, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
              margin: '4px 0',
            }} />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
              color: 'rgba(245,240,232,0.2)',
            }}>
              {sticker.id}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.25em',
              color: 'rgba(77,124,255,0.3)', textTransform: 'uppercase', marginTop: 4,
            }}>
              PANINI
            </div>
          </div>
          )}

          {/* === FRONT FACE: Revealed sticker === */}
          {(owned || justRevealed) && (
          <div
            className={justRevealed ? 'sticker-face sticker-front' : undefined}
            style={{
              position: justRevealed ? 'absolute' : 'relative',
              inset: justRevealed ? 0 : undefined,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 160,
              borderRadius: 10,
              border: `2px solid ${repeated ? '#ffb800' : '#D4AF37'}`,
              boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.3), 0 2px 8px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary}33 100%)`,
            }}
          >
            {/* Top stripe with number */}
            <div style={{
              padding: '6px 8px',
              background: colors.primary,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: -10, bottom: 0, width: 40,
                background: colors.secondary,
                transform: 'skewX(-20deg)',
                opacity: 0.6,
              }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 14,
                color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                position: 'relative', zIndex: 1,
              }}>
                {sticker.id}
              </div>
              {sticker.flag && (
                <div style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>{sticker.flag}</div>
              )}
            </div>

            {/* Center area with silhouette */}
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              padding: '12px 8px',
              background: `linear-gradient(180deg, ${colors.primary}44 0%, ${colors.secondary}22 100%)`,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
                pointerEvents: 'none',
              }} />
              {sticker.category === 'badge' && (
                <div
                  className="holo-overlay"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'conic-gradient(from 0deg, rgba(255,0,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,255,0.1), rgba(0,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,0,0.1))',
                    backgroundSize: '200% 200%',
                    animation: 'hologram 3s ease infinite',
                    mixBlendMode: 'overlay',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {getSilhouette(sticker.category)}
              </div>
            </div>

            {/* Bottom bar with label */}
            <div style={{
              padding: '5px 8px',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                lineHeight: 1.2,
              }}>
                {getLabel()}
              </div>
              {sticker.teamName && (
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {sticker.teamName}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* CONTROLS (outside flip) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '0 2px' }}>
        <button
          className="panini-btn"
          onClick={() => onChange(Math.max(0, qty - 1))}
          disabled={qty === 0}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: qty === 0 ? 'var(--bg-3)' : 'var(--bg)',
            color: qty === 0 ? 'var(--fg-muted)' : 'var(--fg)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: qty === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Minus size={14} />
        </button>

        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700,
          fontSize: 16,
          color: repeated ? 'var(--accent-3)' : owned ? 'var(--accent-2)' : 'var(--fg-muted)',
        }}>
          {qty === 0 ? '—' : `x${qty}`}
        </div>

        <button
          className="panini-btn"
          onClick={() => onChange(qty + 1)}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--accent-2)', color: '#000',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// VISTA DE REPES (láminas repetidas para cambiar)
// ============================================
function RepesView({ collection, setSticker, onBack }) {
  const repes = ALL_STICKERS
    .filter((s) => (collection[s.id] || 0) >= 2)
    .map((s) => ({ ...s, qty: collection[s.id], extras: collection[s.id] - 1 }));

  const totalExtras = repes.reduce((sum, r) => sum + r.extras, 0);

  return (
    <div className="fade-in">
      <button
        className="panini-btn"
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', color: 'var(--fg-muted)',
          padding: '6px 0', marginBottom: 16, fontSize: 13,
        }}
      >
        <ArrowLeft size={14} /> Volver al álbum
      </button>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', margin: 0, letterSpacing: '-0.01em' }}>
        MIS <span style={{ color: 'var(--accent-3)' }}>REPES</span>
      </h2>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 4, marginBottom: 24 }}>
        {totalExtras} láminas disponibles para cambiar · {repes.length} distintas
      </div>

      {repes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-2)', borderRadius: 12,
          border: '1px dashed var(--border)',
        }}>
          <Repeat size={40} color="var(--fg-muted)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Sin láminas repetidas</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            Cuando abras sobres y te salgan repetidas, podrás verlas aquí para cambiar con amigos.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {repes.map((s) => (
            <div key={s.id} style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--accent-3)',
              borderRadius: 10, padding: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)' }}>
                  {s.id}
                </div>
                <div style={{
                  background: 'var(--accent-3)', color: '#000',
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                }}>
                  +{s.extras}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{s.section}</div>
              {s.flag && <div style={{ fontSize: 20 }}>{s.flag}</div>}
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {s.category === 'player' ? `Jugador #${s.playerNum}` :
                 s.category === 'badge' ? 'Escudo' :
                 s.category === 'team' ? 'Plantel' :
                 s.category === 'stadium' ? s.city :
                 `#${s.number}`}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <button
                  className="panini-btn"
                  onClick={() => setSticker(s.id, s.qty - 1)}
                  style={{
                    flex: 1, padding: '6px', borderRadius: 6,
                    background: 'var(--bg-3)', color: 'var(--fg)',
                    border: '1px solid var(--border)', fontSize: 11,
                  }}
                >
                  Cambiar 1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
