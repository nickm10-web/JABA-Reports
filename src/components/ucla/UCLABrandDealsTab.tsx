// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Brand Deals Tab
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { uclaColors, formatNumber, formatCurrency, formatSportName } from './uclaColors';
import { BrandGroup, DrawerPayload } from './uclaTypes';

interface BrandDealsProps {
  brandGroups: BrandGroup[];
  onOpenDrawer: (payload: DrawerPayload) => void;
}

type SortKey = 'posts' | 'athletes' | 'name' | 'emv' | 'sports';

export function UCLABrandDealsTab({ brandGroups, onOpenDrawer }: BrandDealsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('posts');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...brandGroups].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'posts': cmp = a.posts.length - b.posts.length; break;
      case 'athletes': cmp = a.uniqueAthletes.length - b.uniqueAthletes.length; break;
      case 'name': cmp = a.displayName.localeCompare(b.displayName); break;
      case 'emv': cmp = a.totalEMV - b.totalEMV; break;
      case 'sports': cmp = a.sports.length - b.sports.length; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Brands" value={String(brandGroups.length)} />
        <SummaryCard label="Total Posts" value={formatNumber(brandGroups.reduce((s, b) => s + b.posts.length, 0))} />
        <SummaryCard label="Total EMV" value={formatCurrency(brandGroups.reduce((s, b) => s + b.totalEMV, 0))} />
        <SummaryCard label="Avg Posts/Brand" value={(brandGroups.reduce((s, b) => s + b.posts.length, 0) / Math.max(brandGroups.length, 1)).toFixed(1)} />
      </div>

      {/* Brand Table */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                <th className="text-left py-3 pl-5 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>#</th>
                <ThSort label="Brand" col="name" current={sortKey} onSort={handleSort}><SortIcon col="name" /></ThSort>
                <ThSort label="Posts" col="posts" current={sortKey} onSort={handleSort} align="right"><SortIcon col="posts" /></ThSort>
                <ThSort label="Athletes" col="athletes" current={sortKey} onSort={handleSort} align="right"><SortIcon col="athletes" /></ThSort>
                <ThSort label="Sports" col="sports" current={sortKey} onSort={handleSort} align="right"><SortIcon col="sports" /></ThSort>
                <ThSort label="Est. EMV" col="emv" current={sortKey} onSort={handleSort} align="right"><SortIcon col="emv" /></ThSort>
                <th className="text-right py-3 pr-5 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((brand, i) => (
                <tr key={brand.key}
                  onClick={() => onOpenDrawer({ type: 'brand', data: brand })}
                  className="border-b cursor-pointer hover:bg-blue-50/40 transition-colors"
                  style={{ borderColor: uclaColors.border }}>
                  <td className="py-3 pl-5 pr-3 font-medium" style={{ color: uclaColors.textDim }}>{i + 1}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo handle={brand.handle} size={32} />
                      <div>
                        <p className="font-semibold" style={{ color: uclaColors.text }}>{brand.displayName}</p>
                        <p className="text-xs" style={{ color: uclaColors.textDim }}>{brand.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{brand.posts.length}</td>
                  <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>{brand.uniqueAthletes.length}</td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {brand.sports.slice(0, 3).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: uclaColors.blue + '12', color: uclaColors.blue }}>
                          {formatSportName(s).split(' ').pop()}
                        </span>
                      ))}
                      {brand.sports.length > 3 && (
                        <span className="text-[10px] font-medium" style={{ color: uclaColors.textDim }}>
                          +{brand.sports.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right font-semibold" style={{ color: uclaColors.blue }}>
                    {formatCurrency(brand.totalEMV)}
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: uclaColors.gold + '20', color: '#92650a' }}>
                      {brand.category}
                    </span>
                  </td>
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
function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>{label}</p>
      <p className="text-xl font-bold mt-1" style={{ color: uclaColors.text }}>{value}</p>
    </div>
  );
}

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

function BrandLogo({ handle, size = 32 }: { handle: string; size?: number }) {
  const [err, setErr] = useState(false);
  const domain = handle.replace('@', '').replace(/_+$/, '') + '.com';
  const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

  if (err) {
    return (
      <div className="rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}>
        <span className="font-bold text-gray-400" style={{ fontSize: size * 0.3 }}>
          {handle.replace('@', '').slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <img src={url} alt={handle}
      className="rounded-full object-contain bg-white border border-gray-100 flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setErr(true)} />
  );
}
