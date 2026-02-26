import { useState } from 'react';

const campaignData = {
  school: {
    name: 'Auburn',
    sport: "Men's Basketball",
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png'
  },
  brand: {
    name: 'Dude Wipes',
    logo: '/dudewipes-logo.png'
  },
  featuredAthletes: [
    { name: 'Tahaad Pettiford', position: 'Point Guard', image: '/tahaad.png' }
  ],
  brandPartner: {
    name: "Auburn Men's Basketball",
    type: 'Team Account',
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png'
  },
  metrics: {
    posts: 1,
    likes: 5292,
    comments: 38,
    plays: 88100,
    engagementRate: 3.84
  }
};

const campaignPost = {
  account: '@auburnmbb',
  label: 'Auburn MBB × Dude Wipes',
  link: 'https://www.instagram.com/reels/DUbsBk3Eb3o/',
  thumbnail: '/dudewipes-reel-thumbnail.jpg',
  likes: 5292,
  comments: 38,
  plays: 88100,
  er: 3.84,
  caption: 'Camping in the Jungle? Stay ready.\n\nUse @dudewipes and save the TP for the trees 🧻',
  date: 'February 6, 2026',
  collaborators: ['@auburnmbb', '@sec', '@haad.0', '@dudewipes']
};

const dudewipesRecentPosts = [
  { date: 'Feb 23', likes: 209, er: 0.15, isAuburn: false },
  { date: 'Feb 21', likes: 145, er: 0.10, isAuburn: false },
  { date: 'Feb 20', likes: 98, er: 0.07, isAuburn: false },
  { date: 'Feb 18', likes: 14891, er: 10.81, isAuburn: false },
  { date: 'Feb 18', likes: 523, er: 0.38, isAuburn: false },
  { date: 'Feb 17', likes: 20777, er: 15.21, isAuburn: false },
  { date: 'Feb 16', likes: 612, er: 0.44, isAuburn: false },
  { date: 'Feb 15', likes: 188, er: 0.14, isAuburn: false },
  { date: 'Feb 12', likes: 311, er: 0.22, isAuburn: false },
  { date: 'Feb 12', likes: 423, er: 0.31, isAuburn: false },
  { date: 'Feb 11', likes: 556, er: 0.40, isAuburn: false },
  { date: 'Feb 09', likes: 198, er: 0.14, isAuburn: false },
  { date: 'Feb 07', likes: 834, er: 0.60, isAuburn: false },
  { date: 'Feb 07', likes: 5207, er: 3.89, isAuburn: false },
  { date: 'Feb 06', likes: 5292, er: 3.84, isAuburn: true, isCurrent: true },
  { date: 'Feb 05', likes: 201, er: 0.14, isAuburn: false },
  { date: 'Feb 04', likes: 378, er: 0.27, isAuburn: false },
  { date: 'Feb 03', likes: 156, er: 0.11, isAuburn: false }
];

const partnershipStats = {
  plays: 88100,
  totalPosts: 100,
  collabPosts: 38,
  organicPosts: 62,
  avgOrganicER: 0.49,
  avgCollabER: 3.07,
  thisCampaignER: 3.84,
  rankAmongCollabs: 7,
  totalCollabs: 38,
  rankAmongAllPosts: 8,
  totalPostsAnalyzed: 100,
  liftVsOrganic: 683,
  liftVsCollabAvg: 25,
  xAboveAvgLikes: 2.6
};

const topCollabPosts = [
  { rank: 1, collab: '@blaiseffrench', likes: 61522, plays: 1035821, er: 44.65, isAuburn: false },
  { rank: 2, collab: '@dominik_35', likes: 20777, plays: 283557, er: 15.21, isAuburn: false },
  { rank: 3, collab: '@biggy.bailey + @terrellowens', likes: 14891, plays: 223297, er: 10.81, isAuburn: false },
  { rank: 4, collab: '@kylesockwell + @ebeisel34', likes: 14876, plays: 0, er: 10.76, isAuburn: false },
  { rank: 5, collab: '@gabbysgiftguide', likes: 6281, plays: 264101, er: 4.57, isAuburn: false },
  { rank: 6, collab: '@motion.by.nick', likes: 5207, plays: 143572, er: 3.89, isAuburn: false },
  { rank: 7, collab: '@auburnmbb ⭐ THIS CAMPAIGN', likes: 5292, plays: 88100, er: 3.84, isAuburn: true, isCurrent: true },
  { rank: 8, collab: '@auburnfootball', likes: 5042, plays: 86137, er: 3.67, isAuburn: true },
  { rank: 9, collab: '@cameronboozer + @dukeathletics', likes: 4493, plays: 73702, er: 3.38, isAuburn: false },
  { rank: 10, collab: '@twinsauce', likes: 4540, plays: 108850, er: 3.37, isAuburn: false }
];

