export const MOSAIC_COLORS = [
  'var(--c-yellow)', 'var(--c-orange)', 'var(--c-red)', 'var(--c-magenta)',
  'var(--c-violet)', 'var(--c-blue)', 'var(--c-teal)', 'var(--c-green)',
];

export const TEAM_ACCENT = {
  BRA: 'var(--c-yellow)',
  ARG: 'var(--c-blue)',
  FRA: 'var(--c-red)',
  MEX: 'var(--c-green)',
  USA: 'var(--c-violet)',
  ESP: 'var(--c-orange)',
};

export const TEAMS = [
  { code: 'BRA', name: 'Brasil', group: 'C', c1: '#FFDF00', c2: '#009C3B', confed: 'CONMEBOL' },
  { code: 'ARG', name: 'Argentina', group: 'J', c1: '#75AADB', c2: '#FFFFFF', confed: 'CONMEBOL' },
  { code: 'FRA', name: 'Francia', group: 'I', c1: '#0055A4', c2: '#EF4135', confed: 'UEFA' },
  { code: 'MEX', name: 'México', group: 'A', c1: '#006847', c2: '#CE1126', confed: 'CONCACAF' },
  { code: 'USA', name: 'Estados Unidos', group: 'D', c1: '#3C3B6E', c2: '#B22234', confed: 'CONCACAF' },
  { code: 'ESP', name: 'España', group: 'H', c1: '#C60B1E', c2: '#FFC400', confed: 'UEFA' },
  { code: 'CAN', name: 'Canadá', group: 'B', c1: '#FF0000', c2: '#FFFFFF', confed: 'CONCACAF' },
  { code: 'COL', name: 'Colombia', group: 'K', c1: '#FCD116', c2: '#003893', confed: 'CONMEBOL' },
  { code: 'GER', name: 'Alemania', group: 'E', c1: '#000000', c2: '#DD0000', confed: 'UEFA' },
  { code: 'ENG', name: 'Inglaterra', group: 'L', c1: '#FFFFFF', c2: '#CF081F', confed: 'UEFA' },
  { code: 'POR', name: 'Portugal', group: 'K', c1: '#006600', c2: '#FF0000', confed: 'UEFA' },
  { code: 'NED', name: 'Países Bajos', group: 'F', c1: '#FF6600', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'URU', name: 'Uruguay', group: 'H', c1: '#5CBFEB', c2: '#FFFFFF', confed: 'CONMEBOL' },
  { code: 'CRO', name: 'Croacia', group: 'L', c1: '#FF0000', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'MAR', name: 'Marruecos', group: 'C', c1: '#C1272D', c2: '#006233', confed: 'CAF' },
  { code: 'JPN', name: 'Japón', group: 'F', c1: '#000080', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'KOR', name: 'Corea del Sur', group: 'A', c1: '#CD2E3A', c2: '#0047A0', confed: 'AFC' },
  { code: 'SEN', name: 'Senegal', group: 'I', c1: '#009639', c2: '#FDEF42', confed: 'CAF' },
  { code: 'ECU', name: 'Ecuador', group: 'E', c1: '#FFD100', c2: '#034EA2', confed: 'CONMEBOL' },
  { code: 'SUI', name: 'Suiza', group: 'B', c1: '#FF0000', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'NOR', name: 'Noruega', group: 'I', c1: '#EF2B2D', c2: '#002868', confed: 'UEFA' },
  { code: 'PAN', name: 'Panamá', group: 'L', c1: '#DA121A', c2: '#003DA5', confed: 'CONCACAF' },
  { code: 'PAR', name: 'Paraguay', group: 'D', c1: '#DA121A', c2: '#0038A8', confed: 'CONMEBOL' },
  { code: 'CUW', name: 'Curazao', group: 'E', c1: '#002B7F', c2: '#F9E814', confed: 'CONCACAF' },
  { code: 'HAI', name: 'Haití', group: 'C', c1: '#00209F', c2: '#D21034', confed: 'CONCACAF' },
  { code: 'BEL', name: 'Bélgica', group: 'G', c1: '#ED2939', c2: '#000000', confed: 'UEFA' },
  { code: 'AUT', name: 'Austria', group: 'J', c1: '#ED2939', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'SCO', name: 'Escocia', group: 'C', c1: '#003078', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'SWE', name: 'Suecia', group: 'F', c1: '#006AA7', c2: '#FECC00', confed: 'UEFA' },
  { code: 'TUR', name: 'Turquía', group: 'D', c1: '#E30A17', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'CZE', name: 'Chequia', group: 'A', c1: '#11457E', c2: '#D7141A', confed: 'UEFA' },
  { code: 'BIH', name: 'Bosnia y Herzegovina', group: 'B', c1: '#002395', c2: '#FECB00', confed: 'UEFA' },
  { code: 'ALG', name: 'Argelia', group: 'J', c1: '#006633', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'CPV', name: 'Cabo Verde', group: 'H', c1: '#003893', c2: '#CF2027', confed: 'CAF' },
  { code: 'EGY', name: 'Egipto', group: 'G', c1: '#CE1126', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'GHA', name: 'Ghana', group: 'L', c1: '#006B3F', c2: '#FCD116', confed: 'CAF' },
  { code: 'CIV', name: 'Costa de Marfil', group: 'E', c1: '#FF8200', c2: '#009A44', confed: 'CAF' },
  { code: 'RSA', name: 'Sudáfrica', group: 'A', c1: '#007749', c2: '#FFB81C', confed: 'CAF' },
  { code: 'TUN', name: 'Túnez', group: 'F', c1: '#E70013', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'COD', name: 'RD del Congo', group: 'K', c1: '#007FFF', c2: '#CE1021', confed: 'CAF' },
  { code: 'AUS', name: 'Australia', group: 'D', c1: '#00843D', c2: '#FFCD00', confed: 'AFC' },
  { code: 'IRN', name: 'Irán', group: 'G', c1: '#239F40', c2: '#DA0000', confed: 'AFC' },
  { code: 'JOR', name: 'Jordania', group: 'J', c1: '#007A3D', c2: '#CE1126', confed: 'AFC' },
  { code: 'KSA', name: 'Arabia Saudita', group: 'H', c1: '#006C35', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'QAT', name: 'Catar', group: 'B', c1: '#8A1538', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'UZB', name: 'Uzbekistán', group: 'K', c1: '#1EB53A', c2: '#0099B5', confed: 'AFC' },
  { code: 'IRQ', name: 'Irak', group: 'I', c1: '#007A3D', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'NZL', name: 'Nueva Zelanda', group: 'G', c1: '#000000', c2: '#FFFFFF', confed: 'OFC' },
];

