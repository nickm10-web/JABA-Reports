import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Heart,
  MessageCircle,
  Play,
  TrendingUp,
  User,
} from 'lucide-react';

interface MonsterMaxxReportMockProps {
  onBack?: () => void;
}

type OverviewCard = {
  label: string;
  value: string;
  icon: 'posts' | 'user' | 'likes' | 'comments' | 'trend';
};

type MetricRow = {
  post: string;
  account: string;
  type: string;
  date: string;
  likes: string;
  comments: string;
  engagement: string;
};

type GridPost = {
  id: number;
  label: string;
  format: string;
  date: string;
  likes: string;
  comments: string;
  engagement: string;
  image: string;
  href: string;
  isVideo?: boolean;
};

type FitMetric = {
  label: string;
  score: number;
  note: string;
};

type VoiceAnalysisRow = {
  post: string;
  caption: string;
  signal: string;
  score: string;
  takeaway: string;
};

type Recommendation = {
  title: string;
  format: string;
  concept: string;
  whyItWorks: string;
};

type BenchmarkPost = {
  label: string;
  engagement: number;
  percentile: number;
  rank: number;
};

type BenchmarkThreshold = {
  label: string;
  value: string;
};

type BenchmarkAthlete = {
  rank: number;
  name: string;
  sport: string;
  posts: number;
  engagement: number;
  isMaxx?: boolean;
};

const accent = '#9AE600';

const overviewCards: OverviewCard[] = [
  { label: 'Collab Posts Detected', value: '5', icon: 'posts' },
  { label: 'Avg Likes', value: '6.9K', icon: 'likes' },
  { label: 'Avg Comments', value: '94', icon: 'comments' },
  { label: 'Avg Engagement', value: '7.0K', icon: 'trend' },
];

const engagementBars: Array<{ label: string; maxx: number | null }> = [
  { label: 'Post 1', maxx: null },
  { label: 'Post 2', maxx: 15.1 },
  { label: 'Post 3', maxx: 11.6 },
  { label: 'Post 4', maxx: 5.7 },
  { label: 'Post 5', maxx: 2.5 },
];

const commentTrend: Array<number | null> = [51, 225, 76, 76, 41];

const metricRows: MetricRow[] = [
  { post: 'Post 1', account: 'Maxx Crosby', type: 'Video', date: 'Jul 8, 2025', likes: 'Hidden', comments: '51', engagement: 'Hidden' },
  { post: 'Post 2', account: 'Monster Energy', type: 'Video', date: 'Aug 20, 2025', likes: '14,845', comments: '225', engagement: '15,070' },
  { post: 'Post 3', account: 'Monster Energy', type: 'Carousel', date: 'Aug 21, 2025', likes: '11,503', comments: '76', engagement: '11,579' },
  { post: 'Post 4', account: 'Maxx Crosby', type: 'Video', date: 'Aug 22, 2025', likes: '5,654', comments: '76', engagement: '5,730' },
  { post: 'Post 5', account: 'Maxx Crosby', type: 'Video', date: 'May 4, 2026', likes: '2,431', comments: '41', engagement: '2,472' },
];