interface AuburnDudewipesCampaignProps {
  onBack?: () => void;
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatRate(value: number) {
  return `${value.toFixed(2)}%`;
}


export function AuburnDudewipesCampaign({ onBack }: AuburnDudewipesCampaignProps) {
  const [brandLogoError, setBrandLogoError] = useState(false);
  const [athleteImageError, setAthleteImageError] = useState(false);
  const [postImageError, setPostImageError] = useState(false);
  const [likeValue, setLikeValue] = useState(0.50);
  const [commentValue, setCommentValue] = useState(1.50);
  const [showEmvSettings, setShowEmvSettings] = useState(false);
  const [comparisonView, setComparisonView] = useState<'recent' | 'top'>('recent');
  const emv = (campaignPost.likes * likeValue) + (campaignPost.comments * commentValue);
  const formattedEMV = emv.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const basePath = import.meta.env.BASE_URL;
  const brandLogoSrc = `${basePath}dudewipes-logo.png`;
  const athleteImageSrc = `${basePath}tahaad.png`;
  const postThumbnailSrc = `${basePath}dudewipes-reel-thumbnail.jpg`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-[#03244D]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center pt-5 pb-4">
            <div className="w-[120px]">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  ← Back to Hub
                </button>
              )}
            </div>
            <div className="w-[120px]" />
          </div>

