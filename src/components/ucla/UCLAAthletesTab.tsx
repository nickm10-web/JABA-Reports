// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Athletes Tab
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { uclaColors, formatNumber, formatCurrency, formatSportName } from './uclaColors';
import { AthleteIndex, DrawerPayload } from './uclaTypes';
import { HorizontalBarChart } from './UCLAVisualizations';
import { sportColors } from './uclaColors';

interface AthletesProps {
  athleteIndex: AthleteIndex[];
  onOpenDrawer: (payload: DrawerPayload) => void;
}

type SortKey = 'posts' | 'likes' | 'brands' | 'name' | 'emv' | 'followers' | 'engagement';

export function UCLAAthletesTab({ athleteIndex, onOpenDrawer }: AthletesProps) {
  const [sortKey, setSortKey] = useState<SortKey>('emv');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...athleteIndex].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'posts': cmp = a.posts - b.posts; break;
      case 'likes': cmp = a.totalLikes - b.totalLikes; break;
      case 'brands': cmp = a.brands - b.brands; break;
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'emv': cmp = a.totalEMV - b.totalEMV; break;
      case 'followers': cmp = a.followers - b.followers; break;
      case 'engagement': cmp = a.avgEngagement - b.avgEngagement; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  // Sport breakdown for bar chart
  const sportMap = new Map<string, number>();
  athleteIndex.forEach(a => {
    sportMap.set(a.sport, (sportMap.get(a.sport) || 0) + 1);
  });
  const sportBars = [...sportMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([sport, count]) => ({
      label: formatSportName(sport),
      value: count,
      color: sportColors[sport] || uclaColors.textDim,
    }));

  // Engagement leaders (top 5)
  const engLeaders = [...athleteIndex].sort((a, b) => b.avgEngagement - a.avgEngagement).slice(0, 5);

  const SortIcon = ({ col }: { col: SortKey }): React.ReactNode => {
    if (col !== sortKey) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sport Breakdown */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Athletes by Sport
          </h3>
          <HorizontalBarChart bars={sportBars} formatValue={v => String(v)} />
        </div>

        {/* Engagement Leaders */}
        <div className="lg:col-span-2 rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            <Trophy className="w-4 h-4 inline mr-1" style={{ color: uclaColors.gold }} />
            Top Engagement Leaders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {engLeaders.map((a) => (
              <button key={a.id}
                onClick={() => onOpenDrawer({ type: 'athlete', data: a })}
                className="rounded-xl border p-3 text-center hover:bg-blue-50/40 transition-colors cursor-pointer"
                style={{ borderColor: uclaColors.border }}>
                <AthleteAvatar name={a.name} size={48} />
                <p className="text-sm font-semibold mt-2 truncate" style={{ color: uclaColors.text }}>{a.name}</p>
                <p className="text-[10px] font-medium" style={{ color: uclaColors.textDim }}>
                  {formatSportName(a.sport)}
                </p>
                <div className="mt-2 px-2 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: uclaColors.gold + '20', color: '#92650a' }}>
                  {a.avgEngagement.toFixed(1)}% eng
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Athlete Table */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                <th className="text-left py-3 pl-5 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>#</th>
                <ThSort label="Athlete" col="name" current={sortKey} onSort={handleSort}><SortIcon col="name" /></ThSort>
                <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Sport</th>
                <ThSort label="Posts" col="posts" current={sortKey} onSort={handleSort} align="right"><SortIcon col="posts" /></ThSort>
                <ThSort label="Likes" col="likes" current={sortKey} onSort={handleSort} align="right"><SortIcon col="likes" /></ThSort>
                <ThSort label="Brands" col="brands" current={sortKey} onSort={handleSort} align="right"><SortIcon col="brands" /></ThSort>
                <ThSort label="Followers" col="followers" current={sortKey} onSort={handleSort} align="right"><SortIcon col="followers" /></ThSort>
                <ThSort label="Est. EMV" col="emv" current={sortKey} onSort={handleSort} align="right"><SortIcon col="emv" /></ThSort>
                <ThSort label="Avg Eng." col="engagement" current={sortKey} onSort={handleSort} align="right"><SortIcon col="engagement" /></ThSort>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => (
                <tr key={a.id}
                  onClick={() => onOpenDrawer({ type: 'athlete', data: a })}
                  className="border-b cursor-pointer hover:bg-blue-50/40 transition-colors"
                  style={{ borderColor: uclaColors.border }}>
                  <td className="py-3 pl-5 pr-3 font-medium" style={{ color: uclaColors.textDim }}>{i + 1}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <AthleteAvatar name={a.name} size={32} />
                      <div>
                        <p className="font-semibold" style={{ color: uclaColors.text }}>{a.name}</p>
                        <p className="text-[10px]" style={{ color: uclaColors.textDim }}>
                          {a.position && `${a.position} • `}{a.year}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{ backgroundColor: (sportColors[a.sport] || uclaColors.textDim) + '18', color: sportColors[a.sport] || uclaColors.textDim }}>
                      {formatSportName(a.sport)}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{a.posts}</td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{formatNumber(a.totalLikes)}</td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{a.brands}</td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{formatNumber(a.followers)}</td>
                  <td className="py-3 pr-3 text-right font-semibold" style={{ color: uclaColors.blue }}>{formatCurrency(a.totalEMV)}</td>
                  <td className="py-3 pr-5 text-right font-medium" style={{ color: uclaColors.text }}>{a.avgEngagement.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function ThSort({ label, col, current, onSort, align, children }: {
  label: string; col: SortKey; current: SortKey; onSort: (k: SortKey) => void; align?: string; children: React.ReactNode;
}) {
  return (
    <th className={`py-3 pr-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none hover:opacity-70 ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: col === current ? uclaColors.blue : uclaColors.textDim }}
      onClick={() => onSort(col)}>
      <span className="inline-flex items-center gap-1">{label} {children}</span>
    </th>
  );
}

function AthleteAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 mx-auto"
      style={{ width: size, height: size, backgroundColor: uclaColors.blue + '15' }}>
      <span className="font-bold" style={{ fontSize: size * 0.32, color: uclaColors.blue }}>
        {initials}
      </span>
    </div>
  );
}
