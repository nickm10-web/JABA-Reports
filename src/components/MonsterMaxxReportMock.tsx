import { ArrowLeft, BarChart3, Camera, ExternalLink, Eye, Flame, Heart, MessageCircle, Mic2, PlayCircle, Trophy, Zap } from 'lucide-react';

interface MonsterMaxxReportMockProps {
  onBack?: () => void;
}

type CollaborationPost = {
  title: string;
  account: 'Maxx Crosby' | 'Monster Energy';
  date: string;
  format: string;
  likes: string;
  comments: string;
  views?: string;
  image: string;
  note: string;
  href: string;
};

type BenchmarkAthlete = {
  athlete: string;
  sport: string;
  monsterPosts: string;
  avgLikes: string;
  bestPost: string;
  takeaway: string;
};

const collaborationPosts: CollaborationPost[] = [
  {
    title: 'Podcast promo with Monster integration',
    account: 'Maxx Crosby',
    date: 'Mock Jun 2025',
    format: 'Reel',
    likes: '118K',
    comments: '1.9K',
    views: '1.2M',
    image: '/monster-maxx/maxx-1.jpg',
    note: 'Use this module for athlete-owned branded content, especially podcast pushes and launch moments.',
    href: 'https://www.instagram.com/maxxcrosby/',
  },
  {
    title: 'Game-week lifestyle activation',
    account: 'Maxx Crosby',
    date: 'Mock Sep 2025',
    format: 'Photo',
    likes: '96K',
    comments: '1.1K',
    image: '/monster-maxx/maxx-2.jpg',
    note: 'Good placeholder for product-in-frame or caption-level sponsor integration.',
    href: 'https://www.instagram.com/maxxcrosby/',
  },
  {
    title: 'Training carousel with brand cues',
    account: 'Maxx Crosby',
    date: 'Mock Feb 2026',
    format: 'Carousel',
    likes: '83K',
    comments: '874',
    image: '/monster-maxx/maxx-3.jpg',
    note: 'Useful for side-by-side slide previews once the scrape identifies true collab posts.',
    href: 'https://www.instagram.com/maxxcrosby/',
  },
  {
    title: 'Monster feed feature with athlete spotlight',
    account: 'Monster Energy',
    date: 'Mock Apr 2026',
    format: 'Photo',
    likes: '57K',
    comments: '420',
    image: '/monster-maxx/monster-1.jpg',
    note: 'Brand-owned coverage should live in its own lane so the agency can see Monster support clearly.',
    href: 'https://www.instagram.com/monsterenergy/',
  },
  {
    title: 'Monster highlight recap',
    account: 'Monster Energy',
    date: 'Mock Apr 2026',
    format: 'Carousel',
    likes: '64K',
    comments: '511',
    image: '/monster-maxx/monster-2.jpg',
    note: 'Ideal placeholder for event-driven or franchise storytelling content from the brand account.',
    href: 'https://www.instagram.com/monsterenergy/',
  },
  {
    title: 'Monster social cutdown',
    account: 'Monster Energy',
    date: 'Mock Apr 2026',
    format: 'Reel',
    likes: '71K',
    comments: '603',
    views: '884K',
    image: '/monster-maxx/monster-3.jpg',
    note: 'Keeps room for a stronger vertical-video card treatment when real data is ready.',
    href: 'https://www.instagram.com/monsterenergy/',
  },
];

const benchmarkRows: BenchmarkAthlete[] = [
  {
    athlete: 'Rob Gronkowski',
    sport: 'NFL / Athletics',
    monsterPosts: '12',
    avgLikes: '74K',
    bestPost: '142K',
    takeaway: 'Closest current Monster ambassador comp for personality-led U.S. sports content.',
  },
  {
    athlete: 'Alex Pereira',
    sport: 'MMA',
    monsterPosts: '15',
    avgLikes: '189K',
    bestPost: '612K',
    takeaway: 'High-intensity promo ceiling; useful as a premium branded-content reference point.',
  },
  {
    athlete: 'Justin Gaethje',
    sport: 'MMA',
    monsterPosts: '10',
    avgLikes: '133K',
    bestPost: '401K',
    takeaway: 'Strong comp for event spikes and bold product-forward creative.',
  },
  {
    athlete: 'Valentina Shevchenko',
    sport: 'MMA',
    monsterPosts: '9',
    avgLikes: '82K',
    bestPost: '216K',
    takeaway: 'Adds a clean benchmark for polished champion-focused brand storytelling.',
  },
];

