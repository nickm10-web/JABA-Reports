// PlayFly · Sponsored Content IP Impact Report.
//
// A single-page value piece, in the same visual language as the End of Year
// school reports (dark #0D0B12, JABA volt accent, Anton / Saira Extra
// Condensed / DM Sans, skewed stat plates, reveal-on-scroll). It visualizes the
// pre-computed organization / IP-collaboration lift analysis on PlayFly's
// sponsored Instagram content (see README_lift_analysis.md / the two summary
// JSON files this data was lifted from verbatim).
//
// Methodology honored in the framing:
//  - All numbers come from the supplied analysis. We do not recompute anything.
//  - Median is the headline statistic (likes / views are heavily
//    right-skewed; the mean is shown only as honest context).
//  - Collaboration is the one signal that clears the FDR-significance bar; logo
//    alone is presented as the honest "watch-out", not a win.
//  - Every figure is an observational association, not proof of causation.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// JABA mascot mark lives in /public (referenced by URL, not imported).
const jabaHead = '/jaba-head-trimmed.png';

// ── data (verbatim from the two analysis runs) ──
//   sponsored  → playfly_dashboard_summary.json (4,864 sponsored posts)
//   all        → all_playfly_dashboard_summary.json (73,100 organic + sponsored)
// All figures are median lift unless noted. EMV is intentionally not shown.

type Mode = 'sponsored' | 'all';

