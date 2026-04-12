import { useState } from 'react';
import { ArrowLeft, Heart, Eye, MessageCircle, ExternalLink, Trophy } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA (from trey_renn_contents.json)
// ═══════════════════════════════════════════════════════════════

const campaignData = {
  brand: {
    name: "Wendy's",
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Wendy%27s_full_logo_2012.svg/1200px-Wendy%27s_full_logo_2012.svg.png',
  },
  school: {
    name: 'Purdue',
    sport: "Men's Basketball",
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png',
  },
  featuredAthlete: {
    name: 'Trey Kaufman-Renn',
    position: 'Forward',
    sport: "Men's Basketball",
    conference: 'Big Ten',
    year: 'Senior',
    image: 'https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1764957828594-Trey_Kaufman-Renn_68f6c2b98f845316214c4133_ProfilePicture.jpg',
  },
  metrics: {
    totalEngagements: 6214511,
    posts: 2,
    likes: 6001,
    comments: 34,
    videoViews: 6208476,
    totalEmv: 127221.02,
  },
};

const posts = [
  {
    athlete: 'Trey Kaufman-Renn',
    account: '@treykaufmanrenn',
    label: 'Dunk Team Video',
    link: 'https://www.instagram.com/p/DWCBRNyEfiq',
    thumbnail: 'https://storage.googleapis.com/scraper-media-images/18098414707948672',
    mediaType: 'VIDEO' as const,
    likes: 1028,
    comments: 7,
    videoViews: 6208476,
    engagementRate: 0.043,
    emv: 124694.02,
    caption: "It's official: I've joined the Wendy's Dunk Team. Fries + a Frosty is the ultimate dunk. Enter to win prizes in the Dunkstakes by ordering off the Dunk Menu in the Wendy's app.",
    date: 'March 18, 2026',
    hashtags: ['#ad', '#WendysPartner'],
    sponsorPartner: '@wendys',
  },
  {
    athlete: 'Trey Kaufman-Renn',
    account: '@treykaufmanrenn',
    label: 'Fry & Frosty Photo',
    link: 'https://www.instagram.com/p/DV9fZMMlEuc',
    thumbnail: 'https://storage.googleapis.com/scraper-media-images/17979676316989331',
    mediaType: 'PHOTO' as const,
    likes: 4973,
    comments: 27,
    videoViews: 0,
    engagementRate: 0.208,
    emv: 2527.0,
    caption: "The Fry and Frosty combo is elite. This March, every time you order off of the Dunks Menu in the Wendy's app, you're entered to win cool prizes in the Dunkstakes!",
    date: 'March 16, 2026',
    hashtags: ['#ad', '#WendysPartner'],
    sponsorPartner: '@wendys',
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// Purdue brand colors
const PURDUE_GOLD = '#CEB888';
const PURDUE_BLACK = '#000000';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface WendysPurdueCampaignProps {
  onBack?: () => void;
}

export function WendysPurdueCampaign({ onBack }: WendysPurdueCampaignProps) {
  const [athleteImageError, setAthleteImageError] = useState(false);
  const [postImageErrors, setPostImageErrors] = useState<Record<number, boolean>>({});
  const [brandLogoError, setBrandLogoError] = useState(false);
  const [schoolLogoError, setSchoolLogoError] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Hub</span>
          </button>
        )}
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-gray-900">CAMPAIGN</span>
          {' '}
          <span style={{ color: PURDUE_GOLD }} className="italic">OVERVIEW</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* ─── Brand x School Header ─── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shrink-0">
              {!schoolLogoError ? (
                <img
                  src={campaignData.school.logo}
                  alt={campaignData.school.name}
                  className="w-full h-full object-contain"
                  onError={() => setSchoolLogoError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-[#CEB888] flex items-center justify-center">
                  <span className="text-black font-black text-2xl">P</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black uppercase text-gray-900 leading-tight">
                {campaignData.school.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                {campaignData.school.sport}
              </p>
            </div>
          </div>

          <span style={{ color: PURDUE_GOLD }} className="font-black text-2xl sm:text-4xl leading-none select-none shrink-0">✕</span>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shrink-0">
              {!brandLogoError ? (
                <img
                  src={campaignData.brand.logo}
                  alt={campaignData.brand.name}
                  className="w-full h-full object-contain"
                  onError={() => setBrandLogoError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: PURDUE_GOLD }}>
                  <span className="text-white font-black text-lg">W</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black uppercase text-gray-900 leading-tight">
                Wendy&apos;s
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                Dunkstakes Campaign
              </p>
            </div>
          </div>
        </div>

        {/* ─── Featured Athlete ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-lg mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PURDUE_GOLD }}>
            Featured Athlete
          </p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
              {!athleteImageError ? (
                <img
                  src={campaignData.featuredAthlete.image}
                  alt={campaignData.featuredAthlete.name}
                  className="w-full h-full object-cover"
                  onError={() => setAthleteImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                  TKR
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">{campaignData.featuredAthlete.name}</h3>
              <p className="text-sm text-gray-500">
                {campaignData.featuredAthlete.position} · {campaignData.featuredAthlete.sport} · {campaignData.featuredAthlete.year}
              </p>
              <p className="text-xs text-gray-400">{campaignData.school.name} · {campaignData.featuredAthlete.conference}</p>
            </div>
          </div>
        </div>

        {/* ─── Main Metrics Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card - Total Engagements */}
          <div className="md:col-span-1 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PURDUE_BLACK} 0%, #1a1a1a 100%)` }}>
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="dots-w" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.5" fill="white" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots-w)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col justify-center h-full">
              <p className="text-sm uppercase tracking-wider font-semibold text-white/80 mb-2">
                Total Engagements
              </p>
              <p className="text-5xl font-black">{formatNumber(campaignData.metrics.totalEngagements)}</p>
              <p className="text-xs text-white/70 mt-2">Likes, comments, and views combined</p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="# of Posts" value={campaignData.metrics.posts.toString()} />
            <MetricCard label="Likes" value={formatNumber(campaignData.metrics.likes)} />
            <MetricCard label="Comments" value={campaignData.metrics.comments.toString()} />
            <MetricCard label="Video Views" value={formatNumber(campaignData.metrics.videoViews)} />
            <MetricCard label="Est. EMV" value={`$${formatNumber(campaignData.metrics.totalEmv)}`} />
            <MetricCard label="Avg. ER" value="0.13%" />
          </div>
        </div>

        {/* ─── Hero Stat - 6.2M Views ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-6 text-center text-white" style={{ background: `linear-gradient(135deg, ${PURDUE_GOLD} 0%, #B8A070 100%)` }}>
            <p className="text-5xl font-black mb-2">6.2M</p>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Video Views</p>
            <p className="text-xs opacity-75 mt-1">Dunk Team video drove massive reach on Instagram</p>
          </div>
          <div className="rounded-xl p-6 text-center text-white" style={{ background: `linear-gradient(135deg, ${PURDUE_BLACK} 0%, #1a1a1a 100%)` }}>
            <p className="text-5xl font-black mb-2">$127K</p>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Estimated EMV</p>
            <p className="text-xs opacity-75 mt-1">Combined earned media value across both posts</p>
          </div>
        </div>

        {/* ─── Campaign Posts Breakdown ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: PURDUE_BLACK }}>
              Campaign Posts
            </h3>
            <p className="text-sm text-gray-500 mt-1">Side-by-side breakdown of both sponsored posts</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post, i) => (
                <PostCard
                  key={i}
                  post={post}
                  hasError={!!postImageErrors[i]}
                  onError={() => setPostImageErrors(prev => ({ ...prev, [i]: true }))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Post Performance Comparison ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${PURDUE_GOLD} 0%, #B8A070 100%)` }}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: PURDUE_BLACK }}>
                  Post Performance Comparison
                </h3>
                <p className="text-sm text-gray-500">Video vs Photo performance breakdown</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post, i) => (
                <div key={i} className="rounded-xl p-5 bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: i === 0 ? PURDUE_GOLD : PURDUE_BLACK }}
                    >
                      {post.mediaType === 'VIDEO' ? '🎬' : '📷'}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{post.label}</p>
                      <p className="text-xs text-gray-500">{post.date} · {post.mediaType}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Likes</span>
                      <span className="font-bold text-gray-900">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Comments</span>
                      <span className="font-bold text-gray-900">{post.comments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Video Views</span>
                      <span className="font-bold text-gray-900">{post.videoViews > 0 ? formatNumber(post.videoViews) : '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Engagement Rate</span>
                      <span className="font-bold text-gray-900">{(post.engagementRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Est. EMV</span>
                      <span className="font-bold" style={{ color: PURDUE_GOLD }}>${formatNumber(post.emv)}</span>
                    </div>
                  </div>
                  {/* Engagement bar */}
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(post.emv / 124694.02) * 100}%`,
                        background: `linear-gradient(90deg, ${PURDUE_GOLD}, ${PURDUE_BLACK})`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">EMV share: ${formatNumber(post.emv)} of $127K total</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Wendy's Post vs. Average ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${PURDUE_GOLD} 0%, #B8A070 100%)` }}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: PURDUE_BLACK }}>
                  Wendy&apos;s Post vs. Average
                </h3>
                <p className="text-sm text-gray-500">How each sponsored post compared to Trey&apos;s typical performance (51 other posts)</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post, i) => (
                <BaselineCard key={i} post={post} />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Methodology ─── */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Data sourced from Instagram. EMV calculated as (likes × $0.50) + (comments × $1.50) + (views × $0.02). Pull date: April 6, 2026.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function PostCard({
  post,
  hasError,
  onError,
}: {
  post: typeof posts[0];
  hasError: boolean;
  onError: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-[28rem] bg-gray-100 overflow-hidden">
        {!hasError ? (
          <img
            src={post.thumbnail}
            alt={post.label}
            className="w-full h-full object-cover object-center"
            onError={onError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-center">
              <p className="text-gray-500 text-2xl">{post.mediaType === 'VIDEO' ? '🎬' : '📷'}</p>
              <p className="text-gray-500 text-xs mt-1">{post.mediaType}</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
          {post.label}
        </div>
        {post.mediaType === 'VIDEO' && (
          <div className="absolute top-3 right-12 text-white px-2 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: PURDUE_GOLD }}>
            VIDEO
          </div>
        )}
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="p-4">
        <p className="text-sm font-bold mb-1" style={{ color: PURDUE_BLACK }}>{post.account}</p>
        <p className="text-xs text-gray-400 mb-3">{post.date} · {post.hashtags.join(' ')}</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricPill
            icon={<Heart className="w-3.5 h-3.5" />}
            label="Likes"
            value={formatNumber(post.likes)}
          />
          <MetricPill
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Views"
            value={post.videoViews > 0 ? formatNumber(post.videoViews) : '—'}
          />
          <MetricPill
            icon={<MessageCircle className="w-3.5 h-3.5" />}
            label="Comments"
            value={post.comments.toString()}
          />
          <MetricPill
            icon={<span className="text-xs">💰</span>}
            label="EMV"
            value={`$${formatNumber(post.emv)}`}
          />
        </div>
      </div>
    </div>
  );
}

// Trey Kaufman-Renn baseline averages (51 other posts from roster data)
const treyBaseline = {
  postCount: 51,
  avgLikes: 1429,
  avgComments: 54,
  avgViews: 71022,
  avgEmv: 2216.36,
};

function BaselineCard({ post }: { post: typeof posts[0] }) {
  const rows = [
    { label: 'Likes', postVal: post.likes, avgVal: treyBaseline.avgLikes },
    { label: 'Comments', postVal: post.comments, avgVal: treyBaseline.avgComments },
    { label: 'Video Views', postVal: post.videoViews, avgVal: treyBaseline.avgViews },
    { label: 'Est. EMV', postVal: post.emv, avgVal: treyBaseline.avgEmv },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: PURDUE_BLACK }}
        >
          {post.mediaType === 'VIDEO' ? '🎬' : '📷'}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{post.label}</p>
          <p className="text-xs text-gray-500">{post.date} · {post.mediaType}</p>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-3 gap-2 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-400 uppercase">Metric</span>
        <span className="text-xs font-semibold uppercase text-center" style={{ color: PURDUE_GOLD }}>Wendy&apos;s Post</span>
        <span className="text-xs font-semibold text-gray-400 uppercase text-center">Avg ({treyBaseline.postCount} posts)</span>
      </div>

      <div className="space-y-1">
        {rows.map((row) => {
          const postVal = row.postVal;
          const avgVal = row.avgVal;
          const skip = row.label === 'Video Views' && postVal === 0;
          if (skip) return null;

          const pctChange = avgVal > 0 ? ((postVal - avgVal) / avgVal) * 100 : 0;
          const isUp = pctChange > 0;
          const pctStr = `${isUp ? '+' : ''}${pctChange.toFixed(0)}%`;

          return (
            <div key={row.label} className="grid grid-cols-3 gap-2 items-center bg-white rounded-lg px-3 py-2">
              <span className="text-sm text-gray-600 font-medium">{row.label}</span>
              <div className="text-center">
                <span className="text-sm font-bold text-gray-900">
                  {row.label === 'Est. EMV' ? `$${formatNumber(postVal)}` : formatNumber(postVal)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">
                  {row.label === 'Est. EMV' ? `$${formatNumber(avgVal)}` : formatNumber(avgVal)}
                </span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isUp ? '#F0FDF4' : '#FEF2F2',
                    color: isUp ? '#166534' : '#991B1B',
                  }}
                >
                  {pctStr}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
