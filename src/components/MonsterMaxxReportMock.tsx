import {
  ArrowLeft,
  BarChart3,
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

const likeTrend: Array<number | null> = [null, 14.8, 11.5, 5.7, 2.4];
const commentTrend: Array<number | null> = [51, 225, 76, 76, 41];

const metricRows: MetricRow[] = [
  { post: 'Post 1', account: 'Maxx Crosby', type: 'Video', date: 'Jul 8, 2025', likes: 'Hidden', comments: '51', engagement: 'Hidden' },
  { post: 'Post 2', account: 'Maxx Crosby', type: 'Video', date: 'Aug 20, 2025', likes: '14,845', comments: '225', engagement: '15,070' },
  { post: 'Post 3', account: 'Maxx Crosby', type: 'Carousel', date: 'Aug 21, 2025', likes: '11,503', comments: '76', engagement: '11,579' },
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
      className="block overflow-hidden rounded-[18px] border border-white/12 bg-[#131313] transition hover:border-[#9AE600]/50 hover:shadow-[0_0_0_1px_rgba(154,230,0,0.2)]"
    >
      <div className="relative aspect-[1.48/1] bg-[linear-gradient(180deg,#1a1a1a,#111111)]">
        <img src={post.image} alt={post.label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-md bg-[#9AE600] text-[13px] font-black text-black">
          {post.id}
        </div>
        {post.isVideo ? (
          <div className="absolute right-3 top-3 rounded-md bg-black/55 p-1.5 text-white">
            <Play className="h-4 w-4 fill-white" />
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-black text-white">{post.label}</p>
            <p className="mt-1 text-[12px] text-white/55">{post.date}</p>
          </div>
          <span className="rounded-md bg-[#232323] px-2 py-1 text-[11px] font-bold text-white/70">
            {post.format}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-5 text-[13px] text-white/85">
          <div className="flex items-center gap-2"><Heart className="h-4 w-4" />{post.likes}</div>
          <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />{post.comments}</div>
        </div>
        <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#9AE600]">
          Engagement {post.engagement}
        </div>
      </div>
    </a>
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
              <SectionHeader title="Athlete Benchmark" />
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#121212] p-4">
                <div className="grid gap-3 lg:grid-cols-[1.7fr_0.8fr_0.7fr_0.9fr_2fr]">
                  <div className="text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>Athlete</div>
                  <div className="text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>Posts</div>
                  <div className="text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>Avg Likes</div>
                  <div className="text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: accent }}>Engagement</div>
                  <div />
                </div>
                {[
                  ['Maxx Crosby', '5', '6.9K', '7.0K', 100],
                  ['Rob Gronkowski', 'Pending scrape', '—', '—', 0],
                  ['Alex Pereira', 'Pending scrape', '—', '—', 0],
                  ['Justin Gaethje', 'Pending scrape', '—', '—', 0],
                ].map(([label, result, base, delta, width]) => (
                  <div key={label} className="grid items-center gap-3 border-t border-white/8 py-4 lg:grid-cols-[1.7fr_0.8fr_0.7fr_0.9fr_2fr]">
                    <div className="text-[14px] text-white/92">{label}</div>
                    <div className="text-[14px] text-white">{result}</div>
                    <div className="text-[14px] text-white">{base}</div>
                    <div className="text-[18px] font-black" style={{ color: accent }}>{delta}</div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#9AE600,#6FB000)]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="AI Insights" />
              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  'Four of the five detected collaboration posts are videos, suggesting short-form motion content is the dominant activation format so far.',
                  'The strongest detected collaboration post is the August 20, 2025 Monster roster announcement with 14.8K likes and 225 comments.',
                  'Launch and announcement moments outperformed broader sponsor recap content, which suggests clearer brand linkage is driving the strongest response.',
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