export function getTeamAccent(code) {
  return TEAM_ACCENT[code] || MOSAIC_COLORS[
    TEAMS.findIndex(t => t.code === code) % MOSAIC_COLORS.length
  ];
}

export function getStickerAccent(index) {
  return MOSAIC_COLORS[index % MOSAIC_COLORS.length];
}

export const STICKERS_PER_TEAM = 20;

export function buildTeamStickers(teamCode) {
  const stickers = [];
  for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
    stickers.push({
      id: `${teamCode}-${String(i).padStart(2, '0')}`,
      code: teamCode,
      number: String(i).padStart(3, '0'),
      name: `Jugador ${String(i).padStart(2, '0')}`,
    });
  }
  return stickers;
}

export const MOCK_MATCHES = [
  {
    name: 'Andrés P.', loc: '2.4 km · cerca', score: '9 ↔ 7', avatar: '#B0263C',
    give: [['ARG', '04'], ['BRA', '12'], ['ESP', '09']],
    get: [['FRA', '05'], ['FRA', '10'], ['FRA', '08']],
  },
  {
    name: 'María G.', loc: 'online · verificada', score: '6 ↔ 6', avatar: '#1F3A8A',
    give: [['MEX', '02'], ['USA', '11']],
    get: [['ITA', '08'], ['BRA', '03']],
  },
  {
    name: 'Luis R.', loc: '18 km · mismo grupo', score: '4 ↔ 5', avatar: '#2F7A4D',
    give: [['ITA', '07']],
    get: [['POR', '10']],
  },
];
