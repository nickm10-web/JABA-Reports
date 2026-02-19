// ═══════════════════════════════════════════════════════════════
// NIL Intelligence Report — IP Intelligence Tab
// Matches UCLABrandDeals IPTab layout exactly.
// Computes signal buckets from raw post signals:
//   isCollaboration / isOrganizationCollaboration → collab
//   hasOrganizationLogo                           → logo
//   hasOrganizationInCaption                      → caption
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo, type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SponsorPost, BrandGroup, DrawerPayload } from './uclaTypes';
import { useNilContext } from './NilReportContext';
import { calculatePostEMV } from '../../utils/emvCalculator';

// ─── Helpers ─────────────────────────────────────────────────
const formatNumber = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return Math.round(v).toLocaleString('en-US');
};
const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
};
const formatPercent = (v: number, d = 1) => `${v.toFixed(d)}%`;

const headerStyle = { fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' };

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E7F0] bg-white shadow-[0_16px_32px_rgba(15,28,46,0.08)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Signal bucket type (matches uclaIPImpact bucket format) ──
interface IPBucket {
  yes: { contents: number; likes: number; comments: number; engagementRate: number; emv: number };
  no:  { contents: number; likes: number; comments: number; engagementRate: number; emv: number };
  avgLift: number;
}

function computeBucket(posts: SponsorPost[], testFn: (p: SponsorPost) => boolean): IPBucket {
  const yes = posts.filter(testFn);
  const no  = posts.filter(p => !testFn(p));

  const avg = (arr: SponsorPost[], fn: (p: SponsorPost) => number) =>
    arr.length ? arr.reduce((s, p) => s + fn(p), 0) / arr.length : 0;

  const yesER  = avg(yes, p => p.metrics.engagementRate);
  const noER   = avg(no,  p => p.metrics.engagementRate);
  const avgLift = noER > 0 ? ((yesER - noER) / noER) * 100 : 0;

  return {
    yes: {
      contents:       yes.length,
      likes:          avg(yes, p => p.metrics.likes),
      comments:       avg(yes, p => p.metrics.comments),
      engagementRate: yesER,
      emv:            avg(yes, p => calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments })),
    },
    no: {
      contents:       no.length,
      likes:          avg(no,  p => p.metrics.likes),
      comments:       avg(no,  p => p.metrics.comments),
      engagementRate: noER,
      emv:            avg(no,  p => calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments })),
    },
    avgLift,
  };
}

// ─── Props ────────────────────────────────────────────────────
interface IPIntelligenceProps {
  posts: SponsorPost[];
  brandGroups: BrandGroup[];
  onOpenDrawer: (payload: DrawerPayload) => void;
}

