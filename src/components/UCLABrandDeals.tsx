import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Search, ArrowLeft, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DrawerPanel, TabTransition } from './playfly/PlayflyUI';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'teams', label: 'Teams' },
  { id: 'content', label: 'Content' },
  { id: 'sponsored', label: 'Sponsored' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'ip', label: 'IP' }
] as const;

type TabId = typeof TABS[number]['id'];

interface UCLAIPImpact {
  followers: number;
  school: { name: string };
  overall: {
    totalContents: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: number;
    emv: number;
  };
  counts: {
    hasOrganizationInCaption: number;
    isOrganizationCollaboration: number;
    hasOrganizationLogo: number;
    withIp: number;
  };
  orgInCaption: UCLAIPBucket;
  collaboration: UCLAIPBucket;
  logo: UCLAIPBucket;
}

interface UCLAIPBucket {
  yes: { contents: number; likes: number; comments: number; engagementRate: number; emv: number };
  no: { contents: number; likes: number; comments: number; engagementRate: number; emv: number };
  avgLift: number;
}

interface UCLARoster {
  school: { name: string };
  totalAthletes: number;
  sports: string[];
  athletes: UCLAAthlete[];
}

interface UCLAAthlete {
  _id: string;
  name: string;
  sport: string;
  position?: string;
  image?: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  instagramPosts: number;
  tiktokPosts: number;
  followers?: number;
}

interface UCLATeamContent {
  school: { name: string };
  totalTeamAccounts: number;
  totalFollowers: number;
  totalTeamPosts: number;
  totalContentLikes: number;
  totalContentComments: number;
  teamAccounts: UCLATeamAccount[];
  topPosts: UCLATeamPost[];
}

interface UCLATeamAccount {
  sport: string;
  profilePicture?: string;
  conference?: string;
  followers: number;
  engagementRate?: number;
  likes90d?: number;
  comments90d?: number;
  contentCount90d?: number;
  followersGrowth90d?: number;
  logoContentCount?: number;
  engagementRateLogoLift?: number;
  contentLikes?: number;
  contentComments?: number;
  contentPosts?: number;
}

interface UCLATeamPost {
  team: string;
  likes: number;
  comments: number;
  engagementRate?: number;
  caption?: string;
  url?: string;
  permalink?: string;
  publishedAt?: string;
  hasOrganizationLogo?: boolean;
  isSponsored?: boolean;
}

interface UCLASponsoredPost {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image?: string;
    sport: string;
  };
  caption: string;
  mediaType?: string;
  metrics: {
    likes: number;
    comments: number;
    engagementRate: number;
  };
  permalink: string;
  publishedAt: { $date: string } | string;
  sponsorPartner: string;
  url?: string;
  isSponsored?: boolean;
}

type UCLAAthletePost = UCLASponsoredPost;

interface BenchmarkSchool {
  school: string;
  shortName: string;
  conference: string;
  isBigTen: boolean;
  followers: number;
  totalContents: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  emv: number;
  collabLift: number;
  logoLift: number;
  captionLift: number;
  collabPosts: number;
  logoPosts: number;
  withIpCount: number;
  likesPerPost: number;
  commentsPerPost: number;
  ipPercentage: number;
  partnerCount: number;
  athleteCount?: number;
  sponsoredPosts?: number;
}

interface TeamBenchmarkSchool {
  school: string;
  shortName: string;
  conference: string;
  isBigTen: boolean;
  teamAccounts: number;
  totalFollowers: number;
  totalLikes: number;
  totalPosts: number;
  avgEngagementRate: number;
  likesPerPost: number;
}

interface TeamBenchmarksData {
  schools: TeamBenchmarkSchool[];
}

interface BenchmarkAvg {
  totalContents: number;
  totalLikes: number;
  totalComments: number;
  emv: number;
  collabLift: number;
  logoLift: number;
  collabPosts: number;
  logoPosts: number;
  withIpCount: number;
  likesPerPost: number;
  commentsPerPost: number;
  ipPercentage: number;
  partnerCount: number;
  athleteCount?: number;
  sponsoredPosts?: number;
}

interface BenchmarksData {
  schools: BenchmarkSchool[];
  bigTenAvg: BenchmarkAvg;
  allSchoolAvg: BenchmarkAvg;
  uclaRanks: Record<string, { rank: number; of: number }>;
  uclaBigTenRanks: Record<string, { rank: number; of: number }>;
}

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
};