const CONFIGS: Record<Mode, {
  toggleLabel: string;
  lead: string;
  dataset: {
    totalPosts: number; totalLabel: string; scopeNote: string;
    baselinePosts: number; anySignalPosts: number;
    flags: { key: string; label: string; count: number; pct: number }[];
  };
  anySignal: { metric: string; medianLift: number }[];
  signals: {
    key: string; name: string; sub: string;
    likesMedianLift: number; erMedianLift: number; n: number;
    verdict: string; note: string; significant: boolean;
  }[];
  withVsWithout: {
    signals: { key: string; label: string }[];
    data: Record<string, Record<string, { with: number; without: number; lift: number }>>;
  };
}> = {
  sponsored: {
    toggleLabel: 'Sponsored posts',
    lead:
      'We took athletes’ sponsored Instagram posts and split them in two: posts that tie back to the ' +
      'school, and posts that don’t. "School IP" means the post uses the school’s logo, mentions or ' +
      'tags the school in the caption, or is an official collaboration. Then we compared how the two groups perform.',
    dataset: {
      totalPosts: 4864, totalLabel: 'Sponsored posts analyzed', scopeNote: '100% Instagram',
      baselinePosts: 2866, anySignalPosts: 1998,
      flags: [
        { key: 'caption', label: 'School mentioned in caption', count: 1181, pct: 24.3 },
        { key: 'logo', label: 'School logo in the post', count: 1565, pct: 32.2 },
        { key: 'collab', label: 'Official school collaboration', count: 167, pct: 3.4 },
      ],
    },
    anySignal: [
      { metric: 'Likes', medianLift: 26 },
      { metric: 'Video Views', medianLift: 38 },
      { metric: 'Engagement Rate', medianLift: 56 },
    ],
    signals: [
      {
        key: 'collab', name: 'Collaboration', sub: 'A formal tie to the school',
        likesMedianLift: 265, erMedianLift: 172, n: 167, verdict: 'The powerhouse',
        note: 'By far the biggest lift of the three, and the most consistent in the data.',
        significant: true,
      },
      {
        key: 'logo', name: 'Logo', sub: 'The mark visible in the media',
        likesMedianLift: 19, erMedianLift: 61, n: 1565, verdict: 'Solid lift',
        note: 'A clear lift on its own, though well behind collaboration.',
        significant: false,
      },
      {
        key: 'caption', name: 'Caption mention', sub: 'The school named or tagged',
        likesMedianLift: 19, erMedianLift: 36, n: 1181, verdict: 'Mildly positive',
        note: 'A small but consistent lift on the typical post.',
        significant: false,
      },
    ],
    withVsWithout: {
      signals: [
        { key: 'any', label: 'Any IP' },
        { key: 'collab', label: 'Collaboration' },
        { key: 'logo', label: 'Logo' },
        { key: 'mention', label: 'Mention' },
      ],
      data: {
        collab: {
          engagement: { with: 17.8, without: 6.6, lift: 172 },
          likes: { with: 1185, without: 325, lift: 265 },
          comments: { with: 9, without: 9, lift: 0 },
        },
        logo: {
          engagement: { with: 9.5, without: 5.9, lift: 61 },
          likes: { with: 382, without: 321, lift: 19 },
          comments: { with: 8, without: 9, lift: -11 },
        },
        mention: {
          engagement: { with: 8.6, without: 6.3, lift: 36 },
          likes: { with: 390, without: 329, lift: 19 },
          comments: { with: 7, without: 9, lift: -22 },
        },
        any: {
          engagement: { with: 8.9, without: 5.7, lift: 56 },
          likes: { with: 389, without: 309, lift: 26 },
          comments: { with: 8, without: 10, lift: -20 },
        },
      },
    },
  },
  all: {
    toggleLabel: 'All content',
    lead:
      'We took every athlete post we track (organic and sponsored, on Instagram and TikTok) and split ' +
      'them in two: posts that tie back to the school, and posts that don’t. "School IP" means the post uses ' +
      'the school’s logo, mentions or tags the school in the caption, or is an official collaboration. ' +
      'Then we compared how the two groups perform.',
    dataset: {
      totalPosts: 73100, totalLabel: 'Posts analyzed', scopeNote: 'Organic + sponsored · IG + TikTok',
      baselinePosts: 40149, anySignalPosts: 32951,
      flags: [
        { key: 'caption', label: 'School mentioned in caption', count: 13194, pct: 18.1 },
        { key: 'logo', label: 'School logo in the post', count: 29213, pct: 40.0 },
        { key: 'collab', label: 'Official school collaboration', count: 3733, pct: 5.1 },
      ],
    },
    anySignal: [
      { metric: 'Likes', medianLift: 72 },
      { metric: 'Video Views', medianLift: 66 },
      { metric: 'Engagement Rate', medianLift: 50 },
    ],
    signals: [
      {
        key: 'collab', name: 'Collaboration', sub: 'A formal tie to the school',
        likesMedianLift: 139, erMedianLift: 56, n: 3733, verdict: 'The powerhouse',
        note: 'The biggest lift of the three.',
        significant: true,
      },
      {
        key: 'logo', name: 'Logo', sub: 'The mark visible in the media',
        likesMedianLift: 66, erMedianLift: 52, n: 29213, verdict: 'Strong & proven',
        note: 'A clear lift even on its own, across nearly 30,000 posts.',
        significant: true,
      },
      {
        key: 'caption', name: 'Caption mention', sub: 'The school named or tagged',
        likesMedianLift: 40, erMedianLift: 31, n: 13194, verdict: 'Reliable lift',
        note: 'A consistent lift on the typical post.',
        significant: true,
      },
    ],
    withVsWithout: {
      signals: [
        { key: 'any', label: 'Any IP' },
        { key: 'collab', label: 'Collaboration' },
        { key: 'logo', label: 'Logo' },
        { key: 'mention', label: 'Mention' },
      ],
      data: {
        collab: {
          engagement: { with: 28.1, without: 18.0, lift: 56 },
          likes: { with: 1128, without: 471, lift: 139 },
          comments: { with: 14, without: 22, lift: -36 },
        },
        logo: {
          engagement: { with: 23.4, without: 15.4, lift: 52 },
          likes: { with: 660, without: 398, lift: 66 },
          comments: { with: 24, without: 20, lift: 20 },
        },
        mention: {
          engagement: { with: 23.0, without: 17.6, lift: 31 },
          likes: { with: 646, without: 461, lift: 40 },
          comments: { with: 14, without: 23, lift: -39 },
        },
        any: {
          engagement: { with: 22.8, without: 15.2, lift: 50 },
          likes: { with: 655, without: 381, lift: 72 },
          comments: { with: 23, without: 21, lift: 10 },
        },
      },
    },
  },
};

type Cfg = (typeof CONFIGS)[Mode];

const WVW_METRICS = [
  { key: 'engagement', label: 'Engagement', fmt: 'pct' as const },
  { key: 'likes', label: 'Likes', fmt: 'count' as const },
  { key: 'comments', label: 'Comments', fmt: 'count' as const },
];

// ── helpers ──────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`pfip-reveal ${shown ? 'pfip-in' : ''} ${className ?? ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function HeadLogo({ size = 38, framed = false }: { size?: number; framed?: boolean }) {
  return (
    <span className={`pfip-head ${framed ? 'pfip-head-framed' : ''}`} style={{ width: size, height: size }} aria-hidden>
      <img src={jabaHead} alt="JABA" />
    </span>
  );
}