export function UCLAIPIntelligenceTab({ posts }: IPIntelligenceProps) {
  const { shortName, colors } = useNilContext();
  const PRIMARY = colors.primary;

  const [signal, setSignal] = useState<'collab' | 'logo' | 'caption'>('collab');
  const [metric, setMetric] = useState<'er' | 'likes' | 'comments'>('er');

  // ─── Compute all 3 buckets ───────────────────────────────
  const collab  = useMemo(() => computeBucket(posts, p => !!(p.isCollaboration || p.isOrganizationCollaboration)), [posts]);
  const logo    = useMemo(() => computeBucket(posts, p => !!p.hasOrganizationLogo),          [posts]);
  const caption = useMemo(() => computeBucket(posts, p => !!p.hasOrganizationInCaption),     [posts]);

  const signals = [
    { id: 'collab'  as const, label: 'Collaboration', data: collab  },
    { id: 'logo'    as const, label: 'Logo',           data: logo    },
    { id: 'caption' as const, label: 'Caption',        data: caption },
  ];

  const metrics = [
    { id: 'er'       as const, label: 'Eng. Rate'      },
    { id: 'likes'    as const, label: 'Likes/Post'     },
    { id: 'comments' as const, label: 'Comments/Post'  },
  ];

  const active = signals.find(s => s.id === signal)!;
  const lift = active.data.avgLift;
  const liftPositive = lift >= 0;
  const withData = active.data.yes;
  const noData   = active.data.no;

  const withLpp = Math.round(withData.likes);
  const noLpp   = Math.round(noData.likes);
  const withCpp = Math.round(withData.comments);
  const noCpp   = Math.round(noData.comments);

  const getValues = () => {
    if (metric === 'er') return {
      withVal: withData.engagementRate * 100,
      noVal:   noData.engagementRate   * 100,
      fmt: (v: number) => formatPercent(v, 1),
    };
    if (metric === 'likes') return {
      withVal: withLpp,
      noVal:   noLpp,
      fmt: formatNumber,
    };
    return {
      withVal: withCpp,
      noVal:   noCpp,
      fmt: formatNumber,
    };
  };

  const { withVal, noVal, fmt } = getValues();
  const maxVal = Math.max(withVal, noVal, 0.001);
  const withPct = (withVal / maxVal) * 100;
  const noPct   = (noVal   / maxVal) * 100;

  return (
    <div className="space-y-6">
      {/* ── Headline ─────────────────────────────────────────── */}
      <GlassPanel className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: PRIMARY }}>
              IP Intelligence · Instagram Only
            </p>
            <p className="text-3xl md:text-4xl font-black text-[#0F1D2E] leading-tight" style={headerStyle}>
              Posts with {shortName} {active.label.toLowerCase()} drive{' '}
              <span style={{ color: liftPositive ? PRIMARY : '#C2413B' }}>
                {liftPositive ? '+' : ''}{lift.toFixed(1)}%
              </span>{' '}
              higher engagement.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border"
              style={{ color: PRIMARY, backgroundColor: PRIMARY + '10', borderColor: PRIMARY + '30' }}>
              Instagram only
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* ── Signal + Metric selectors ────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Signal pills */}
        <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
          {signals.map(s => (
            <button
              key={s.id}
              onClick={() => setSignal(s.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={signal === s.id
                ? { backgroundColor: PRIMARY, color: 'white' }
                : { color: '#5B6B82' }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {/* Metric pills */}
        <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
          {metrics.map(m => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={metric === m.id
                ? { backgroundColor: '#0F1D2E', color: 'white' }
                : { color: '#5B6B82' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bar Comparison ───────────────────────────────────── */}
      <GlassPanel className="p-6">
        <p className="text-sm font-bold text-[#0F1D2E] mb-1">
          {active.label} Impact on {metrics.find(m => m.id === metric)?.label}
        </p>
        <p className="text-xs text-[#7A8AA3] mb-6">
          Posts using {active.label.toLowerCase()} vs posts without {active.label.toLowerCase()}
        </p>

        <div className="space-y-5">
          {/* WITH bar */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: PRIMARY }}>
                With {active.label} · {formatNumber(withData.contents)} posts
              </p>
              <p className="text-xl font-black text-[#0F1D2E]">{fmt(withVal)}</p>
            </div>
            <div className="w-full bg-[#F0F4FA] rounded-lg h-9 overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700"
                style={{ width: `${Math.max(withPct, 2)}%`, backgroundColor: PRIMARY }}
              />
            </div>
          </div>

          {/* WITHOUT bar */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9AA7BC]">
                Without {active.label} · {formatNumber(noData.contents)} posts
              </p>
              <p className="text-xl font-black text-[#5B6B82]">{fmt(noVal)}</p>
            </div>
            <div className="w-full bg-[#F0F4FA] rounded-lg h-9 overflow-hidden">
              <div
                className="h-full rounded-lg bg-[#C8D5E3] transition-all duration-700"
                style={{ width: `${Math.max(noPct, 2)}%` }}
              />
            </div>
          </div>

          {/* Lift badge */}
          <div className="pt-2 border-t border-[#E1E7F0] flex items-center gap-2">
            {liftPositive
              ? <ArrowUpRight className="w-5 h-5" style={{ color: PRIMARY }} />
              : <ArrowDownRight className="w-5 h-5 text-[#C2413B]" />}
            <span className="text-sm font-bold" style={{ color: liftPositive ? PRIMARY : '#C2413B' }}>
              {liftPositive ? '+' : ''}{lift.toFixed(1)}% ER lift
            </span>
            <span className="text-xs text-[#7A8AA3]">on posts with {active.label.toLowerCase()}</span>
          </div>
        </div>
      </GlassPanel>

      {/* ── Stat grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Posts With',    value: formatNumber(withData.contents) },
          { label: 'Posts Without', value: formatNumber(noData.contents)   },
          { label: 'Avg ER With',   value: formatPercent(withData.engagementRate * 100, 1) },
          { label: 'EMV With',      value: formatCurrency(withData.emv)    },
        ].map(item => (
          <GlassPanel key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</p>
            <p className="text-xl font-bold mt-2 text-[#0F1D2E]">{item.value}</p>
          </GlassPanel>
        ))}
      </div>

      {/* ── All 3 signals summary ─────────────────────────────── */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          All IP Signals — Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signals.map(s => {
            const pos   = s.data.avgLift >= 0;
            const color = pos ? PRIMARY : '#C2413B';
            const lpp   = s.data.yes.likes;
            const isActive = s.id === signal;
            return (
              <button
                key={s.id}
                onClick={() => setSignal(s.id)}
                className="text-left rounded-xl border p-4 transition-all"
                style={isActive
                  ? { borderColor: PRIMARY + '60', backgroundColor: PRIMARY + '08' }
                  : { borderColor: '#E1E7F0', backgroundColor: 'white' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#0F1D2E]">{s.label}</span>
                  <span className="text-sm font-bold" style={{ color }}>
                    {pos ? '+' : ''}{s.data.avgLift.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#5B6B82]">
                  <div className="flex justify-between">
                    <span>Posts with</span>
                    <span className="font-medium text-[#0F1D2E]">{formatNumber(s.data.yes.contents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg ER with</span>
                    <span className="font-medium text-[#0F1D2E]">{formatPercent(s.data.yes.engagementRate * 100, 1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes/post with</span>
                    <span className="font-medium text-[#0F1D2E]">{formatNumber(Math.round(lpp))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EMV</span>
                    <span className="font-medium text-[#0F1D2E]">{formatCurrency(s.data.yes.emv)}</span>
                  </div>
                </div>
                {/* Mini ER bar */}
                <div className="mt-3">
                  <div className="w-full bg-[#F0F4FA] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: color,
                        width: `${Math.min((s.data.yes.engagementRate / Math.max(s.data.yes.engagementRate, s.data.no.engagementRate, 0.001)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
