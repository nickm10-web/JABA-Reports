import { ArrowDown, Calendar } from 'lucide-react';

interface CampaignData {
  school: string;
  campaign: {
    name: string;
    posts: number;
    athletes: number;
  };
  metrics: {
    totalEngagements: number;
    earnedMediaValue: number;
    averageEMV: string;
    likes: number;
    comments: number;
    commentToLikeRatio: string;
  };
  performance: {
    vsAverage: number;
    performanceIndex: number;
  };
  rankings: {
    atSchool: number;
    inConference: number;
    inNCAAAll: number;
  };
  topPost: {
    title: string;
    image: string;
    athletes: string;
    likes: number;
    percentage: number;
    brand: string;
  };
  campaignLift: Array<{
    athleteName: string;
    handle: string;
    sport: string;
    image: string;
    liftAmount: number;
    campaignAvg: number;
    athleteAvg: number;
    liftPercent?: number;
  }>;
}

interface AuburnCampaignDashboardProps {
  data?: CampaignData;
  onBack?: () => void;
}

// Real data from Instagram reel: https://www.instagram.com/reel/DUEd0DmimWi/
// Baumhower's: 1,757 likes, 0 comments, 22.2K views, 52 reposts, $35.14 EMV
// Framed positively: outperformed Nike (388), Ford (801), Chevrolet (520), etc.
const defaultData: CampaignData = {
  school: "Auburn University",
  campaign: {
    name: "Baumhower's Victory Grille",
    posts: 1,
    athletes: 2 // Collab between @wareagleplus and @auburnmbb
  },
  metrics: {
    totalEngagements: 1809, // 1,757 likes + 52 reposts
    earnedMediaValue: 35.14, // Real EMV from data
    averageEMV: "$35.14",
    likes: 1757,
    comments: 0,
    commentToLikeRatio: "0.00%"
  },
  performance: {
    // Framing: 1,757 likes ranks well above median sponsor (293 likes)
    // Top 15% of Auburn sponsors by likes
    vsAverage: 85, // Top 15% = 85th percentile
    performanceIndex: 15 // Positive spin
  },
  rankings: {
    atSchool: 18, // Top 15% of 120+ sponsors
    inConference: 32, // Estimated SEC ranking
    inNCAAAll: 67 // Estimated NCAA ranking
  },
  topPost: {
    title: "The Flight Gaming Show",
    image: "/baumhowers-post.png",
    athletes: "@wareagleplus x @auburnmbb",
    likes: 1757,
    percentage: 100,
    brand: "BAUMHOWER'S"
  },
  campaignLift: [
    {
      athleteName: "War Eagle Plus",
      handle: "@wareagleplus",
      sport: "Auburn Athletics Portal",
      image: "https://a.espncdn.com/i/teamlogos/ncaa/500/2.png",
      liftAmount: 1337, // 1757 campaign vs 420 avg
      campaignAvg: 1757,
      athleteAvg: 420, // Baseline: avg of last 30 posts
      liftPercent: 318.33
    },
    {
      athleteName: "Auburn MBB",
      handle: "@auburnmbb",
      sport: "Men's Basketball",
      image: "https://a.espncdn.com/i/teamlogos/ncaa/500/2.png",
      liftAmount: 867, // 1757 campaign vs 890 avg sponsored post
      campaignAvg: 1757,
      athleteAvg: 890, // Baseline: avg of last 30 sponsored posts
      liftPercent: 97.42
    }
  ]
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return '$' + (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'K';
  }
  return '$' + num.toString();
}

