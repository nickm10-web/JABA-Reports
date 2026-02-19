// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Color System
// ═══════════════════════════════════════════════════════════════

export const uclaColors = {
  blue: '#2D68C4',
  gold: '#F2A900',
  brightGold: '#FFD100',
  darkBlue: '#1a4a9e',
  deepBlue: '#0f3278',
  white: '#ffffff',
  lightBg: '#f8f9fa',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  border: '#e5e7eb',
  cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
};

export const sportColors: Record<string, string> = {
  FOOTBALL: '#2D68C4',
  MENS_BASKETBALL: '#F2A900',
  WOMENS_BASKETBALL: '#FFD100',
  BASEBALL: '#1a4a9e',
  SOFTBALL: '#5B9BD5',
  WOMENS_VOLLEYBALL: '#C084FC',
  WOMENS_SOCCER: '#34D399',
  MENS_SOCCER: '#60A5FA',
  WOMENS_GYMNASTICS: '#F472B6',
  TRACK_AND_FIELD: '#FB923C',
  WOMENS_TENNIS: '#A78BFA',
  MENS_TENNIS: '#818CF8',
  SWIMMING_AND_DIVING: '#22D3EE',
  WOMENS_GOLF: '#4ADE80',
  MENS_GOLF: '#86EFAC',
  ROWING: '#94A3B8',
  WOMENS_WATER_POLO: '#38BDF8',
};

export function formatSportName(sport: string): string {
  const map: Record<string, string> = {
    FOOTBALL: 'Football',
    MENS_BASKETBALL: "Men's Basketball",
    WOMENS_BASKETBALL: "Women's Basketball",
    BASEBALL: 'Baseball',
    SOFTBALL: 'Softball',
    WOMENS_VOLLEYBALL: "Women's Volleyball",
    WOMENS_SOCCER: "Women's Soccer",
    MENS_SOCCER: "Men's Soccer",
    WOMENS_GYMNASTICS: "Women's Gymnastics",
    TRACK_AND_FIELD: "Track & Field",
    WOMENS_TENNIS: "Women's Tennis",
    MENS_TENNIS: "Men's Tennis",
    SWIMMING_AND_DIVING: "Swimming & Diving",
    WOMENS_GOLF: "Women's Golf",
    MENS_GOLF: "Men's Golf",
    ROWING: 'Rowing',
    WOMENS_WATER_POLO: "Women's Water Polo",
  };
  return map[sport] || sport.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