const gridPosts: GridPost[] = [
  {
    id: 1,
    label: 'Sack Summit 2025 was DIFFERENT!',
    format: 'Video',
    date: 'Jul 8, 2025',
    likes: 'Hidden',
    comments: '51',
    engagement: 'Hidden',
    image:
      'https://scontent-ord5-3.cdninstagram.com/v/t51.82787-15/517353863_17955519437970359_7166339081307153058_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=100&ig_cache_key=MzY3MjI2OTY3OTI1MTU0OTM0OTE3OTU1NTE5NDMxOTcwMzU5.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjEzMjAuc2RyLnZpZGVvX2RlZmF1bHRfY292ZXJfZnJhbWUuQzMifQ%3D%3D&_nc_ohc=wWAOAD_BdSMQ7kNvwH_4FKV&_nc_oc=Adp-kixx58kikHEm6k_FXqSVQUxTNpxpnHoWc6NlLKGp82P_ATu9a3lA4o13i42RUig5AmXIiGHdbNshkVcg_aKT&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_gid=Pe1a4bzoSGNKkQta8HmPWg&_nc_ss=7a22e&oh=00_Af4frRGFJ8sXAztUmfj4eTy_8TA-zNqXVLWe32Llg5ACTw&oe=6A01C9AE',
    href: 'https://www.instagram.com/p/DL2hdEXOeyl/',
    isVideo: true,
  },
  {
    id: 2,
    label: 'Legend in the making...',
    format: 'Video',
    date: 'Aug 20, 2025',
    likes: '14.8K',
    comments: '225',
    engagement: '15.1K',
    image:
      'https://scontent-ord5-2.cdninstagram.com/v/t51.82787-15/536443018_18537672349061745_2534960173875829680_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=104&ig_cache_key=MzcwMzQ0NzA1MjkyODUyMzYzMzE4NTM3NjcyMzQ2MDYxNzQ1.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjIyNDcuc2RyLnZpZGVvX2RlZmF1bHRfY292ZXJfZnJhbWUuQzMifQ%3D%3D&_nc_ohc=Yu-8z5mkrXYQ7kNvwEQUuMN&_nc_oc=AdrZ3x1ou4vHhhPyXicmfCm816J8X3_8aOkNnJDGtLYa4-7fn9mbZyp5SLIdsu2k5Rjsu6L5GrVRsfnc30X6eRki&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_gid=Pe1a4bzoSGNKkQta8HmPWg&_nc_ss=7a22e&oh=00_Af4Cl0FhjI85Vrou5g98OlSKd287oLclB0oZoeKWc6TSew&oe=6A01F20E',
    href: 'https://www.instagram.com/p/DNlSXkSRZ1x/',
    isVideo: true,
  },
  {
    id: 3,
    label: 'CHARGED UP',
    format: 'Carousel',
    date: 'Aug 21, 2025',
    likes: '11.5K',
    comments: '76',
    engagement: '11.6K',
    image:
      'https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/535941213_18537836131061745_1212052493355259403_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=MzcwNDE3Mzg4MDA2ODcwOTI1Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Y1W28afOQIgQ7kNvwEf4Lry&_nc_oc=AdqMVzX4zlxcetFN6amOI_BBI-5uXQkraJCPXurvMCcVewXuHVvFIfJ6QevVJ2oKj8xyCfieK6Dn0PfqySQhihcd&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_gid=Pe1a4bzoSGNKkQta8HmPWg&_nc_ss=7a22e&oh=00_Af5hoHB58oI2PII2a_zjdc6IOsllZcyK0l4IXrywXvEPtA&oe=6A01E50C',
    href: 'https://www.instagram.com/p/DNn3oYvxVG9/',
  },
  {
    id: 4,
    label: 'Behind-the-scenes with @MonsterEnergy',
    format: 'Video',
    date: 'Aug 22, 2025',
    likes: '5.7K',
    comments: '76',
    engagement: '5.7K',
    image: '/monster-maxx/real/post-2025-08-22.jpg',
    href: 'https://www.instagram.com/p/DNqbIvJRwc_/',
    isVideo: true,
  },
  {
    id: 5,
    label: 'Race weekend in the books.',
    format: 'Video',
    date: 'May 4, 2026',
    likes: '2.4K',
    comments: '41',
    engagement: '2.5K',
    image: '/monster-maxx/real/post-2026-05-04.jpg',
    href: 'https://www.instagram.com/p/DX7s242yxiN/',
    isVideo: true,
  },
];

const fitMetrics: FitMetric[] = [
  {
    label: 'Voice Match',
    score: 78,
    note: 'Best when Maxx sounds conversational or recap-driven. Weakens when copy reads like a roster announcement.',
  },
  {
    label: 'Brand Naturalness',
    score: 72,
    note: 'Monster fits most naturally inside event recap and behind-the-scenes language, less so in overtly branded phrasing.',
  },
  {
    label: 'Promo Pressure',
    score: 38,
    note: 'Lower is better here. The strongest posts avoid hard CTA language and keep the brand embedded in the moment.',
  },
];