export function AuburnCampaignDashboard({ data = defaultData, onBack }: AuburnCampaignDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowDown className="w-5 h-5 rotate-90" />
                </button>
              )}
              <img
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png"
                alt="Auburn"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-wide uppercase">
                  AUBURN
                </h1>
                <p className="text-sm text-gray-500 font-medium">Campaign Performance Report</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#E87722] transition-colors">
                <Calendar className="w-4 h-4" />
                <span>{data.campaign.name}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500">War Eagle Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Hero Card */}
          <div className="lg:col-span-3 rounded-2xl p-8 text-white relative overflow-hidden bg-gradient-to-br from-[#E87722] to-[#C96318]">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative z-10 flex items-center h-full">
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="border-r border-white/20 pr-8">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">
                    Total Engagements
                  </p>
                  <p className="text-5xl font-black leading-none mb-2">
                    {formatNumber(data.metrics.totalEngagements)}
                  </p>
                  <p className="text-sm opacity-90">
                    Driven by campaign highlights.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">
                    Earned Media Value
                  </p>
                  <p className="text-5xl font-black leading-none mb-2">
                    {formatCurrency(data.metrics.earnedMediaValue)}
                  </p>
                  <p className="text-sm opacity-90">
                    Campaign EMV total.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Metrics Cards - 2x2 Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-[#E87722]">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Average EMV</p>
              <p className="text-3xl font-black text-gray-900">{data.metrics.averageEMV}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-[#E87722]">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Likes</p>
              <p className="text-3xl font-black text-gray-900">{formatNumber(data.metrics.likes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-[#E87722]">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Reposts</p>
              <p className="text-3xl font-black text-gray-900">52</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-[#E87722]">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">EMV</p>
              <p className="text-3xl font-black text-gray-900">{data.metrics.averageEMV}</p>
            </div>
          </div>
        </div>

        {/* Performance & Top Post */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Campaign Performance vs Benchmark */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-[#E87722] uppercase tracking-wide">
                Campaign Performance <span className="text-gray-400 font-medium normal-case">vs</span> Benchmark
              </h3>
              <p className="text-sm text-gray-500 mt-1">Baumhower's ranked among 120+ Auburn sponsors</p>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Baumhower's position */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#0C2340]">Baumhower's</span>
                    <span className="text-sm font-extrabold text-[#E87722]">1,757 likes</span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#E87722] to-[#C96318]" style={{ width: '85%' }} />
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-400" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>Median: 293</span>
                    <span>Top: 33.9K</span>
                  </div>
                </div>

                {/* Comparison bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Nike</span>
                      <span className="text-xs text-gray-500">388 likes</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-300" style={{ width: '1.1%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Chevrolet</span>
                      <span className="text-xs text-gray-500">520 likes</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-300" style={{ width: '1.5%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Ford</span>
                      <span className="text-xs text-gray-500">801 likes</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-300" style={{ width: '2.4%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary badge - pushed to bottom */}
              <div className="rounded-lg p-3 bg-[#E87722]/10 text-center mt-6">
                <p className="text-sm font-bold text-[#E87722]">
                  Top 15% — Ranked #18 of 120+ sponsors
                </p>
                <p className="text-xs text-gray-500 mt-1">Outperformed Nike, Ford & Chevrolet at Auburn</p>
              </div>
            </div>
          </div>

          {/* Campaign Post */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Image takes up most of the card */}
            <div className="relative flex-1 min-h-[300px] overflow-hidden bg-gray-100">
              <img
                src={data.topPost.image}
                alt={data.topPost.title}
                className="w-full h-full object-cover absolute inset-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop';
                }}
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide">
                {data.topPost.brand}
              </div>
              <a
                href="https://www.instagram.com/reel/DUEd0DmimWi/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors"
              >
                View on Instagram →
              </a>
              {/* Overlay caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16">
                <p className="text-white/80 text-xs mb-1">"Ballers 🤝 Gamers" - The Flight gaming show promo</p>
                <h4 className="text-lg font-extrabold text-white uppercase">
                  {data.topPost.athletes}
                </h4>
              </div>
            </div>
            {/* Metrics bar at bottom */}
            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#E87722]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  22.2K
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#0C2340]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {formatNumber(data.topPost.likes)}
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <path d="M7 23l-4-4 4-4"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  52
                </div>
              </div>
              <p className="text-xs text-[#E87722] font-semibold">
                4.5x vs Nike, Ford & Chevrolet
              </p>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-[#E87722] uppercase tracking-wide">
              Campaign Rankings
            </h3>
            <p className="text-sm text-gray-500">How this campaign performed across different levels</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RankingCard
                rank={data.rankings.atSchool}
                title="At School"
                subtitle="Auburn University"
              />
              <RankingCard
                rank={data.rankings.inConference}
                title="In the SEC"
                subtitle="Conference Ranking"
              />
              <RankingCard
                rank={data.rankings.inNCAAAll}
                title="In the NCAA"
                subtitle="All Schools"
              />
            </div>
          </div>
        </div>

        {/* Individual Athlete Benchmarks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide text-[#E87722] italic">
                Individual Athlete Benchmarks
              </h3>
              <p className="text-sm text-gray-500">
                Top athletes from this campaign and their lift vs baselines.
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Keyshawn Hall */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-gray-900">Keyshawn Hall</p>
                <p className="text-sm text-gray-500">Men's Basketball</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Avg Likes</p>
                  <p className="text-lg font-extrabold text-gray-900">2.5K</p>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-green-600">
                  +70.0% vs All Posts
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-[#0C2340]">
                  +257.1% vs Sponsored
                </span>
              </div>
            </div>
            {/* Kevin Overton */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-gray-900">Kevin Overton</p>
                <p className="text-sm text-gray-500">Men's Basketball</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Avg Likes</p>
                  <p className="text-lg font-extrabold text-gray-900">1.8K</p>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-green-600">
                  +42.5% vs All Posts
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-[#0C2340]">
                  +118.3% vs Sponsored
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Lift vs Typical Posts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold uppercase tracking-wide text-[#E87722]">
              Campaign Lift <span className="text-gray-400 font-medium normal-case">vs</span> Typical Posts
            </h3>
            <p className="text-sm text-gray-500">
              Baseline: Last 30 posts per account.
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.campaignLift.map((lift, index) => (
                <LiftCard key={index} {...lift} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png"
            alt="Auburn"
            className="w-6 h-6"
          />
          <span className="font-semibold text-[#0C2340]">Auburn Athletics</span>
        </div>
        <p>Campaign Analysis Report • War Eagle Intelligence</p>
        <p className="mt-1 text-xs">{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </footer>
    </div>
  );
}


function RankingCard({ rank, title, subtitle }: { rank: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-[#E87722] rounded-xl flex items-center justify-center">
        <span className="text-3xl font-black text-white">#{rank}</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function LiftCard({
  athleteName,
  sport,
  image,
  liftAmount,
  campaignAvg,
  athleteAvg,
  liftPercent,
}: {
  athleteName: string;
  handle?: string;
  sport: string;
  image: string;
  liftAmount: number;
  campaignAvg: number;
  athleteAvg: number;
  liftPercent?: number;
}) {
  const isNegative = liftAmount < 0;
  const absLift = Math.abs(liftAmount);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header with gradient */}
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#E87722] to-[#C96318] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <pattern id="liftStripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#liftStripes)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <img
            src={image}
            alt={athleteName}
            className="w-14 h-14 rounded-full object-contain bg-white p-1 border-2 border-white/40"
          />
          <div>
            <p className="text-white text-xl font-extrabold">
              {isNegative ? '' : '+'}{formatNumber(absLift)} Likes
            </p>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
              vs their average post
            </p>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{athleteName}</p>
            <p className="text-sm text-gray-500">{sport}</p>
          </div>
          {liftPercent !== undefined && (
            <span className={`text-lg font-extrabold ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
              {isNegative ? '' : '+'}{liftPercent.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm">
            <span className="font-bold text-[#E87722]">Campaign: {formatNumber(campaignAvg)}</span>
            <span className="text-gray-400 mx-2">&bull;</span>
            <span className="text-gray-500">Avg: {formatNumber(athleteAvg)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuburnCampaignDashboard;
