// ═══════════════════════════════════════════════════════════════
// School Athlete + Team Performance Report
// Generic version of UCLABrandDeals for any school using
// content-posts.json. Matches the UCLA report design.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { DrawerPanel, TabTransition } from './playfly/PlayflyUI';
import type { SchoolConfig } from '../config/schoolConfigs';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'teams', label: 'Teams' },
  { id: 'content', label: 'Content' },
  { id: 'sponsored', label: 'Sponsored' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'ip', label: 'IP' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Raw post shape from content-posts.json ─────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawPost = any;

// ─── Derived types ───────────────────────────────────────────
interface DerivedAthlete {
  id: string;
  name: string;
  sport: string;
  image?: string;
  position?: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  avgEngagementRate: number; // decimal 0-1
}

interface DerivedSport {
  sport: string;
  athleteCount: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number; // decimal 0-1
}

interface IPBucket {
  contents: number;
  likes: number;
  comments: number;
  engagementRate: number; // decimal 0-1
  emv: number;
}

interface IPComparison {
  label: string;
  yes: IPBucket;
  no: IPBucket;
  avgLift: number; // percentage points
}

// ─── Formatters ──────────────────────────────────────────────
const fmtN = (v?: number | null) => {
  if (v == null || isNaN(v)) return 'N/A';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString('en-US');
};
const fmtPct = (v?: number | null, d = 1) => {
  if (v == null || isNaN(v)) return 'N/A';
  return `${v.toFixed(d)}%`;
};
const fmtCur = (v?: number | null) => {
  if (v == null || isNaN(v)) return 'N/A';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};
const fmtDate = (v?: string) => {
  if (!v) return 'N/A';
  const d = new Date(v);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtSport = (s?: string) => {
  if (!s) return 'N/A';
  // First replace underscores and title case, then fix Men's/Women's
  return s.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bMens\b/g, "Men's")
    .replace(/\bWomens\b/g, "Women's");
};
const emv = (likes: number, comments: number) => likes * 0.5 + comments * 1.5;

const headerStyle = { fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' as const };

// ─── Data Derivation ─────────────────────────────────────────
function derivePosts(raw: RawPost[]) {
  const athleteMap = new Map<string, DerivedAthlete & { engSum: number; engCount: number }>();
  const sponsored: RawPost[] = [];

  for (const p of raw) {
    const aid = p.athlete?._id || 'unknown';
    if (!athleteMap.has(aid)) {
      athleteMap.set(aid, {
        id: aid,
        name: p.athlete?.name || 'Unknown',
        sport: p.athlete?.sport || 'Unknown',
        image: p.athlete?.image,
        position: p.athlete?.position,
        totalPosts: 0, totalLikes: 0, totalComments: 0, followers: 0,
        avgEngagementRate: 0, engSum: 0, engCount: 0,
      });
    }
    const a = athleteMap.get(aid)!;
    a.totalPosts++;
    a.totalLikes += p.metrics?.likes || 0;
    a.totalComments += p.metrics?.comments || 0;
    // Check both athlete.followers and metrics.followers
    const followerCount = p.athlete?.followers || p.metrics?.followers || 0;
    if (followerCount > 0) a.followers = Math.max(a.followers, followerCount);
    const er = p.metrics?.engagementRate || 0;
    if (er > 0) { a.engSum += er; a.engCount++; }

    if (p.sponsorPartner) sponsored.push(p);
  }

  const athletes: DerivedAthlete[] = [];
  athleteMap.forEach(a => {
    // engagementRate in JSON is 0-100 scale; convert to 0-1 for display compat with UCLABrandDeals
    a.avgEngagementRate = a.engCount > 0 ? (a.engSum / a.engCount) / 100 : 0;
    athletes.push(a);
  });
  athletes.sort((a, b) => b.totalLikes - a.totalLikes);

  return { athletes, sponsored };
}

function deriveSports(athletes: DerivedAthlete[]): DerivedSport[] {
  const map = new Map<string, { likes: number; posts: number; comments: number; engSum: number; count: number }>();
  for (const a of athletes) {
    if (!map.has(a.sport)) map.set(a.sport, { likes: 0, posts: 0, comments: 0, engSum: 0, count: 0 });
    const s = map.get(a.sport)!;
    s.likes += a.totalLikes; s.posts += a.totalPosts;
    s.comments += a.totalComments; s.engSum += a.avgEngagementRate; s.count++;
  }
  const out: DerivedSport[] = [];
  map.forEach((v, sport) => out.push({
    sport, athleteCount: v.count, totalPosts: v.posts,
    totalLikes: v.likes, totalComments: v.comments,
    avgEngagementRate: v.count > 0 ? v.engSum / v.count : 0,
  }));
  return out.sort((a, b) => b.totalLikes - a.totalLikes);
}

function computeIPBucket(posts: RawPost[]): IPBucket {
  const n = posts.length;
  if (!n) return { contents: 0, likes: 0, comments: 0, engagementRate: 0, emv: 0 };
  const totalLikes = posts.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.metrics?.comments || 0), 0);
  const erVals = posts.map(p => (p.metrics?.engagementRate || 0) / 100).filter(v => v > 0);
  const avgER = erVals.length ? erVals.reduce((s, v) => s + v, 0) / erVals.length : 0;
  return { contents: n, likes: totalLikes / n, comments: totalComments / n, engagementRate: avgER, emv: emv(totalLikes, totalComments) };
}

