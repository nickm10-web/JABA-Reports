import { useState } from 'react';
import { ArrowLeft, Heart, Eye, MessageCircle, ExternalLink, Trophy } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA (from creatine_contents.json — both Athletes Unlimited)
// ═══════════════════════════════════════════════════════════════

const campaignData = {
  brand: {
    name: 'CON-CRĒT Creatine HCl',
    logo: 'https://con-cret.com/cdn/shop/files/CON_CRET_Logo_-_No_Bar_1445x.png?v=1708035556',
  },
  organization: {
    name: 'Athletes Unlimited',
    logo: 'https://auprosports.com/wp-content/themes/au/assets/img/logo-athletes-unlimited.svg',
  },
  featuredAthletes: [
    {
      name: 'Shey Peddy',
      position: 'Guard',
      sport: "Women's Basketball",
      image: 'https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1764867931492-Shey_Peddy_68817b7338778f08a62e5610_ProfilePicture.jpg',
    },
    {
      name: 'Ariel Atkins',
      position: 'Guard',
      sport: "Women's Basketball",
      image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/wnba/players/full/3146151.png&w=350&h=254',
    },
  ],
  metrics: {
    totalEngagements: 2091,
    athletes: 2,
    posts: 2,
    likes: 190,
    comments: 17,
    videoViews: 1869,
    totalEmv: 157.88,
  },
};

