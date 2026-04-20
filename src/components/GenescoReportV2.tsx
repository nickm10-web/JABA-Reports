import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  DollarSign,
  Eye,
  FileBarChart,
  Grid3X3,
  Heart,
  Instagram,
  LineChart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import contentsData from '../data/Genesco_contents.json';
import rosterData from '../data/Genesco_Roster.json';

type PostMetrics = {
  comments?: number;
  likes?: number;
  engagementRate?: number;
  shares?: number;
  saves?: number;
  impressions?: number;
  followers?: number;
  totalInteractions?: number;
  accountsEngaged?: number;
  videoViews?: number;
  reach?: number;
  emv?: number;
};

type Post = {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image?: string;
    sport?: string;
    position?: string;
  };
  caption?: string;
  createdAt?: { $date: string };
  publishedAt?: { $date: string };
  hasOrganizationLogo?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  isSponsored?: boolean;
  mediaType?: 'VIDEO' | 'PHOTO' | string;
  metrics?: PostMetrics;
  permalink?: string;
  source?: string;
  sponsorPartner?: string;
  url?: string;
};

type RosterAthlete = {
  _id?: { $oid: string } | string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  sport?: string;
  position?: string;
  metrics?: {
    sevenDays?: {
      audienceConnection?: number;
      engagementRate?: number;
      followers?: number;
      influencePower?: number;
      marketability?: number;
    };
    ninetyDays?: {
      contentCount?: number;
      sponsoredContentCount?: number;
    };
  };
};

type SponsorRow = {
  sponsor: string;
  posts: number;
  emv: number;
  likes: number;
  comments: number;
  videoViews: number;
  avgER: number;
  topAthlete: string;
  athletes: string[];
  topPosts: Post[];
};

type AthleteRow = {
  name: string;
  sport: string;
  image?: string;
  followers: number;
  marketability: number;
  influencePower: number;
  audienceConnection: number;
  posts: number;
  sponsored: number;
  collabs: number;
  emv: number;
  likes: number;
  comments: number;
  videoViews: number;
  avgER: number;
};

type MonthRow = {
  month: string;
  posts: number;
  sponsored: number;
  nonSponsored: number;
  emv: number;
  likes: number;
  comments: number;
  videoViews: number;
};

const posts = contentsData as Post[];
const roster = rosterData as RosterAthlete[];

const t = {
  bg: '#0a0a0a',
  panel: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  panelFlat: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#ffffff',
  text2: 'rgba(255,255,255,0.62)',
  text3: 'rgba(255,255,255,0.36)',
  accent: '#c8ff00',
  accent2: 'rgba(200,255,0,0.18)',
  accentGlow: 'rgba(200,255,0,0.34)',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#22c55e',
  orange: '#f59e0b',
  purple: '#a855f7',
  red: '#ef4444',
};

const navGroups = [
  {
    label: 'Core',
    items: [
      { id: 'overview', title: 'Portfolio Overview', meta: 'Metrics', icon: FileBarChart },
      { id: 'brand-summary', title: 'Brand/Sponsor Summary', meta: 'Real partners', icon: Award },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { id: 'sponsored-performance', title: 'Sponsored Post Performance', meta: 'Comparison', icon: LineChart },
      { id: 'emv-analysis', title: 'EMV Analysis', meta: 'Trend chart', icon: BarChart3 },
      { id: 'opportunity-map', title: 'Athlete Opportunity Map', meta: 'Scatter', icon: TrendingUp },
      { id: 'media-mix', title: 'Media Type Mix', meta: 'Format breakdown', icon: Grid3X3 },
    ],
  },
] as const;

const fmtInt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
};