const voiceAnalysisRows: VoiceAnalysisRow[] = [
  {
    post: 'Post 1',
    caption: '“Sack Summit 2025 was DIFFERENT! ... Major shoutout to our sponsors for making this the best one yet.”',
    signal: 'Sponsor thank-you cluster',
    score: 'Medium',
    takeaway: 'Still sounds like Maxx, but the Monster tie-in sits inside a broader sponsor recap rather than the center of the story.',
  },
  {
    post: 'Post 2',
    caption: '“Legend in the making, and the newest addition to the #MonsterEnergy roster. Let’s get it, @MaxxCrosby.”',
    signal: 'Monster-owned roster announcement',
    score: '',
    takeaway: '',
  },
  {
    post: 'Post 3',
    caption: '“C H A R G E D  U P @MaxxCrosby #MonsterEnergy”',
    signal: 'Monster hype caption',
    score: '',
    takeaway: '',
  },
  {
    post: 'Post 4',
    caption: '“Behind-the-scenes with @MonsterEnergy.”',
    signal: 'Behind-the-scenes framing',
    score: 'High',
    takeaway: 'Short, native, and easy to believe. This is one of the cleaner examples of brand presence without over-explaining it.',
  },
  {
    post: 'Post 5',
    caption: '“Race weekend in the books... @MonsterEnergy clubhouse was a movie. Miami Maxx OUT.”',
    signal: 'Event recap in Maxx tone',
    score: 'High',
    takeaway: 'Feels most athlete-owned because Monster is part of the story, not the entire story.',
  },
];

const benchmarkPosts: BenchmarkPost[] = [
  { label: 'Aug 20 · Roster Reveal', engagement: 15070, percentile: 54, rank: 230 },
  { label: 'Aug 21 · “CHARGED UP”', engagement: 11579, percentile: 42, rank: 289 },
];

const benchmarkThresholds: BenchmarkThreshold[] = [
  { label: 'P25', value: '8.2K' },
  { label: 'Median', value: '13.9K' },
  { label: 'P75', value: '26.7K' },
  { label: 'P90', value: '54.4K' },
];

const benchmarkTotalPosts = 500;

const benchmarkTopPosts: Array<{ rank: number; date: string; shortcode: string; engagement: number; label: string }> = [
  { rank: 1, date: 'Sep 27, 2025', shortcode: 'DPHgI2EDK5z', engagement: 1970678, label: 'V8 Hayabusa mini-truck wheelies at LZ World Tour' },
  { rank: 2, date: 'Mar 2, 2026', shortcode: 'DVZRdOrjDeO', engagement: 799646, label: 'Mega day in Sweden with the Solbergs (rally)' },
  { rank: 3, date: 'Jan 4, 2026', shortcode: 'DTGMeq6Eaqc', engagement: 763150, label: 'Ben Richards FMX big-air extension' },
];

const formatEngagementShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
};

const athleteLeaderboard: BenchmarkAthlete[] = [
  { rank: 1, name: 'Axell Hodges', sport: 'FMX', posts: 6, engagement: 47797 },
  { rank: 2, name: 'Alex Pereira', sport: 'MMA', posts: 2, engagement: 42058 },
  { rank: 3, name: 'Justin Gaethje', sport: 'MMA', posts: 2, engagement: 33154 },
  { rank: 4, name: 'Dangerboy Deegan', sport: 'Motocross', posts: 9, engagement: 28989 },
  { rank: 5, name: 'Marc Marquez', sport: 'MotoGP', posts: 8, engagement: 27185 },
  { rank: 6, name: 'Nyjah Huston', sport: 'Skate', posts: 8, engagement: 23576 },
  { rank: 7, name: 'Lando Norris', sport: 'F1', posts: 7, engagement: 21788 },
  { rank: 8, name: 'Cole Davies', sport: 'Motocross', posts: 6, engagement: 17196 },
  { rank: 9, name: 'Lotte van Drunen', sport: 'Motocross', posts: 5, engagement: 16285 },
  { rank: 10, name: 'Vaughn Gittin Jr', sport: 'Drift', posts: 5, engagement: 15808 },
  { rank: 16, name: 'Maxx Crosby', sport: 'NFL', posts: 2, engagement: 13324, isMaxx: true },
];