function SocialIcon({ kind }: { kind: 'ig' | 'x' | 'in' | 'yt' }) {
  const c = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' };
  if (kind === 'x') return (<svg {...c}><path d="M18.2 3h3.3l-7.2 8.2L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.2 3Zm-1.2 16h1.8L7.1 4.9H5.2L17 19Z" /></svg>);
  if (kind === 'in') return (<svg {...c}><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9V9Z" /></svg>);
  if (kind === 'yt') return (<svg {...c}><path d="M21.6 7.2a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.7 1.8C5.7 19 12 19 12 19s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" /></svg>);
  return (<svg {...c} fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" /></svg>);
}

// ── sections ───────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="pfip-topbar">
      <div className="pfip-wrap pfip-topbar-inner">
        <span className="pfip-brand-mark">PLAYFLY</span>
        <span className="pfip-topbar-title">Athlete Content · IP Impact</span>
        <HeadLogo size={38} framed />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="pfip-hero">
      <div className="pfip-hero-ph" />
      <img className="pfip-hero-img" src="/images/for-agencies/world-hero-stadium.jpg" alt="" />
      <div className="pfip-hero-scrim" />
      <div className="pfip-wrap pfip-hero-copy">
        <h1 className="pfip-hero-h1">
          <img className="pfip-hero-wordmark" src="/playflyip.png" alt="PlayFly IP Effect" />
        </h1>
      </div>
    </header>
  );
}