const fmtCurrency = (n: number) => {
  if (!Number.isFinite(n)) return '$0';
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

const getDate = (p: Post) => p.publishedAt?.$date ?? p.createdAt?.$date ?? '';

const prettySponsor = (handle: string) =>
  handle
    .replace(/^@/, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const SPONSOR_LOGO_DOMAINS: Record<string, string> = {
  '@adidasfootball': 'adidas.com',
  '@icons_memorabilia': 'icons.com',
  '@loweshomeimprovement': 'lowes.com',
  '@efootball': 'konami.com',
  '@mastercard': 'mastercard.com',
  '@messifragrances': 'messifragrances.com',
  '@americaneagle': 'ae.com',
  '@snickers': 'snickers.com',
  '@oakleymeta': 'oakley.com',
  '@bountypapertowels': 'pg.com',
  '@sleepnumber': 'sleepnumber.com',
};

const fullName = (r: RosterAthlete) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();

const getSponsorHandle = (post: Post) => {
  const tagged = post.sponsorPartner?.trim();
  if (tagged && tagged.toLowerCase() !== 'unknown') return tagged;
  if (!post.isSponsored || !post.caption) return '';

  const lower = post.caption.toLowerCase();
  if (lower.includes('adidasfootball')) return '@adidasfootball';
  if (lower.includes('oakleymeta')) return '@oakleymeta';

  const handle = post.caption.match(/@[a-zA-Z0-9_.]+/)?.[0] ?? '';
  return handle.toLowerCase() === '@unknown' ? '' : handle;
};

function useInterFont() {
  useEffect(() => {
    if (document.querySelector('link[data-genesco-v2-font]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.genescoV2Font = 'true';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }, []);
}

export function GenescoReportV2() {
  useInterFont();

  const rosterByName = useMemo(() => {
    const map = new Map<string, RosterAthlete>();
    roster.forEach((r) => {
      const name = fullName(r);
      if (name) map.set(name, r);
    });
    return map;
  }, []);

  const kpis = useMemo(() => {
    const activeCreators = new Set<string>();
    let emv = 0;
    let likes = 0;
    let comments = 0;
    let videoViews = 0;
    let sponsored = 0;
    let collabs = 0;
    let erSum = 0;
    let erCount = 0;
    let sponsoredEmv = 0;
    const sponsorPartners = new Set<string>();
    const sponsorHandles = new Set<string>();
    const dates: number[] = [];
    let weightedErSum = 0;
    let weightedErWeight = 0;

    posts.forEach((p) => {
      activeCreators.add(p.athlete?.name ?? 'Unknown');
      emv += p.metrics?.emv ?? 0;
      likes += p.metrics?.likes ?? 0;
      comments += p.metrics?.comments ?? 0;
      videoViews += p.metrics?.videoViews ?? 0;
      if (p.isSponsored) {
        sponsored++;
        sponsoredEmv += p.metrics?.emv ?? 0;
      }
      if (p.isCollaboration) collabs++;
      if (p.sponsorPartner?.trim()) sponsorPartners.add(p.sponsorPartner.trim());
      const sponsorHandle = getSponsorHandle(p);
      if (sponsorHandle) sponsorHandles.add(sponsorHandle);
      const er = p.metrics?.engagementRate ?? 0;
      if (er > 0) {
        erSum += er;
        erCount++;
        const followers = rosterByName.get(p.athlete?.name ?? '')?.metrics?.sevenDays?.followers ?? 0;
        if (followers > 0) {
          weightedErSum += er * followers;
          weightedErWeight += followers;
        }
      }
      const time = Date.parse(getDate(p));
      if (Number.isFinite(time)) dates.push(time);
    });

    return {
      posts: posts.length,
      roster: roster.length,
      activeCreators: activeCreators.size,
      sponsorPartners: sponsorPartners.size,
      sponsorHandles: sponsorHandles.size,
      emv,
      sponsoredEmv,
      likes,
      comments,
      videoViews,
      sponsored,
      collabs,
      avgER: erCount ? erSum / erCount : 0,
      weightedER: weightedErWeight ? weightedErSum / weightedErWeight : 0,
      followers: roster.reduce((sum, r) => sum + (r.metrics?.sevenDays?.followers ?? 0), 0),
      dateMin: new Date(Math.min(...dates)),
      dateMax: new Date(Math.max(...dates)),
    };
  }, [rosterByName]);

  const athletes = useMemo<AthleteRow[]>(() => {
    const map = new Map<string, AthleteRow>();
    posts.forEach((p) => {
      const name = p.athlete?.name ?? 'Unknown';
      const r = rosterByName.get(name);
      const row =
        map.get(name) ??
        {
          name,
          sport: p.athlete?.sport ?? r?.sport ?? 'Unknown',
          image: p.athlete?.image ?? r?.profilePicture,
          followers: r?.metrics?.sevenDays?.followers ?? 0,
          marketability: r?.metrics?.sevenDays?.marketability ?? 0,
          influencePower: r?.metrics?.sevenDays?.influencePower ?? 0,
          audienceConnection: r?.metrics?.sevenDays?.audienceConnection ?? 0,
          posts: 0,
          sponsored: 0,
          collabs: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          videoViews: 0,
          avgER: 0,
        };
      row.posts += 1;
      row.sponsored += p.isSponsored ? 1 : 0;
      row.collabs += p.isCollaboration ? 1 : 0;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      row.videoViews += p.metrics?.videoViews ?? 0;
      row.avgER += ((p.metrics?.engagementRate ?? 0) - row.avgER) / row.posts;
      map.set(name, row);
    });

    roster.forEach((r) => {
      const name = fullName(r);
      if (!name || map.has(name)) return;
      map.set(name, {
        name,
        sport: r.sport ?? 'Unknown',
        image: r.profilePicture,
        followers: r.metrics?.sevenDays?.followers ?? 0,
        marketability: r.metrics?.sevenDays?.marketability ?? 0,
        influencePower: r.metrics?.sevenDays?.influencePower ?? 0,
        audienceConnection: r.metrics?.sevenDays?.audienceConnection ?? 0,
        posts: 0,
        sponsored: 0,
        collabs: 0,
        emv: 0,
        likes: 0,
        comments: 0,
        videoViews: 0,
        avgER: 0,
      });
    });

    return Array.from(map.values()).sort((a, b) => b.emv - a.emv);
  }, [rosterByName]);

  const sponsors = useMemo<SponsorRow[]>(() => {
    type WorkingSponsor = SponsorRow & { er: number[]; perAthlete: Map<string, number>; postList: Post[] };
    const map = new Map<string, WorkingSponsor>();
    posts.forEach((p) => {
      const key = getSponsorHandle(p);
      if (!key) return;
      const row =
        map.get(key) ??
        {
          sponsor: key,
          posts: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          videoViews: 0,
          avgER: 0,
          topAthlete: '',
          athletes: [],
          topPosts: [],
          er: [],
          perAthlete: new Map<string, number>(),
          postList: [],
        };
      const athlete = p.athlete?.name ?? 'Unknown';
      row.posts += 1;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      row.videoViews += p.metrics?.videoViews ?? 0;
      if ((p.metrics?.engagementRate ?? 0) > 0) row.er.push(p.metrics?.engagementRate ?? 0);
      row.perAthlete.set(athlete, (row.perAthlete.get(athlete) ?? 0) + (p.metrics?.emv ?? 0));
      row.postList.push(p);
      map.set(key, row);
    });

    return Array.from(map.values())
      .map((row) => {
        const rankedAthletes = Array.from(row.perAthlete.entries()).sort((a, b) => b[1] - a[1]);
        return {
          sponsor: row.sponsor,
          posts: row.posts,
          emv: row.emv,
          likes: row.likes,
          comments: row.comments,
          videoViews: row.videoViews,
          avgER: row.er.length ? row.er.reduce((a, b) => a + b, 0) / row.er.length : 0,
          topAthlete: rankedAthletes[0]?.[0] ?? 'Unknown',
          athletes: rankedAthletes.map(([name]) => name),
          topPosts: [...row.postList].sort((a, b) => (b.metrics?.emv ?? 0) - (a.metrics?.emv ?? 0)).slice(0, 2),
        };
      })
      .sort((a, b) => b.emv - a.emv);
  }, []);

  const months = useMemo<MonthRow[]>(() => {
    const map = new Map<string, MonthRow>();
    posts.forEach((p) => {
      const raw = getDate(p);
      if (!raw) return;
      const d = new Date(raw);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const row =
        map.get(key) ??
        {
          month: key,
          posts: 0,
          sponsored: 0,
          nonSponsored: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          videoViews: 0,
        };
      row.posts += 1;
      row.sponsored += p.isSponsored ? 1 : 0;
      row.nonSponsored += p.isSponsored ? 0 : 1;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      row.videoViews += p.metrics?.videoViews ?? 0;
      map.set(key, row);
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  const insights = useMemo(() => {
    const topAthlete = athletes[0];
    const nonMessiFootball = athletes
      .filter((a) => a.sport === 'Football' && a.posts > 0)
      .sort((a, b) => b.avgER - a.avgER)[0];
    const topSponsor = sponsors[0];
    const peakMonth = months.reduce((best, m) => (m.emv > best.emv ? m : best), months[0]);
    const topAthleteShare = topAthlete ? topAthlete.emv / Math.max(kpis.emv, 1) : 0;
    return {
      topAthlete,
      topAthleteShare,
      nonMessiFootball,
      topSponsor,
      peakMonth,
      sponsoredShare: kpis.sponsoredEmv / Math.max(kpis.emv, 1),
    };
  }, [athletes, sponsors, months, kpis.emv, kpis.sponsoredEmv]);

  return (
    <div className="genesco-v2">
      <style>{css}</style>
      <aside className="left-rail" aria-label="Genesco report navigation">
        <div className="rail-logo">
          <img src="/jaba-logo.png" alt="JABA" />
        </div>
        {navGroups.map((group) => (
          <div className="rail-group" key={group.label}>
            <div className="rail-group-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <a href={`#${item.id}`} className="rail-item" key={item.id}>
                  <Icon size={15} />
                  <span>
                    <b>{item.title}</b>
                    <small>{item.meta}</small>
                  </span>
                </a>
              );
            })}
          </div>
        ))}
      </aside>

      <main className="report-shell">
        <section className="hero" id="overview">
          <div className="hero-copy">
            <img className="genesco-logo" src="/logos/genesco-gse.svg" alt="Genesco Sports Enterprises" />
            <div className="eyebrow">Portfolio intelligence report</div>
            <h1>Genesco Sports Enterprises</h1>
            <p>
              A real-data JABA readout of roster reach, earned media value, sponsored performance,
              content trends, and athlete opportunity across the Genesco portfolio.
            </p>
            <div className="hero-meta">
              <span>{kpis.dateMin.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to {kpis.dateMax.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              <span>{kpis.posts} posts</span>
              <span>{kpis.roster} roster athletes</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-value">{fmtCurrency(kpis.emv)}</div>
            <div className="hero-label">Total earned media value</div>
            <div className="hero-grid">
              <MiniStat label="Likes" value={fmtInt(kpis.likes)} />
              <MiniStat label="Comments" value={fmtInt(kpis.comments)} />
              <MiniStat label="Video Views" value={fmtInt(kpis.videoViews)} />
              <MiniStat label="Weighted ER" value={fmtPct(kpis.weightedER)} />
            </div>
          </div>
        </section>

        <div className="reconciliation-note">
          <b>Scope check:</b> {kpis.posts} total posts across {kpis.activeCreators} active athletes.
          The full roster has {kpis.roster} athletes; {kpis.roster - kpis.activeCreators} roster athletes have
          no post activity in this Genesco export.
        </div>

        <KpiGrid kpis={kpis} />

        <Section id="brand-summary" eyebrow="Core" title="Brand/Sponsor Summary" subtitle="Sponsors are sourced from sponsorPartner when present, with caption handles used only for sponsored posts missing sponsorPartner.">
          <Panel>
            <PanelTitle title="Sponsor EMV Leaders" kicker={`${sponsors.length} sponsor handles`} />
            <SponsorBarChart sponsors={sponsors} />
          </Panel>
          <div className="sponsor-grid">
            {sponsors.map((s) => (
              <SponsorCard key={s.sponsor} sponsor={s} />
            ))}
          </div>
        </Section>

        <Section id="sponsored-performance" eyebrow="Analysis" title="Sponsored Post Performance" subtitle="Sponsored content is compared only against metrics present in the Genesco source data.">
          <div className="two-column">
            <Panel>
              <PanelTitle title="Sponsored vs Non-Sponsored" kicker="EMV, engagement, content volume" />
              <SponsoredComparison posts={posts} />
            </Panel>
            <Panel>
              <PanelTitle title="Partner Signal" kicker="Computed from sponsor-tagged posts" />
              <div className="insight-list">
                <InsightLine label="Sponsored EMV Share" value={`${(insights.sponsoredShare * 100).toFixed(1)}%`} detail={`${fmtCurrency(kpis.sponsoredEmv)} across ${kpis.sponsored} sponsored posts; not ROI because deal fees and spend are unavailable`} />
                <InsightLine label="Top Sponsor" value={insights.topSponsor ? prettySponsor(insights.topSponsor.sponsor) : 'N/A'} detail={insights.topSponsor ? `${fmtCurrency(insights.topSponsor.emv)} led by ${insights.topSponsor.topAthlete}` : 'No tagged sponsors'} />
                <InsightLine label="Sponsor Density" value={`${((kpis.sponsored / Math.max(kpis.posts, 1)) * 100).toFixed(1)}%`} detail="Share of all posts marked sponsored" />
              </div>
            </Panel>
          </div>
        </Section>

        <Section id="emv-analysis" eyebrow="Analysis" title="EMV Analysis" subtitle="Monthly performance across EMV, activity, engagement, and video scale.">
          <Panel>
            <PanelTitle title="Monthly Portfolio Trend" kicker="Normalized multi-metric chart" />
            <MonthlyTrendChart months={months} />
          </Panel>
        </Section>

        <Section id="opportunity-map" eyebrow="Analysis" title="Athlete Opportunity Map" subtitle="Followers on a log scale against average engagement rate, with EMV and JABA score fields available in hover detail.">
          <Panel>
            <PanelTitle title="Followers vs Engagement" kicker="One dot per athlete with posting data" />
            <AthleteScatter athletes={athletes} />
          </Panel>
        </Section>

        <Section id="media-mix" eyebrow="Analysis" title="Media Type Mix" subtitle="How format drives reach, value, and engagement. Video has the volume; photos drive the dollars.">
          <Panel>
            <PanelTitle title="Posts and EMV by format" kicker="Share of total across all Genesco posts" />
            <MediaTypeMix posts={posts} />
          </Panel>
        </Section>

      </main>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="panel">{children}</div>;
}

function PanelTitle({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="panel-title">
      <h3>{title}</h3>
      {kicker && <span>{kicker}</span>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function KpiGrid({ kpis }: { kpis: ReturnType<typeof useKpisShape> }) {
  const items = [
    { icon: DollarSign, label: 'Total EMV', value: fmtCurrency(kpis.emv), accent: true },
    { icon: Award, label: 'Sponsored EMV', value: fmtCurrency(kpis.sponsoredEmv) },
    { icon: Instagram, label: 'Posts', value: fmtInt(kpis.posts) },
    { icon: Users, label: 'Active Athletes', value: fmtInt(kpis.activeCreators) },
    { icon: Heart, label: 'Likes', value: fmtInt(kpis.likes) },
    { icon: Eye, label: 'Video Views', value: fmtInt(kpis.videoViews) },
    { icon: Zap, label: 'Weighted ER', value: fmtPct(kpis.weightedER) },
    { icon: BookOpen, label: 'Sponsor Handles', value: fmtInt(kpis.sponsorHandles) },
  ];
  return (
    <div className="kpi-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className={`kpi-card ${item.accent ? 'accent' : ''}`} key={item.label}>
            <Icon size={16} />
            <span>{item.label}</span>
            <b>{item.value}</b>
          </div>
        );
      })}
    </div>
  );
}

function useKpisShape() {
  return {
    posts: 0,
    roster: 0,
    activeCreators: 0,
    sponsorPartners: 0,
    sponsorHandles: 0,
    emv: 0,
    sponsoredEmv: 0,
    likes: 0,
    comments: 0,
    videoViews: 0,
    sponsored: 0,
    collabs: 0,
    avgER: 0,
    weightedER: 0,
    followers: 0,
    dateMin: new Date(),
    dateMax: new Date(),
  };
}

function SponsorCard({ sponsor }: { sponsor: SponsorRow }) {
  return (
    <div className="sponsor-card">
      <SponsorLogo handle={sponsor.sponsor} />
      <div className="sponsor-body">
        <div>
          <b>{prettySponsor(sponsor.sponsor)}</b>
          <span>{sponsor.sponsor}</span>
        </div>
        <strong>{fmtCurrency(sponsor.emv)}</strong>
        <small>
          {sponsor.posts} posts, {sponsor.athletes.length} athlete{ sponsor.athletes.length === 1 ? '' : 's' }, top: {sponsor.topAthlete}
        </small>
      </div>
    </div>
  );
}

function SponsorLogo({ handle }: { handle: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const display = prettySponsor(handle);
  const initials = display.slice(0, 2).toUpperCase();
  const domain =
    SPONSOR_LOGO_DOMAINS[handle.toLowerCase()] ??
    `${handle.replace(/^@/, '').toLowerCase()}.com`;
  const sources = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
  ];

  if (sourceIndex >= sources.length) {
    return <div className="sponsor-mark">{initials}</div>;
  }

  return (
    <img
      className="sponsor-logo"
      src={sources[sourceIndex]}
      alt={`${display} logo`}
      onError={() => setSourceIndex((idx) => idx + 1)}
    />
  );
}

function InsightLine({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="insight-line">
      <span>{label}</span>
      <b>{value}</b>
      <small>{detail}</small>
    </div>
  );
}

function SponsorBarChart({ sponsors }: { sponsors: SponsorRow[] }) {
  const rows = sponsors;
  const max = Math.max(...rows.map((r) => r.emv), 1);
  return (
    <div className="bar-list">
      {rows.map((s) => (
        <div className="bar-row" key={s.sponsor}>
          <div className="bar-label">
            <b>{prettySponsor(s.sponsor)}</b>
            <span>{s.posts} posts</span>
          </div>
          <div className="bar-track">
            <div style={{ width: `${(s.emv / max) * 100}%` }} />
          </div>
          <strong>{fmtCurrency(s.emv)}</strong>
        </div>
      ))}
    </div>
  );
}

function SponsoredComparison({ posts: source }: { posts: Post[] }) {
  const groups = [
    { key: 'Sponsored', rows: source.filter((p) => p.isSponsored), color: t.accent },
    { key: 'Non-sponsored', rows: source.filter((p) => !p.isSponsored), color: t.blue },
  ];
  const metrics = groups.map((g) => {
    const er = g.rows.map((p) => p.metrics?.engagementRate ?? 0).filter((v) => v > 0);
    return {
      ...g,
      posts: g.rows.length,
      emv: g.rows.reduce((a, p) => a + (p.metrics?.emv ?? 0), 0),
      avgER: er.length ? er.reduce((a, b) => a + b, 0) / er.length : 0,
      views: g.rows.reduce((a, p) => a + (p.metrics?.videoViews ?? 0), 0),
      likes: g.rows.reduce((a, p) => a + (p.metrics?.likes ?? 0), 0),
      comments: g.rows.reduce((a, p) => a + (p.metrics?.comments ?? 0), 0),
    };
  });
  // Per-metric max so every row's bar widths compare like-for-like across the two groups
  const maxEmv = Math.max(...metrics.map((m) => m.emv), 1);
  const maxViews = Math.max(...metrics.map((m) => m.views), 1);
  const maxPosts = Math.max(...metrics.map((m) => m.posts), 1);
  const maxER = Math.max(...metrics.map((m) => m.avgER), 0.01);
  const maxLikes = Math.max(...metrics.map((m) => m.likes), 1);
  const maxComments = Math.max(...metrics.map((m) => m.comments), 1);
  return (
    <div className="compare-chart">
      {metrics.map((m) => (
        <div className="compare-group" key={m.key}>
          <h4>{m.key}</h4>
          <MetricBar color={m.color} label="EMV" value={fmtCurrency(m.emv)} pct={m.emv / maxEmv} />
          <MetricBar color={m.color} label="Video Views" value={fmtInt(m.views)} pct={m.views / maxViews} />
          <MetricBar color={m.color} label="Likes" value={fmtInt(m.likes)} pct={m.likes / maxLikes} />
          <MetricBar color={m.color} label="Comments" value={fmtInt(m.comments)} pct={m.comments / maxComments} />
          <MetricBar color={m.color} label="Posts" value={fmtInt(m.posts)} pct={m.posts / maxPosts} />
          <MetricBar color={m.color} label="Avg ER" value={fmtPct(m.avgER)} pct={m.avgER / maxER} />
        </div>
      ))}
    </div>
  );
}

function MetricBar({ color, label, value, pct }: { color: string; label: string; value: string; pct: number }) {
  return (
    <div className="metric-bar">
      <span>{label}</span>
      <div>
        <i style={{ width: `${Math.max(4, Math.min(100, pct * 100))}%`, background: color }} />
      </div>
      <b>{value}</b>
    </div>
  );
}

function MonthlyTrendChart({ months }: { months: MonthRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 980;
  const H = 360;
  const pad = { l: 52, r: 28, t: 26, b: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / Math.max(months.length - 1, 1)) * innerW;
  const maxes = {
    emv: Math.max(...months.map((m) => m.emv), 1),
    posts: Math.max(...months.map((m) => m.posts), 1),
    views: Math.max(...months.map((m) => m.videoViews), 1),
  };
  const y = (value: number, max: number) => pad.t + innerH - (value / max) * innerH;
  const path = (key: 'emv' | 'posts' | 'videoViews', max: number) =>
    months.map((m, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(m[key], max)}`).join(' ');
  const labelEvery = Math.ceil(months.length / 8);
  const hovered = hover === null ? null : months[hover];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly Genesco portfolio trend">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const yy = pad.t + innerH - tick * innerH;
          return (
            <g key={tick}>
              <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="rgba(255,255,255,0.07)" />
              <text x={pad.l - 10} y={yy + 4} textAnchor="end" fontSize="10" fill={t.text3}>
                {Math.round(tick * 100)}%
              </text>
            </g>
          );
        })}
        <path d={path('emv', maxes.emv)} fill="none" stroke={t.accent} strokeWidth="3" />
        <path d={path('videoViews', maxes.views)} fill="none" stroke={t.cyan} strokeWidth="2.2" opacity="0.9" />
        <path d={path('posts', maxes.posts)} fill="none" stroke={t.purple} strokeWidth="2.2" opacity="0.9" />
        {months.map((m, i) => (
          <rect key={m.month} x={x(i) - innerW / months.length / 2} y={pad.t} width={innerW / months.length} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {months.map((m, i) =>
          i % labelEvery === 0 ? (
            <text key={m.month} x={x(i)} y={H - 18} textAnchor="middle" fontSize="10" fill={t.text3}>
              {m.month}
            </text>
          ) : null,
        )}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 4" />
        )}
      </svg>
      <div className="legend">
        <Legend color={t.accent} label="EMV" />
        <Legend color={t.cyan} label="Video views" />
        <Legend color={t.purple} label="Posts" />
      </div>
      {hovered && (
        <div className="chart-tooltip">
          <b>{hovered.month}</b>
          <span>{fmtCurrency(hovered.emv)} EMV</span>
          <span>{hovered.posts} posts, {hovered.sponsored} sponsored</span>
          <span>{fmtInt(hovered.videoViews)} video views</span>
        </div>
      )}
    </div>
  );
}

function MediaTypeMix({ posts }: { posts: Post[] }) {
  const mix = useMemo(() => {
    const types = new Map<string, { count: number; emv: number; erSum: number; likes: number; videoViews: number }>();
    for (const p of posts) {
      const mt = (p.mediaType || 'UNKNOWN').toUpperCase();
      const row = types.get(mt) || { count: 0, emv: 0, erSum: 0, likes: 0, videoViews: 0 };
      row.count += 1;
      row.emv += p.metrics?.emv ?? 0;
      row.erSum += p.metrics?.engagementRate ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.videoViews += p.metrics?.videoViews ?? 0;
      types.set(mt, row);
    }
    return [...types.entries()]
      .map(([key, v]) => ({ key, ...v, avgER: v.count > 0 ? v.erSum / v.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const totalCount = mix.reduce((a, b) => a + b.count, 0) || 1;
  const totalEmv = mix.reduce((a, b) => a + b.emv, 0) || 1;

  const colorFor = (key: string): string => {
    if (key === 'VIDEO') return t.blue;
    if (key === 'PHOTO') return t.accent;
    if (key === 'CAROUSEL') return '#a855f7';
    return 'rgba(255,255,255,0.24)';
  };

  type BarDef = { label: string; total: string; seg: (m: (typeof mix)[number]) => { pct: number; text: string } };
  const bars: BarDef[] = [
    {
      label: 'Posts',
      total: fmtInt(totalCount),
      seg: (m) => ({ pct: (m.count / totalCount) * 100, text: `${m.key} · ${fmtInt(m.count)}` }),
    },
    {
      label: 'EMV',
      total: fmtCurrency(totalEmv),
      seg: (m) => ({ pct: (m.emv / totalEmv) * 100, text: `${m.key} · ${fmtCurrency(m.emv)}` }),
    },
  ];

  return (
    <div className="media-mix">
      <div className="media-mix-bars">
        {bars.map((bar) => (
          <div className="media-bar-row" key={bar.label}>
            <span className="media-bar-label">{bar.label}</span>
            <div className="media-bar">
              {mix.map((m) => {
                const { pct, text } = bar.seg(m);
                return (
                  <div
                    key={m.key}
                    className="media-seg"
                    style={{ width: `${pct}%`, background: colorFor(m.key) }}
                    title={text}
                  >
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
            <b className="media-bar-total">{bar.total}</b>
          </div>
        ))}
      </div>
      <div className="media-mix-cards">
        {mix.map((m) => (
          <div className="media-mix-card" key={m.key}>
            <div className="media-mix-swatch" style={{ background: colorFor(m.key) }} />
            <div className="media-mix-card-body">
              <b>{m.key}</b>
              <div className="media-mix-stats">
                <span>
                  <em>{fmtInt(m.count)}</em> posts · {((m.count / totalCount) * 100).toFixed(0)}%
                </span>
                <span>
                  <em>{fmtCurrency(m.emv)}</em> EMV · {((m.emv / totalEmv) * 100).toFixed(0)}%
                </span>
                <span>
                  <em>{fmtPct(m.avgER)}</em> avg ER
                </span>
                <span>
                  <em>{fmtInt(m.likes)}</em> total likes
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AthleteScatter({ athletes }: { athletes: AthleteRow[] }) {
  const pts = athletes.filter((a) => a.posts > 0 && a.followers > 0 && a.avgER > 0);
  const [hover, setHover] = useState<string | null>(null);
  const W = 980;
  const H = 380;
  const pad = { l: 66, r: 40, t: 28, b: 52 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxF = Math.max(...pts.map((p) => p.followers), 10);
  // Pin left edge of the log axis just below the first meaningful tick (1K).
  // This removes the dead space between 0 and 1K and keeps decade ticks evenly spaced.
  const logMin = Math.log10(500);
  const logMax = Math.log10(Math.max(maxF, 1000)) + 0.2;
  const maxER = Math.max(...pts.map((p) => p.avgER), 0.01) * 1.14;
  const maxEmv = Math.max(...pts.map((p) => p.emv), 1);
  const x = (followers: number) => pad.l + ((Math.log10(Math.max(1, followers)) - logMin) / Math.max(logMax - logMin, 0.1)) * innerW;
  const y = (er: number) => pad.t + innerH - (er / maxER) * innerH;
  const radius = (emv: number) => 24 + Math.sqrt(emv / maxEmv) * 12; // ~48–72px diameter at viewBox scale
  const clipId = (name: string) => `scatter-clip-${name.replace(/[^a-zA-Z0-9]/g, '')}`;
  const hovered = pts.find((p) => p.name === hover);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Athlete opportunity scatter plot">
        <defs>
          {pts.map((a) => (
            <clipPath key={a.name} id={clipId(a.name)}>
              <circle cx={x(a.followers)} cy={y(a.avgER)} r={radius(a.emv)} />
            </clipPath>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const yy = pad.t + innerH - tick * innerH;
          return (
            <g key={tick}>
              <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="rgba(255,255,255,0.07)" />
              <text x={pad.l - 10} y={yy + 4} textAnchor="end" fontSize="10" fill={t.text3}>
                {(tick * maxER * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {[1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000].map((tick) => {
          const xx = x(tick);
          if (xx < pad.l || xx > W - pad.r) return null;
          return (
            <g key={tick}>
              <line x1={xx} x2={xx} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.055)" />
              <text x={xx} y={H - 22} textAnchor="middle" fontSize="10" fill={t.text3}>
                {fmtInt(tick)}
              </text>
            </g>
          );
        })}
        {pts.map((a) => {
          const r = radius(a.emv);
          const active = hover === a.name;
          const cx = x(a.followers);
          const cy = y(a.avgER);
          const ringColor = a.sport === 'Soccer' ? t.accent : t.blue;
          return (
            <g
              key={a.name}
              onMouseEnter={() => setHover(a.name)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Sport-colored fill — visible if no image, and as subtle tint behind image */}
              <circle cx={cx} cy={cy} r={r} fill={ringColor} opacity={active ? 0.95 : 0.55} />
              {a.image && (
                <image
                  href={a.image}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  clipPath={`url(#${clipId(a.name)})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* Sport-colored ring keeps the color coding readable even with a photo */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={active ? '#fff' : ringColor}
                strokeWidth={active ? 2.5 : 2}
                opacity={active ? 1 : 0.9}
              />
              {!a.image && (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={Math.max(10, r * 0.42)}
                  fontWeight="800"
                  fill="#0a0a0a"
                >
                  {a.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2)}
                </text>
              )}
            </g>
          );
        })}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill={t.text3}>Followers, log scale</text>
        <text x="-190" y="17" textAnchor="middle" fontSize="11" fill={t.text3} transform="rotate(-90)">Average engagement rate</text>
      </svg>
      <div className="legend">
        <Legend color={t.accent} label="Soccer" />
        <Legend color={t.blue} label="Football" />
        <span>Bubble size = EMV</span>
      </div>
      {hovered && (
        <div className="chart-tooltip">
          <b>{hovered.name}</b>
          <span>{fmtInt(hovered.followers)} followers</span>
          <span>{fmtPct(hovered.avgER)} avg ER</span>
          <span>{fmtCurrency(hovered.emv)} EMV</span>
          <span>Marketability {hovered.marketability || '-'}</span>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="legend-item">
      <i style={{ background: color }} />
      {label}
    </span>
  );
}

const css = `
.genesco-v2 {
  min-height: 100vh;
  background: #000;
  color: ${t.text};
  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.left-rail {
  position: fixed;
  inset: 16px auto 16px 16px;
  width: 260px;
  padding: 22px 14px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0.06) 100%);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 22px;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 -1px 0 rgba(255,255,255,0.04),
    0 12px 40px rgba(0,0,0,0.55);
  overflow-y: auto;
  z-index: 20;
}
.rail-logo {
  padding: 0 10px 18px;
  display: flex;
  align-items: center;
}
.rail-logo img {
  height: 32px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 18px ${t.accentGlow});
}
.rail-group { margin: 10px 0 20px; }
.rail-group-label {
  padding: 0 6px 8px;
  color: ${t.text3};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}
.rail-item {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  align-items: center;
  min-height: 50px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: ${t.text2};
  text-decoration: none;
}
.rail-item:hover {
  color: ${t.text};
  border-color: ${t.borderStrong};
  background: rgba(255,255,255,0.04);
}
.rail-item b {
  display: block;
  font-size: 12.5px;
  line-height: 1.2;
}
.rail-item small {
  display: block;
  margin-top: 3px;
  color: ${t.text3};
  font-size: 11px;
}
.report-shell {
  margin-left: 292px;
  padding: 34px clamp(18px, 4vw, 54px) 80px;
  max-width: 1480px;
}
.hero {
  min-height: 560px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 22px;
  align-items: center;
  border-bottom: 1px solid ${t.border};
}
.genesco-logo {
  width: min(380px, 80vw);
  height: auto;
  display: block;
  margin-bottom: 22px;
  filter: drop-shadow(0 12px 34px rgba(1,105,173,0.24));
}
.eyebrow {
  color: ${t.accent};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  text-shadow: 0 0 14px ${t.accentGlow};
}
.hero h1 {
  margin: 12px 0;
  max-width: 900px;
  font-size: clamp(46px, 8vw, 96px);
  line-height: 0.92;
  letter-spacing: -1px;
}
.hero p {
  max-width: 760px;
  margin: 0;
  color: ${t.text2};
  font-size: 17px;
  line-height: 1.65;
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}
.hero-meta span {
  border: 1px solid ${t.border};
  border-radius: 999px;
  padding: 8px 13px;
  background: rgba(255,255,255,0.035);
  color: ${t.text2};
  font-size: 12px;
  font-weight: 700;
}
.reconciliation-note {
  margin-top: 18px;
  padding: 12px 14px;
  border: 1px solid rgba(200,255,0,0.22);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(200,255,0,0.07), rgba(200,255,0,0.015));
  color: ${t.text2};
  font-size: 13px;
  line-height: 1.5;
}
.reconciliation-note b {
  color: ${t.accent};
}
.hero-panel, .panel, .kpi-card, .coverage-card, .executive-insight {
  position: relative;
  overflow: hidden;
  background: ${t.panel};
  border: 1px solid ${t.border};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06);
}
.hero-panel:before, .panel:before, .kpi-card:before, .coverage-card:before, .executive-insight:before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
}
.hero-panel { padding: 28px; }
.hero-value {
  color: ${t.accent};
  font-size: clamp(42px, 6vw, 74px);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -1px;
  text-shadow: 0 0 24px ${t.accentGlow};
}
.hero-label {
  margin-top: 10px;
  color: ${t.text3};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.hero-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 28px;
}
.hero-grid div {
  border: 1px solid ${t.border};
  border-radius: 8px;
  padding: 14px;
  background: rgba(255,255,255,0.035);
}
.hero-grid span, .kpi-card span {
  display: block;
  color: ${t.text3};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.hero-grid b {
  display: block;
  margin-top: 7px;
  font-size: 22px;
}
.section {
  scroll-margin-top: 30px;
  margin-top: 56px;
}
.section-head {
  margin-bottom: 18px;
}
.section-head h2 {
  margin: 8px 0 0;
  font-size: clamp(28px, 4vw, 42px);
  letter-spacing: -0.5px;
}
.section-head p {
  max-width: 780px;
  margin: 8px 0 0;
  color: ${t.text2};
  line-height: 1.55;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}
.kpi-card {
  min-height: 128px;
  padding: 16px;
}
.kpi-card svg {
  color: ${t.text3};
}
.kpi-card.accent {
  border-color: rgba(200,255,0,0.24);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 28px rgba(200,255,0,0.06), inset 0 1px 0 rgba(200,255,0,0.1);
}
.kpi-card.accent svg, .kpi-card.accent b {
  color: ${t.accent};
}
.kpi-card span {
  margin-top: 16px;
}
.kpi-card b {
  display: block;
  margin-top: 8px;
  font-size: clamp(22px, 3vw, 32px);
  letter-spacing: -0.5px;
}
.two-column {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 16px;
  align-items: stretch;
}
.stack {
  display: grid;
  gap: 12px;
}
.sponsor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.panel {
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 16px;
}
.panel-title h3 {
  margin: 0;
  font-size: 18px;
}
.panel-title span {
  color: ${t.text3};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}
.bar-list {
  display: grid;
  gap: 14px;
}
.bar-row {
  display: grid;
  grid-template-columns: 170px 1fr 86px;
  gap: 12px;
  align-items: center;
}
.bar-label b, .bar-label span {
  display: block;
}
.bar-label b {
  font-size: 13px;
}
.bar-label span {
  color: ${t.text3};
  font-size: 11px;
  margin-top: 3px;
}
.bar-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.bar-track div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${t.accent}, rgba(200,255,0,0.38));
  box-shadow: 0 0 16px ${t.accentGlow};
}
.bar-row strong {
  text-align: right;
  color: ${t.accent};
}
.sponsor-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid ${t.border};
  border-radius: 8px;
  background: rgba(255,255,255,0.035);
}
.sponsor-mark {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: ${t.accent};
  color: #0a0a0a;
  font-weight: 900;
}
.sponsor-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
  background: #ffffff;
  padding: 4px;
  box-sizing: border-box;
  border: 1px solid ${t.border};
}
.sponsor-body {
  min-width: 0;
}
.sponsor-body b, .sponsor-body span, .sponsor-body strong, .sponsor-body small {
  display: block;
}
.sponsor-body span, .sponsor-body small {
  color: ${t.text3};
  font-size: 11px;
  line-height: 1.4;
}
.sponsor-body strong {
  margin: 5px 0 3px;
  color: ${t.accent};
  font-size: 20px;
}
.coverage-grid, .insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.coverage-card {
  padding: 20px;
}
.coverage-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: ${t.orange};
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
}
.coverage-icon.good {
  color: ${t.green};
  background: rgba(34,197,94,0.12);
  border-color: rgba(34,197,94,0.25);
}
.coverage-card h3 {
  margin: 14px 0 8px;
}
.coverage-card ul {
  margin: 0;
  padding-left: 19px;
  color: ${t.text2};
  line-height: 1.6;
}
.coverage-card li {
  margin: 8px 0;
}
.compare-chart {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.compare-group {
  display: flex;
  flex-direction: column;
}
.compare-group h4 {
  margin: 0 0 12px;
}
.metric-bar {
  display: grid;
  grid-template-columns: 82px 1fr 84px;
  gap: 10px;
  align-items: center;
  margin: 18px 0;
}
.metric-bar span {
  color: ${t.text3};
  font-size: 11px;
}
.metric-bar > div {
  height: 9px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.metric-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
}
.metric-bar b {
  text-align: right;
  font-size: 12px;
}
.insight-list {
  display: grid;
  gap: 14px;
}
.insight-line {
  padding-bottom: 14px;
  border-bottom: 1px solid ${t.border};
}
.insight-line:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.insight-line span, .insight-line small {
  display: block;
  color: ${t.text3};
}
.insight-line span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.insight-line b {
  display: block;
  margin: 5px 0;
  color: ${t.accent};
  font-size: 24px;
}
.insight-line small {
  line-height: 1.4;
}
.chart-wrap {
  position: relative;
  width: 100%;
  overflow-x: auto;
}
.chart-wrap svg {
  width: 100%;
  min-width: 720px;
  display: block;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  color: ${t.text3};
  font-size: 12px;
  margin-top: 10px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 10px currentColor;
}
.chart-tooltip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid ${t.border};
  border-radius: 8px;
  background: rgba(255,255,255,0.035);
  color: ${t.text2};
  font-size: 12px;
}
.chart-tooltip b {
  color: ${t.accent};
}
.media-mix {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.media-mix-bars {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.media-bar-row {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 110px;
  gap: 14px;
  align-items: center;
}
.media-bar-label {
  color: ${t.text3};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
.media-bar {
  display: flex;
  height: 36px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
}
.media-seg {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: #0a0a0a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  overflow: hidden;
  transition: filter 0.15s ease;
}
.media-seg:hover {
  filter: brightness(1.08);
}
.media-seg span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-bar-total {
  font-size: 14px;
  font-weight: 800;
  text-align: right;
  color: ${t.text};
}
.media-mix-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.media-mix-card {
  display: grid;
  grid-template-columns: 6px 1fr;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid ${t.border};
  border-radius: 10px;
  background: rgba(255,255,255,0.025);
}
.media-mix-swatch {
  border-radius: 3px;
  box-shadow: 0 0 12px currentColor;
}
.media-mix-card-body b {
  display: block;
  font-size: 13px;
  letter-spacing: 1px;
  color: ${t.text};
}
.media-mix-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  font-size: 11.5px;
  color: ${t.text3};
}
.media-mix-stats em {
  color: ${t.text};
  font-style: normal;
  font-weight: 700;
}
.post-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.post-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${t.border};
  border-radius: 8px;
  background: ${t.panel};
  color: ${t.text};
  text-decoration: none;
}
.post-media {
  position: relative;
  flex: 0 0 auto;
  height: 220px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.04);
  color: ${t.text3};
}
.post-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.post-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 999px;
  padding: 4px 9px;
  background: rgba(10,10,10,0.72);
  color: ${t.text2};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
}
.post-tag.sponsored {
  color: ${t.accent};
  border-color: rgba(200,255,0,0.32);
}
.post-tag.collab {
  color: ${t.blue};
  border-color: rgba(59,130,246,0.32);
}
.post-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.post-body b, .post-body span, .post-body small {
  display: block;
}
.post-body span, .post-body small, .post-body p {
  color: ${t.text3};
}
.post-body span, .post-body small {
  margin-top: 4px;
  font-size: 11px;
}
.post-body small {
  color: ${t.accent};
}
.post-body p {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 10px 0;
  font-size: 12.5px;
  line-height: 1.5;
}
.post-body div {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  align-items: baseline;
  margin-top: auto;
  padding-top: 10px;
}
.post-body strong {
  color: ${t.accent};
}
.executive-insight {
  padding: 20px;
}
.executive-insight > div {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: ${t.accent};
  background: ${t.accent2};
  border: 1px solid rgba(200,255,0,0.24);
}
.executive-insight h3 {
  margin: 14px 0 8px;
}
.executive-insight p {
  margin: 0;
  color: ${t.text2};
  line-height: 1.6;
}
.table-wrap {
  overflow: auto;
  border: 1px solid ${t.border};
  border-radius: 8px;
  background: ${t.panel};
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}
th, td {
  padding: 12px 14px;
  border-bottom: 1px solid ${t.border};
  text-align: left;
  white-space: nowrap;
}
th {
  color: ${t.accent};
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
td {
  color: ${t.text2};
  font-size: 13px;
}
tr:last-child td {
  border-bottom: 0;
}
@media (max-width: 1180px) {
  .left-rail {
    position: sticky;
    inset: auto;
    top: 0;
    width: auto;
    height: auto;
    margin: 0;
    padding: 10px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    border: 0;
    border-bottom: 1px solid ${t.border};
    border-radius: 0;
    box-shadow: none;
    background: rgba(10,10,10,0.92);
  }
  .rail-logo, .rail-group-label, .rail-item small {
    display: none;
  }
  .rail-group {
    display: flex;
    gap: 8px;
    margin: 0;
  }
  .rail-item {
    min-height: 38px;
    grid-template-columns: 16px max-content;
    white-space: nowrap;
  }
  .report-shell {
    margin-left: 0;
  }
  .hero {
    min-height: auto;
    padding-top: 38px;
    padding-bottom: 42px;
    grid-template-columns: 1fr;
  }
}
@media (max-width: 860px) {
  .kpi-grid, .coverage-grid, .insight-grid, .two-column, .compare-chart {
    grid-template-columns: 1fr;
  }
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bar-row {
    grid-template-columns: 1fr;
  }
  .bar-row strong {
    text-align: left;
  }
}
@media (max-width: 520px) {
  .report-shell {
    padding-inline: 14px;
  }
  .hero-grid, .post-grid {
    grid-template-columns: 1fr;
  }
  .metric-bar {
    grid-template-columns: 70px 1fr;
  }
  .metric-bar b {
    grid-column: 2;
    text-align: left;
  }
}
`;
