// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Content Tab
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play } from 'lucide-react';
import { uclaColors, formatNumber, formatDate } from './uclaColors';
import { SponsorPost, DrawerPayload } from './uclaTypes';
import { EngagementRing } from './UCLAVisualizations';

interface ContentProps {
  posts: SponsorPost[];
  onOpenDrawer: (payload: DrawerPayload) => void;
}

export function UCLAContentTab({ posts, onOpenDrawer }: ContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'top'>('grid');

  // Content type breakdown
  const typeMap = new Map<string, number>();
  posts.forEach(p => {
    const t = p.mediaType || 'IMAGE';
    typeMap.set(t, (typeMap.get(t) || 0) + 1);
  });
  const types = [...typeMap.entries()].sort((a, b) => b[1] - a[1]);
  const typeTotal = posts.length;

  const typeColors: Record<string, string> = {
    VIDEO: uclaColors.blue,
    IMAGE: uclaColors.gold,
    CAROUSEL_ALBUM: uclaColors.darkBlue,
  };

  const typeLabels: Record<string, string> = {
    VIDEO: 'Reels',
    IMAGE: 'Images',
    CAROUSEL_ALBUM: 'Carousels',
  };

  // Aggregate engagement
  const totalLikes = posts.reduce((s, p) => s + p.metrics.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.metrics.comments, 0);
  const totalShares = posts.reduce((s, p) => s + (p.metrics.shares || 0), 0);
  const totalSaves = posts.reduce((s, p) => s + (p.metrics.saves || 0), 0);
  const maxEng = Math.max(totalLikes, totalComments, totalShares, totalSaves) || 1;

  // Top performing posts
  const topPosts = [...posts].sort((a, b) =>
    (b.metrics.likes + b.metrics.comments) - (a.metrics.likes + a.metrics.comments)
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Type Breakdown */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Content Types
          </h3>
          {/* Stacked bar */}
          <div className="h-6 rounded-full overflow-hidden flex mb-4">
            {types.map(([type, count]) => (
              <div key={type}
                className="h-full transition-all"
                style={{
                  width: `${(count / typeTotal) * 100}%`,
                  backgroundColor: typeColors[type] || uclaColors.textDim,
                }}
                title={`${typeLabels[type] || type}: ${count}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {types.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: typeColors[type] || uclaColors.textDim }} />
                  <span style={{ color: uclaColors.text }}>{typeLabels[type] || type}</span>
                </div>
                <span className="font-medium" style={{ color: uclaColors.textMuted }}>
                  {count} ({((count / typeTotal) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Total Engagement
          </h3>
          <div className="flex items-center justify-center">
            <EngagementRing
              rings={[
                { label: 'Likes', value: totalLikes, max: maxEng, color: '#ef4444' },
                { label: 'Comments', value: totalComments, max: maxEng, color: uclaColors.blue },
                { label: 'Shares', value: totalShares, max: maxEng, color: uclaColors.gold },
                { label: 'Saves', value: totalSaves, max: maxEng, color: '#22c55e' },
              ]}
              size={140}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <EngStat icon={<Heart className="w-3.5 h-3.5" />} color="#ef4444" label="Likes" value={formatNumber(totalLikes)} />
            <EngStat icon={<MessageCircle className="w-3.5 h-3.5" />} color={uclaColors.blue} label="Comments" value={formatNumber(totalComments)} />
            <EngStat icon={<Share2 className="w-3.5 h-3.5" />} color={uclaColors.gold} label="Shares" value={formatNumber(totalShares)} />
            <EngStat icon={<Bookmark className="w-3.5 h-3.5" />} color="#22c55e" label="Saves" value={formatNumber(totalSaves)} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Content Stats
          </h3>
          <div className="space-y-4">
            <QuickStat label="Total Posts" value={formatNumber(posts.length)} />
            <QuickStat label="Avg Likes/Post" value={formatNumber(Math.round(totalLikes / Math.max(posts.length, 1)))} />
            <QuickStat label="Avg Comments/Post" value={formatNumber(Math.round(totalComments / Math.max(posts.length, 1)))} />
            <QuickStat label="Video Views" value={formatNumber(posts.reduce((s, p) => s + (p.metrics.videoViews || 0), 0))} />
            <QuickStat label="Avg Engagement Rate" value={
              (posts.reduce((s, p) => s + p.metrics.engagementRate, 0) / Math.max(posts.length, 1)).toFixed(1) + '%'
            } />
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'text-white' : ''}`}
          style={{
            backgroundColor: viewMode === 'grid' ? uclaColors.blue : 'transparent',
            color: viewMode === 'grid' ? '#fff' : uclaColors.textMuted,
            border: viewMode === 'grid' ? 'none' : `1px solid ${uclaColors.border}`,
          }}
        >
          All Posts
        </button>
        <button
          onClick={() => setViewMode('top')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'top' ? 'text-white' : ''}`}
          style={{
            backgroundColor: viewMode === 'top' ? uclaColors.blue : 'transparent',
            color: viewMode === 'top' ? '#fff' : uclaColors.textMuted,
            border: viewMode === 'top' ? 'none' : `1px solid ${uclaColors.border}`,
          }}
        >
          Top Performing
        </button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(viewMode === 'top' ? topPosts : posts.slice(0, 40)).map(post => (
          <PostCard key={post._id} post={post} onClick={() => onOpenDrawer({ type: 'post', data: post })} />
        ))}
      </div>
      {viewMode === 'grid' && posts.length > 40 && (
        <p className="text-center text-sm" style={{ color: uclaColors.textDim }}>
          Showing 40 of {posts.length} posts. Use filters to narrow results.
        </p>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function PostCard({ post, onClick }: { post: SponsorPost; onClick: () => void }) {
  const isVideo = post.mediaType === 'VIDEO';
  return (
    <button onClick={onClick}
      className="rounded-xl border bg-white text-left hover:shadow-md transition-all group overflow-hidden"
      style={{ borderColor: uclaColors.border }}>
      {/* Thumbnail placeholder */}
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: uclaColors.blue + '08' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <Play className="w-10 h-10 opacity-20" style={{ color: uclaColors.blue }} />
          ) : (
            <div className="w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: uclaColors.blue }} />
          )}
        </div>
        {isVideo && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
            style={{ backgroundColor: uclaColors.blue }}>
            REEL
          </span>
        )}
        {post.mediaType === 'CAROUSEL_ALBUM' && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
            style={{ backgroundColor: uclaColors.darkBlue }}>
            CAROUSEL
          </span>
        )}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white">
          {post.sponsorPartner}
        </span>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold truncate" style={{ color: uclaColors.text }}>{post.athlete.name}</p>
        <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: uclaColors.textDim }}>
          {post.caption.slice(0, 80)}...
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: uclaColors.textMuted }}>
            <Heart className="w-3 h-3" /> {formatNumber(post.metrics.likes)}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: uclaColors.textMuted }}>
            <MessageCircle className="w-3 h-3" /> {formatNumber(post.metrics.comments)}
          </span>
          <span className="ml-auto text-[10px]" style={{ color: uclaColors.textDim }}>
            {formatDate(post.publishedAt.$date)}
          </span>
        </div>
      </div>
    </button>
  );
}

function EngStat({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-xs" style={{ color: uclaColors.textDim }}>{label}</p>
        <p className="text-sm font-bold" style={{ color: uclaColors.text }}>{value}</p>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: uclaColors.textMuted }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: uclaColors.text }}>{value}</span>
    </div>
  );
}