function deriveIPComparisons(raw: RawPost[]): IPComparison[] {
  const signalFields: { label: string; field: keyof RawPost }[] = [
    { label: 'Collaboration', field: 'isCollaboration' },
    { label: 'Logo', field: 'hasOrganizationLogo' },
    { label: 'Caption', field: 'hasOrganizationInCaption' },
  ];
  return signalFields.map(({ label, field }) => {
    const withIP = raw.filter(p => p[field]);
    const withoutIP = raw.filter(p => !p[field]);
    const yBucket = computeIPBucket(withIP);
    const nBucket = computeIPBucket(withoutIP);
    const lift = nBucket.engagementRate > 0
      ? ((yBucket.engagementRate - nBucket.engagementRate) / nBucket.engagementRate) * 100
      : 0;
    return { label, yes: yBucket, no: nBucket, avgLift: parseFloat(lift.toFixed(1)) };
  });
}

// ─── Glass Panel ─────────────────────────────────────────────
function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E7F0] bg-white shadow-[0_16px_32px_rgba(15,28,46,0.08)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
interface SchoolAthleteReportProps {
  config: SchoolConfig;
  onBack?: () => void;
}

export function SchoolAthleteReport({ config, onBack }: SchoolAthleteReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [rawPosts, setRawPosts] = useState<RawPost[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<DerivedAthlete | null>(null);

  const primaryColor = config.colors.primary;
  const secondaryColor = config.colors.secondary;

  useEffect(() => {
    fetch(config.dataFile)
      .then(r => r.ok ? r.json() : [])
      .then((data: RawPost[]) => { setRawPosts(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [config.dataFile]);

  const { athletes, sponsored } = useMemo(() => derivePosts(rawPosts), [rawPosts]);
  const sports = useMemo(() => deriveSports(athletes), [athletes]);
  const ipComparisons = useMemo(() => deriveIPComparisons(rawPosts), [rawPosts]);

  const totalLikes = useMemo(() => rawPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0), [rawPosts]);
  const totalComments = useMemo(() => rawPosts.reduce((s, p) => s + (p.metrics?.comments || 0), 0), [rawPosts]);
  const totalEmv = emv(totalLikes, totalComments);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="text-gray-700 text-lg">Loading {config.shortName} Report…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1E2A3B]" style={{ background: 'radial-gradient(circle at top left, rgba(39,116,174,0.08), transparent 45%), #F7F9FC' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#E1E7F0] bg-white/90">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#4B5B73] hover:text-[#1E2A3B]">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div className="flex items-center gap-3">
              <img src={config.logoUrl} alt={config.shortName} className="w-9 h-9 object-contain" />
              <div>
                <div className="text-lg font-semibold text-[#0F1D2E]">{config.shortName} Athlete + Team Performance Report</div>
                <div className="text-xs text-[#5B6B82]">Athlete + team content performance and audience scale</div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeTab === tab.id
                    ? 'border-opacity-40 text-white'
                    : 'bg-white border-[#E1E7F0] text-[#1E2A3B] hover:border-opacity-30'
                }`}
                style={activeTab === tab.id ? { backgroundColor: primaryColor + '20', borderColor: primaryColor + '66', color: primaryColor } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <TabTransition tabKey={activeTab}>
          {activeTab === 'overview' && (
            <OverviewTab
              shortName={config.shortName}
              primaryColor={primaryColor}
              totalLikes={totalLikes}
              totalPosts={rawPosts.length}
              totalEmv={totalEmv}
              athletes={athletes}
              sports={sports}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'athletes' && (
            <AthletesTab
              athletes={athletes}
              primaryColor={primaryColor}
              onSelectAthlete={setSelectedAthlete}
            />
          )}
          {activeTab === 'teams' && (
            <TeamsTab sports={sports} primaryColor={primaryColor} />
          )}
          {activeTab === 'content' && (
            <ContentTab posts={rawPosts} primaryColor={primaryColor} shortName={config.shortName} />
          )}
          {activeTab === 'sponsored' && (
            <SponsoredTab posts={sponsored} primaryColor={primaryColor} shortName={config.shortName} />
          )}
          {activeTab === 'benchmarks' && (
            <BenchmarksTab
              config={config}
              athletes={athletes}
              sponsored={sponsored}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          )}
          {activeTab === 'ip' && (
            <IPTab comparisons={ipComparisons} primaryColor={primaryColor} />
          )}
        </TabTransition>
      </main>

      <DrawerPanel
        open={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        title={selectedAthlete?.name}
        side="right"
      >
        {selectedAthlete && <AthleteDrawer athlete={selectedAthlete} />}
      </DrawerPanel>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ shortName, primaryColor, totalLikes, totalPosts, totalEmv, athletes, sports, onNavigate }: {
  shortName: string;
  primaryColor: string;
  totalLikes: number;
  totalPosts: number;
  totalEmv: number;
  athletes: DerivedAthlete[];
  sports: DerivedSport[];
  onNavigate: (tab: TabId) => void;
}) {
  const topByLikes = athletes[0];
  const topSportByFollowers = sports[0];
  const totalLikesAll = athletes.reduce((s, a) => s + a.totalLikes, 0);
  const top10 = athletes.slice(0, 10);
  const top10Share = totalLikesAll > 0 ? (top10.reduce((s, a) => s + a.totalLikes, 0) / totalLikesAll) * 100 : null;
  const avgAthleteEngagement = athletes.length
    ? (athletes.reduce((s, a) => s + a.avgEngagementRate, 0) / athletes.length) * 100
    : null;
  const topSportsByLikes = sports.slice(0, 3);
  const topSportsByEng = [...sports].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 3);

  return (
    <div className="space-y-10">
      <GlassPanel className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: primaryColor }}>{shortName.toUpperCase()} SOCIAL PERFORMANCE</p>
            <div className="h-0.5 w-12 mt-2" style={{ backgroundColor: primaryColor }} />
            <p className="text-4xl md:text-5xl font-bold mt-4 text-[#0F1D2E]">
              {fmtN(totalLikes)} total likes generated across {fmtN(totalPosts)} athlete posts
            </p>
            <p className="text-[#5B6B82] mt-3 text-base">Athlete + team content performance and audience scale.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Athlete posts analyzed</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(totalPosts)}</p>
            </GlassPanel>
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Total likes</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(totalLikes)}</p>
            </GlassPanel>
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Estimated EMV</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtCur(totalEmv)}</p>
            </GlassPanel>
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sports active</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{sports.length}</p>
            </GlassPanel>
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Avg Athlete Engagement Rate</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{avgAthleteEngagement != null ? fmtPct(avgAthleteEngagement) : 'N/A'}</p>
            </GlassPanel>
            <GlassPanel className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Athletes tracked</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(athletes.length)}</p>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      {/* Spotlight row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete by Likes</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-[#F0F4FA] overflow-hidden border border-[#E1E7F0]">
              {topByLikes?.image && <img src={topByLikes.image} alt={topByLikes.name} className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#0F1D2E]">{topByLikes?.name || 'N/A'}</p>
              <p className="text-xs text-[#5B6B82]">{fmtSport(topByLikes?.sport)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-[#5B6B82]">
            <div>Likes: {fmtN(topByLikes?.totalLikes)}</div>
            <div>Posts: {fmtN(topByLikes?.totalPosts)}</div>
            <div>Avg ER: {fmtPct((topByLikes?.avgEngagementRate || 0) * 100)}</div>
          </div>
          <button className="text-sm mt-3" style={{ color: primaryColor }} onClick={() => onNavigate('athletes')}>View →</button>
        </GlassPanel>

        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Sport by Likes</p>
          <p className="text-lg font-semibold mt-2 text-[#0F1D2E]">{fmtSport(topSportByFollowers?.sport) || 'N/A'}</p>
          <p className="text-sm text-[#5B6B82]">{fmtN(topSportByFollowers?.totalLikes)} total likes</p>
          <button className="text-sm mt-3" style={{ color: primaryColor }} onClick={() => onNavigate('teams')}>View →</button>
        </GlassPanel>

        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete Post</p>
          <p className="text-lg font-semibold mt-2 text-[#0F1D2E]">{topByLikes?.name || 'N/A'}</p>
          <p className="text-sm text-[#5B6B82]">{fmtN(topByLikes?.totalLikes)} likes</p>
          <button className="text-sm mt-3" style={{ color: primaryColor }} onClick={() => onNavigate('content')}>View →</button>
        </GlassPanel>
      </div>

      {/* At a glance */}
      <GlassPanel className="p-6">
        <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E] mb-4">At a glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top 10 share of likes</p>
            <p className="text-xl font-bold mt-2 text-[#0F1D2E]">{top10Share != null ? fmtPct(top10Share) : 'N/A'}</p>
            <p className="text-xs text-[#7A8AA3] mt-2">Share of total athlete likes from top 10 athletes.</p>
          </div>
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Avg Athlete Engagement Rate</p>
            <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{avgAthleteEngagement != null ? fmtPct(avgAthleteEngagement) : 'N/A'}</p>
            <p className="text-sm text-[#5B6B82]">Across {fmtN(athletes.length)} athletes</p>
          </div>
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sports leaders</p>
            <div className="text-sm text-[#5B6B82] mt-2">
              <div>Likes: {topSportsByLikes.map(s => fmtSport(s.sport)).join(', ')}</div>
              <div>Engagement: {topSportsByEng.map(s => fmtSport(s.sport)).join(', ')}</div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Athletes Tab ────────────────────────────────────────────
function AthletesTab({ athletes, primaryColor, onSelectAthlete }: {
  athletes: DerivedAthlete[];
  primaryColor: string;
  onSelectAthlete: (a: DerivedAthlete) => void;
}) {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'posts' | 'comments' | 'followers'>('likes');

  const sports = ['All', ...new Set(athletes.map(a => a.sport))];

  const filtered = useMemo(() => athletes.filter(a => {
    if (sport !== 'All' && a.sport !== sport) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [athletes, sport, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagementRate - a.avgEngagementRate;
    if (sortKey === 'posts') return b.totalPosts - a.totalPosts;
    if (sortKey === 'followers') return b.followers - a.followers;
    return b.totalComments - a.totalComments;
  }), [filtered, sortKey]);

  const topByLikes = sorted.slice(0, 10);
  const topByEng = [...filtered].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 10);

  const chip = (key: typeof sortKey, label: string) => (
    <button key={key} onClick={() => setSortKey(key)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sortKey === key ? '' : 'bg-white border-[#E1E7F0] text-[#1E2A3B]'}`}
      style={sortKey === key ? { backgroundColor: primaryColor + '1A', borderColor: primaryColor + '66', color: primaryColor } : {}}>
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <GlassPanel className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA7BC]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athlete"
              className="w-full bg-white border border-[#E1E7F0] rounded-full pl-9 pr-4 py-2 text-sm text-[#1E2A3B]" />
          </div>
          <select value={sport} onChange={e => setSport(e.target.value)}
            className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B]">
            {sports.map(s => <option key={s} value={s}>{fmtSport(s)}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-wrap">
            {chip('likes', 'Likes')}{chip('followers', 'Followers')}{chip('engagement', 'Engagement Rate')}{chip('posts', 'Posts')}{chip('comments', 'Comments')}
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel className="p-5">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">Top 10 Athletes by Likes</h3>
          <div className="flex gap-3 overflow-x-auto">
            {topByLikes.map(a => (
              <div key={a.id} className="min-w-[200px] rounded-xl border border-[#E1E7F0] bg-white p-4">
                <div className="text-sm font-semibold text-[#0F1D2E]">{a.name}</div>
                <div className="text-xs text-[#5B6B82]">{fmtSport(a.sport)}</div>
                <div className="text-lg font-bold mt-2 text-[#0F1D2E]">{fmtN(a.totalLikes)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="p-5">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">Top 10 Athletes by Engagement Rate</h3>
          <div className="flex gap-3 overflow-x-auto">
            {topByEng.map(a => (
              <div key={a.id} className="min-w-[200px] rounded-xl border border-[#E1E7F0] bg-white p-4">
                <div className="text-sm font-semibold text-[#0F1D2E]">{a.name}</div>
                <div className="text-xs text-[#5B6B82]">{fmtSport(a.sport)}</div>
                <div className="text-lg font-bold mt-2 text-[#0F1D2E]">{fmtPct(a.avgEngagementRate * 100)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F3F6FB] sticky top-0">
              <tr className="text-xs uppercase tracking-[0.2em]">
                <th className="text-left px-4 py-3 text-[#5B6B82]">Athlete</th>
                <th className="text-left px-4 py-3 text-[#5B6B82]">Sport</th>
                <th onClick={() => setSortKey('posts')}
                    className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                    style={{ color: sortKey === 'posts' ? primaryColor : '#5B6B82' }}>
                  <div className="flex items-center justify-end gap-1">
                    Posts
                    {sortKey === 'posts' && <span style={{ color: primaryColor }}>↓</span>}
                  </div>
                </th>
                <th onClick={() => setSortKey('followers')}
                    className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                    style={{ color: sortKey === 'followers' ? primaryColor : '#5B6B82' }}>
                  <div className="flex items-center justify-end gap-1">
                    Followers
                    {sortKey === 'followers' && <span style={{ color: primaryColor }}>↓</span>}
                  </div>
                </th>
                <th onClick={() => setSortKey('likes')}
                    className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                    style={{ color: sortKey === 'likes' ? primaryColor : '#5B6B82' }}>
                  <div className="flex items-center justify-end gap-1">
                    Likes
                    {sortKey === 'likes' && <span style={{ color: primaryColor }}>↓</span>}
                  </div>
                </th>
                <th onClick={() => setSortKey('comments')}
                    className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                    style={{ color: sortKey === 'comments' ? primaryColor : '#5B6B82' }}>
                  <div className="flex items-center justify-end gap-1">
                    Comments
                    {sortKey === 'comments' && <span style={{ color: primaryColor }}>↓</span>}
                  </div>
                </th>
                <th onClick={() => setSortKey('engagement')}
                    className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                    style={{ color: sortKey === 'engagement' ? primaryColor : '#5B6B82' }}>
                  <div className="flex items-center justify-end gap-1">
                    Avg ER
                    {sortKey === 'engagement' && <span style={{ color: primaryColor }}>↓</span>}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 200).map(a => (
                <tr key={a.id} onClick={() => onSelectAthlete(a)}
                  className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB] cursor-pointer">
                  <td className="px-4 py-3 text-sm font-semibold text-[#0F1D2E]">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-[#5B6B82]">{fmtSport(a.sport)}</td>
                  <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalPosts)}</td>
                  <td className="px-4 py-3 text-sm text-right">{fmtN(a.followers)}</td>
                  <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalLikes)}</td>
                  <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalComments)}</td>
                  <td className="px-4 py-3 text-sm text-right">{fmtPct(a.avgEngagementRate * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Teams Tab (sport-level breakdown) ───────────────────────
function TeamsTab({ sports, primaryColor }: { sports: DerivedSport[]; primaryColor: string }) {
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'posts' | 'athletes'>('likes');
  const sorted = useMemo(() => [...sports].sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagementRate - a.avgEngagementRate;
    if (sortKey === 'posts') return b.totalPosts - a.totalPosts;
    return b.athleteCount - a.athleteCount;
  }), [sports, sortKey]);

  const chip = (key: typeof sortKey, label: string) => (
    <button key={key} onClick={() => setSortKey(key)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sortKey === key ? '' : 'bg-white border-[#E1E7F0] text-[#1E2A3B]'}`}
      style={sortKey === key ? { backgroundColor: primaryColor + '1A', borderColor: primaryColor + '66', color: primaryColor } : {}}>
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Sport Breakdown</h2>
            <p className="text-sm text-[#5B6B82]">{sports.length} sports active • Based on athlete post data</p>
          </div>
          <div className="flex items-center gap-2">
            {chip('likes', 'Total Likes')}{chip('engagement', 'Engagement Rate')}
            {chip('posts', 'Posts')}{chip('athletes', 'Athletes')}
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.slice(0, 6).map(s => (
          <GlassPanel key={s.sport} className="p-5">
            <div className="text-sm font-semibold text-[#0F1D2E]">{fmtSport(s.sport)}</div>
            <div className="mt-3 text-sm text-[#5B6B82]">Total likes: {fmtN(s.totalLikes)}</div>
            <div className="text-xs text-[#7A8AA3]">{s.athleteCount} athletes • {fmtN(s.totalPosts)} posts</div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6">
        <div style={headerStyle} className="text-sm font-bold uppercase tracking-tight mb-3 text-[#0F1D2E]">Sport Leaderboard</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">Sport</th>
                <th className="text-right py-2 px-3">Athletes</th>
                <th className="text-right py-2 px-3">Posts</th>
                <th className="text-right py-2 px-3">Likes</th>
                <th className="text-right py-2 px-3">Avg ER</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => (
                <tr key={s.sport} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                  <td className="py-3 px-3 text-sm font-semibold text-[#0F1D2E]">{fmtSport(s.sport)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.athleteCount)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalPosts)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalLikes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtPct(s.avgEngagementRate * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Content Tab ─────────────────────────────────────────────
function ContentTab({ posts, primaryColor, shortName }: { posts: RawPost[]; primaryColor: string; shortName: string }) {
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'comments'>('likes');
  const [sponsoredOnly, setSponsoredOnly] = useState(false);

  const normalizedPosts = useMemo(() => posts.map(p => ({
    id: p._id,
    title: p.athlete?.name || 'Unknown',
    sport: p.athlete?.sport || 'Unknown',
    caption: p.caption,
    likes: p.metrics?.likes || 0,
    comments: p.metrics?.comments || 0,
    engagementRate: (p.metrics?.engagementRate || 0) / 100,
    url: p.url,
    permalink: p.permalink,
    publishedAt: typeof p.publishedAt === 'string' ? p.publishedAt : p.publishedAt?.$date,
    isSponsored: !!p.sponsorPartner,
  })), [posts]);

  const filtered = useMemo(() => {
    let list = normalizedPosts;
    if (sponsoredOnly) list = list.filter(p => p.isSponsored);
    return list;
  }, [normalizedPosts, sponsoredOnly]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortKey === 'likes') return b.likes - a.likes;
    if (sortKey === 'comments') return b.comments - a.comments;
    return b.engagementRate - a.engagementRate;
  }), [filtered, sortKey]);

  const top3 = sorted.slice(0, 3);
  const top10 = sorted.slice(0, 10);

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6 bg-[#F3F6FB]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">{shortName}'s Highest Performing Content</h2>
            <p className="text-sm text-[#5B6B82]">Top posts across {shortName} athlete accounts</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-[#5B6B82]">Sponsored only</span>
              <button role="switch" aria-checked={sponsoredOnly} onClick={() => setSponsoredOnly(!sponsoredOnly)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                style={{ backgroundColor: sponsoredOnly ? primaryColor : '#D1D5DB' }}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${sponsoredOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </button>
            </label>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
              className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B] h-9">
              <option value="likes">Likes</option>
              <option value="engagement">Engagement Rate</option>
              <option value="comments">Comments</option>
            </select>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {top3.map((post, idx) => (
          <GlassPanel key={`${post.id}-${idx}`} className="p-5">
            <div className="w-full h-48 rounded-xl bg-[#F0F4FA] overflow-hidden">
              {post.url ? <img src={post.url} alt={post.title} className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">No image</div>}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#7A8AA3]">
              <span className="px-2 py-0.5 rounded-full bg-[#F3F6FB] border border-[#E1E7F0]">{post.title}</span>
              <span>{fmtDate(post.publishedAt)}</span>
            </div>
            <p className="text-sm font-semibold text-[#0F1D2E] mt-2">{post.caption?.slice(0, 90) || 'No caption'}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
              <div>Likes: {fmtN(post.likes)}</div>
              <div>Comments: {fmtN(post.comments)}</div>
              <div>ER: {fmtPct(post.engagementRate * 100)}</div>
            </div>
            {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" className="text-xs mt-3 block" style={{ color: primaryColor }}>Open post</a>}
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight text-[#0F1D2E]">
          Top 10 Posts by {sortKey === 'likes' ? 'Likes' : sortKey === 'comments' ? 'Comments' : 'Engagement Rate'}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">#</th>
                <th className="text-left py-2 px-3">Athlete</th>
                <th className="text-left py-2 px-3">Sport</th>
                <th className="text-right py-2 px-3">Likes</th>
                <th className="text-right py-2 px-3">ER</th>
                <th className="text-right py-2 px-3">Date</th>
                <th className="text-right py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {top10.map((post, idx) => (
                <tr key={`${post.id}-${idx}`} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                  <td className="py-3 px-3 text-sm text-[#5B6B82]">#{idx + 1}</td>
                  <td className="py-3 px-3 text-sm text-[#0F1D2E]">{post.title}</td>
                  <td className="py-3 px-3 text-sm text-[#5B6B82]">{fmtSport(post.sport)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(post.likes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtPct(post.engagementRate * 100)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtDate(post.publishedAt)}</td>
                  <td className="py-3 px-3 text-right">
                    {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{ color: primaryColor }}><ExternalLink className="w-4 h-4" /></a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Sponsored Tab ───────────────────────────────────────────
function SponsoredTab({ posts, shortName }: { posts: RawPost[]; primaryColor: string; shortName: string }) {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'posts' | 'likes' | 'engagement'>('posts');

  const sports = ['All', ...new Set(posts.map(p => p.athlete?.sport).filter(Boolean) as string[])];

  const filtered = posts.filter(p => {
    if (sportFilter !== 'All' && p.athlete?.sport !== sportFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.sponsorPartner || '').toLowerCase().includes(q) || (p.athlete?.name || '').toLowerCase().includes(q);
  });

  const totalLikes = filtered.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
  const totalComments = filtered.reduce((s, p) => s + (p.metrics?.comments || 0), 0);
  const uniqueBrands = new Set(filtered.map(p => (p.sponsorPartner || '').toLowerCase().trim()).filter(Boolean));
  const uniqueAthletes = new Set(filtered.map(p => p.athlete?._id).filter(Boolean));
  const avgLikes = filtered.length ? totalLikes / filtered.length : null;
  const avgComments = filtered.length ? totalComments / filtered.length : null;

  const brandMap = new Map<string, { posts: RawPost[]; athletes: Set<string>; sports: Set<string>; totalLikes: number; totalComments: number; engSum: number }>();
  filtered.forEach(p => {
    const key = (p.sponsorPartner || '').trim();
    if (!key) return;
    if (!brandMap.has(key)) brandMap.set(key, { posts: [], athletes: new Set(), sports: new Set(), totalLikes: 0, totalComments: 0, engSum: 0 });
    const entry = brandMap.get(key)!;
    entry.posts.push(p);
    if (p.athlete?._id) entry.athletes.add(p.athlete._id);
    if (p.athlete?.sport) entry.sports.add(p.athlete.sport);
    entry.totalLikes += p.metrics?.likes || 0;
    entry.totalComments += p.metrics?.comments || 0;
    entry.engSum += (p.metrics?.engagementRate || 0) / 100;
  });

  const brandCards = [...brandMap.entries()].map(([brand, entry]) => ({
    brand,
    postCount: entry.posts.length,
    athleteCount: entry.athletes.size,
    sportCount: entry.sports.size,
    totalLikes: entry.totalLikes,
    totalComments: entry.totalComments,
    avgEngagement: entry.posts.length ? entry.engSum / entry.posts.length : 0,
  })).sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagement - a.avgEngagement;
    return b.postCount - a.postCount;
  });

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Sponsored Posts</h2>
            <p className="text-sm text-[#5B6B82]">Sponsored posts across {shortName} athletes</p>
          </div>
          <div className="text-sm text-[#5B6B82]">{uniqueBrands.size} total brands</div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <GlassPanel className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sponsored posts</p><p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(filtered.length)}</p></GlassPanel>
        <GlassPanel className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Unique brands</p><p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(uniqueBrands.size)}</p></GlassPanel>
        <GlassPanel className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Total likes</p><p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(totalLikes)}</p></GlassPanel>
        <GlassPanel className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Athletes with deals</p><p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{fmtN(uniqueAthletes.size)}</p></GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brand or athlete..."
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sport</label>
            <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              {sports.map(s => <option key={s} value={s}>{fmtSport(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sort by</label>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              <option value="posts">Posts</option>
              <option value="likes">Total Likes</option>
              <option value="engagement">Engagement Rate</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-[#5B6B82]">
          <div>Avg likes per sponsored post: {avgLikes != null ? fmtN(avgLikes) : 'N/A'}</div>
          <div>Avg comments per sponsored post: {avgComments != null ? fmtN(avgComments) : 'N/A'}</div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {brandCards.slice(0, 30).map(brand => (
          <GlassPanel key={brand.brand} className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F3F6FB] border border-[#E1E7F0] flex items-center justify-center overflow-hidden">
                <img src={`https://logo.dev/${brand.brand.replace(/^@/, '')}.com`} alt={brand.brand}
                  className="w-full h-full object-contain"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-sm font-semibold text-[#1E2A3B]">{brand.brand.replace(/^@/, '').slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#0F1D2E]">{brand.brand}</div>
                <div className="text-xs text-[#5B6B82]">{brand.postCount} posts • {brand.athleteCount} athletes • {brand.sportCount} sports</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
              <div>Likes: {fmtN(brand.totalLikes)}</div>
              <div>Comments: {fmtN(brand.totalComments)}</div>
              <div>Avg ER: {fmtPct(brand.avgEngagement * 100)}</div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

// ─── Benchmarks Tab ──────────────────────────────────────────
function BenchmarksTab({ config, athletes, primaryColor }: {
  config: SchoolConfig;
  athletes: DerivedAthlete[];
  sponsored: RawPost[];
  primaryColor: string;
  secondaryColor: string;
}) {
  const { benchmark, peerSchools, shortName, conference } = config;

  const totalLikes = athletes.reduce((s, a) => s + a.totalLikes, 0);
  const totalPosts = athletes.reduce((s, a) => s + a.totalPosts, 0);
  const avgEngagement = athletes.length ? athletes.reduce((s, a) => s + a.avgEngagementRate, 0) / athletes.length * 100 : 0;

  // Build peer list with this school
  const allSchools = [...peerSchools, benchmark];
  const confMedian = (key: keyof typeof benchmark) => {
    const vals = peerSchools.map(p => p[key] as number).sort((a, b) => a - b);
    return vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  };
  const medianDeals = confMedian('totalDeals');
  const medianEMV = confMedian('totalEMV');
  const medianEng = confMedian('avgEngagement');
  const medianAthletes = confMedian('athleteCount');
  const medianBrands = confMedian('brandCount');

  // Compute rank for each metric based on benchmark stats
  const rankOf = (field: keyof typeof benchmark, higher = true) => {
    const sorted = [...allSchools].sort((a, b) => higher
      ? (b[field] as number) - (a[field] as number)
      : (a[field] as number) - (b[field] as number));
    return { rank: sorted.findIndex(s => s.id === benchmark.id) + 1, of: allSchools.length };
  };

  const metricRows = [
    { label: 'Sponsored Deals', thisVal: benchmark.totalDeals, medVal: medianDeals, format: fmtN, rankKey: 'totalDeals' as const },
    { label: 'Est. Total EMV', thisVal: benchmark.totalEMV, medVal: medianEMV, format: fmtCur, rankKey: 'totalEMV' as const },
    { label: 'Avg Engagement', thisVal: benchmark.avgEngagement, medVal: medianEng, format: (v: number) => fmtPct(v), rankKey: 'avgEngagement' as const },
    { label: 'Athletes Active', thisVal: benchmark.athleteCount, medVal: medianAthletes, format: fmtN, rankKey: 'athleteCount' as const },
    { label: 'Unique Brands', thisVal: benchmark.brandCount, medVal: medianBrands, format: fmtN, rankKey: 'brandCount' as const },
  ];

  const highlightRanks = [
    { label: 'Sponsored Deals', key: 'totalDeals' as const },
    { label: 'Total EMV', key: 'totalEMV' as const },
    { label: 'Avg Engagement', key: 'avgEngagement' as const },
    { label: 'Brands', key: 'brandCount' as const },
  ];

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Benchmarks</h2>
            <p className="text-sm text-[#5B6B82]">{shortName} vs {conference} conference peers ({peerSchools.length} schools)</p>
          </div>
          <div className="text-sm text-[#5B6B82]">
            Live stats: {fmtN(totalPosts)} posts • {fmtN(totalLikes)} likes • {fmtPct(avgEngagement)} avg ER
          </div>
        </div>
      </GlassPanel>

      {/* Rank highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlightRanks.map(item => {
          const r = rankOf(item.key);
          return (
            <GlassPanel key={item.key} className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">#{r.rank}</p>
              <p className="text-xs text-[#7A8AA3]">of {r.of} schools</p>
            </GlassPanel>
          );
        })}
      </div>

      {/* Comparison table */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          {shortName} vs {conference} Median
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">Metric</th>
                <th className="text-right py-2 px-3">{shortName}</th>
                <th className="text-right py-2 px-3">{conference} Median</th>
                <th className="text-right py-2 px-3">Diff</th>
                <th className="text-right py-2 px-3">Rank</th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map(row => {
                const diff = row.medVal !== 0 ? ((row.thisVal - row.medVal) / Math.abs(row.medVal)) * 100 : 0;
                const r = rankOf(row.rankKey);
                return (
                  <tr key={row.label} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                    <td className="py-3 px-3 text-sm font-medium text-[#0F1D2E]">{row.label}</td>
                    <td className="py-3 px-3 text-sm text-right font-semibold text-[#0F1D2E]">{row.format(row.thisVal)}</td>
                    <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">{row.format(row.medVal)}</td>
                    <td className={`py-3 px-3 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">#{r.rank}/{r.of}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Visual bars */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          Key Metrics vs {conference}
        </h3>
        <div className="space-y-5">
          {[
            { label: 'Sponsored Deals', thisVal: benchmark.totalDeals, medVal: medianDeals },
            { label: 'Total EMV', thisVal: benchmark.totalEMV, medVal: medianEMV },
            { label: 'Avg Engagement', thisVal: benchmark.avgEngagement, medVal: medianEng },
          ].map(item => {
            const max = Math.max(item.thisVal, item.medVal) || 1;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-[#0F1D2E]">{item.label}</span>
                  <span className="text-xs text-[#7A8AA3]">{shortName} {fmtN(item.thisVal)} vs Median {fmtN(item.medVal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-14 truncate" style={{ color: primaryColor }}>{shortName}</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(item.thisVal / max) * 100}%`, backgroundColor: primaryColor }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-14 text-[#9AA7BC]">Median</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8D5E3] rounded-full" style={{ width: `${(item.medVal / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Peer leaderboard */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">{conference} Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">School</th>
                <th className="text-right py-2 px-3">Deals</th>
                <th className="text-right py-2 px-3">EMV</th>
                <th className="text-right py-2 px-3">Avg Eng.</th>
                <th className="text-right py-2 px-3">Athletes</th>
                <th className="text-right py-2 px-3">Brands</th>
              </tr>
            </thead>
            <tbody>
              {[...allSchools].sort((a, b) => b.totalDeals - a.totalDeals).map(s => (
                <tr key={s.id}
                  className={`border-t border-[#E1E7F0] ${s.id === benchmark.id ? 'font-semibold' : 'hover:bg-[#F3F6FB]'}`}
                  style={s.id === benchmark.id ? { backgroundColor: primaryColor + '0D' } : {}}>
                  <td className="py-3 px-3 text-sm text-[#0F1D2E]">
                    {s.id === benchmark.id ? '→ ' : ''}{s.shortName}
                  </td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalDeals)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtCur(s.totalEMV)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtPct(s.avgEngagement)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.athleteCount)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.brandCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── IP Tab ──────────────────────────────────────────────────
function IPTab({ comparisons, primaryColor }: { comparisons: IPComparison[]; primaryColor: string }) {
  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-2">
          <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">IP Impact (Supporting)</h2>
          <p className="text-sm text-[#5B6B82]">Engagement lift when Playfly IP signals are present.</p>
          <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full w-fit border"
            style={{ color: primaryColor, backgroundColor: primaryColor + '1A', borderColor: primaryColor + '4D' }}>
            Instagram only
          </span>
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisons.map(item => {
            const positive = item.avgLift > 0;
            const neutral = item.avgLift === 0;
            const color = neutral ? '#6B7280' : positive ? primaryColor : '#C2413B';
            return (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E1E7F0] bg-white px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</div>
                  <div className="text-2xl font-bold mt-1" style={{ color }}>{fmtPct(item.avgLift)}</div>
                </div>
                {neutral ? <span className="text-[#6B7280] text-xs">—</span>
                  : positive ? <ArrowUpRight className="w-5 h-5" color={color} />
                  : <ArrowDownRight className="w-5 h-5" color={color} />}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-sm font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">IP Comparison</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {comparisons.map(row => (
            <div key={row.label} className="rounded-xl border border-[#E1E7F0] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0F1D2E]">{row.label}</div>
                <div className={`text-sm font-bold ${row.avgLift >= 0 ? '' : 'text-[#C2413B]'}`} style={row.avgLift >= 0 ? { color: primaryColor } : {}}>
                  {row.avgLift >= 0 ? '+' : ''}{row.avgLift.toFixed(1)}% ER Lift
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-[#5B6B82]">
                <div>
                  <div className="text-xs text-[#7A8AA3]">With</div>
                  <div>Posts: {fmtN(row.yes.contents)}</div>
                  <div>Avg ER: {fmtPct(row.yes.engagementRate * 100)}</div>
                  <div>Likes/post: {fmtN(row.yes.likes)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A8AA3]">Without</div>
                  <div>Posts: {fmtN(row.no.contents)}</div>
                  <div>Avg ER: {fmtPct(row.no.engagementRate * 100)}</div>
                  <div>Likes/post: {fmtN(row.no.likes)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Athlete Drawer ──────────────────────────────────────────
function AthleteDrawer({ athlete }: { athlete: DerivedAthlete }) {
  const likesPerPost = athlete.totalPosts ? athlete.totalLikes / athlete.totalPosts : 0;
  const commentsPerPost = athlete.totalPosts ? athlete.totalComments / athlete.totalPosts : 0;

  return (
    <div className="space-y-4 text-sm text-[#1E2A3B]">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-[#F0F4FA] overflow-hidden">
          {athlete.image
            ? <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">N/A</div>}
        </div>
        <div>
          <div className="text-base font-semibold text-[#0F1D2E]">{athlete.name}</div>
          <div className="text-xs text-[#5B6B82]">{fmtSport(athlete.sport)}{athlete.position ? ` • ${athlete.position}` : ''}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>Likes: {fmtN(athlete.totalLikes)}</div>
        <div>Comments: {fmtN(athlete.totalComments)}</div>
        <div>Avg ER: {fmtPct(athlete.avgEngagementRate * 100)}</div>
        <div>Posts: {fmtN(athlete.totalPosts)}</div>
        <div>Likes/post: {fmtN(likesPerPost)}</div>
        <div>Comments/post: {fmtN(commentsPerPost)}</div>
      </div>
    </div>
  );
}