function statCard(label: string, value: string, sublabel: string) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{sublabel}</p>
    </div>
  );
}

export function MonsterMaxxReportMock({ onBack }: MonsterMaxxReportMockProps) {
  const athleteOwned = collaborationPosts.filter((post) => post.account === 'Maxx Crosby');
  const brandOwned = collaborationPosts.filter((post) => post.account === 'Monster Energy');

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
      </div>

      <section className="relative overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,255,0,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(96,255,171,0.12),transparent_26%),linear-gradient(180deg,#0c0d07_0%,#050505_62%,#050505_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff36]/40 to-transparent" />
        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.25fr_0.9fr] lg:px-8 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ff36]/25 bg-[#d7ff36]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#efff9b]">
              <Zap className="h-3.5 w-3.5" />
              Mock Layout With Placeholder Metrics
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              <span>Maxx Crosby x Monster Energy</span>
              <span className="h-1 w-1 rounded-full bg-white/35" />
              <span>Agency Collaboration Report</span>
              <span className="h-1 w-1 rounded-full bg-white/35" />
              <span>Instagram First Pass</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              A thumbnail-led report shell for the Maxx x Monster partnership.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              Built to show branded posts, Monster-owned support, and a clean peer benchmark without waiting on the entire scrape to finish. Real scrape data can replace these cards directly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/maxxcrosby/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#d7ff36] px-5 py-3 text-sm font-black text-[#111305] transition hover:bg-[#e8ff7a]"
              >
                View Maxx Profile
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/monsterenergy/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                View Monster Profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {statCard('Estimated Collaboration Posts', '6+', 'Mock count until the scrape isolates true partnership posts.')}
              {statCard('Monster-Owned Support', '3 cards', 'Separate lane for brand feed coverage and event amplification.')}
              {statCard('Peer Benchmark Set', '4 athletes', 'Focused comparison group, not noisy all-roster benchmarking.')}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/42">Partnership Scope</p>
                <h2 className="mt-2 text-2xl font-black text-white">Activation Pillars</h2>
              </div>
              <div className="rounded-2xl border border-[#d7ff36]/30 bg-[#d7ff36]/12 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#efff9b]">Internal Note</p>
                <p className="mt-1 text-sm font-semibold text-white">Layout ready before final dataset</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Mic2 className="h-5 w-5 text-[#d7ff36]" />
                  <div>
                    <p className="text-sm font-black text-white">The Rush podcast integration</p>
                    <p className="text-sm leading-6 text-white/60">Monster branding across 40 episodes, including three custom segments.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-[#d7ff36]" />
                  <div>
                    <p className="text-sm font-black text-white">Social activations</p>
                    <p className="text-sm leading-6 text-white/60">Athlete-owned posts, recaps, reels, training content, and product-forward moments.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-[#d7ff36]" />
                  <div>
                    <p className="text-sm font-black text-white">Brand amplification</p>
                    <p className="text-sm leading-6 text-white/60">Monster-owned feed support, athlete spotlights, and exclusive content recuts.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-[#d7ff36]" />
                  <div>
                    <p className="text-sm font-black text-white">Appearances and cultural relevance</p>
                    <p className="text-sm leading-6 text-white/60">Use this block for camps, public appearances, and premium earned-attention moments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#d7ff36]/90">Collaboration Timeline</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">What the report will feel like once the real data drops in.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/55">
            These cards are intentionally visual-first: thumbnail, source account, quick engagement readout, and one note explaining why the post matters.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collaborationPosts.map((post) => (
            <article key={`${post.account}-${post.title}`} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/55 to-transparent p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/78">
                      {post.account}
                    </span>
                    <span className="rounded-full bg-[#d7ff36] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#111305]">
                      {post.format}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black leading-tight text-white">{post.title}</h3>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/42">{post.date}</p>
                  </div>
                  <a
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
                    <div className="flex items-center gap-2 text-white/45"><Heart className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Likes</span></div>
                    <p className="mt-2 text-sm font-black text-white">{post.likes}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
                    <div className="flex items-center gap-2 text-white/45"><MessageCircle className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Comments</span></div>
                    <p className="mt-2 text-sm font-black text-white">{post.comments}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
                    <div className="flex items-center gap-2 text-white/45"><Eye className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Views</span></div>
                    <p className="mt-2 text-sm font-black text-white">{post.views ?? 'N/A'}</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-white/62">{post.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#d7ff36]/14 p-3 text-[#d7ff36]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/42">Athlete-Owned Content</p>
                <h3 className="mt-1 text-2xl font-black text-white">Maxx feed lane</h3>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {athleteOwned.map((post) => (
                <div key={post.title} className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-3">
                  <img src={post.image} alt={post.title} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">{post.title}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{post.format} • {post.date}</p>
                    <p className="mt-2 text-sm text-white/60">{post.likes} likes • {post.comments} comments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#d7ff36]/14 p-3 text-[#d7ff36]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/42">Brand-Owned Content</p>
                <h3 className="mt-1 text-2xl font-black text-white">Monster feed lane</h3>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {brandOwned.map((post) => (
                <div key={post.title} className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-3">
                  <img src={post.image} alt={post.title} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">{post.title}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{post.format} • {post.date}</p>
                    <p className="mt-2 text-sm text-white/60">{post.likes} likes • {post.comments} comments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/8 p-3 text-[#d7ff36]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/42">Snapshot</p>
                <h3 className="mt-1 text-2xl font-black text-white">What to surface above the fold</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-white/62">
              <p><span className="font-black text-white">1.</span> Keep the intro short and factual: Monster sponsors The Rush, supports Maxx as an ambassador, and activates through posts, appearances, and exclusive content.</p>
              <p><span className="font-black text-white">2.</span> Lead visually with the strongest collab thumbnails instead of copy-heavy storytelling.</p>
              <p><span className="font-black text-white">3.</span> Use peer benchmarking to show whether Maxx is in range, then use a short “creative ceiling” strip for standout Monster athlete content.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#d7ff36]/90">Peer Benchmark</p>
                <h3 className="mt-2 text-2xl font-black text-white">Small, defensible comparison set</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                Mock values
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8">
              <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_1.2fr] gap-3 bg-white/[0.05] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                <div>Athlete</div>
                <div>Sport</div>
                <div>Posts</div>
                <div>Avg Likes</div>
                <div>Read</div>
              </div>
              {benchmarkRows.map((row) => (
                <div key={row.athlete} className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_1.2fr] gap-3 border-t border-white/8 px-4 py-4 text-sm">
                  <div>
                    <p className="font-black text-white">{row.athlete}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">Best: {row.bestPost}</p>
                  </div>
                  <div className="text-white/62">{row.sport}</div>
                  <div className="font-bold text-white">{row.monsterPosts}</div>
                  <div className="font-bold text-white">{row.avgLikes}</div>
                  <div className="text-white/58">{row.takeaway}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#090909] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#d7ff36]/90">Creative Ceiling</p>
              <h3 className="mt-2 text-2xl font-black text-white">Optional strip for broader Monster standouts</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/58">
              <Trophy className="h-4 w-4 text-[#d7ff36]" />
              Add only if it sharpens the story
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              'Best-performing athlete-owned Monster post',
              'Best-performing Monster-owned athlete feature',
              'Most premium branded video execution',
            ].map((label) => (
              <div key={label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/38">Reserved slot</p>
                <p className="mt-3 text-lg font-black text-white">{label}</p>
                <p className="mt-3 text-sm leading-7 text-white/58">This should stay tight. The goal is to inspire the agency, not bury the Maxx story under broader roster content.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