const posts = [
  {
    athlete: 'Shey Peddy',
    account: '@sheypeddy',
    label: 'Shey Peddy',
    link: 'https://www.instagram.com/p/DWZ7C3vDbT3',
    thumbnail: 'https://storage.googleapis.com/scraper-media-images/17906110332385387',
    mediaType: 'VIDEO',
    likes: 0,
    comments: 15,
    videoViews: 1869,
    emv: 59.88,
    caption: 'Fuel different. Train different. Get the most out of your workouts with @concret_creatine\n\nCON-CRĒT Creatine HCI supports cellular energy, strength and muscle recovery. No bloating. No waiting. Just results.',
    date: 'March 27, 2026',
    hashtags: ['#ad', '#CONCRET'],
    sponsorPartner: '@concret_creatine',
    likeAndViewCountsDisabled: true,
  },
  {
    athlete: 'Ariel Atkins',
    account: '@iamarielatkins',
    label: 'Ariel Atkins',
    link: 'https://www.instagram.com/p/DVUtaVEkYvf',
    thumbnail: 'https://storage.googleapis.com/scraper-media-images/18112469527654760',
    mediaType: 'PHOTO',
    likes: 190,
    comments: 2,
    videoViews: 0,
    emv: 98.0,
    caption: 'Celebrating Champions Week with Con-Cret 🏀\n\nCreatine has been a key part of my routine! Every lift, sprint and dynamic movement depends on my strength and energy as a pro athlete.',
    date: 'March 1, 2026',
    hashtags: ['#ad', '#CONCRET', '#BeUnlimited'],
    sponsorPartner: '@concret',
    likeAndViewCountsDisabled: false,
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

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ConcretCreatineCampaignProps {
  onBack?: () => void;
}

export function ConcretCreatineCampaign({ onBack }: ConcretCreatineCampaignProps) {
  const [athleteImageErrors, setAthleteImageErrors] = useState<Record<number, boolean>>({});
  const [postImageErrors, setPostImageErrors] = useState<Record<number, boolean>>({});

  // Brand colors — AU black/white/orange
  const brandPrimary = '#000000';   // Black

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
          <span className="text-[#FF8300] italic">OVERVIEW</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* ─── Campaign Selector (Brand x Org) ─── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-black p-3 flex items-center justify-center shrink-0">
              <img src={campaignData.organization.logo} alt={campaignData.organization.name} className="w-full h-full object-contain invert" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black uppercase text-gray-900 leading-tight">
                Athletes Unlimited
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                Women&apos;s Basketball
              </p>
            </div>
          </div>

          <span className="text-[#FF8300] font-black text-2xl sm:text-4xl leading-none select-none shrink-0">✕</span>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 border border-gray-200">
              <img src={campaignData.brand.logo} alt={campaignData.brand.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black uppercase text-gray-900 leading-tight">
                CON-CRĒT
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                Creatine HCl
              </p>
            </div>
          </div>
        </div>

        {/* ─── Featured Athletes ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaignData.featuredAthletes.map((athlete, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF8300] mb-3">
                Featured Athlete
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                  {athlete.image && !athleteImageErrors[index] ? (
                    <img
                      src={athlete.image}
                      alt={athlete.name}
                      className="w-full h-full object-cover"
                      onError={() => setAthleteImageErrors(prev => ({ ...prev, [index]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                      {athlete.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{athlete.name}</h3>
                  <p className="text-sm text-gray-500">{athlete.position} · {athlete.sport}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main Metrics Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card - Total Engagements */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.5" fill="white" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots)" />
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
            <MetricCard label="Athletes" value={campaignData.metrics.athletes.toString()} />
            <MetricCard label="# of Posts" value={campaignData.metrics.posts.toString()} />
            <MetricCard label="Likes" value={formatNumber(campaignData.metrics.likes)} />
            <MetricCard label="Comments" value={campaignData.metrics.comments.toString()} />
            <MetricCard label="Video Views" value={formatNumber(campaignData.metrics.videoViews)} />
            <MetricCard label="Est. EMV" value={`$${campaignData.metrics.totalEmv.toFixed(0)}`} />
          </div>
        </div>

        {/* ─── Campaign Posts Breakdown ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-[#111111] uppercase tracking-wide">
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
                  brandPrimary={brandPrimary}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Athlete Comparison ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8300] to-[#E07000] flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#111111] uppercase tracking-wide">
                  Athlete Performance Comparison
                </h3>
                <p className="text-sm text-gray-500">How each athlete&apos;s post performed</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post, i) => {
                const maxEmv = Math.max(...posts.map(p => p.emv));
                const emvPercent = maxEmv > 0 ? (post.emv / maxEmv) * 100 : 0;

                return (
                  <div
                    key={i}
                    className="rounded-xl p-5 bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                        {campaignData.featuredAthletes[i]?.image && !athleteImageErrors[i] ? (
                          <img
                            src={campaignData.featuredAthletes[i].image}
                            alt={post.athlete}
                            className="w-full h-full object-cover"
                            onError={() => setAthleteImageErrors(prev => ({ ...prev, [i]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                            {post.athlete.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{post.athlete}</p>
                        <p className="text-xs text-gray-500">{post.date} · {post.mediaType === 'VIDEO' ? 'Video' : 'Photo'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Likes</span>
                        <span className="font-bold text-gray-900">{post.likeAndViewCountsDisabled ? 'Hidden' : formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Comments</span>
                        <span className="font-bold text-gray-900">{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Video Views</span>
                        <span className="font-bold text-gray-900">{post.videoViews > 0 ? formatNumber(post.videoViews) : '—'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">Est. EMV</span>
                        <span className="text-lg font-black" style={{ color: '#FF8300' }}>${post.emv.toFixed(2)}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${emvPercent}%`, backgroundColor: '#FF8300' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {post.likeAndViewCountsDisabled
                          ? 'EMV from comments + views (likes hidden)'
                          : 'EMV from likes + comments'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Sponsored vs. Average Performance ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#111111] to-[#333333] flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#111111] uppercase tracking-wide">
                  CON-CRĒT Post vs. Average
                </h3>
                <p className="text-sm text-gray-500">How each sponsored post compared to the athlete&apos;s typical performance</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shey Peddy Comparison */}
              <BaselineCard
                name="Shey Peddy"
                sampleSize={6}
                image={campaignData.featuredAthletes[0].image}
                imageError={!!athleteImageErrors[0]}
                onImageError={() => setAthleteImageErrors(prev => ({ ...prev, [0]: true }))}
                sponsored={{ likes: 0, likesHidden: true, comments: 15, views: 1869, emv: 59.88 }}
                average={{ likes: 614, comments: 37, views: 0, emv: 362.83 }}
              />
              {/* Ariel Atkins Comparison */}
              <BaselineCard
                name="Ariel Atkins"
                sampleSize={4}
                image={campaignData.featuredAthletes[1].image}
                imageError={!!athleteImageErrors[1]}
                onImageError={() => setAthleteImageErrors(prev => ({ ...prev, [1]: true }))}
                sponsored={{ likes: 190, likesHidden: false, comments: 2, views: 0, emv: 98.00 }}
                average={{ likes: 337, comments: 11, views: 0, emv: 184.62 }}
              />
            </div>
          </div>
        </div>

        {/* ─── Methodology ─── */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Data sourced from Instagram. EMV calculated as (likes × $0.50) + (comments × $1.50) + (views × $0.02). Shey Peddy&apos;s likes are hidden; EMV uses per-view rate. Pull date: April 6, 2026.
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
  brandPrimary,
}: {
  post: typeof posts[0];
  hasError: boolean;
  onError: () => void;
  brandPrimary: string;
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
              <p className="text-gray-500 text-sm font-bold">{post.mediaType === 'VIDEO' ? '🎬' : '📷'}</p>
              <p className="text-gray-500 text-xs mt-1">{post.mediaType}</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
          {post.label}
        </div>
        {post.mediaType === 'VIDEO' && (
          <div className="absolute top-3 right-12 bg-purple-600/90 text-white px-2 py-1 rounded-lg text-xs font-bold">
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
        <p className="text-sm font-bold mb-1" style={{ color: brandPrimary }}>{post.account}</p>
        <p className="text-xs text-gray-400 mb-3">{post.date} · {post.hashtags.join(' ')}</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricPill
            icon={<Heart className="w-3.5 h-3.5" />}
            label="Likes"
            value={post.likeAndViewCountsDisabled ? 'Hidden' : formatNumber(post.likes)}
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
            value={`$${post.emv.toFixed(0)}`}
          />
        </div>
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

function BaselineCard({
  name,
  sampleSize,
  image,
  imageError,
  onImageError,
  sponsored,
  average,
}: {
  name: string;
  sampleSize: number;
  image: string;
  imageError: boolean;
  onImageError: () => void;
  sponsored: { likes: number; likesHidden: boolean; comments: number; views: number; emv: number };
  average: { likes: number; comments: number; views: number; emv: number };
}) {
  const rows = [
    {
      label: 'Likes',
      sponsored: sponsored.likesHidden ? 'Hidden' : formatNumber(sponsored.likes),
      average: formatNumber(average.likes),
      delta: sponsored.likesHidden ? null : average.likes > 0 ? ((sponsored.likes - average.likes) / average.likes) * 100 : null,
    },
    {
      label: 'Comments',
      sponsored: formatNumber(sponsored.comments),
      average: formatNumber(average.comments),
      delta: average.comments > 0 ? ((sponsored.comments - average.comments) / average.comments) * 100 : null,
    },
    ...(sponsored.views > 0 ? [{
      label: 'Video Views',
      sponsored: formatNumber(sponsored.views),
      average: average.views > 0 ? formatNumber(average.views) : '—',
      delta: null as number | null,
    }] : []),
    {
      label: 'Est. EMV',
      sponsored: `$${sponsored.emv.toFixed(0)}`,
      average: `$${average.emv.toFixed(0)}`,
      delta: average.emv > 0 ? ((sponsored.emv - average.emv) / average.emv) * 100 : null,
    },
  ];

  return (
    <div className="rounded-xl p-5 bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
          {image && !imageError ? (
            <img src={image} alt={name} className="w-full h-full object-cover" onError={onImageError} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">CON-CRĒT post vs. avg of {sampleSize} other posts</p>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-400 uppercase"></span>
        <span className="text-xs font-semibold text-gray-400 uppercase text-right">CON-CRĒT</span>
        <span className="text-xs font-semibold text-gray-400 uppercase text-right">Avg</span>
        <span className="text-xs font-semibold text-gray-400 uppercase text-right">Change</span>
      </div>

      {/* Table rows */}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-4 gap-2 bg-white rounded-lg px-3 py-2 items-center">
            <span className="text-sm text-gray-600">{row.label}</span>
            <span className="text-sm font-bold text-gray-900 text-right">{row.sponsored}</span>
            <span className="text-sm text-gray-500 text-right">{row.average}</span>
            <span className={`text-sm font-bold text-right ${
              row.delta === null ? 'text-gray-400'
              : row.delta >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {row.delta === null ? '—' : `${row.delta >= 0 ? '+' : ''}${row.delta.toFixed(0)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