const recommendations: Recommendation[] = [
  {
    title: 'No Off Switch',
    format: '15-20 sec reel, fast cuts',
    concept: 'Split-screen or rapid transitions showing Maxx’s intensity in three places: film room at 6AM (Monster on desk), weight room mid-lift (can in frame), game day pass rush. Text overlay: “some people have an off switch” [cut to Maxx] “I don’t” [Monster logo].',
    whyItWorks: 'Monster’s brand is about energy and relentlessness. Maxx’s motor is his signature trait. This is the most natural fit possible. His identity IS their product benefit.',
  },
  {
    title: 'Unleash the Chaos',
    format: '30 sec reel, POV + game footage mashup',
    concept: 'Opens with Maxx cracking open a Monster (tight shot, you hear the hiss). Cut to helmet cam POV of him running out of the tunnel. Then splice in his most violent pass rush moments: sacks, pressures, QB hits, synced to heavy bass. End card: “Chaos is a lifestyle. @monsterenergy”',
    whyItWorks: 'Taps into Monster’s extreme sports aesthetic. Maxx’s playing style is chaotic, violent, uncontrollable. Exactly what Monster wants associated with their brand. Visceral and shareable.',
  },
  {
    title: 'Fuel the Grind (Sobriety Angle)',
    format: '45-60 sec reel, more narrative',
    concept: 'Maxx voice-over about what fuels him now vs. what used to. Show him training, studying film, recovery work. “Used to look for energy in the wrong places. Now I find it in the work.” Monster cans placed naturally throughout: gym bag, locker, film room. Not a hard sell, just present. End with him on field, text: “Find your fuel. @monsterenergy”',
    whyItWorks: 'This is the differentiated play. Maxx’s sobriety story is powerful and unique in the NFL. Monster can own the “clean energy” narrative in a way that feels real to him. It’s brand integration that actually means something because it connects to his actual journey.',
  },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="text-[14px] font-black uppercase tracking-[0.08em]" style={{ color: accent }}>
        {title}
      </h2>
      <div className="h-px flex-1 bg-white/10" />
      <div className="h-2 w-6 skew-x-[-28deg]" style={{ backgroundColor: accent }} />
    </div>
  );
}

function IconFor({ kind }: { kind: OverviewCard['icon'] }) {
  const common = 'h-4 w-4';
  switch (kind) {
    case 'posts':
      return <MessageCircle className={common} />;
    case 'user':
      return <User className={common} />;
    case 'likes':
      return <Heart className={common} />;
    case 'comments':
      return <MessageCircle className={common} />;
    case 'trend':
      return <TrendingUp className={common} />;
  }
}

function OverviewMetric({ card }: { card: OverviewCard }) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-[#171717] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-5 sm:py-4">
      <div className="flex items-center gap-2 text-[#9AE600]">
        <IconFor kind={card.icon} />
      </div>
      <p className="mt-2 text-[11px] leading-4 text-white/80">{card.label}</p>
      <p className="mt-1 text-[16px] font-black tracking-tight text-white sm:text-[18px]">{card.value}</p>
    </div>
  );
}

