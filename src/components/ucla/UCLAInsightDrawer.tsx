// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Insight Drawer
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, ExternalLink, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uclaColors, formatNumber, formatCurrency, formatSportName, formatDate } from './uclaColors';
import { DrawerPayload, BrandGroup, AthleteIndex, SponsorPost, IPMetricDrawerData } from './uclaTypes';
import { sportColors } from './uclaColors';

interface InsightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payload: DrawerPayload | null;
}

export function UCLAInsightDrawer({ isOpen, onClose, payload }: InsightDrawerProps) {
  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && payload && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 bg-white shadow-2xl overflow-y-auto"
            style={{ width: 480, maxWidth: '90vw' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Close button */}
            <button onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: uclaColors.textMuted }}>
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pt-14">
              {payload.type === 'brand' && <BrandDetail brand={payload.data} />}
              {payload.type === 'athlete' && <AthleteDetail athlete={payload.data} />}
              {payload.type === 'post' && <PostDetail post={payload.data} />}
              {payload.type === 'ip-metric' && <IPMetricDetail data={payload.data} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Brand Detail ───────────────────────────────────────────
type AthleteSortKey = 'name' | 'sport' | 'posts' | 'followers' | 'likes';

function BrandDetail({ brand }: { brand: BrandGroup }) {
  const totalLikes = brand.posts.reduce((s, p) => s + p.metrics.likes, 0);
  const totalComments = brand.posts.reduce((s, p) => s + p.metrics.comments, 0);
  const [athleteSortKey, setAthleteSortKey] = useState<AthleteSortKey>('posts');
  const [athleteSortAsc, setAthleteSortAsc] = useState(false);

  const handleAthleteSort = (key: AthleteSortKey) => {
    if (key === athleteSortKey) setAthleteSortAsc(!athleteSortAsc);
    else { setAthleteSortKey(key); setAthleteSortAsc(false); }
  };

  const sortedAthletes = [...brand.athleteGroups].sort((a, b) => {
    let cmp = 0;
    switch (athleteSortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'sport': cmp = formatSportName(a.sport).localeCompare(formatSportName(b.sport)); break;
      case 'posts': cmp = a.posts.length - b.posts.length; break;
      case 'followers': cmp = a.followers - b.followers; break;
      case 'likes': cmp = a.posts.reduce((s, p) => s + p.metrics.likes, 0) - b.posts.reduce((s, p) => s + p.metrics.likes, 0); break;
    }
    return athleteSortAsc ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: AthleteSortKey }) => {
    if (col !== athleteSortKey) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return athleteSortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <BrandLogo handle={brand.handle} size={64} />
        <div>
          <h2 className="text-xl font-bold" style={{ color: uclaColors.text }}>{brand.displayName}</h2>
          <p className="text-sm" style={{ color: uclaColors.textMuted }}>{brand.handle}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: uclaColors.gold + '20', color: '#92650a' }}>
            {brand.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Posts" value={String(brand.posts.length)} />
        <StatCard label="Athletes" value={String(brand.uniqueAthletes.length)} />
        <StatCard label="Est. EMV" value={formatCurrency(brand.totalEMV)} />
        <StatCard label="Sports" value={String(brand.sports.length)} />
        <StatCard label="Total Likes" value={formatNumber(totalLikes)} />
        <StatCard label="Total Comments" value={formatNumber(totalComments)} />
      </div>

      {/* Sports */}
      <Section title="Sports">
        <div className="flex flex-wrap gap-2">
          {brand.sports.map(s => (
            <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: (sportColors[s] || uclaColors.textDim) + '18', color: sportColors[s] || uclaColors.textDim }}>
              {formatSportName(s)}
            </span>
          ))}
        </div>
      </Section>

      {/* Athletes - Sortable Table */}
      <Section title="Athletes">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                <ThSort label="Name" col="name" current={athleteSortKey} onSort={handleAthleteSort}><SortIcon col="name" /></ThSort>
                <ThSort label="Sport" col="sport" current={athleteSortKey} onSort={handleAthleteSort}><SortIcon col="sport" /></ThSort>
                <ThSort label="Posts" col="posts" current={athleteSortKey} onSort={handleAthleteSort} align="right"><SortIcon col="posts" /></ThSort>
                <ThSort label="Followers" col="followers" current={athleteSortKey} onSort={handleAthleteSort} align="right"><SortIcon col="followers" /></ThSort>
                <ThSort label="Likes" col="likes" current={athleteSortKey} onSort={handleAthleteSort} align="right"><SortIcon col="likes" /></ThSort>
              </tr>
            </thead>
            <tbody>
              {sortedAthletes.map(ag => (
                <tr key={ag.id} className="border-b hover:bg-blue-50/40 transition-colors" style={{ borderColor: uclaColors.border }}>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <AthleteAvatar name={ag.name} size={28} />
                      <span className="font-semibold truncate" style={{ color: uclaColors.text }}>{ag.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                      style={{ backgroundColor: (sportColors[ag.sport] || uclaColors.textDim) + '18', color: sportColors[ag.sport] || uclaColors.textDim }}>
                      {formatSportName(ag.sport)}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right font-medium" style={{ color: uclaColors.text }}>{ag.posts.length}</td>
                  <td className="py-2 pr-2 text-right font-medium" style={{ color: uclaColors.text }}>{formatNumber(ag.followers)}</td>
                  <td className="py-2 text-right font-bold" style={{ color: uclaColors.blue }}>{formatNumber(ag.posts.reduce((s, p) => s + p.metrics.likes, 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Recent Posts */}
      <Section title="Recent Posts">
        <div className="space-y-3">
          {brand.posts.slice(0, 5).map(post => (
            <MiniPost key={post._id} post={post} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// Table header with sorting
function ThSort({ label, col, current, onSort, align, children }: {
  label: string; col: AthleteSortKey; current: AthleteSortKey; onSort: (k: AthleteSortKey) => void; align?: string; children: React.ReactNode;
}) {
  return (
    <th className={`py-2 pr-2 font-semibold text-[10px] uppercase tracking-wider cursor-pointer select-none hover:opacity-70 ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: col === current ? uclaColors.blue : uclaColors.textDim }}
      onClick={() => onSort(col)}>
      <span className="inline-flex items-center gap-1">{label} {children}</span>
    </th>
  );
}

// ─── IP Metric Detail ───────────────────────────────────────
function IPMetricDetail({ data }: { data: IPMetricDrawerData }) {
  return (
    <div>
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: uclaColors.blue + '12' }}>
          <svg className="w-5 h-5" style={{ color: uclaColors.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold" style={{ color: uclaColors.text }}>{data.metric}</h2>
      </div>

      <Section title="Definition">
        <p className="text-sm leading-relaxed" style={{ color: uclaColors.textMuted }}>{data.definition}</p>
      </Section>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <StatCard label="UCLA Value" value={data.uclaValue} />
        <StatCard label="Conference Average" value={data.conferenceAvg} />
        <StatCard label="Rank" value={data.rank} />
      </div>

      <Section title="Insight">
        <div className="rounded-lg p-4 border" style={{ borderColor: uclaColors.gold + '40', backgroundColor: uclaColors.gold + '08' }}>
          <p className="text-sm leading-relaxed" style={{ color: uclaColors.text }}>{data.insight}</p>
        </div>
      </Section>
    </div>
  );
}

// ─── Athlete Detail ─────────────────────────────────────────
function AthleteDetail({ athlete }: { athlete: AthleteIndex }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <AthleteAvatar name={athlete.name} size={72} />
        <div>
          <h2 className="text-xl font-bold" style={{ color: uclaColors.text }}>{athlete.name}</h2>
          <p className="text-sm" style={{ color: uclaColors.textMuted }}>
            {formatSportName(athlete.sport)}
            {athlete.position && ` • ${athlete.position}`}
            {athlete.year && ` • ${athlete.year}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Posts" value={String(athlete.posts)} />
        <StatCard label="Brands" value={String(athlete.brands)} />
        <StatCard label="Est. EMV" value={formatCurrency(athlete.totalEMV)} />
        <StatCard label="Followers" value={formatNumber(athlete.followers)} />
        <StatCard label="Total Likes" value={formatNumber(athlete.totalLikes)} />
        <StatCard label="Avg Engagement" value={athlete.avgEngagement.toFixed(1) + '%'} />
      </div>
    </div>
  );
}

// ─── Post Detail ────────────────────────────────────────────
function PostDetail({ post }: { post: SponsorPost }) {
  return (
    <div>
      {/* Post placeholder */}
      <div className="aspect-square rounded-xl mb-4 flex items-center justify-center"
        style={{ backgroundColor: uclaColors.blue + '08' }}>
        <Tag className="w-16 h-16 opacity-15" style={{ color: uclaColors.blue }} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <AthleteAvatar name={post.athlete.name} size={40} />
        <div>
          <p className="text-sm font-bold" style={{ color: uclaColors.text }}>{post.athlete.name}</p>
          <p className="text-xs" style={{ color: uclaColors.textDim }}>
            {formatSportName(post.athlete.sport)} &bull; {formatDate(post.publishedAt.$date)}
          </p>
        </div>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: uclaColors.text }}>{post.caption}</p>

      <div className="rounded-lg border p-4 mb-4" style={{ borderColor: uclaColors.border }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: uclaColors.textDim }}>Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricRow icon={<Heart className="w-3.5 h-3.5" />} label="Likes" value={formatNumber(post.metrics.likes)} />
          <MetricRow icon={<MessageCircle className="w-3.5 h-3.5" />} label="Comments" value={formatNumber(post.metrics.comments)} />
          <MetricRow icon={<Share2 className="w-3.5 h-3.5" />} label="Shares" value={formatNumber(post.metrics.shares || 0)} />
          <MetricRow icon={<Bookmark className="w-3.5 h-3.5" />} label="Saves" value={formatNumber(post.metrics.saves || 0)} />
        </div>
        {post.metrics.videoViews && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: uclaColors.border }}>
            <MetricRow icon={<ExternalLink className="w-3.5 h-3.5" />} label="Video Views" value={formatNumber(post.metrics.videoViews)} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold" style={{ color: uclaColors.textDim }}>Brand:</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: uclaColors.blue + '12', color: uclaColors.blue }}>
          {post.sponsorPartner}
        </span>
      </div>

      {post.permalink && (
        <a href={post.permalink} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3 hover:opacity-70 transition-opacity"
          style={{ color: uclaColors.blue }}>
          <ExternalLink className="w-4 h-4" /> View Original Post
        </a>
      )}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 pt-5 border-t" style={{ borderColor: uclaColors.border }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: uclaColors.textMuted }}>{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: uclaColors.border }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>{label}</p>
      <p className="text-lg font-bold mt-0.5" style={{ color: uclaColors.text }}>{value}</p>
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: uclaColors.textDim }}>{icon}</span>
      <span className="text-xs" style={{ color: uclaColors.textMuted }}>{label}</span>
      <span className="text-sm font-bold ml-auto" style={{ color: uclaColors.text }}>{value}</span>
    </div>
  );
}

function MiniPost({ post }: { post: SponsorPost }) {
  return (
    <div className="flex gap-3 py-2 border-b" style={{ borderColor: uclaColors.border }}>
      <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: uclaColors.blue + '08' }}>
        <Tag className="w-5 h-5 opacity-20" style={{ color: uclaColors.blue }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: uclaColors.text }}>{post.athlete.name}</p>
        <p className="text-[10px] truncate" style={{ color: uclaColors.textDim }}>{post.caption.slice(0, 60)}...</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px]" style={{ color: uclaColors.textDim }}>{formatDate(post.publishedAt.$date)}</span>
          <span className="text-[10px] font-medium" style={{ color: uclaColors.textMuted }}>
            {formatNumber(post.metrics.likes)} likes
          </span>
        </div>
      </div>
    </div>
  );
}

function BrandLogo({ handle, size = 40 }: { handle: string; size?: number }) {
  const domain = handle.replace('@', '').replace(/_+$/, '') + '.com';
  const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  return (
    <img src={url} alt={handle}
      className="rounded-full object-contain bg-white border border-gray-100 flex-shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = 'none';
        const parent = el.parentElement;
        if (parent && !parent.querySelector('.fallback')) {
          const fb = document.createElement('div');
          fb.className = 'fallback rounded-full bg-gray-100 flex items-center justify-center';
          fb.style.width = `${size}px`;
          fb.style.height = `${size}px`;
          fb.innerHTML = `<span style="font-size:${size * 0.28}px" class="font-bold text-gray-400">${handle.replace('@', '').slice(0, 2).toUpperCase()}</span>`;
          parent.appendChild(fb);
        }
      }} />
  );
}

function AthleteAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: uclaColors.blue + '15' }}>
      <span className="font-bold" style={{ fontSize: size * 0.32, color: uclaColors.blue }}>
        {initials}
      </span>
    </div>
  );
}
