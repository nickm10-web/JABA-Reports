import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, BarChart3, DollarSign, Heart, Zap, Award, Users } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CampaignMetrics {
  posts: number;
  emv: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  lift: number;
}

interface AuburnAthlete {
  name: string;
  sport: string;
  totalPosts: number;
  totalEmv: number;
  engagementRate: number;
  collab?: CampaignMetrics;
  logo?: CampaignMetrics;
  mention?: CampaignMetrics;
}

interface AuburnPlaygroundProps {
  onBack?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// AUBURN COLORS
// ═══════════════════════════════════════════════════════════════

const AUBURN = {
  navy: '#0C2340',
  orange: '#E87722',
  brightOrange: '#F26522',
  // RGBA helpers
  orangeRgb: '232, 119, 34',
  navyRgb: '12, 35, 64',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'K';
  return '$' + num.toLocaleString();
}

function formatSport(sport: string): string {
  return sport
    .replace(/^MENS_/, "Men's ")
    .replace(/^WOMENS_/, "Women's ")
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Compute a "marketability" score 0-99 from EMV + engagement + campaign activity */
function getMarketabilityScore(athlete: AuburnAthlete): number {
  const campaignTypes = [athlete.collab, athlete.logo, athlete.mention].filter(Boolean).length;
  const totalCampaignPosts = (athlete.collab?.posts || 0) + (athlete.logo?.posts || 0) + (athlete.mention?.posts || 0);
  const avgLift = (() => {
    const lifts: number[] = [];
    if (athlete.collab) lifts.push(athlete.collab.lift);
    if (athlete.logo) lifts.push(athlete.logo.lift);
    if (athlete.mention) lifts.push(athlete.mention.lift);
    if (lifts.length === 0) return 0;
    return lifts.reduce((a, b) => a + b, 0) / lifts.length;
  })();

  // Weighted score components
  const emvScore = Math.min(athlete.totalEmv / 2500, 40); // max 40 points
  const engScore = Math.min((athlete.engagementRate < 1 ? athlete.engagementRate * 100 : athlete.engagementRate) * 3, 25); // max 25
  const campaignScore = Math.min(campaignTypes * 6 + totalCampaignPosts * 0.8, 20); // max 20
  const liftScore = Math.min(Math.max(avgLift / 10, 0), 14); // max 14

  return Math.min(Math.round(emvScore + engScore + campaignScore + liftScore), 99);
}

// ═══════════════════════════════════════════════════════════════
// ATHLETE CARD (Auburn-themed)
// ═══════════════════════════════════════════════════════════════

function AuburnAthleteCard({ athlete }: { athlete: AuburnAthlete }) {
  const initials = athlete.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const [firstName, ...restNameParts] = athlete.name.trim().split(/\s+/);
  const lastNameLine = restNameParts.join(' ');
  const score = getMarketabilityScore(athlete);
  const engRate = athlete.engagementRate < 1 ? athlete.engagementRate * 100 : athlete.engagementRate;

  // Best campaign type
  const bestCampaign = (() => {
    const types: { name: string; data: CampaignMetrics }[] = [];
    if (athlete.collab) types.push({ name: 'Collab', data: athlete.collab });
    if (athlete.logo) types.push({ name: 'Logo', data: athlete.logo });
    if (athlete.mention) types.push({ name: 'Mention', data: athlete.mention });
    if (types.length === 0) return null;
    return types.sort((a, b) => b.data.emv - a.data.emv)[0];
  })();

  // Score ring
  const circumference = 125.66;
  const scoreOffset = circumference - (circumference * score) / 99;
  const scoreColor = score >= 80 ? AUBURN.brightOrange : score >= 60 ? AUBURN.orange : '#D4701E';

  return (
    <div className="relative w-full group auburn-card-shimmer auburn-card-scan cursor-pointer overflow-hidden" style={{ aspectRatio: '3/4' }}>
      {/* Multi-layer glow effect on hover */}
      <div className="absolute inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-[25]"
        style={{ boxShadow: `inset 0 0 30px rgba(${AUBURN.orangeRgb},0.08), inset 0 0 60px rgba(${AUBURN.orangeRgb},0.04)` }}
      />

      {/* Card content */}
      <div className="absolute inset-[6%] z-10 rounded-xl overflow-hidden transition-all duration-500 ease-out bg-black flex flex-col">
        {/* Radial gradient background with navy tint */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 24%, rgba(${AUBURN.navyRgb},0.95) 0%, rgba(8,18,32,0.985) 24%, rgba(4,10,20,1) 60%, rgba(2,6,14,1) 100%)`,
          }}
        />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 52%)' }} />
        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        {/* Orange accent line */}
        <div className="absolute inset-x-4 top-3 h-px pointer-events-none" style={{ background: `linear-gradient(to right, transparent, rgba(${AUBURN.orangeRgb},0.55), transparent)` }} />

        {/* Hero / portrait area */}
        <div className="relative h-[40%] overflow-visible px-4 pt-2.5 shrink-0">
          {/* Score Badge */}
          <div className="absolute top-[18px] left-[18px] z-[5] overflow-visible p-3 -m-3 auburn-score-pulse">
            <div
              className="absolute inset-[8px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${scoreColor}24 0%, ${scoreColor}14 38%, rgba(${AUBURN.orangeRgb},0.05) 55%, rgba(${AUBURN.orangeRgb},0) 76%)`,
                filter: 'blur(12px)',
              }}
            />
            <div
              className="absolute inset-[14px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${scoreColor}30 0%, ${scoreColor}12 42%, rgba(${AUBURN.orangeRgb},0) 72%)`,
                filter: 'blur(6px)',
              }}
            />
            <div
              className="relative w-[62px] h-[62px] rounded-full overflow-visible"
              style={{
                background: `radial-gradient(circle at 50% 45%, rgba(${AUBURN.navyRgb},0.98) 0%, rgba(4,10,20,0.96) 65%, rgba(2,6,14,0.9) 100%)`,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), inset 0 0 24px rgba(255,255,255,0.03)',
              }}
            >
              <svg viewBox="0 0 54 54" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                <circle cx="27" cy="27" r="21" fill="none" stroke={`rgba(${AUBURN.orangeRgb},0.10)`} strokeWidth="5" />
                <circle
                  cx="27" cy="27" r="21" fill="none"
                  stroke={scoreColor}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  className="auburn-score-ring"
                  style={{ filter: `drop-shadow(0 0 3px ${scoreColor})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-black text-[28px] leading-none" style={{ textShadow: `0 0 16px ${scoreColor}55` }}>{score}</span>
              </div>
            </div>
            <p className="text-[8px] font-bold tracking-[0.28em] text-center mt-1" style={{ color: AUBURN.orange }}>SCORE</p>
          </div>

          {/* Initials portrait (Auburn data has no images) */}
          <div className="absolute left-[38%] right-[2%] top-[12%] bottom-[-30px] z-[4] pointer-events-none">
            <div className="absolute left-[12%] right-[12%] top-[14%] h-[32%] rounded-full blur-3xl opacity-14" style={{ background: `radial-gradient(circle, rgba(${AUBURN.orangeRgb},0.12) 0%, rgba(${AUBURN.orangeRgb},0.05) 38%, rgba(255,255,255,0.015) 54%, transparent 74%)` }} />
            <div className="absolute inset-0 flex items-center justify-end pr-6 z-[5]">
              <span className="text-6xl font-black" style={{ color: `rgba(${AUBURN.orangeRgb},0.12)`, textShadow: `0 0 40px rgba(${AUBURN.orangeRgb},0.12)` }}>
                {initials}
              </span>
            </div>
          </div>

          {/* Name + meta */}
          <div className="absolute left-4 right-[48%] top-[66%] z-[6]">
            <div className="absolute -left-2 -right-4 -inset-y-2 rounded-[28px] opacity-85" style={{ background: `linear-gradient(90deg, rgba(${AUBURN.navyRgb},0.85) 0%, rgba(${AUBURN.navyRgb},0.6) 42%, rgba(${AUBURN.navyRgb},0.2) 76%, transparent 100%)`, filter: 'blur(12px)' }} />
            <div className="relative">
              <p className="text-white font-black text-[18px] leading-[0.92] tracking-[-0.04em]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.72)' }}>
                {firstName?.toUpperCase()}
              </p>
              {lastNameLine && (
                <p className="mt-1 text-white font-black text-[18px] leading-[0.92] tracking-[-0.04em]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.72)' }}>
                  {lastNameLine.toUpperCase()}
                </p>
              )}
              <div className="mt-2.5 text-[9px] font-bold tracking-[0.16em] uppercase" style={{ color: AUBURN.orange }}>
                {formatSport(athlete.sport).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="relative z-[6] mt-auto px-4 pb-3">
          {/* Divider */}
          <div className="-mt-3 mb-3 h-px pointer-events-none" style={{ background: `linear-gradient(to right, transparent, rgba(${AUBURN.orangeRgb},0.55), transparent)` }} />

          {/* KPI section */}
          <div className="pt-2 shrink-0">
            <div className="auburn-kpi-grid grid grid-cols-3 gap-2.5">
              {[
                { label: 'EMV', value: formatCurrency(athlete.totalEmv), icon: <DollarSign className="w-3 h-3" style={{ color: `rgba(${AUBURN.orangeRgb},0.65)` }} /> },
                { label: 'Posts', value: athlete.totalPosts.toString(), icon: <BarChart3 className="w-3 h-3" style={{ color: `rgba(${AUBURN.orangeRgb},0.60)` }} /> },
                { label: 'Engagement', value: `${engRate.toFixed(1)}%`, icon: <TrendingUp className="w-3 h-3" style={{ color: `rgba(${AUBURN.orangeRgb},0.65)` }} /> },
              ].map((stat) => (
                <div key={stat.label} className="auburn-kpi-cell relative overflow-hidden rounded-[16px] px-3 py-2.5 min-h-[84px]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                  <div className="absolute inset-x-4 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${AUBURN.orangeRgb},0.40), transparent)` }} />
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: `rgba(${AUBURN.orangeRgb},0.55)` }}>{stat.label}</span>
                    {stat.icon}
                  </div>
                  <p className="mt-2 text-white font-black text-[21px] leading-none tracking-[-0.05em]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign section */}
          <div className="pt-3">
            <div className="auburn-about-panel relative overflow-hidden rounded-[16px] px-3.5 py-3.5 min-h-[102px]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
              <p className="text-[7px] font-bold tracking-[0.24em] uppercase text-white/24">Campaign Highlights</p>
              {bestCampaign ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3 h-3 flex-shrink-0" style={{ color: AUBURN.orange }} />
                    <span className="text-[11px] leading-[1.58] text-white/76">
                      Best: <span className="font-semibold text-white/90">{bestCampaign.name}</span> — {formatCurrency(bestCampaign.data.emv)} EMV
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3 h-3 flex-shrink-0" style={{ color: `rgba(${AUBURN.orangeRgb},0.6)` }} />
                    <span className="text-[11px] leading-[1.58] text-white/60">
                      {formatNumber(bestCampaign.data.avgLikes)} avg likes · {formatNumber(bestCampaign.data.avgComments)} avg comments
                    </span>
                  </div>
                  {bestCampaign.data.lift !== 0 && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 flex-shrink-0" style={{ color: bestCampaign.data.lift > 0 ? '#4ade80' : '#f87171' }} />
                      <span className="text-[11px] leading-[1.58]" style={{ color: bestCampaign.data.lift > 0 ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.7)' }}>
                        {bestCampaign.data.lift > 0 ? '+' : ''}{bestCampaign.data.lift.toFixed(1)}% lift
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[11px] leading-[1.58] text-white/36">
                  No campaign data available for this athlete yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Border overlay */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-xl auburn-border-idle"
        style={{
          border: `2px solid rgba(${AUBURN.orangeRgb},0.25)`,
          borderRadius: '16px',
          boxShadow: `inset 0 0 20px rgba(${AUBURN.orangeRgb},0.04), 0 0 12px rgba(${AUBURN.orangeRgb},0.06)`,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export function AuburnPlayground({ onBack }: AuburnPlaygroundProps) {
  const [athletes, setAthletes] = useState<AuburnAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/data/auburn-athletes.json')
      .then((res) => res.json())
      .then((data: AuburnAthlete[]) => {
        setAthletes(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: try the src import path
        import('../data/auburn-athletes.json').then((mod) => {
          setAthletes(mod.default as AuburnAthlete[]);
          setLoading(false);
        });
      });
  }, []);

  const sports = [...new Set(athletes.map((a) => a.sport))].sort();

  const filtered = athletes.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || a.sport === sportFilter;
    return matchesSearch && matchesSport;
  });

  const totalEmv = athletes.reduce((sum, a) => sum + a.totalEmv, 0);
  const totalPosts = athletes.reduce((sum, a) => sum + a.totalPosts, 0);
  const avgEngagement = athletes.length > 0
    ? athletes.reduce((sum, a) => sum + (a.engagementRate < 1 ? a.engagementRate * 100 : a.engagementRate), 0) / athletes.length
    : 0;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${AUBURN.navy} 0%, #050A14 8%, #030712 100%)` }}>
      {/* Auburn CSS animations */}
      <style>{`
        @keyframes auburn-card-glow {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.08),
              0 14px 34px rgba(0, 0, 0, 0.36),
              0 0 18px rgba(${AUBURN.orangeRgb}, 0.10);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.14),
              0 14px 34px rgba(0, 0, 0, 0.40),
              0 0 28px rgba(${AUBURN.orangeRgb}, 0.16);
          }
        }

        @keyframes auburn-score-pulse {
          0%, 100% {
            opacity: 0.84;
            transform: scale(1);
            filter: brightness(1) saturate(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.035);
            filter: brightness(1.08) saturate(1.08);
          }
        }

        @keyframes auburn-card-scan {
          0% { transform: translateY(-140%); opacity: 0; }
          18% { opacity: 0.6; }
          50% { opacity: 0.5; }
          82% { opacity: 0; }
          100% { transform: translateY(140%); opacity: 0; }
        }

        @keyframes auburn-holo-shimmer {
          0% { background-position: 0% 50%; transform: rotate(0deg) scale(1); }
          50% { background-position: 100% 50%; transform: rotate(180deg) scale(1.01); }
          100% { background-position: 0% 50%; transform: rotate(360deg) scale(1.02); }
        }

        .auburn-card-shimmer {
          transition: transform 280ms ease, filter 280ms ease, box-shadow 280ms ease;
          animation: auburn-card-glow 4s ease-in-out infinite;
          transform-origin: center center;
          isolation: isolate;
        }

        .auburn-card-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          border-radius: inherit;
          opacity: 0.12;
          background:
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(${AUBURN.orangeRgb}, 0.04) 0deg,
              rgba(255, 180, 80, 0.06) 90deg,
              rgba(${AUBURN.orangeRgb}, 0.03) 180deg,
              rgba(255, 200, 120, 0.05) 270deg,
              rgba(${AUBURN.orangeRgb}, 0.04) 360deg
            );
          background-size: 180% 180%;
          animation: auburn-holo-shimmer 8.5s linear infinite;
        }

        .auburn-card-shimmer:hover {
          transform: translateY(-4px) scale(1.01);
          filter: brightness(1.03) saturate(1.06);
          box-shadow:
            0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.22),
            0 22px 52px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(${AUBURN.orangeRgb}, 0.25);
        }

        .auburn-card-shimmer:hover::before {
          opacity: 0.28;
        }

        .auburn-card-scan::after {
          content: '';
          position: absolute;
          inset: -12% 18%;
          pointer-events: none;
          z-index: 2;
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(${AUBURN.orangeRgb}, 0.04) 36%,
            rgba(255, 180, 80, 0.035) 64%,
            rgba(255, 255, 255, 0) 100%
          );
          filter: blur(14px);
          opacity: 0;
          animation: auburn-card-scan 11s ease-in-out infinite;
        }

        .auburn-border-idle {
          filter: saturate(1.04) brightness(1.01);
          transition: filter 280ms ease, opacity 280ms ease, transform 280ms ease;
        }

        .auburn-card-shimmer:hover .auburn-border-idle {
          filter: saturate(1.15) brightness(1.08);
          border-color: rgba(${AUBURN.orangeRgb}, 0.45) !important;
          box-shadow: inset 0 0 30px rgba(${AUBURN.orangeRgb}, 0.08), 0 0 20px rgba(${AUBURN.orangeRgb}, 0.12) !important;
        }

        .auburn-score-pulse {
          animation: auburn-score-pulse 2.7s ease-in-out infinite;
          transform-origin: center center;
        }

        .auburn-score-ring {
          animation: auburn-score-pulse 2.7s ease-in-out infinite;
          transform-origin: center center;
        }

        .auburn-kpi-grid {
          transition: filter 260ms ease;
        }

        .auburn-kpi-cell {
          background: linear-gradient(180deg, rgba(${AUBURN.navyRgb}, 0.85), rgba(6, 16, 32, 0.95));
          border: 1px solid rgba(${AUBURN.orangeRgb}, 0.28);
          box-shadow:
            0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.14),
            0 0 14px rgba(${AUBURN.orangeRgb}, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 0 20px rgba(${AUBURN.orangeRgb}, 0.03);
          transition: background 260ms ease, border-color 260ms ease, box-shadow 260ms ease, transform 260ms ease, filter 260ms ease;
        }

        .auburn-card-shimmer:hover .auburn-kpi-cell {
          background: linear-gradient(180deg, rgba(${AUBURN.navyRgb}, 0.90), rgba(10, 22, 40, 0.97));
          border-color: rgba(${AUBURN.orangeRgb}, 0.45);
          box-shadow:
            0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.25),
            0 0 20px rgba(${AUBURN.orangeRgb}, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 0 24px rgba(${AUBURN.orangeRgb}, 0.06);
          transform: translateY(-1px);
        }

        .auburn-about-panel {
          background: linear-gradient(180deg, rgba(${AUBURN.navyRgb}, 0.80), rgba(6, 14, 28, 0.95));
          border: 1px solid rgba(${AUBURN.orangeRgb}, 0.24);
          box-shadow:
            0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.12),
            0 0 14px rgba(${AUBURN.orangeRgb}, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            inset 0 0 16px rgba(${AUBURN.orangeRgb}, 0.02);
          transition: background 260ms ease, border-color 260ms ease, box-shadow 260ms ease, filter 260ms ease;
        }

        .auburn-card-shimmer:hover .auburn-about-panel {
          border-color: rgba(${AUBURN.orangeRgb}, 0.35);
          box-shadow:
            0 0 0 1px rgba(${AUBURN.orangeRgb}, 0.18),
            0 0 18px rgba(${AUBURN.orangeRgb}, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 0 20px rgba(${AUBURN.orangeRgb}, 0.04);
        }

        @media (prefers-reduced-motion: reduce) {
          .auburn-card-shimmer,
          .auburn-card-shimmer::before,
          .auburn-card-scan::after,
          .auburn-score-pulse,
          .auburn-score-ring {
            animation: none !important;
          }
          .auburn-card-shimmer,
          .auburn-border-idle,
          .auburn-kpi-cell {
            transition: none !important;
          }
          .auburn-card-shimmer:hover {
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: `rgba(${AUBURN.navyRgb},0.85)`, borderColor: `rgba(${AUBURN.orangeRgb},0.15)` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <img
              src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png"
              alt="Auburn"
              className="w-10 h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Auburn Athletes</h1>
              <p className="text-xs font-medium tracking-wide" style={{ color: `rgba(${AUBURN.orangeRgb},0.7)` }}>
                CAMPAIGN PERFORMANCE CARDS
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="ml-auto flex items-center gap-6">
            {[
              { label: 'Athletes', value: athletes.length.toString() },
              { label: 'Total EMV', value: formatCurrency(totalEmv) },
              { label: 'Total Posts', value: formatNumber(totalPosts) },
              { label: 'Avg Engagement', value: `${avgEngagement.toFixed(1)}%` },
            ].map((s) => (
              <div key={s.label} className="text-right hidden md:block">
                <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: `rgba(${AUBURN.orangeRgb},0.5)` }}>{s.label}</p>
                <p className="text-white font-bold text-sm">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search athletes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm text-white placeholder-white/30 border focus:outline-none focus:ring-2 transition-all"
          style={{
            background: `rgba(${AUBURN.navyRgb},0.6)`,
            borderColor: `rgba(${AUBURN.orangeRgb},0.2)`,
          }}
        />
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm text-white border focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer"
          style={{
            background: `rgba(${AUBURN.navyRgb},0.6)`,
            borderColor: `rgba(${AUBURN.orangeRgb},0.2)`,
          }}
        >
          <option value="all">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>{formatSport(s)}</option>
          ))}
        </select>
        <span className="text-xs text-white/40 ml-2">{filtered.length} athlete{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `rgba(${AUBURN.orangeRgb},0.3)`, borderTopColor: AUBURN.orange }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((athlete) => (
              <AuburnAthleteCard key={athlete.name} athlete={athlete} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: `rgba(${AUBURN.orangeRgb},0.3)` }} />
            <p className="text-white/40 text-sm">No athletes match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