const formatPercent = (value: number | null | undefined, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(digits)}%`;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const estimateEmv = (likes: number, comments: number) => {
  return likes * 0.5 + comments * 1.5;
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTeamName = (value?: string) => {
  if (!value) return 'N/A';
  const cleaned = value.replace(/_/g, ' ').toLowerCase();
  const words = cleaned.split(' ').filter(Boolean).map(word => {
    if (word === 'mens') return "Men's";
    if (word === 'womens') return "Women's";
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return words.join(' ');
};

const headerStyle = { fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' };

export function UCLABrandDeals({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [ipImpact, setIpImpact] = useState<UCLAIPImpact | null>(null);
  const [roster, setRoster] = useState<UCLARoster | null>(null);
  const [teamContent, setTeamContent] = useState<UCLATeamContent | null>(null);
  const [sponsoredPosts, setSponsoredPosts] = useState<UCLASponsoredPost[]>([]);
  const [athletePosts, setAthletePosts] = useState<UCLAAthletePost[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarksData | null>(null);
  const [teamBenchmarks, setTeamBenchmarks] = useState<TeamBenchmarksData | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<UCLAAthlete | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handle = () => setIsMobile(media.matches);
    handle();
    media.addEventListener('change', handle);
    return () => media.removeEventListener('change', handle);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const fetchJson = async <T,>(path: string): Promise<T | null> => {
          const res = await fetch(path);
          if (!res.ok) return null;
          return res.json();
        };

        const [ipData, rosterData, teamData, sponsoredData, athleteData, benchData, teamBenchData] = await Promise.allSettled([
          fetchJson<UCLAIPImpact>('/data/ucla-ip-impact.json'),
          fetchJson<UCLARoster>('/data/ucla-roster.json'),
          fetchJson<UCLATeamContent>('/data/ucla-team-content.json'),
          fetchJson<UCLASponsoredPost[]>('/data/ucla-sponsored-posts.json'),
          fetchJson<UCLAAthletePost[]>('/data/ucla-all-posts.json'),
          fetchJson<BenchmarksData>('/data/ucla-benchmarks.json'),
          fetchJson<TeamBenchmarksData>('/data/ucla-team-benchmarks.json'),
        ]);

        if (ipData.status === 'fulfilled' && ipData.value) setIpImpact(ipData.value);
        if (rosterData.status === 'fulfilled' && rosterData.value) setRoster(rosterData.value);
        if (teamData.status === 'fulfilled' && teamData.value) setTeamContent(teamData.value);
        if (sponsoredData.status === 'fulfilled' && Array.isArray(sponsoredData.value)) {
          setSponsoredPosts(sponsoredData.value);
        } else {
          setSponsoredPosts([]);
        }
        if (athleteData.status === 'fulfilled' && Array.isArray(athleteData.value)) {
          setAthletePosts(athleteData.value);
        } else {
          setAthletePosts([]);
        }
        if (benchData.status === 'fulfilled' && benchData.value) setBenchmarks(benchData.value);
        if (teamBenchData.status === 'fulfilled' && teamBenchData.value) setTeamBenchmarks(teamBenchData.value);
      } catch (err) {
        console.error('Failed to load UCLA data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalLikes = ipImpact?.overall.totalLikes ?? 0;
  const totalComments = ipImpact?.overall.totalComments ?? 0;
  const totalEmv = ipImpact?.overall.emv ?? estimateEmv(totalLikes, totalComments);
  const athletePostsCount = ipImpact?.overall.totalContents ?? 0;
  const athleteFollowers = (roster as (UCLARoster & { totalFollowers?: number }) | null)?.totalFollowers ?? null;
  const teamFollowers = teamContent?.totalFollowers ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="text-gray-700 text-lg">Loading UCLA Report…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1E2A3B]" style={{ background: 'radial-gradient(circle at top left, rgba(39,116,174,0.08), transparent 45%), #F7F9FC' }}>
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#E1E7F0] bg-white/90">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#4B5B73] hover:text-[#1E2A3B]">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <div className="flex items-center gap-3">
                <img
                  src="https://a.espncdn.com/i/teamlogos/ncaa/500/26.png"
                  alt="UCLA"
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <div className="text-lg font-semibold text-[#0F1D2E]">UCLA Athlete + Team Performance Report</div>
                  <div className="text-xs text-[#5B6B82]">
                    Athlete + team content performance and audience scale · Generated by <span className="font-semibold" style={{ borderBottom: '2px solid #CCFF00' }}>JABA AI</span>
                  </div>
                </div>
              </div>
            </div>
            <img src="/JABA-face.png" alt="JABA" className="h-12 sm:h-16 object-contain flex-shrink-0" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2774AE]/10 border-[#2774AE]/40 text-[#2774AE]'
                    : 'bg-white border-[#E1E7F0] text-[#1E2A3B] hover:border-[#2774AE]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <TabTransition tabKey={activeTab}>
          {activeTab === 'overview' && (
            <OverviewTab
              athletePosts={athletePostsCount}
              athleteFollowers={athleteFollowers}
              totalLikes={totalLikes}
              totalEmv={totalEmv}
              teamFollowers={teamFollowers}
              roster={roster}
              teamContent={teamContent}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'athletes' && roster && (
            <AthletesTab
              roster={roster}
              onSelectAthlete={setSelectedAthlete}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'teams' && teamContent && (
            <TeamsTab teamContent={teamContent} />
          )}
          {activeTab === 'content' && teamContent && (
            <ContentTab
              teamContent={teamContent}
              athletePosts={athletePosts}
            />
          )}
          {activeTab === 'sponsored' && (
            <SponsoredTab posts={sponsoredPosts} />
          )}
          {activeTab === 'benchmarks' && benchmarks && (
            <BenchmarksTab benchmarks={benchmarks} teamBenchmarks={teamBenchmarks} />
          )}
          {activeTab === 'ip' && ipImpact && (
            <IPTab ipImpact={ipImpact} />
          )}
        </TabTransition>
      </main>

      <DrawerPanel
        open={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        title={selectedAthlete?.name}
        side={isMobile ? 'bottom' : 'right'}
      >
        {selectedAthlete && (
          <AthleteDrawer athlete={selectedAthlete} />
        )}
      </DrawerPanel>

    </div>
  );
}

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E7F0] bg-white shadow-[0_16px_32px_rgba(15,28,46,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function OverviewTab({
  athletePosts,
  athleteFollowers,
  totalLikes,
  totalEmv,
  teamFollowers,
  roster,
  teamContent,
  onNavigate
}: {
  athletePosts: number;
  athleteFollowers: number | null;
  totalLikes: number;
  totalEmv: number | null;
  teamFollowers: number | null;
  roster: UCLARoster | null;
  teamContent: UCLATeamContent | null;
  onNavigate: (tab: TabId) => void;
}) {
  const athleteList = roster?.athletes ?? [];
  const totalLikesRoster = athleteList.reduce((s, a) => s + (a.totalLikes || 0), 0);
  const top10Likes = [...athleteList].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 10);
  const top10LikesShare = totalLikesRoster > 0
    ? (top10Likes.reduce((s, a) => s + a.totalLikes, 0) / totalLikesRoster) * 100
    : null;

  const sportGroups = athleteList.reduce((acc: Record<string, { likes: number; posts: number; engSum: number }>, a) => {
    if (!acc[a.sport]) acc[a.sport] = { likes: 0, posts: 0, engSum: 0 };
    acc[a.sport].likes += a.totalLikes || 0;
    acc[a.sport].posts += a.totalPosts || 0;
    acc[a.sport].engSum += a.avgEngagementRate || 0;
    return acc;
  }, {} as Record<string, { likes: number; posts: number; engSum: number }>);

  const topSportsByLikes = Object.entries(sportGroups)
    .map(([sport, data]) => ({ sport, likes: data.likes }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  const topSportsByEngagement = Object.entries(sportGroups)
    .map(([sport, data]) => ({ sport, avgEngagement: data.posts > 0 ? (data.engSum / athleteList.filter(a => a.sport === sport).length) : 0 }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 3);

  const topAthleteByLikes = top10Likes[0];
  const topTeamByFollowers = teamContent?.teamAccounts
    ? [...teamContent.teamAccounts].sort((a, b) => b.followers - a.followers)[0]
    : null;
  const topTeamPost = teamContent?.topPosts
    ? [...teamContent.topPosts].sort((a, b) => b.likes - a.likes)[0]
    : null;
  const avgAthleteEngagement = athleteList.length
    ? (athleteList.reduce((s, a) => s + (a.avgEngagementRate || 0), 0) / athleteList.length) * 100
    : null;
  const teamEngagementValues = teamContent?.teamAccounts
    ? teamContent.teamAccounts.map(t => t.engagementRate || 0).filter(v => v > 0)
    : [];
  const avgTeamEngagement = teamEngagementValues.length
    ? (teamEngagementValues.reduce((s, v) => s + v, 0) / teamEngagementValues.length) * 100
    : null;

  return (
    <div className="space-y-10">
      <GlassPanel className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#2774AE]">UCLA SOCIAL PERFORMANCE</p>
            <div className="h-0.5 w-12 bg-[#2774AE] mt-2" />
            <p className="text-4xl md:text-5xl font-bold mt-4 text-[#0F1D2E]">
              {formatNumber(totalLikes)} total likes generated across {formatNumber(athletePosts)} athlete posts
            </p>
            <p className="text-[#5B6B82] mt-3 text-base">
              Athlete + team content performance and audience scale.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {/* Athlete Metrics */}
            <div className="rounded-xl border border-[#2774AE]/20 bg-[#2774AE]/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2774AE] mb-2">Athlete Metrics</p>
              <div className="grid grid-cols-2 gap-2">
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Posts analyzed</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{formatNumber(athletePosts)}</p>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Total followers</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{athleteFollowers !== null ? formatNumber(athleteFollowers) : 'N/A'}</p>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Total likes</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{formatNumber(totalLikes)}</p>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Estimated EMV</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{formatCurrency(totalEmv)}</p>
                </GlassPanel>
                <GlassPanel className="p-3 col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Avg Engagement Rate</p>
                      <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{avgAthleteEngagement !== null ? formatPercent(avgAthleteEngagement, 1) : 'N/A'}</p>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
            {/* Team Accounts */}
            <div className="rounded-xl border border-[#F2A900]/20 bg-[#F2A900]/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B07E00] mb-2">Team Social Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Total followers</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{formatNumber(teamFollowers)}</p>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#4B5B73]">Avg Engagement Rate</p>
                  <p className="text-xl font-bold mt-1 text-[#0F1D2E]">{avgTeamEngagement !== null ? formatPercent(avgTeamEngagement, 1) : 'N/A'}</p>
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete by Likes</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-[#F0F4FA] overflow-hidden border border-[#E1E7F0]">
              {topAthleteByLikes?.image ? (
                <img src={topAthleteByLikes.image} alt={topAthleteByLikes.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#0F1D2E]">{topAthleteByLikes ? topAthleteByLikes.name : 'N/A'}</p>
              <p className="text-xs text-[#5B6B82]">{topAthleteByLikes ? formatTeamName(topAthleteByLikes.sport) : 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-[#5B6B82]">
            <div>Likes: {topAthleteByLikes ? formatNumber(topAthleteByLikes.totalLikes) : 'N/A'}</div>
            <div>Posts: {topAthleteByLikes ? formatNumber(topAthleteByLikes.totalPosts) : 'N/A'}</div>
            <div>Avg ER: {topAthleteByLikes ? formatPercent(topAthleteByLikes.avgEngagementRate * 100) : 'N/A'}</div>
          </div>
          <button className="text-sm text-[#2774AE] mt-3" onClick={() => onNavigate('athletes')}>
            View →
          </button>
        </GlassPanel>
        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Followers</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Team Account by Followers</p>
          <p className="text-lg font-semibold mt-2 text-[#0F1D2E]">{topTeamByFollowers ? formatTeamName(topTeamByFollowers.sport) : 'N/A'}</p>
          <p className="text-sm text-[#5B6B82]">{topTeamByFollowers ? formatNumber(topTeamByFollowers.followers) + ' followers' : 'N/A'}</p>
          <button className="text-sm text-[#2774AE] mt-3" onClick={() => onNavigate('teams')}>
            View →
          </button>
        </GlassPanel>
        <GlassPanel className="p-5 relative">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Team Post by Likes</p>
          <p className="text-lg font-semibold mt-2 text-[#0F1D2E]">{topTeamPost ? formatTeamName(topTeamPost.team) : 'N/A'}</p>
          <p className="text-sm text-[#5B6B82]">{topTeamPost ? formatNumber(topTeamPost.likes) + ' likes' : 'N/A'}</p>
          <button className="text-sm text-[#2774AE] mt-3" onClick={() => onNavigate('content')}>
            View →
          </button>
        </GlassPanel>
      </div>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">At a glance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top 10 share of likes</p>
            <p className="text-xl font-bold mt-2 text-[#0F1D2E]">{top10LikesShare !== null ? formatPercent(top10LikesShare, 1) : 'N/A'}</p>
            <p className="text-xs text-[#7A8AA3] mt-2">Share of total athlete likes generated by the top 10 athletes.</p>
          </div>
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Avg Athlete Engagement Rate</p>
            <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{avgAthleteEngagement !== null ? formatPercent(avgAthleteEngagement, 1) : 'N/A'}</p>
            <p className="text-sm text-[#5B6B82]">Across {formatNumber(roster?.totalAthletes ?? 0)} athletes</p>
          </div>
          <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sports leaders</p>
            <div className="text-sm text-[#5B6B82] mt-2">
              <div>Likes: {topSportsByLikes.length ? topSportsByLikes.map(s => formatTeamName(s.sport)).join(', ') : 'N/A'}</div>
              <div>Engagement: {topSportsByEngagement.length ? topSportsByEngagement.map(s => formatTeamName(s.sport)).join(', ') : 'N/A'}</div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function AthletesTab({ roster, onSelectAthlete, isMobile }: { roster: UCLARoster; onSelectAthlete: (a: UCLAAthlete) => void; isMobile: boolean }) {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [sortKey, setSortKey] = useState<'followers' | 'likes' | 'engagement' | 'posts' | 'comments' | 'instagram'>('followers');

  const sports = ['All', ...new Set(roster.athletes.map(a => a.sport))];

  const filtered = useMemo(() => {
    return roster.athletes.filter(a => {
      if (sport !== 'All' && a.sport !== sport) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [roster.athletes, sport, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'followers') return (b.followers ?? 0) - (a.followers ?? 0);
      if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
      if (sortKey === 'engagement') return b.avgEngagementRate - a.avgEngagementRate;
      if (sortKey === 'posts') return b.totalPosts - a.totalPosts;
      if (sortKey === 'instagram') return b.instagramPosts - a.instagramPosts;
      return b.totalComments - a.totalComments;
    });
  }, [filtered, sortKey]);

  const topByLikes = useMemo(() => [...filtered].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 10), [filtered]);
  const topByEngagement = useMemo(() => [...filtered].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 10), [filtered]);

  return (
    <div className="space-y-8">
      <GlassPanel className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA7BC]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athlete"
              className="w-full bg-white border border-[#E1E7F0] rounded-full pl-9 pr-4 py-2 text-sm text-[#1E2A3B]"
            />
          </div>
          <select value={sport} onChange={(e) => setSport(e.target.value)} className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B]">
            {sports.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sports' : formatTeamName(s)}</option>)}
          </select>
          <p className="text-xs text-[#9AA7BC]">Click any column header to sort</p>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel className="p-5">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">Top 10 Athletes by Likes</h3>
          <div className="flex gap-3 overflow-x-auto">
            {topByLikes.map(a => (
              <div key={a._id} className="min-w-[220px] rounded-xl border border-[#E1E7F0] bg-white p-4">
                <div className="text-sm font-semibold text-[#0F1D2E]">{a.name}</div>
                <div className="text-xs text-[#5B6B82]">{formatTeamName(a.sport)}</div>
                <div className="text-lg font-bold mt-2 text-[#0F1D2E]">{formatNumber(a.totalLikes)}</div>
                {a.followers != null && <div className="text-xs text-[#7A8AA3] mt-1">{formatNumber(a.followers)} followers</div>}
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="p-5">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">Top 10 Athletes by Engagement Rate</h3>
          <div className="flex gap-3 overflow-x-auto">
            {topByEngagement.map(a => (
              <div key={a._id} className="min-w-[220px] rounded-xl border border-[#E1E7F0] bg-white p-4">
                <div className="text-sm font-semibold text-[#0F1D2E]">{a.name}</div>
                <div className="text-xs text-[#5B6B82]">{formatTeamName(a.sport)}</div>
                <div className="text-lg font-bold mt-2 text-[#0F1D2E]">{formatPercent(a.avgEngagementRate * 100)}</div>
                {a.followers != null && <div className="text-xs text-[#7A8AA3] mt-1">{formatNumber(a.followers)} followers</div>}
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {sorted.map(a => (
            <GlassPanel key={a._id} className="p-4" >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#0F1D2E]">{a.name}</div>
                  <div className="text-xs text-[#5B6B82]">{formatTeamName(a.sport)}</div>
                </div>
                <button className="text-xs text-[#2774AE]" onClick={() => onSelectAthlete(a)}>Details</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#5B6B82]">
                <div>Followers: {formatNumber(a.followers ?? 0)}</div>
                <div>Likes: {formatNumber(a.totalLikes)}</div>
                <div>Posts: {formatNumber(a.totalPosts)}</div>
                <div>Avg ER: {formatPercent(a.avgEngagementRate * 100)}</div>
              </div>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <VirtualizedTable
          rows={sorted}
          rowHeight={56}
          height={560}
          renderRow={(a) => (
            <tr key={a._id} className="border-b border-[#E1E7F0] hover:bg-[#F3F6FB] cursor-pointer" onClick={() => onSelectAthlete(a)}>
              <td className="px-4 py-3 text-sm font-semibold text-[#0F1D2E]">{a.name}</td>
              <td className="px-4 py-3 text-sm text-[#5B6B82]">{formatTeamName(a.sport)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatNumber(a.followers ?? 0)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatNumber(a.totalPosts)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatNumber(a.totalLikes)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatPercent(a.avgEngagementRate * 100)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatNumber(a.instagramPosts)}</td>
            </tr>
          )}
          header={(
            <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
              {[
                { key: null,         label: 'Athlete',    align: 'left'  },
                { key: null,         label: 'Sport',      align: 'left'  },
                { key: 'followers',  label: 'Followers',  align: 'right' },
                { key: 'posts',      label: 'Posts',      align: 'right' },
                { key: 'likes',      label: 'Likes',      align: 'right' },
                { key: 'engagement', label: 'Avg ER',     align: 'right' },
                { key: 'instagram',  label: 'IG Posts',   align: 'right' },
              ].map(col => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-${col.align} ${col.key ? 'cursor-pointer select-none hover:text-[#2774AE]' : ''} ${sortKey === col.key ? 'text-[#2774AE]' : ''}`}
                  onClick={() => col.key && setSortKey(col.key as typeof sortKey)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && (sortKey === col.key ? <span>↓</span> : <span className="opacity-30">↕</span>)}
                  </span>
                </th>
              ))}
            </tr>
          )}
        />
      )}
    </div>
  );
}