function Setup({ cfg }: { cfg: Cfg }) {
  const d = cfg.dataset;
  return (
    <section className="pfip-section">
      <div className="pfip-wrap">
        <h2 className="pfip-h2">What We Measured</h2>
        <p className="pfip-lead">{cfg.lead}</p>
        <div className="pfip-setup-grid">
          <div className="pfip-setup-stat">
            <span className="pfip-setup-num">{d.totalPosts.toLocaleString()}</span>
            <span className="pfip-setup-lbl">{d.totalLabel}</span>
            <span className="pfip-setup-sub">{d.scopeNote}</span>
          </div>
          <div className="pfip-setup-stat">
            <span className="pfip-setup-num">{d.baselinePosts.toLocaleString()}</span>
            <span className="pfip-setup-lbl">Use no school IP</span>
            <span className="pfip-setup-sub">Our comparison baseline</span>
          </div>
          <div className="pfip-setup-stat">
            <span className="pfip-setup-num">{d.anySignalPosts.toLocaleString()}</span>
            <span className="pfip-setup-lbl">Use school IP</span>
            <span className="pfip-setup-sub">Logo, mention, or collaboration</span>
          </div>
        </div>
        <div className="pfip-flag-title">The three ways school IP shows up</div>
        <div className="pfip-flag-row">
          {d.flags.map((f) => (
            <div key={f.key} className="pfip-flag-chip">
              <span className="pfip-flag-label">{f.label}</span>
              <span className="pfip-flag-meta">{f.count.toLocaleString()} posts · {f.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Headline({ cfg }: { cfg: Cfg }) {
  return (
    <section className="pfip-section pfip-section-center">
      <div className="pfip-wrap">
        <h2 className="pfip-h2 pfip-h2-center">Posts That Use School IP Perform Better</h2>
        <div className="pfip-sub-rule"><span>Typical post · school IP vs no school IP</span></div>
        <div className="pfip-grid pfip-grid-3 pfip-kpi-grid">
          {cfg.anySignal.map((k, i) => (
            <Reveal key={k.metric} delay={i * 80} className="pfip-kpi-card">
              <div className="pfip-plate">
                <span className="pfip-plate-num">+{k.medianLift}%</span>
              </div>
              <div className="pfip-kpi-metric">{k.metric}</div>
              <div className="pfip-kpi-foot">vs posts with no school IP</div>
            </Reveal>
          ))}
        </div>
        <p className="pfip-note">
          Each figure is the typical (median) post, so a handful of viral hits don't skew the picture.
        </p>
      </div>
    </section>
  );
}

function Signals({ cfg }: { cfg: Cfg }) {
  return (
    <section className="pfip-section">
      <div className="pfip-wrap">
        <h2 className="pfip-h2">Which Kind of IP Matters Most</h2>
        <div className="pfip-kicker">How much more each signal earns vs posts without it · typical post</div>
        <div className="pfip-grid pfip-grid-3 pfip-signal-grid">
          {cfg.signals.map((s, i) => (
            <Reveal key={s.key} delay={i * 90} className={`pfip-signal-card ${s.significant ? 'pfip-signal-hot' : ''}`}>
              <div className="pfip-signal-head">
                <div>
                  <h3 className="pfip-signal-name">{s.name}</h3>
                  <div className="pfip-signal-sub">{s.sub}</div>
                </div>
                <span className={`pfip-verdict ${s.significant ? 'pfip-verdict-hot' : ''}`}>{s.verdict}</span>
              </div>
              <div className="pfip-signal-big">
                +{s.likesMedianLift}%
                <span className="pfip-signal-big-lbl">more likes</span>
              </div>
              <div className="pfip-signal-metrics">
                <div><span className="pfip-sm-val">+{s.erMedianLift}%</span><span className="pfip-sm-lbl">More engagement</span></div>
                <div><span className="pfip-sm-val">{s.n.toLocaleString()}</span><span className="pfip-sm-lbl">Posts in sample</span></div>
              </div>
              <p className="pfip-signal-note">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WithVsWithout({ cfg }: { cfg: Cfg }) {
  const wvw = cfg.withVsWithout;
  const [sig, setSig] = useState(wvw.signals[0].key);
  const [metric, setMetric] = useState('engagement');
  const m = WVW_METRICS.find((x) => x.key === metric) ?? WVW_METRICS[0];
  const sigObj = wvw.signals.find((s) => s.key === sig) ?? wvw.signals[0];
  const d = wvw.data[sig][metric];
  const fmt = (v: number) => (m.fmt === 'pct' ? `${v}%` : v.toLocaleString());
  const maxV = Math.max(d.with, d.without) || 1;
  const pos = d.lift >= 0;
  const withLabel = sig === 'any' ? 'With IP' : `With ${sigObj.label}`;
  const withoutLabel = sig === 'any' ? 'Without IP' : `Without ${sigObj.label}`;
  return (
    <section className="pfip-section">
      <div className="pfip-wrap">
        <h2 className="pfip-h2">With IP vs Without IP</h2>
        <div className="pfip-kicker">Pick a signal and a metric to compare the typical post</div>

        <div className="pfip-wvw-tabs">
          {wvw.signals.map((s) => (
            <button key={s.key} className={`pfip-chip ${sig === s.key ? 'pfip-chip-on' : ''}`} onClick={() => setSig(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="pfip-wvw-tabs pfip-wvw-tabs-sm">
          {WVW_METRICS.map((x) => (
            <button key={x.key} className={`pfip-chip pfip-chip-sm ${metric === x.key ? 'pfip-chip-on' : ''}`} onClick={() => setMetric(x.key)}>
              {x.label}
            </button>
          ))}
        </div>

        <div className="pfip-wvw-cards">
          <div className="pfip-wvw-card pfip-wvw-with">
            <div className="pfip-wvw-card-lbl">{withLabel}</div>
            <div className="pfip-wvw-card-val">{fmt(d.with)}</div>
          </div>
          <div className="pfip-wvw-card pfip-wvw-without">
            <div className="pfip-wvw-card-lbl">{withoutLabel}</div>
            <div className="pfip-wvw-card-val">{fmt(d.without)}</div>
          </div>
        </div>

        <div className="pfip-wvw-bars">
          <div className="pfip-wvw-bar-row">
            <span className="pfip-wvw-bar-lbl">With</span>
            <div className="pfip-wvw-bar-track">
              <div className="pfip-wvw-bar pfip-wvw-bar-on" style={{ width: `${(d.with / maxV) * 100}%` }}><span>{fmt(d.with)}</span></div>
            </div>
          </div>
          <div className="pfip-wvw-bar-row">
            <span className="pfip-wvw-bar-lbl">Without</span>
            <div className="pfip-wvw-bar-track">
              <div className="pfip-wvw-bar pfip-wvw-bar-off" style={{ width: `${(d.without / maxV) * 100}%` }}><span>{fmt(d.without)}</span></div>
            </div>
          </div>
        </div>

        <div className="pfip-wvw-lift">
          <div className="pfip-wvw-lift-lbl">IP Lift</div>
          <div className={`pfip-wvw-lift-val ${pos ? '' : 'pfip-neg'}`}>{pos ? '+' : ''}{d.lift}%</div>
          <div className="pfip-wvw-lift-sub">{m.label} with {sigObj.label} vs without</div>
        </div>
      </div>
    </section>
  );
}

function FooterBanner() {
  return (
    <footer className="pfip-footer">
      <div className="pfip-footer-wedge">
        <HeadLogo size={52} />
        <div className="pfip-footer-tag">
          <span>Prepared for PlayFly.</span>
          <span className="pfip-footer-tag-em">Powered by JABA.</span>
        </div>
      </div>
      <div className="pfip-footer-end">
        <span className="pfip-footer-logo">JABA.AI</span>
        <div className="pfip-footer-social">
          <a href="https://www.instagram.com/jaba/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><SocialIcon kind="ig" /></a>
          <a href="https://www.linkedin.com/company/jaba-ai/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><SocialIcon kind="in" /></a>
        </div>
      </div>
    </footer>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="pfip-toggle-wrap">
      <div className="pfip-toggle">
        {(Object.keys(CONFIGS) as Mode[]).map((m) => (
          <button
            key={m}
            className={`pfip-toggle-btn ${mode === m ? 'pfip-toggle-on' : ''}`}
            onClick={() => setMode(m)}
          >
            {CONFIGS[m].toggleLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── root ─────────────────────────────────────────────────────────────────

export function PlayflyIPImpactReport() {
  const [mode, setMode] = useState<Mode>('sponsored');
  const cfg = CONFIGS[mode];
  return (
    <div className="pfip-root">
      <style>{CSS}</style>
      <TopBar />
      <Hero />
      <ModeToggle mode={mode} setMode={setMode} />
      <Setup cfg={cfg} />
      <Headline cfg={cfg} />
      <Signals cfg={cfg} />
      <WithVsWithout cfg={cfg} />
      <FooterBanner />
    </div>
  );
}

export default PlayflyIPImpactReport;

// ── scoped styles ────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=Saira+Extra+Condensed:wght@600;700;800&display=swap');
.pfip-root{
  --ink:#0D0B12; --card:#13111A; --line:rgba(255,255,255,.08);
  --volt:#E2F500; --pos:#4ADE80; --neg:#EF4444;
  --t1:#fff; --t2:rgba(255,255,255,.62); --t3:rgba(255,255,255,.40);
  --display:'Anton',Impact,sans-serif; --cond:'Saira Extra Condensed',sans-serif;
  --body:'DM Sans',system-ui,sans-serif;
  background:var(--ink); color:var(--t1); font-family:var(--body);
  line-height:1.55; -webkit-font-smoothing:antialiased; min-height:100vh;
}
.pfip-root *{box-sizing:border-box;}
.pfip-root ::selection{background:var(--volt);color:var(--ink);}
.pfip-wrap{max-width:1180px;margin:0 auto;padding:0 28px;}

/* topbar */
.pfip-topbar{background:var(--ink);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:50;}
.pfip-topbar-inner{display:flex;align-items:center;justify-content:space-between;height:60px;}
.pfip-topbar-title{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.34em;font-size:15px;color:var(--t1);}
.pfip-brand-mark{font-family:var(--display);font-size:22px;letter-spacing:.02em;color:var(--t1);}
.pfip-head{display:inline-flex;align-items:center;justify-content:center;flex:none;}
.pfip-head img{width:100%;height:100%;object-fit:contain;display:block;}
.pfip-head-framed{background:var(--volt);border-radius:999px;padding:5px;}

/* hero */
.pfip-hero{position:relative;min-height:clamp(360px,48vw,560px);display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--line);
  background:radial-gradient(120% 120% at 80% 0%, #1d1a2c 0%, #0D0B12 55%, #100d18 100%);}
.pfip-hero-ph{position:absolute;inset:0;
  background:
    radial-gradient(60% 80% at 88% 12%, rgba(226,245,0,.16) 0%, transparent 60%),
    repeating-linear-gradient(125deg,rgba(255,255,255,.035) 0 1px,transparent 1px 30px);}
.pfip-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pfip-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,11,18,.1) 0%,transparent 30%,rgba(13,11,18,.78) 100%),linear-gradient(90deg,rgba(13,11,18,.62) 0%,transparent 60%);}
.pfip-hero-copy{position:relative;padding:64px 0;width:100%;text-align:center;}
.pfip-hero-kicker{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.26em;color:var(--volt);font-size:15px;margin-bottom:14px;}
.pfip-hero-h1{font-family:var(--display);line-height:.8;text-transform:uppercase;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;}
.pfip-hero-wordmark{position:relative;z-index:1;display:block;width:min(840px,94%);height:auto;margin:0 auto;
  filter:
    drop-shadow(0 0 3px rgba(226,245,0,.65))
    drop-shadow(0 0 12px rgba(226,245,0,.5))
    drop-shadow(0 0 30px rgba(226,245,0,.32))
    drop-shadow(0 10px 26px rgba(0,0,0,.5));}
.pfip-hero-a{font-size:clamp(3.4rem,12vw,9rem);color:#fff;letter-spacing:-.02em;text-shadow:0 4px 34px rgba(0,0,0,.6);}
.pfip-hero-b{font-size:clamp(3.4rem,12vw,9rem);color:var(--volt);letter-spacing:-.02em;text-shadow:0 0 46px rgba(226,245,0,.3);}
.pfip-hero-lede{max-width:560px;color:var(--t2);font-size:16px;margin:20px auto 0;}

/* mode toggle */
.pfip-toggle-wrap{display:flex;justify-content:center;padding:22px 28px;border-bottom:1px solid var(--line);background:var(--ink);position:sticky;top:60px;z-index:40;}
.pfip-toggle{display:inline-flex;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px;}
.pfip-toggle-btn{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:13px;color:var(--t2);background:transparent;border:none;border-radius:999px;padding:9px 22px;cursor:pointer;transition:color .15s,background .15s;}
.pfip-toggle-btn:hover{color:var(--t1);}
.pfip-toggle-on{background:var(--volt);color:var(--ink);}
.pfip-toggle-on:hover{color:var(--ink);}

/* sections */
.pfip-section{padding:58px 0;border-bottom:1px solid var(--line);}
.pfip-section-center{text-align:center;}
.pfip-h2{font-family:var(--display);font-size:clamp(1.9rem,4vw,2.9rem);text-transform:uppercase;letter-spacing:-.01em;line-height:1;margin:0;}
.pfip-h2-center{text-align:center;}
.pfip-kicker{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.22em;color:var(--volt);font-size:15px;margin-top:8px;}
.pfip-grid{display:grid;gap:16px;margin-top:30px;}
.pfip-grid-3{grid-template-columns:repeat(3,1fr);}
.pfip-grid-4{grid-template-columns:repeat(4,1fr);}
.pfip-note{color:var(--t2);font-size:13.5px;margin:26px auto 0;max-width:820px;}
.pfip-section-center .pfip-note{text-align:center;}

/* reveal */
.pfip-reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease;}
.pfip-reveal.pfip-in{opacity:1;transform:none;}

/* sub rule */
.pfip-sub-rule{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:14px;}
.pfip-sub-rule span{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:var(--volt);font-size:13px;white-space:nowrap;}
.pfip-sub-rule:before,.pfip-sub-rule:after{content:"";height:1px;width:84px;background:linear-gradient(90deg,transparent,var(--volt));}
.pfip-sub-rule:after{background:linear-gradient(90deg,var(--volt),transparent);}

/* setup */
.pfip-setup-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:30px;}
.pfip-setup-stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px;display:flex;flex-direction:column;}
.pfip-setup-num{font-family:var(--display);font-size:3rem;line-height:.9;color:var(--volt);}
.pfip-setup-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:15px;margin-top:12px;}
.pfip-setup-sub{color:var(--t3);font-size:12.5px;margin-top:4px;}
.pfip-flag-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;}
.pfip-flag-chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:10px 18px;display:flex;flex-direction:column;}
.pfip-flag-label{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:13px;}
.pfip-flag-meta{color:var(--t3);font-size:11.5px;margin-top:2px;}
.pfip-lead{max-width:760px;color:var(--t2);font-size:15.5px;margin:16px 0 0;}
.pfip-flag-title{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--t3);font-size:12px;margin:24px 0 12px;}

/* kpi plates */
.pfip-kpi-grid{margin-top:32px;}
.pfip-kpi-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px 22px;text-align:left;display:flex;flex-direction:column;align-items:flex-start;}
.pfip-plate{background:var(--volt);color:var(--ink);transform:skewX(-11deg);padding:10px 22px;display:inline-flex;border-radius:3px;}
.pfip-plate>*{transform:skewX(11deg);}
.pfip-plate-num{font-family:var(--display);font-size:2.6rem;line-height:.85;}
.pfip-kpi-metric{font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.02em;font-size:1.3rem;margin-top:18px;line-height:1;}
.pfip-kpi-foot{color:var(--t3);font-size:12px;margin-top:8px;}

/* signal cards */
.pfip-signal-grid{margin-top:30px;}
.pfip-signal-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px;display:flex;flex-direction:column;}
.pfip-signal-hot{border-color:rgba(226,245,0,.5);box-shadow:0 0 0 1px rgba(226,245,0,.25),0 0 40px rgba(226,245,0,.08);}
.pfip-signal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.pfip-signal-name{font-family:var(--cond);font-weight:800;text-transform:uppercase;font-size:1.5rem;line-height:1;margin:0;}
.pfip-signal-sub{color:var(--t3);font-size:12.5px;margin-top:4px;}
.pfip-verdict{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:11px;color:var(--t2);border:1px solid var(--line);border-radius:999px;padding:4px 10px;white-space:nowrap;flex:none;}
.pfip-verdict-hot{color:var(--ink);background:var(--volt);border-color:var(--volt);}
.pfip-signal-big{font-family:var(--display);font-size:3.4rem;line-height:.9;color:var(--volt);margin-top:20px;display:flex;align-items:baseline;gap:10px;}
.pfip-signal-big-lbl{font-family:var(--cond);font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);}
.pfip-signal-metrics{display:flex;gap:18px;margin-top:18px;padding-top:16px;border-top:1px solid var(--line);}
.pfip-signal-metrics>div{display:flex;flex-direction:column;}
.pfip-sm-val{font-family:var(--display);font-size:1.3rem;line-height:1;color:var(--t1);}
.pfip-sm-lbl{font-family:var(--cond);font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--t3);font-size:10.5px;margin-top:4px;}
.pfip-sig-badge{margin-top:16px;font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:11px;color:var(--ink);background:var(--volt);border-radius:6px;padding:6px 10px;align-self:flex-start;}
.pfip-signal-note{color:var(--t2);font-size:13px;margin:14px 0 0;}

/* ladder */
.pfip-ladder{margin-top:34px;display:flex;flex-direction:column;gap:14px;}
.pfip-ladder-row{display:grid;grid-template-columns:200px 1fr 130px;align-items:center;gap:18px;}
.pfip-ladder-label{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:15px;display:flex;flex-direction:column;gap:3px;}
.pfip-low{font-family:var(--body);font-weight:600;text-transform:none;letter-spacing:0;font-size:10.5px;color:var(--t3);}
.pfip-ladder-track{background:rgba(255,255,255,.04);border-radius:6px;height:38px;overflow:hidden;}
.pfip-ladder-bar{height:100%;background:rgba(255,255,255,.16);border-radius:6px;display:flex;align-items:center;justify-content:flex-end;padding-right:12px;min-width:54px;transition:width .8s cubic-bezier(.2,.7,.2,1);}
.pfip-bar-hot{background:linear-gradient(90deg,rgba(226,245,0,.55),var(--volt));}
.pfip-ladder-val{font-family:var(--display);font-size:1.15rem;color:var(--ink);}
.pfip-ladder-bar:not(.pfip-bar-hot) .pfip-ladder-val{color:var(--t1);}
.pfip-ladder-emv{font-family:var(--display);font-size:1.5rem;color:var(--volt);text-align:right;display:flex;flex-direction:column;line-height:1;}
.pfip-ladder-emv span{font-family:var(--cond);font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-top:4px;}

/* with vs without */
.pfip-wvw-tabs{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px;}
.pfip-wvw-tabs-sm{margin-top:10px;}
.pfip-chip{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.11em;font-size:13.5px;color:var(--t2);background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:999px;padding:11px 24px;cursor:pointer;outline:none;transition:color .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease;}
.pfip-chip:hover{color:var(--t1);background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.22);transform:translateY(-1px);}
.pfip-chip:focus-visible{box-shadow:0 0 0 2px rgba(226,245,0,.55);}
.pfip-chip-on,.pfip-chip-on:hover{background:var(--volt);color:var(--ink);border-color:var(--volt);box-shadow:0 6px 20px rgba(226,245,0,.28);}
.pfip-chip-sm{font-size:12px;padding:9px 18px;letter-spacing:.09em;}
.pfip-chip-sm.pfip-chip-on,.pfip-chip-sm.pfip-chip-on:hover{box-shadow:0 4px 14px rgba(226,245,0,.25);}
.pfip-wvw-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px;}
.pfip-wvw-card{border:1px solid var(--line);border-radius:16px;padding:30px 24px;text-align:center;background:var(--card);}
.pfip-wvw-with{border-color:rgba(226,245,0,.5);box-shadow:0 0 0 1px rgba(226,245,0,.25),0 0 40px rgba(226,245,0,.08);}
.pfip-wvw-card-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.2em;font-size:13px;color:var(--t3);}
.pfip-wvw-with .pfip-wvw-card-lbl{color:var(--volt);}
.pfip-wvw-card-val{font-family:var(--display);font-size:clamp(2.6rem,6vw,4rem);line-height:1;margin-top:12px;color:var(--t2);}
.pfip-wvw-with .pfip-wvw-card-val{color:var(--volt);}
.pfip-wvw-bars{margin-top:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px 24px;display:flex;flex-direction:column;gap:12px;}
.pfip-wvw-bar-row{display:grid;grid-template-columns:90px 1fr;align-items:center;gap:14px;}
.pfip-wvw-bar-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:13px;color:var(--t2);}
.pfip-wvw-bar-track{background:rgba(255,255,255,.04);border-radius:8px;height:40px;overflow:hidden;}
.pfip-wvw-bar{height:100%;border-radius:8px;display:flex;align-items:center;justify-content:flex-end;padding-right:14px;min-width:50px;transition:width .5s cubic-bezier(.2,.7,.2,1);}
.pfip-wvw-bar span{font-family:var(--display);font-size:1.05rem;}
.pfip-wvw-bar-on{background:linear-gradient(90deg,rgba(226,245,0,.55),var(--volt));color:var(--ink);}
.pfip-wvw-bar-off{background:rgba(255,255,255,.16);color:var(--t1);}
.pfip-wvw-lift{margin-top:16px;border:1px solid var(--line);border-radius:16px;padding:34px 24px;text-align:center;}
.pfip-wvw-lift-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.22em;font-size:13px;color:var(--t3);}
.pfip-wvw-lift-val{font-family:var(--display);font-size:clamp(3rem,8vw,5rem);line-height:1;margin-top:8px;color:var(--volt);}
.pfip-wvw-lift-val.pfip-neg{color:var(--neg);}
.pfip-wvw-lift-sub{color:var(--t2);font-size:14px;margin-top:10px;}
@media(max-width:620px){
  .pfip-wvw-cards{grid-template-columns:1fr;}
  .pfip-wvw-bar-row{grid-template-columns:74px 1fr;}
}

/* dollars */
.pfip-dollars{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:38px;align-items:end;height:300px;}
.pfip-dollar-col{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
.pfip-dollar-val{font-family:var(--display);font-size:1.7rem;color:var(--t1);margin-bottom:10px;}
.pfip-dollar-bar{width:72%;max-width:120px;border-radius:8px 8px 0 0;transition:height .9s cubic-bezier(.2,.7,.2,1);}
.pfip-dollar-base{background:rgba(255,255,255,.14);}
.pfip-dollar-mid{background:rgba(255,255,255,.26);}
.pfip-dollar-hi{background:linear-gradient(180deg,rgba(226,245,0,.5),rgba(226,245,0,.78));}
.pfip-dollar-peak{background:linear-gradient(180deg,rgba(226,245,0,.85),var(--volt));}
.pfip-dollar-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:13px;margin-top:14px;color:var(--t2);text-align:center;}

/* takeaways */
.pfip-take-grid{margin-top:30px;}
.pfip-take-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px;display:flex;flex-direction:column;}
.pfip-take-num{font-family:var(--display);font-size:2rem;color:var(--volt);line-height:1;}
.pfip-take-title{font-family:var(--cond);font-weight:800;text-transform:uppercase;font-size:1.35rem;line-height:1.04;margin:12px 0 0;}
.pfip-take-desc{color:var(--t2);font-size:13.5px;margin:12px 0 0;}

/* methodology */
.pfip-method{background:#100d18;}
.pfip-method-h2{font-size:clamp(1.6rem,3vw,2.2rem);}
.pfip-method-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:28px;}
.pfip-method-item{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;color:var(--t2);font-size:13px;}
.pfip-method-k{display:block;font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--volt);font-size:12px;margin-bottom:6px;}

/* footer */
.pfip-footer{display:grid;grid-template-columns:minmax(280px,360px) 1fr;}
.pfip-footer-wedge{background:var(--volt);color:var(--ink);display:flex;align-items:center;gap:16px;padding:26px 28px;position:relative;}
.pfip-footer-wedge:after{content:"";position:absolute;right:-26px;top:0;bottom:0;width:52px;background:var(--volt);transform:skewX(-11deg);}
.pfip-footer-tag{display:flex;flex-direction:column;font-family:var(--cond);font-weight:700;text-transform:uppercase;line-height:1.04;font-size:1.35rem;}
.pfip-footer-tag-em{font-style:italic;}
.pfip-footer-end{display:flex;align-items:center;justify-content:space-between;padding:26px 28px;background:var(--ink);}
.pfip-footer-logo{font-family:var(--display);font-size:1.7rem;letter-spacing:.02em;text-transform:uppercase;margin-left:48px;}
.pfip-footer-social{display:flex;gap:10px;}
.pfip-footer-social a{width:34px;height:34px;border-radius:999px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--t2);transition:color .15s,border-color .15s;}
.pfip-footer-social a:hover{color:var(--volt);border-color:var(--volt);}

/* responsive */
@media(max-width:1000px){
  .pfip-grid-4{grid-template-columns:repeat(2,1fr);}
  .pfip-grid-3{grid-template-columns:1fr;}
  .pfip-method-grid{grid-template-columns:1fr;}
  .pfip-ladder-row{grid-template-columns:140px 1fr 96px;gap:12px;}
}
@media(max-width:620px){
  .pfip-grid-4{grid-template-columns:1fr;}
  .pfip-setup-grid{grid-template-columns:1fr;}
  .pfip-dollars{height:auto;grid-template-columns:repeat(2,1fr);}
  .pfip-dollar-bar{min-height:60px;}
  .pfip-ladder-row{grid-template-columns:1fr;gap:6px;}
  .pfip-ladder-emv{text-align:left;flex-direction:row;align-items:baseline;gap:8px;}
  .pfip-footer{grid-template-columns:1fr;}
  .pfip-footer-wedge:after{display:none;}
  .pfip-topbar-title{letter-spacing:.18em;font-size:12px;}
}
`;