          <div className="flex justify-center items-center gap-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <img
                  src={campaignData.school.logo}
                  alt={campaignData.school.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black uppercase text-white leading-tight">
                  {campaignData.school.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wide">{campaignData.school.sport}</p>
              </div>
            </div>

            <span className="text-[#E87722] font-black text-2xl sm:text-4xl leading-none select-none shrink-0">✕</span>

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                {brandLogoError ? (
                  <div className="w-full h-full rounded-xl bg-white/10 text-white text-[11px] sm:text-sm font-black flex items-center justify-center px-2 text-center leading-tight">
                    DUDE WIPES
                  </div>
                ) : (
                  <img
                    src={brandLogoSrc}
                    alt={campaignData.brand.name}
                    className="w-full h-full object-contain"
                    onError={() => setBrandLogoError(true)}
                  />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black uppercase text-white leading-tight">
                  {campaignData.brand.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wide">Brand Partner</p>
              </div>
            </div>
          </div>
          <p className="text-center text-white/55 text-xs pb-4 pt-3">
            Analysis based on @dudewipes&apos; last 100 Instagram posts (Oct 24, 2025 – Feb 23, 2026) · 138,739 followers · Data pulled Feb 24, 2026 by JABA
          </p>

          <div className="flex items-center justify-between py-5">
            <div>
              <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest">Featured Athlete</p>
              <div className="mt-2 flex items-center gap-3">
                {athleteImageError ? (
                  <div className="w-10 h-10 rounded-full border-2 border-[#E87722] bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">
                    TP
                  </div>
                ) : (
                  <img
                    src={athleteImageSrc}
                    alt="Tahaad Pettiford"
                    className="w-10 h-10 rounded-full object-cover object-top border-2 border-[#E87722]"
                    onError={() => setAthleteImageError(true)}
                  />
                )}
                <p className="text-white font-black text-lg">Tahaad Pettiford</p>
                <p className="text-white/50 text-sm">Point Guard · @haad.0</p>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { value: '295K', label: 'Followers' },
                { value: '16.2%', label: 'ER' },
                { value: '360', label: 'Avg Comments' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-white font-black text-base leading-tight">{stat.value}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-6">
          <h3 className="text-lg font-extrabold text-[#03244D] uppercase tracking-wide">The Post</h3>
          <p className="text-sm text-gray-500 mt-1">Auburn MBB × Dude Wipes · Instagram Reel · February 6, 2026</p>
        </div>
        <div className="bg-[#03244D] rounded-2xl overflow-hidden shadow-sm">
          <div className="min-h-[480px] flex items-stretch">
            <div className="flex-1 flex flex-col justify-between p-8 text-white">
              <div>
                <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest">
                  Instagram Reel · February 6, 2026
                </p>
                <p className="mt-1 text-white text-xl font-black">{campaignPost.account}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest mb-1">Plays</p>
                  <p className="text-white font-black text-2xl">88.1K</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest mb-1">Likes</p>
                  <p className="text-white font-black text-2xl">5,292</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest mb-1">ER</p>
                  <p className="text-white font-black text-2xl">3.84%</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-[#E87722] text-xs font-bold uppercase tracking-widest mb-1">EMV</p>
                  <p className="text-white font-black text-2xl">{formattedEMV}</p>
                  <p className="text-white/50 text-[10px] mt-1">Estimated Earned Media Value</p>
                </div>
              </div>

              <div>
                <p className="text-white/80 text-base leading-relaxed italic whitespace-pre-line">{campaignPost.caption}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-2">{campaignPost.date}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {campaignPost.collaborators.map((collaborator) => (
                    <span key={collaborator} className="bg-white/10 text-white/70 text-xs rounded-full px-3 py-1">
                      {collaborator}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative w-[340px] shrink-0 h-full bg-gray-100 overflow-hidden rounded-l-none rounded-r-2xl">
              <img
                src={postImageError ? athleteImageSrc : postThumbnailSrc}
                alt={campaignPost.label}
                className="h-full min-h-[480px] w-full object-cover"
                style={{ objectPosition: '50% 20%' }}
                onError={() => setPostImageError(true)}
              />
              <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                {campaignPost.label}
              </div>
              <a
                href={campaignPost.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 left-3 bg-[#E87722] text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide hover:bg-[#d76b1c] transition-colors"
              >
                View Reel →
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-4">
          <p className="text-center text-2xl md:text-3xl font-black text-[#03244D] leading-tight">
            The Auburn MBB × Dude Wipes reel outperformed 93% of posts on the @dudewipes account — and ranked #7 of 38 brand collaborations by engagement rate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#E87722] to-[#C96318] rounded-xl p-6 text-center text-white">
              <p className="text-5xl font-black mb-2">+{partnershipStats.liftVsOrganic}%</p>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Above Organic Average</p>
              <p className="text-xs opacity-75 mt-1">3.84% ER vs 0.49% avg on organic Dude Wipes posts</p>
            </div>
            <div className="bg-gradient-to-br from-[#03244D] to-[#1a3a5c] rounded-xl p-6 text-center text-white">
              <p className="text-5xl font-black mb-2">#{partnershipStats.rankAmongCollabs} of {partnershipStats.totalCollabs}</p>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Among All Collab Posts</p>
              <p className="text-xs opacity-75 mt-1">Top 18% of all Dude Wipes brand & athlete collaborations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#03244D] uppercase tracking-wide">How This Post Compares</h3>
                <p className="text-sm text-gray-500">
                  {comparisonView === 'recent'
                    ? "Ranked by likes against @dudewipes' last 18 posts"
                    : 'Ranked by engagement rate among all collab posts (last 100)'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setComparisonView('recent')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    comparisonView === 'recent' ? 'bg-[#E87722] text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Recent Posts
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonView('top')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    comparisonView === 'top' ? 'bg-[#E87722] text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Top Collabs
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {comparisonView === 'recent' ? (
              <>
                <div className="space-y-3">
                  {dudewipesRecentPosts.map((post, index) => (
                    <div key={`${post.date}-${post.likes}-${index}`}>
                      {(() => {
                        const isOutlierCollab =
                          (post.date === 'Feb 17' && post.likes === 20777) ||
                          (post.date === 'Feb 18' && post.likes === 14891);
                        return (
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-500'}`}>
                                {post.date}
                              </span>
                              {isOutlierCollab && (
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-1.5 py-0.5 rounded italic">
                                  collab post
                                </span>
                              )}
                              {post.isCurrent && (
                                <span className="bg-[#E87722]/10 text-[#E87722] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  This Campaign ⭐
                                </span>
                              )}
                            </div>
                            <span className={`text-sm ${post.isCurrent ? 'font-extrabold text-[#E87722]' : 'text-gray-500'}`}>
                              {formatNumber(post.likes)} likes
                            </span>
                          </div>
                        );
                      })()}
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${post.isCurrent ? 'bg-[#E87722]' : 'bg-gray-300'}`}
                          style={{ width: `${Math.min((post.likes / 21000) * 100, 100)}%`, minWidth: '6px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl p-4 bg-green-50 border border-green-200 text-center">
                  <p className="text-sm font-bold text-green-700">
                    The Auburn campaign post ranked #8 of 100 posts by likes on the Dude Wipes account — 2.6x the average post.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowEmvSettings((prev) => !prev)}
                    className="text-xs font-bold text-[#E87722] hover:text-[#c96318] transition-colors"
                  >
                    ⚙ Adjust EMV Rates
                  </button>

                  {showEmvSettings && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#03244D]">EMV Rate Calculator</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">Per Like</span>
                          <span className="font-black text-[#E87722]">${likeValue.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={2}
                          step={0.05}
                          value={likeValue}
                          onChange={(e) => setLikeValue(Number(e.target.value))}
                          className="w-full accent-orange-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">Per Comment</span>
                          <span className="font-black text-[#E87722]">${commentValue.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={5}
                          step={0.25}
                          value={commentValue}
                          onChange={(e) => setCommentValue(Number(e.target.value))}
                          className="w-full accent-orange-500"
                        />
                      </div>

                      <p className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                        EMV = (5,292 likes × ${likeValue.toFixed(2)}) + (38 comments × ${commentValue.toFixed(2)}) = {formattedEMV}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setLikeValue(0.5);
                          setCommentValue(1.5);
                        }}
                        className="text-xs text-gray-500 underline hover:text-gray-700"
                      >
                        Reset to defaults
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-3 pb-1 flex items-center justify-between">
                  <div />
                  <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    <span>Likes</span>
                    <span>Plays</span>
                    <span>ER%</span>
                    <span>EMV</span>
                  </div>
                </div>
                {topCollabPosts.map((post) => {
                  const capEr = 3.89;
                  const widthPercent = Math.min((post.er / capEr) * 100, 100);
                  const rowEmv = post.isCurrent
                    ? (post.likes * likeValue) + (campaignPost.comments * commentValue)
                    : (post.likes * likeValue);
                  const formattedRowEmv = rowEmv.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  });

                  return (
                    <div
                      key={post.rank}
                      className={`rounded-lg p-3 transition-all ${
                        post.isCurrent
                          ? 'bg-[#E87722]/10 border-2 border-[#E87722]'
                          : post.isAuburn
                            ? 'bg-[#E87722]/5 border border-[#E87722]/40'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs font-bold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-400'}`}>
                            #{post.rank}
                          </span>
                          <span className={`text-sm font-bold truncate ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-900'}`}>
                            {post.collab}
                          </span>
                          {post.isAuburn && (
                            <span className="bg-[#E87722]/10 text-[#E87722] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Auburn
                            </span>
                          )}
                        </div>
                        <div className="shrink-0 pl-2 flex items-center gap-5 text-right">
                          <p className={`text-sm font-extrabold min-w-[64px] ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-700'}`}>
                            {formatNumber(post.likes)}
                          </p>
                          <p className={`text-sm font-extrabold min-w-[70px] ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-700'}`}>
                            {formatNumber(post.plays)}
                          </p>
                          <p className="text-xs text-gray-500 min-w-[44px]">{formatRate(post.er)}</p>
                          <p className={`text-xs font-bold min-w-[70px] ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-600'}`}>
                            {formattedRowEmv}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${post.isCurrent ? 'bg-gradient-to-r from-[#E87722] to-[#C96318]' : 'bg-gray-400'}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <p className="text-xs italic text-gray-500 mt-2">
                  * EMV for non-campaign posts estimated from likes only (comment data not available).
                </p>
                <p className="text-xs italic text-gray-500 mt-2">
                  * Bars scaled to #6 post (3.89% ER). Posts above this threshold are off the chart.
                </p>

                <div className="mt-4 rounded-xl p-4 bg-[#E87722]/10 border border-[#E87722]/30 text-center">
                  <p className="text-sm font-bold text-[#a14f12]">
                    Auburn is the only partner to appear multiple times in Dude Wipes&apos; top 10 collaborations — with both @auburnmbb (#7) and @auburnfootball (#8).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full bg-[#03244D] py-10">
        <div className="max-w-7xl mx-auto px-8">
          <h4 className="text-[#E87722] text-xs font-bold uppercase tracking-widest mb-3">What This Means for Dude Wipes</h4>
          <div className="h-px bg-[#E87722] w-16 mb-6" />
          <div className="space-y-2 text-white text-xl font-semibold leading-relaxed">
            <p>Auburn&apos;s audience is built for this.</p>
            <p>Between @auburnmbb and @auburnfootball, Auburn accounts represent 2 of Dude Wipes&apos; top 8 collaborations ever.</p>
            <p>This single reel drove 88,100 plays with a 3.84% ER, a repeatable result with the right partner.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuburnDudewipesCampaign;