function EngagementChart() {
  const maxValue = 16;
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-black uppercase tracking-[0.06em] text-white">Engagement By Post</p>
        <div className="flex items-center gap-4 text-[11px] text-white/70">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#9AE600]" />Maxx Crosby</div>
        </div>
      </div>
      <div className="grid h-[210px] grid-cols-5 items-end gap-4">
        {engagementBars.map((item) => (
          <div key={item.label} className="flex h-full flex-col justify-end">
            <div className="mb-2 flex items-end justify-center">
              <div className="flex w-10 flex-col items-center">
                <span className="mb-1 text-[10px] font-bold text-white">{item.maxx === null ? 'Hidden' : `${item.maxx}K`}</span>
                <div className="w-full rounded-t-sm bg-[#9AE600]" style={{ height: `${item.maxx === null ? 2 : (item.maxx / maxValue) * 150}px` }} />
              </div>
            </div>
            <p className="text-center text-[11px] text-white/70">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentsChart() {
  const width = 520;
  const height = 170;
  const max = 240;
  const padX = 28;
  const step = (width - padX * 2) / (commentTrend.length - 1);
  const valueToY = (value: number | null) => height - (Math.max(0.18, (value ?? 0) / max) * 130);
  const pts = commentTrend.map((v, i) => `${padX + i * step},${valueToY(v)}`).join(' ');
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-black uppercase tracking-[0.06em] text-white">Comments By Post</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" y1={20 + i * 35} x2={width} y2={20 + i * 35} stroke="rgba(255,255,255,0.08)" />
        ))}
        <polyline points={pts} fill="none" stroke="#9AE600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {commentTrend.map((v, i) => (
          <g key={i}>
            <circle cx={padX + i * step} cy={valueToY(v)} r="5" fill="#9AE600" />
            <text x={padX + i * step} y={valueToY(v) - 12} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
              {v}
            </text>
            <text x={padX + i * step} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="11">
              {`Post ${i + 1}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function PostGridCard({ post }: { post: GridPost }) {
  return (
    <a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-[22px] border border-white/10 bg-[#121212] transition hover:-translate-y-0.5 hover:border-[#9AE600]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[linear-gradient(180deg,#1a1a1a,#111111)]">
        <img
          src={post.image}
          alt={post.label}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.08)_35%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom,rgba(154,230,0,0.18),transparent_62%)]" />
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#9AE600] text-[13px] font-black text-black shadow-[0_6px_18px_rgba(154,230,0,0.25)]">
          {post.id}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/88 backdrop-blur-sm">
            {post.date}
          </span>
          <div className="rounded-full border border-white/15 bg-black/45 p-2 text-white backdrop-blur-sm">
            {post.isVideo ? <Play className="h-3.5 w-3.5 fill-white" /> : <ExternalLink className="h-3.5 w-3.5" />}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="max-w-[78%]">
              <p className="line-clamp-2 text-[19px] font-black leading-[1.02] tracking-[-0.02em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                {post.label}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#9AE600]/30 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.09em] text-[#b4f636] backdrop-blur-sm">
              {post.format}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/42">Likes</p>
            <div className="mt-1 flex items-center gap-2 text-[14px] font-black text-white">
              <Heart className="h-4 w-4 text-white/72" />
              {post.likes}
            </div>
          </div>
          <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/42">Comments</p>
            <div className="mt-1 flex items-center gap-2 text-[14px] font-black text-white">
              <MessageCircle className="h-4 w-4 text-white/72" />
              {post.comments}
            </div>
          </div>
          <div className="rounded-[14px] border border-[#9AE600]/20 bg-[#9AE600]/[0.06] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#b4f636]/75">Engagement</p>
            <div className="mt-1 text-[14px] font-black text-[#d9ff86]">{post.engagement}</div>
          </div>
        </div>
      </div>
    </a>
  );
}

function FitMetricCard({ item }: { item: FitMetric }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#121212] p-4">
      <div className="flex items-end justify-between gap-3">
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-white/62">{item.label}</p>
        <p className="text-[26px] font-black tracking-[-0.03em]" style={{ color: accent }}>
          {item.score}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#9AE600,#6FB000)]"
          style={{ width: `${item.score}%` }}
        />
      </div>
      <p className="mt-3 text-[13px] leading-6 text-white/82">{item.note}</p>
    </div>
  );
}

function AthleteLeaderboardRow({ row, maxValue }: { row: BenchmarkAthlete; maxValue: number }) {
  const isMaxx = row.isMaxx;
  return (
    <div
      className={`grid grid-cols-[28px_1fr_92px_60px] items-center gap-3 rounded-[10px] px-2 py-2 ${
        isMaxx ? 'border border-[#9AE600]/40 bg-[#9AE600]/[0.06]' : ''
      }`}
    >
      <div className={`text-[11px] font-black ${isMaxx ? 'text-[#9AE600]' : 'text-white/50'}`}>{row.rank}</div>
      <div className="min-w-0">
        <p className={`truncate text-[13px] ${isMaxx ? 'font-black text-white' : 'font-bold text-white/88'}`}>{row.name}</p>
        <p className="text-[10px] text-white/45">{`${row.sport} · ${row.posts} posts`}</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{ width: `${(row.engagement / maxValue) * 100}%`, backgroundColor: isMaxx ? '#d9ff86' : '#9AE600' }}
        />
      </div>
      <div className={`text-right text-[12px] font-black ${isMaxx ? 'text-[#9AE600]' : 'text-white'}`}>
        {`${(row.engagement / 1000).toFixed(1)}K`}
      </div>
    </div>
  );
}

function BenchmarkDistributionBar() {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#121212] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-black uppercase tracking-[0.06em] text-white">Maxx vs Full Monster Feed</p>
          <p className="mt-1 text-[11px] text-white/55">Last {benchmarkTotalPosts} @monsterenergy posts, ranked by engagement</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative h-12">
          <div className="absolute inset-y-[18px] left-0 right-0 rounded-full bg-[linear-gradient(90deg,rgba(154,230,0,0.12),rgba(154,230,0,0.55))]" />
          {[25, 50, 75, 90].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-px bg-white/15"
              style={{ left: `${pct}%` }}
            />
          ))}
          {benchmarkPosts.map((post) => (
            <div
              key={post.label}
              className="absolute top-1 flex flex-col items-center"
              style={{ left: `${post.percentile}%`, transform: 'translateX(-50%)' }}
              title={`${post.label} · ${post.engagement.toLocaleString()} engagement`}
            >
              <div className="h-10 w-3 rounded-full border-2 border-[#0b0b0b]" style={{ backgroundColor: accent }} />
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-4 text-[10px] font-bold uppercase tracking-[0.06em] text-white/55">
          {[
            { pct: 25, label: 'P25' },
            { pct: 50, label: 'Median' },
            { pct: 75, label: 'P75' },
            { pct: 90, label: 'P90' },
          ].map((tick) => (
            <div key={tick.pct} className="absolute" style={{ left: `${tick.pct}%`, transform: 'translateX(-50%)' }}>
              {tick.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {benchmarkPosts.map((post) => (
          <div key={post.label} className="flex items-center justify-between gap-4 rounded-[14px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">{post.label}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-[0.06em]" style={{ color: accent }}>
                {`${post.percentile}th percentile · rank ${post.rank} of ${benchmarkTotalPosts}`}
              </p>
            </div>
            <p className="shrink-0 text-[24px] font-black tracking-[-0.02em] text-white">
              {post.engagement.toLocaleString()}
              <span className="ml-1 text-[11px] font-bold text-white/55">eng.</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {benchmarkThresholds.map((t) => (
          <div key={t.label} className="rounded-[10px] border border-white/8 bg-white/[0.02] px-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">{t.label}</p>
            <p className="mt-1 text-[13px] font-black text-white">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[14px] border border-white/8 bg-white/[0.02] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">Top of the feed, for reference</p>
        <div className="mt-3 space-y-2.5">
          {benchmarkTopPosts.map((post) => (
            <div key={post.shortcode} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#9AE600]/30 bg-[#9AE600]/[0.08] text-[11px] font-black" style={{ color: accent }}>
                  {post.rank}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black leading-5 text-white">{post.label}</p>
                  <p className="text-[10px] text-white/45">{`${post.date} · ${post.shortcode}`}</p>
                </div>
              </div>
              <p className="shrink-0 text-[15px] font-black" style={{ color: accent }}>
                {formatEngagementShort(post.engagement)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-white/55">
          Monster’s top tier is built on extreme stunts and motorsports moments, not athlete partnerships. Top 3 posts run 50 to 130 times Maxx’s engagement. Even P90 sits roughly 4 times above his stronger post.
        </p>
      </div>
    </div>
  );
}

function AthleteLeaderboardCard() {
  const maxValue = Math.max(...athleteLeaderboard.map((a) => a.engagement));
  const topTen = athleteLeaderboard.filter((a) => !a.isMaxx);
  const maxx = athleteLeaderboard.find((a) => a.isMaxx);
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#121212] p-5">
      <p className="text-[13px] font-black uppercase tracking-[0.06em] text-white">Athlete Leaderboard</p>
      <p className="mt-1 text-[11px] text-white/55">Avg engagement per @monsterenergy post (top 10 + Maxx)</p>
      <div className="mt-4 space-y-1.5">
        {topTen.map((row) => (
          <AthleteLeaderboardRow key={row.name} row={row} maxValue={maxValue} />
        ))}
        <div className="flex items-center gap-3 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
          <div className="h-px flex-1 bg-white/8" />
          ranks 11 – 15
          <div className="h-px flex-1 bg-white/8" />
        </div>
        {maxx ? <AthleteLeaderboardRow key={maxx.name} row={maxx} maxValue={maxValue} /> : null}
      </div>
      <p className="mt-4 text-[11px] leading-5 text-white/50">
        Sample sizes vary. Combat-sports leaders (Pereira, Gaethje) anchor on single big-moment title fights; action-sports leaders (Hodges, Deegan, Marquez, Nyjah) draw from steady high-volume coverage.
      </p>
    </div>
  );
}

export function MonsterMaxxReportMock({ onBack }: MonsterMaxxReportMockProps) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
          <div className="relative">
            <img src="/monster-maxx/maxx-header.png" alt="Maxx Crosby" className="h-[230px] w-full object-cover sm:h-[290px]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_34%,rgba(0,0,0,0.62)_55%,rgba(0,0,0,0.88)_100%)]" />
            <div className="absolute inset-y-0 left-0 w-24 bg-[radial-gradient(circle_at_left,rgba(154,230,0,0.24),transparent_68%)]" />
            <div className="absolute inset-y-0 right-0 w-36 bg-[radial-gradient(circle_at_right,rgba(154,230,0,0.22),transparent_66%)]" />

            <div className="absolute inset-0 flex items-center">
              <div className="grid w-full gap-4 px-5 sm:grid-cols-[1fr_150px] sm:px-8">
                <div className="self-center">
                  <h1 className="text-[34px] font-black uppercase leading-[0.9] tracking-[-0.03em] text-white sm:text-[58px]">
                    Maxx Crosby x
                    <span className="block italic" style={{ color: accent }}>
                      Monster Energy
                    </span>
                  </h1>
                  <p className="mt-3 text-[18px] font-black uppercase tracking-[0.04em] text-white">Campaign Performance Report</p>
                </div>
                <div className="hidden items-center justify-end sm:flex">
                  <img src="/monster-maxx/monster-logo.png" alt="Monster Energy logo" className="h-[138px] w-auto object-contain opacity-95" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <SectionHeader title="Campaign Overview" />
            <div className="grid items-center gap-3 lg:grid-cols-4">
              {overviewCards.map((card) => (
                <OverviewMetric key={card.label} card={card} />
              ))}
            </div>

            <div className="mt-6">
              <SectionHeader title="Post Performance" />
              <div className="grid gap-4 lg:grid-cols-2">
                <EngagementChart />
                <CommentsChart />
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Campaign Metrics" />
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#121212]">
                <div className="grid grid-cols-7 gap-3 border-b border-white/10 px-4 py-3 text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>
                  <div>Post</div>
                  <div>Account</div>
                  <div>Type</div>
                  <div>Date</div>
                  <div>Likes</div>
                  <div>Comments</div>
                  <div>Engagement</div>
                </div>
                {metricRows.map((row) => (
                  <div key={`${row.post}-${row.account}`} className="grid grid-cols-7 gap-3 border-b border-white/8 px-4 py-3 text-[13px] text-white/88 last:border-b-0">
                    <div>{row.post}</div>
                    <div>{row.account}</div>
                    <div>{row.type}</div>
                    <div>{row.date}</div>
                    <div>{row.likes}</div>
                    <div>{row.comments}</div>
                    <div className="font-black" style={{ color: accent }}>{row.engagement}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Post Grid" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {gridPosts.map((post) => (
                  <PostGridCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Caption Fit Analysis" />
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#121212]">
                <div className="grid grid-cols-[0.65fr_1.5fr_1fr_0.65fr_1.5fr] gap-3 border-b border-white/10 px-4 py-3 text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>
                  <div>Post</div>
                  <div>Caption</div>
                  <div>Voice Signal</div>
                  <div>Match</div>
                  <div>Takeaway</div>
                </div>
                {voiceAnalysisRows.map((row) => (
                  <div key={row.post} className="grid grid-cols-[0.65fr_1.5fr_1fr_0.65fr_1.5fr] gap-3 border-b border-white/8 px-4 py-4 text-[13px] text-white/88 last:border-b-0">
                    <div className="font-black text-white">{row.post}</div>
                    <div className="leading-6 text-white/74">{row.caption}</div>
                    <div>{row.signal}</div>
                    <div className="font-black" style={{ color: accent }}>{row.score}</div>
                    <div className="leading-6 text-white/82">{row.takeaway}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Benchmark" />
              <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                <BenchmarkDistributionBar />
                <AthleteLeaderboardCard />
              </div>
              <div className="mt-4 rounded-[22px] border border-[#9AE600]/25 bg-[linear-gradient(135deg,rgba(154,230,0,0.08),rgba(154,230,0,0.02))] p-5">
                <p className="text-[12px] font-black uppercase tracking-[0.08em]" style={{ color: accent }}>
                  Strategic Read
                </p>
                <p className="mt-2 text-[15px] leading-7 text-white/92">
                  Monster’s handle isn’t the lift surface for this partnership. Across 500 posts, Maxx lands at the median. Not a flop, but nowhere near the top tier. Their audience is action-sports-native and rewards big-moment combat-sports content, not NFL roster reveals. The recommendations below focus on Maxx’s own account because that’s where this collab actually compounds.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Creator Studio Recommendations" />
              <div className="mb-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-[#121212] p-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.08em]" style={{ color: accent }}>
                    Maxx Voice Model Notes
                  </p>
                  <div className="mt-3 space-y-2 text-[14px] leading-6 text-white/84">
                    <p>Median caption length is short at roughly 80 characters, and half of his recent captions stay under that range.</p>
                    <p>He uses hashtags lightly, averages under one per caption, and sounds strongest when the copy feels like a statement or recap rather than a campaign script.</p>
                    <p>Recurring cues include grit, reset, edge, presence, and simple emotional punctuation through emojis like `🦅`, `🖤`, `💎`, and `💪`.</p>
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-[#121212] p-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.08em]" style={{ color: accent }}>
                    Monster Voice Model Notes
                  </p>
                  <div className="mt-3 space-y-2 text-[14px] leading-6 text-white/84">
                    <p>Monster tends to write medium-length hype copy with more hashtags and more overt brand framing than Maxx naturally uses.</p>
                    <p>Its strongest pattern is event energy, crew access, roster announcements, and action-first language that feels fast and amplified.</p>
                    <p>The best overlap with Maxx is intensity, environment, and momentum. The weakest overlap is heavy sponsor phrasing or stacked hashtag language.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {recommendations.map((item, index) => (
                  <div key={item.title} className="rounded-[18px] border border-white/10 bg-[#121212] p-4">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#9AE600]/60 bg-[#9AE600]/12 text-[#9AE600]">
                      {index === 0 ? <Heart className="h-5 w-5" /> : index === 1 ? <BarChart3 className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-black text-white">{item.title}</p>
                      <span className="rounded-full border border-[#9AE600]/25 bg-[#9AE600]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#b4f636]">
                        {item.format}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-6 text-white/86">{item.concept}</p>
                    <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-[13px] leading-6">
                      <p><span className="font-black text-white">Why it works:</span> <span className="text-white/78">{item.whyItWorks}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="AI Insights" />
              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  'The highest-performing collaboration post leaned into clear announcement framing, but it sounded less like Maxx than the strongest native-feeling recap posts.',
                  'Shorter BTS and event-recap captions produced the best balance of authenticity and brand visibility, which is the better long-term lane for this partnership.',
                  'Monster performs best here when it behaves like part of Maxx’s environment, not when the caption reads like brand copy pasted onto his page.',
                ].map((item, index) => (
                  <div key={item} className="rounded-[18px] border border-white/10 bg-[#121212] p-4">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#9AE600]/60 bg-[#9AE600]/12 text-[#9AE600]">
                      {index === 0 ? <Heart className="h-5 w-5" /> : index === 1 ? <BarChart3 className="h-5 w-5" /> : index === 2 ? <Play className="h-5 w-5 fill-current" /> : <User className="h-5 w-5" />}
                    </div>
                    <p className="text-[14px] leading-6 text-white/92">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