const MAX_TEAM_POSTS = 12;

function capTeamAccount(team: UCLATeamAccount): UCLATeamAccount {
  const posts = team.contentPosts ?? 0;
  if (posts <= MAX_TEAM_POSTS) return team;
  const scale = MAX_TEAM_POSTS / posts;
  return {
    ...team,
    contentPosts: MAX_TEAM_POSTS,
    contentLikes: Math.round((team.contentLikes ?? 0) * scale),
    contentComments: Math.round((team.contentComments ?? 0) * scale),
  };
}

function TeamsTab({ teamContent }: { teamContent: UCLATeamContent }) {
  const [sortKey, setSortKey] = useState<'followers' | 'likes' | 'engagement' | 'posts'>('followers');

  const cappedAccounts = useMemo(() => teamContent.teamAccounts.map(capTeamAccount), [teamContent.teamAccounts]);

  const sortedTeams = useMemo(() => {
    return [...cappedAccounts].sort((a, b) => {
      if (sortKey === 'followers') return b.followers - a.followers;
      if (sortKey === 'likes') return (b.contentLikes || 0) - (a.contentLikes || 0);
      if (sortKey === 'engagement') return (b.engagementRate || 0) - (a.engagementRate || 0);
      return (b.contentPosts || 0) - (a.contentPosts || 0);
    });
  }, [cappedAccounts, sortKey]);

  const topTeams = sortedTeams.slice(0, 6);

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Team Accounts</h2>
            <p className="text-sm text-[#5B6B82]">Total team followers: {formatNumber(teamContent.totalFollowers)}</p>
            <p className="text-xs text-[#9AA7BC] mt-1">Based on last {MAX_TEAM_POSTS} most recent posts</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: 'followers', label: 'Followers' },
              { key: 'likes', label: 'Total Likes' },
              { key: 'engagement', label: 'Engagement Rate' },
              { key: 'posts', label: 'Posts' }
            ].map(chip => (
              <button
                key={chip.key}
                onClick={() => setSortKey(chip.key as typeof sortKey)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sortKey === chip.key ? 'bg-[#2774AE]/10 border-[#2774AE]/40 text-[#2774AE]' : 'bg-white border-[#E1E7F0] text-[#1E2A3B]'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topTeams.map(team => (
          <GlassPanel key={team.sport} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#0F1D2E]">{formatTeamName(team.sport)}</div>
            </div>
            <div className="mt-3 text-sm text-[#5B6B82]">Followers: {formatNumber(team.followers)}</div>
            <div className="text-xs text-[#7A8AA3]">Share of total: {teamContent.totalFollowers ? formatPercent((team.followers / teamContent.totalFollowers) * 100, 1) : 'N/A'}</div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6">
        <div style={headerStyle} className="text-sm font-bold uppercase tracking-tight mb-3 text-[#0F1D2E]">Team Leaderboard</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">Team</th>
                <th className="text-right py-2 px-3">Followers</th>
                <th className="text-right py-2 px-3">Likes</th>
                <th className="text-right py-2 px-3">Eng. Rate</th>
                <th className="text-right py-2 px-3">Posts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map(team => (
              <tr key={team.sport} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                  <td className="py-3 px-3 text-sm font-semibold text-[#0F1D2E]">{formatTeamName(team.sport)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(team.followers)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(team.contentLikes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatPercent((team.engagementRate || 0) * 100)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(team.contentPosts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

function ContentTab({ teamContent, athletePosts }: { teamContent: UCLATeamContent; athletePosts: UCLAAthletePost[] }) {
  const [contentScope, setContentScope] = useState<'team' | 'athlete'>('team');
  const [teamFilter] = useState('All');
  const [sportFilter] = useState('All');
  const [mediaType, setMediaType] = useState('N/A');
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'comments'>('likes');
  const [sponsoredOnly, setSponsoredOnly] = useState(false);

  const normalizedAthletePosts = useMemo(() => {
    return athletePosts.map(p => ({
      id: p._id,
      title: p.athlete?.name || 'Unknown athlete',
      sport: p.athlete?.sport || 'Unknown',
      caption: p.caption,
      likes: p.metrics?.likes || 0,
      comments: p.metrics?.comments || 0,
      engagementRate: p.metrics?.engagementRate || 0,
      url: p.url,
      permalink: p.permalink,
      publishedAt: typeof p.publishedAt === 'string' ? p.publishedAt : p.publishedAt?.$date,
      isSponsored: p.isSponsored
    }));
  }, [athletePosts]);

  const teamPosts = useMemo(() => {
    return teamContent.topPosts.map(p => ({
      id: `${p.permalink || p.team}-${p.publishedAt || ''}`,
      teamKey: p.team,
      title: formatTeamName(p.team),
      sport: p.team,
      caption: p.caption,
      likes: p.likes,
      comments: p.comments,
      engagementRate: p.engagementRate || 0,
      url: p.url,
      permalink: p.permalink,
      publishedAt: p.publishedAt
    }));
  }, [teamContent.topPosts]);

  const filteredPosts = useMemo(() => {
    if (contentScope === 'team') {
      let list = [...teamPosts];
      if (teamFilter !== 'All') list = list.filter(p => p.teamKey === teamFilter);
      if (sportFilter !== 'All') list = list.filter(p => p.sport === sportFilter);
      return list;
    }
    let list = [...normalizedAthletePosts];
    if (sportFilter !== 'All') list = list.filter(p => p.sport === sportFilter);
    if (sponsoredOnly) list = list.filter(p => p.isSponsored);
    return list;
  }, [contentScope, teamPosts, normalizedAthletePosts, teamFilter, sportFilter, sponsoredOnly]);

  const sortedByMetric = [...filteredPosts].sort((a, b) => {
    if (sortKey === 'likes') return b.likes - a.likes;
    if (sortKey === 'comments') return b.comments - a.comments;
    return (b.engagementRate || 0) - (a.engagementRate || 0);
  });
  const top3 = sortedByMetric.slice(0, 3);
  const top10 = sortedByMetric.slice(0, 10);

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6 bg-[#F3F6FB]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">UCLA’s Highest Performing Content</h2>
              <p className="text-sm text-[#5B6B82]">Top posts across UCLA team + athlete accounts</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-full border border-[#E1E7F0] bg-white p-1 text-xs font-semibold">
                {[
                  { key: 'team', label: 'Team' },
                  { key: 'athlete', label: 'Athlete' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setContentScope(item.key as typeof contentScope)}
                    className={`px-3 py-1 rounded-full transition ${
                      (item.key === 'team' && contentScope === 'team') || (item.key === 'athlete' && contentScope === 'athlete')
                        ? 'bg-[#2774AE]/10 text-[#2774AE] border border-[#2774AE]/30'
                        : 'text-[#1E2A3B]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {contentScope === 'athlete' && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-[#5B6B82]">Sponsored only</span>
                  <button
                    role="switch"
                    aria-checked={sponsoredOnly}
                    onClick={() => setSponsoredOnly(!sponsoredOnly)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      sponsoredOnly ? 'bg-[#2774AE]' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      sponsoredOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
                    }`} />
                  </button>
                </label>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5B6B82]">Metric</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                  className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B] h-9"
                >
                  <option value="likes">Likes</option>
                  <option value="engagement">Engagement Rate</option>
                  <option value="comments">Comments</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {mediaType !== 'N/A' && (
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B] h-9 min-w-[160px]"
              >
                <option value="All">All Media</option>
              </select>
            )}
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {top3.map((post, idx) => (
          <GlassPanel key={`${post.id}-${idx}`} className="p-5 hover:border-[#FFD100]/60 transition-colors">
            <div className="w-full h-48 rounded-xl bg-[#F0F4FA] overflow-hidden">
              {post.url ? (
                <img src={post.url} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">N/A</div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#7A8AA3]">
              <span className="px-2 py-0.5 rounded-full bg-[#F3F6FB] border border-[#E1E7F0]">{post.title}</span>
              <span>{formatDate(post.publishedAt as string)}</span>
            </div>
            <p className="text-sm font-semibold text-[#0F1D2E] mt-2">{post.caption ? post.caption.slice(0, 90) : 'No caption'}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
              <div>Likes: {formatNumber(post.likes)}</div>
              <div>Comments: {formatNumber(post.comments)}</div>
              <div>ER: {formatPercent((post.engagementRate || 0) * 100)}</div>
            </div>
            {post.permalink && (
              <div className="mt-3">
                <a href={post.permalink} target="_blank" rel="noreferrer" className="text-xs text-[#2774AE]">Open post</a>
              </div>
            )}
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
                <th className="text-left py-2 px-3">Post</th>
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
                  <td className="py-3 px-3 text-sm text-[#0F1D2E]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F0F4FA] overflow-hidden">
                        {post.url ? <img src={post.url} alt={post.title} className="w-full h-full object-cover" /> : null}
                      </div>
                      <span className="line-clamp-1">{post.caption ? post.caption.slice(0, 60) : 'No caption'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-[#5B6B82]">{formatTeamName(post.sport)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(post.likes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatPercent((post.engagementRate || 0) * 100)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatDate(post.publishedAt as string)}</td>
                  <td className="py-3 px-3 text-right">
                    {post.permalink && (
                      <a href={post.permalink} target="_blank" rel="noreferrer" className="text-[#2774AE]">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
      {/* Intentionally removed content below Top 10 per request */}
    </div>
  );
}

function SponsoredTab({ posts }: { posts: UCLASponsoredPost[] }) {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'posts' | 'likes' | 'engagement'>('posts');

  const [brandLogoMap, setBrandLogoMap] = useState<Record<string, string>>({});

  const normalizedPosts = posts.map(p => ({
    ...p,
    publishedAt: typeof p.publishedAt === 'string' ? p.publishedAt : p.publishedAt?.$date
  }));

  useEffect(() => {
    fetch('/data/socialMedia.brands.json')
      .then(res => res.ok ? res.json() : [])
      .then((data) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, string> = {};
        data.forEach((item: { name?: string; logo?: string }) => {
          const key = (item.name || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9]/g, '');
          if (key && item.logo) map[key] = item.logo;
        });
        setBrandLogoMap(map);
      })
      .catch(() => {});
  }, []);

  const sports = ['All', ...new Set(normalizedPosts.map(p => p.athlete?.sport).filter(Boolean) as string[])];

  // Team pages, individuals, NIL platforms, agencies, podcasts, and local/personal accounts
  const NON_BRAND_EXCLUSIONS = new Set([
    // UCLA team & org pages
    'uclawbb','uclagymnastics','uclawomensvb','uclabruinsforlife','uclawsoccer',
    'uclabeachvb','uclafootball','ucla_pv','ucladeltagamma','bruinnil','ucla.nil.store',
    // Other team / league / org pages
    'laacwaterpolo','onwaterpolo','unrivaledbasketball','teamusa','volleyballnationsleague',
    'indianavb','stanfordmgolf','scblueheatfc','pgfnetwork','socalproseries',
    'fpfpuertorico','thirdcoastvolleyballhtx','bscyb_offiziell','dst_houston_south',
    'weareangelcity','usta','ultimatepolevaultclub','bowermantc','blacktidesports',
    'braidrowing','thewestwomen',
    // Individual athlete / celebrity accounts
    'charlisselegerwalker','charlisse.legerwalker','parishilton','kwameaduseionline',
    'skylervarga','jordanchiles','ezavierstaples','moosecuellar10','thelitevans',
    'domdolla','chef_megan_cooking','jtmadethat',
    // NIL stores, collectives, management platforms
    'athletezonestore','myplayersports','postgame.official','prepdig',
    // Agencies & modeling
    'apsportsagency','powerhausagency','hometownheroagency','bala.academy_','wilhelminamodels',
    // Podcasts & niche media
    'itspersonalpodcast','whatsup_pod','citiusmag','citiusmagrunclub','flotrack',
    'voiceinsport','trackandfeelsclub','futurescapequiz','thesundayshakeout',
    'softball_america','topdrawersoccer','slam',
    // Local / personal / non-brand accounts
    'outlawtattootemecula','midtown_luxury_rentals_','purocleansocal','hairmaidenindia',
    'hairqueen_la','kicks_by_kenna','tjcuts','barknbitches','ticocarsa','fly.3man',
    'aupiu.44','flight23white_','mjhoopstraining','is8nikebasketball','path2pro',
    'elite_sports_performance___','queenofthecourtseries','queenkingofthecourt',
    'dividenpac','clubdiezinc','3strandfootball','phenomk2','einsteinenergylab',
    'monarcsport','golden__saints','teamavoli','blumaka','uswingmojing','we.are.ever',
    'cortsofficial','ducko.us','phixey','twinbridgesports','soundrunning',
    'sanmar_corp','teamessx','wescom','wescomfinancial',
  ]);

  const filtered = normalizedPosts.filter(p => {
    const sponsor = (p.sponsorPartner || '').replace(/^@/, '').toLowerCase().trim();
    if (NON_BRAND_EXCLUSIONS.has(sponsor)) return false;
    if (sportFilter !== 'All' && p.athlete?.sport !== sportFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.sponsorPartner || '').toLowerCase().includes(q) || (p.athlete?.name || '').toLowerCase().includes(q);
  });

  // Semantic alias map: variant handle → canonical handle (all lowercase, no @)
  const BRAND_ALIASES: Record<string, string> = {
    'drinkdripdrop':   'dripdrop',
    'eastonbaseball':  'easton',
    'eastonfastpitch': 'easton',
    'adidasbasketball':'adidas',
    'adidasfootball':  'adidas',
    'adidasusfootball':'adidas',
  };

  const totalLikes = filtered.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
  const totalComments = filtered.reduce((s, p) => s + (p.metrics?.comments || 0), 0);
  const uniqueBrands = new Set(filtered.map(p => {
    const n = (p.sponsorPartner || '').replace(/^@/, '').toLowerCase().trim();
    return BRAND_ALIASES[n] ?? n;
  }).filter(Boolean));
  const uniqueAthletes = new Set(filtered.map(p => p.athlete?._id).filter(Boolean));

  const avgLikes = filtered.length ? totalLikes / filtered.length : null;
  const avgComments = filtered.length ? Math.round(totalComments / filtered.length) : null;
  const postsPerBrand = uniqueBrands.size ? filtered.length / uniqueBrands.size : null;

  const brandMap = new Map<string, {
    brand: string;
    posts: UCLASponsoredPost[];
    athletes: Set<string>;
    sports: Set<string>;
    totalLikes: number;
    totalComments: number;
    avgEngagement: number;
  }>();

  filtered.forEach(p => {
    const raw = (p.sponsorPartner || '').trim();
    if (!raw) return;
    // Normalize to lowercase-without-@ for deduplication, then apply aliases
    const normalized = raw.replace(/^@/, '').toLowerCase();
    const key = BRAND_ALIASES[normalized] ?? normalized;
    const existing = brandMap.get(key);
    if (existing) {
      existing.posts.push(p);
      if (p.athlete?._id) existing.athletes.add(p.athlete._id);
      if (p.athlete?.sport) existing.sports.add(p.athlete.sport);
      existing.totalLikes += p.metrics?.likes || 0;
      existing.totalComments += p.metrics?.comments || 0;
      existing.avgEngagement += p.metrics?.engagementRate || 0;
    } else {
      // Use @lowercased as the canonical display name
      const displayName = '@' + key;
      brandMap.set(key, {
        brand: displayName,
        posts: [p],
        athletes: new Set(p.athlete?._id ? [p.athlete._id] : []),
        sports: new Set(p.athlete?.sport ? [p.athlete.sport] : []),
        totalLikes: p.metrics?.likes || 0,
        totalComments: p.metrics?.comments || 0,
        avgEngagement: p.metrics?.engagementRate || 0
      });
    }
  });

  const brandCards = Array.from(brandMap.values()).map(entry => ({
    brand: entry.brand,
    posts: entry.posts,
    postCount: entry.posts.length,
    athleteCount: entry.athletes.size,
    sportCount: entry.sports.size,
    totalLikes: entry.totalLikes,
    totalComments: entry.totalComments,
    avgEngagement: entry.posts.length ? entry.avgEngagement / entry.posts.length : 0
  }));

  const sortedBrands = [...brandCards].sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagement - a.avgEngagement;
    return b.postCount - a.postCount;
  });

  const topBrands = sortedBrands.slice(0, 30);

  const brandLogoUrl = (brand: string) => {
    const clean = brand.replace(/^@/, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    return brandLogoMap[clean] || `https://logo.dev/${clean}.com`;
  };

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Sponsored Posts</h2>
            <p className="text-sm text-[#5B6B82]">Sponsored posts across UCLA athletes</p>
          </div>
          <div className="text-sm text-[#5B6B82]">{uniqueBrands.size} total brands</div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <GlassPanel className="p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sponsored posts</p>
          <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{formatNumber(filtered.length)}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Unique brands</p>
          <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{formatNumber(uniqueBrands.size)}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Total likes</p>
          <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{formatNumber(totalLikes)}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Athletes with deals</p>
          <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">{formatNumber(uniqueAthletes.size)}</p>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Search by brand or athlete</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand or athlete..."
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sport</label>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              {sports.map(s => <option key={s} value={s}>{formatTeamName(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sort by</label>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              <option value="posts">Posts</option>
              <option value="likes">Total Likes</option>
              <option value="engagement">Engagement Rate</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm text-[#5B6B82]">
          <div>Avg likes per sponsored post: {avgLikes !== null ? formatNumber(avgLikes) : 'N/A'}</div>
          <div>Avg comments per sponsored post: {avgComments !== null ? formatNumber(avgComments) : 'N/A'}</div>
          <div>Posts per brand: {postsPerBrand !== null ? postsPerBrand.toFixed(1) : 'N/A'}</div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topBrands.map(brand => {
          return (
            <GlassPanel key={brand.brand} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F3F6FB] border border-[#E1E7F0] flex items-center justify-center overflow-hidden">
                  <img
                    src={brandLogoUrl(brand.brand)}
                    alt={brand.brand}
                    className="w-full h-full object-contain"
                    onLoad={(e) => {
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'none';
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-semibold text-[#1E2A3B]">{brand.brand.replace(/^@/, '').slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#0F1D2E]">{brand.brand}</div>
                  <div className="text-xs text-[#5B6B82]">{brand.postCount} posts • {brand.athleteCount} athletes • {brand.sportCount} sports</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
                <div>Likes: {formatNumber(brand.totalLikes)}</div>
                <div>Comments: {formatNumber(brand.totalComments)}</div>
                <div>Avg ER: {formatPercent((brand.avgEngagement || 0) * 100)}</div>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}

function BenchmarksTab({ benchmarks, teamBenchmarks }: { benchmarks: BenchmarksData; teamBenchmarks: TeamBenchmarksData | null }) {
  const [scope, setScope] = useState<'bigTen' | 'all'>('bigTen');
  const [dataType, setDataType] = useState<'athletes' | 'teams'>('athletes');
  const [lbSort, setLbSort] = useState<'totalLikes' | 'totalContents' | 'likesPerPost' | 'collabPosts'>('totalLikes');
  const [teamLbSort, setTeamLbSort] = useState<'totalFollowers' | 'totalLikes' | 'totalPosts' | 'avgEngagementRate' | 'teamAccounts' | 'likesPerPost'>('totalFollowers');

  const ucla = benchmarks.schools.find(s => s.shortName === 'UCLA');
  if (!ucla) return null;

  const peers = scope === 'bigTen'
    ? benchmarks.schools.filter(s => s.isBigTen && s.shortName !== 'UCLA')
    : benchmarks.schools.filter(s => s.shortName !== 'UCLA');
  const avg = scope === 'bigTen' ? benchmarks.bigTenAvg : benchmarks.allSchoolAvg;
  const ranks = scope === 'bigTen' ? benchmarks.uclaBigTenRanks : benchmarks.uclaRanks;

  const metricRows: Array<{
    label: string;
    key: string;
    uclaVal: number;
    avgVal: number;
    format: (v: number) => string;
  }> = [
    { label: 'Total Posts', key: 'totalContents', uclaVal: ucla.totalContents, avgVal: avg.totalContents, format: formatNumber },
    { label: 'Total Likes', key: 'totalLikes', uclaVal: ucla.totalLikes, avgVal: avg.totalLikes, format: formatNumber },
    { label: 'Total Comments', key: 'totalComments', uclaVal: ucla.totalComments, avgVal: avg.totalComments, format: formatNumber },
    { label: 'Likes / Post', key: 'likesPerPost', uclaVal: ucla.likesPerPost, avgVal: avg.likesPerPost, format: formatNumber },
    { label: 'Collab Posts', key: 'collabPosts', uclaVal: ucla.collabPosts, avgVal: avg.collabPosts, format: formatNumber },
    { label: 'IP Posts %', key: 'ipPercentage', uclaVal: ucla.ipPercentage, avgVal: avg.ipPercentage, format: (v: number) => formatPercent(v, 1) },
  ];

  const diffPct = (a: number, b: number) => b !== 0 ? ((a - b) / Math.abs(b)) * 100 : 0;

  const teamSchools = (teamBenchmarks?.schools ?? []).filter(s =>
    scope === 'bigTen' ? s.isBigTen : true
  );

  return (
    <div className="space-y-8">
      {/* Header + toggles */}
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Benchmarks</h2>
              <p className="text-sm text-[#5B6B82]">
                {dataType === 'athletes'
                  ? `UCLA athlete NIL posts vs ${scope === 'bigTen' ? `Big Ten peers (${peers.length} schools)` : `all schools in dataset (${peers.length} schools)`}`
                  : `Official team social pages — ${scope === 'bigTen' ? `Big Ten (${teamSchools.length} schools)` : `all schools (${teamSchools.length} schools)`}`
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Data type toggle */}
              <div className="flex items-center gap-1 rounded-full border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
                {([
                  { key: 'athletes', label: 'Athlete Posts' },
                  { key: 'teams', label: 'Team Pages' }
                ] as const).map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => setDataType(chip.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${dataType === chip.key ? 'bg-[#2774AE] text-white shadow-sm' : 'text-[#5B6B82] hover:text-[#1E2A3B]'}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              {/* Scope toggle */}
              <div className="flex items-center gap-1">
                {([
                  { key: 'bigTen', label: 'Big Ten' },
                  { key: 'all', label: 'All Schools' }
                ] as const).map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => setScope(chip.key)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${scope === chip.key ? 'bg-[#2774AE]/10 border-[#2774AE]/40 text-[#2774AE]' : 'bg-white border-[#E1E7F0] text-[#1E2A3B]'}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* ── ATHLETE VIEW ── */}
      {dataType === 'athletes' && <>

      {/* Rank highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Likes', key: 'totalLikes' },
          { label: 'Total Comments', key: 'totalComments' },
          { label: 'Collab Posts', key: 'collabPosts' },
          { label: 'Likes / Post', key: 'likesPerPost' },
        ].map(item => {
          const r = ranks[item.key];
          return (
            <GlassPanel key={item.key} className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</p>
              <p className="text-2xl font-bold mt-2 text-[#0F1D2E]">#{r?.rank ?? '—'}</p>
              <p className="text-xs text-[#7A8AA3]">of {r?.of ?? '—'} schools</p>
            </GlassPanel>
          );
        })}
      </div>

      {/* UCLA vs Average comparison table */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          UCLA vs {scope === 'bigTen' ? 'Big Ten' : 'Network'} Average
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th className="text-left py-2 px-3">Metric</th>
                <th className="text-right py-2 px-3">UCLA</th>
                <th className="text-right py-2 px-3">{scope === 'bigTen' ? 'Big Ten Avg' : 'All Avg'}</th>
                <th className="text-right py-2 px-3">Diff</th>
                <th className="text-right py-2 px-3">Rank</th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map(row => {
                const diff = diffPct(row.uclaVal, row.avgVal);
                const r = ranks[row.key];
                return (
                  <tr key={row.key} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                    <td className="py-3 px-3 text-sm font-medium text-[#0F1D2E]">{row.label}</td>
                    <td className="py-3 px-3 text-sm text-right font-semibold text-[#0F1D2E]">{row.format(row.uclaVal)}</td>
                    <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">{row.format(row.avgVal)}</td>
                    <td className={`py-3 px-3 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">
                      {r ? `#${r.rank}/${r.of}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Visual comparison bars */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          Key Metrics vs {scope === 'bigTen' ? 'Big Ten' : 'Network'}
        </h3>
        <div className="space-y-5">
          {[
            { label: 'Total Likes', uclaVal: ucla.totalLikes, avgVal: avg.totalLikes },
            { label: 'Collab Posts', uclaVal: ucla.collabPosts, avgVal: avg.collabPosts },
            { label: 'Likes / Post', uclaVal: ucla.likesPerPost, avgVal: avg.likesPerPost },
          ].map(item => {
            const max = Math.max(item.uclaVal, item.avgVal) || 1;
            const uclaW = (item.uclaVal / max) * 100;
            const avgW = (item.avgVal / max) * 100;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-[#0F1D2E]">{item.label}</span>
                  <span className="text-xs text-[#7A8AA3]">UCLA {formatNumber(item.uclaVal)} vs Avg {formatNumber(item.avgVal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#2774AE] w-10">UCLA</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2774AE] rounded-full" style={{ width: `${uclaW}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9AA7BC] w-10">Avg</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8D5E3] rounded-full" style={{ width: `${avgW}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Peer school leaderboard — athlete NIL posts */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-1 text-[#0F1D2E]">
          {scope === 'bigTen' ? 'Big Ten' : 'All Schools'} Athlete Posts Leaderboard
        </h3>
        <p className="text-xs text-[#7A8AA3] mb-4">Athlete NIL social media posts (Instagram + TikTok)</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82] bg-[#F3F6FB]">
                <th className="text-left py-2 px-3">School</th>
                <th className="text-left py-2 px-3">Conference</th>
                {([
                  { key: 'totalContents', label: 'Posts' },
                  { key: 'totalLikes',    label: 'Likes' },
                  { key: 'likesPerPost',  label: 'Likes/Post' },
                  { key: 'collabPosts',   label: 'Collab Posts' },
                ] as const).map(col => (
                  <th
                    key={col.key}
                    className={`text-right py-2 px-3 cursor-pointer select-none hover:text-[#2774AE] ${lbSort === col.key ? 'text-[#2774AE]' : ''}`}
                    onClick={() => setLbSort(col.key)}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      {col.label}
                      {lbSort === col.key ? <span>↓</span> : <span className="opacity-30">↕</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[ucla, ...peers].sort((a, b) => b[lbSort] - a[lbSort]).map(s => (
                <tr
                  key={s.shortName}
                  className={`border-t border-[#E1E7F0] ${s.shortName === 'UCLA' ? 'bg-[#2774AE]/5 font-semibold' : 'hover:bg-[#F3F6FB]'}`}
                >
                  <td className="py-3 px-3 text-sm text-[#0F1D2E]">
                    {s.shortName === 'UCLA' ? '→ ' : ''}{s.shortName}
                  </td>
                  <td className="py-3 px-3 text-xs text-[#7A8AA3]">{s.conference}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(s.totalContents)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(s.totalLikes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(s.likesPerPost)}</td>
                  <td className="py-3 px-3 text-sm text-right">{formatNumber(s.collabPosts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      </> /* end athlete view */}

      {/* ── TEAM PAGES VIEW ── */}
      {dataType === 'teams' && (
        <GlassPanel className="p-6">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-1 text-[#0F1D2E]">
            {scope === 'bigTen' ? 'Big Ten' : 'All Schools'} Team Social Pages Leaderboard
          </h3>
          <p className="text-xs text-[#7A8AA3] mb-4">Official school athletic department social accounts (90-day metrics)</p>
          {teamSchools.length === 0 ? (
            <p className="text-sm text-[#7A8AA3]">No team page data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82] bg-[#F3F6FB]">
                    <th className="text-left py-2 px-3">School</th>
                    <th className="text-left py-2 px-3">Conference</th>
                    {([
                      { key: 'teamAccounts',      label: 'Accounts' },
                      { key: 'totalFollowers',    label: 'Followers' },
                      { key: 'totalLikes',        label: 'Likes' },
                      { key: 'likesPerPost',      label: 'Likes/Post' },
                      { key: 'avgEngagementRate', label: 'Eng. Rate' },
                    ] as const).map(col => (
                      <th
                        key={col.key}
                        className={`text-right py-2 px-3 cursor-pointer select-none hover:text-[#2774AE] ${teamLbSort === col.key ? 'text-[#2774AE]' : ''}`}
                        onClick={() => setTeamLbSort(col.key)}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {col.label}
                          {teamLbSort === col.key ? <span>↓</span> : <span className="opacity-30">↕</span>}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...teamSchools].sort((a, b) => b[teamLbSort] - a[teamLbSort]).map(s => (
                    <tr
                      key={s.school}
                      className={`border-t border-[#E1E7F0] ${s.shortName === 'UCLA' ? 'bg-[#2774AE]/5 font-semibold' : 'hover:bg-[#F3F6FB]'}`}
                    >
                      <td className="py-3 px-3 text-sm text-[#0F1D2E]">
                        {s.shortName === 'UCLA' ? '→ ' : ''}{s.shortName || s.school}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#7A8AA3]">{s.conference}</td>
                      <td className="py-3 px-3 text-sm text-right">{s.teamAccounts}</td>
                      <td className="py-3 px-3 text-sm text-right">{formatNumber(s.totalFollowers)}</td>
                      <td className="py-3 px-3 text-sm text-right">{formatNumber(s.totalLikes)}</td>
                      <td className="py-3 px-3 text-sm text-right">{formatNumber(Math.round(s.likesPerPost))}</td>
                      <td className="py-3 px-3 text-sm text-right">{formatPercent(s.avgEngagementRate, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      )}
    </div>
  );
}

function IPTab({ ipImpact }: { ipImpact: UCLAIPImpact }) {
  const [signal, setSignal] = useState<'collab' | 'logo' | 'caption'>('collab');
  const [metric, setMetric] = useState<'er' | 'likes' | 'comments'>('er');

  const signals = [
    { id: 'collab' as const,  label: 'Collaboration', data: ipImpact.collaboration },
    { id: 'logo' as const,    label: 'Logo',          data: ipImpact.logo },
    { id: 'caption' as const, label: 'Caption',       data: ipImpact.orgInCaption },
  ];

  const metrics = [
    { id: 'er' as const,       label: 'Eng. Rate' },
    { id: 'likes' as const,    label: 'Likes/Post' },
    { id: 'comments' as const, label: 'Comments/Post' },
  ];

  const active = signals.find(s => s.id === signal)!;
  const lift = active.data.avgLift;
  const liftPositive = lift >= 0;

  const withData  = active.data.yes;
  const noData    = active.data.no;

  // likes/comments in the JSON are already per-post averages — no division needed
  const withLpp  = Math.round(withData.likes);
  const noLpp    = Math.round(noData.likes);
  const withCpp  = Math.round(withData.comments);
  const noCpp    = Math.round(noData.comments);

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
      {/* Headline */}
      <GlassPanel className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#2774AE] mb-2">IP Intelligence · Instagram Only</p>
            <p className="text-3xl md:text-4xl font-black text-[#0F1D2E] leading-tight">
              Posts with UCLA {active.label.toLowerCase()} drive{' '}
              <span style={{ color: liftPositive ? '#2774AE' : '#C2413B' }}>
                {liftPositive ? '+' : ''}{lift.toFixed(1)}%
              </span>{' '}
              higher engagement.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#2774AE] bg-[#2774AE]/10 border border-[#2774AE]/30 px-2 py-0.5 rounded-full">
              Instagram only
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* Signal + Metric selectors */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Signal tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
          {signals.map(s => (
            <button
              key={s.id}
              onClick={() => setSignal(s.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                signal === s.id
                  ? 'bg-[#2774AE] text-white shadow-sm'
                  : 'text-[#5B6B82] hover:text-[#1E2A3B]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {/* Metric tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
          {metrics.map(m => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                metric === m.id
                  ? 'bg-[#0F1D2E] text-white shadow-sm'
                  : 'text-[#5B6B82] hover:text-[#1E2A3B]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Comparison */}
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2774AE]">
                With {active.label} · {formatNumber(withData.contents)} posts
              </p>
              <p className="text-xl font-black text-[#0F1D2E]">{fmt(withVal)}</p>
            </div>
            <div className="w-full bg-[#F0F4FA] rounded-lg h-9 overflow-hidden">
              <div
                className="h-full rounded-lg bg-[#2774AE] transition-all duration-700"
                style={{ width: `${Math.max(withPct, 2)}%` }}
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
            {liftPositive ? (
              <ArrowUpRight className="w-5 h-5 text-[#2774AE]" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-[#C2413B]" />
            )}
            <span className="text-sm font-bold" style={{ color: liftPositive ? '#2774AE' : '#C2413B' }}>
              {liftPositive ? '+' : ''}{lift.toFixed(1)}% ER lift
            </span>
            <span className="text-xs text-[#7A8AA3]">on posts with {active.label.toLowerCase()}</span>
          </div>
        </div>
      </GlassPanel>

      {/* Stat grid for active signal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Posts With', value: formatNumber(withData.contents) },
          { label: 'Posts Without', value: formatNumber(noData.contents) },
          { label: 'Avg ER With', value: formatPercent(withData.engagementRate * 100, 1) },
          { label: 'Total EMV', value: formatCurrency(withData.emv * withData.contents) },
        ].map(item => (
          <GlassPanel key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</p>
            <p className="text-xl font-bold mt-2 text-[#0F1D2E]">{item.value}</p>
          </GlassPanel>
        ))}
      </div>

      {/* All 3 signals summary */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          All IP Signals — Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signals.map(s => {
            const pos = s.data.avgLift >= 0;
            const color = pos ? '#2774AE' : '#C2413B';
            const lpp = s.data.yes.likes; // already a per-post average
            return (
              <button
                key={s.id}
                onClick={() => setSignal(s.id)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  signal === s.id
                    ? 'border-[#2774AE]/40 bg-[#2774AE]/5 shadow-sm'
                    : 'border-[#E1E7F0] bg-white hover:border-[#2774AE]/20'
                }`}
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
                    <span>Total EMV</span>
                    <span className="font-medium text-[#0F1D2E]">{formatCurrency(s.data.yes.emv * s.data.yes.contents)}</span>
                  </div>
                </div>
                {/* Mini ER bar */}
                <div className="mt-3">
                  <div className="w-full bg-[#F0F4FA] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: color,
                        width: `${Math.min((s.data.yes.engagementRate / Math.max(s.data.yes.engagementRate, s.data.no.engagementRate, 0.001)) * 100, 100)}%`
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

function AthleteDrawer({ athlete }: { athlete: UCLAAthlete }) {
  const totalPosts = athlete.totalPosts || 0;
  const igShare = totalPosts ? (athlete.instagramPosts / totalPosts) * 100 : 0;
  const ttShare = totalPosts ? (athlete.tiktokPosts / totalPosts) * 100 : 0;
  const likesPerPost = totalPosts ? athlete.totalLikes / totalPosts : 0;
  const commentsPerPost = totalPosts ? athlete.totalComments / totalPosts : 0;

  return (
    <div className="space-y-4 text-sm text-[#1E2A3B]">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-[#F0F4FA] overflow-hidden">
          {athlete.image ? (
            <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">N/A</div>
          )}
        </div>
        <div>
          <div className="text-base font-semibold text-[#0F1D2E]">{athlete.name}</div>
          <div className="text-xs text-[#5B6B82]">{formatTeamName(athlete.sport)} {athlete.position ? `• ${athlete.position}` : ''}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>Likes: {formatNumber(athlete.totalLikes)}</div>
        <div>Comments: {formatNumber(athlete.totalComments)}</div>
        <div>Avg ER: {formatPercent(athlete.avgEngagementRate * 100)}</div>
        <div>Posts: {formatNumber(athlete.totalPosts)}</div>
        <div>IG Posts: {formatNumber(athlete.instagramPosts)}</div>
        <div>TT Posts: {formatNumber(athlete.tiktokPosts)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[#5B6B82]">IG vs TikTok share</div>
          <div className="text-sm">IG {formatPercent(igShare)} / TT {formatPercent(ttShare)}</div>
        </div>
        <div>
          <div className="text-xs text-[#5B6B82]">Per post</div>
          <div className="text-sm">Likes {formatNumber(likesPerPost)} • Comments {formatNumber(commentsPerPost)}</div>
        </div>
      </div>
    </div>
  );
}

function VirtualizedTable({
  rows,
  rowHeight,
  height,
  renderRow,
  header
}: {
  rows: UCLAAthlete[];
  rowHeight: number;
  height: number;
  renderRow: (row: UCLAAthlete) => React.ReactNode;
  header: React.ReactNode;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 4);
  const endIndex = Math.min(rows.length, startIndex + Math.ceil(height / rowHeight) + 8);
  const visibleRows = rows.slice(startIndex, endIndex);

  return (
    <GlassPanel className="overflow-hidden">
      <div className="overflow-auto" style={{ height }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <table className="w-full">
          <thead className="bg-[#F3F6FB] sticky top-0">
            {header}
          </thead>
          <tbody>
            <tr style={{ height: startIndex * rowHeight }}>
              <td colSpan={7} />
            </tr>
            {visibleRows.map(renderRow)}
            <tr style={{ height: (rows.length - endIndex) * rowHeight }}>
              <td colSpan={7} />
            </tr>
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}
