// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Persistent Filter Bar
// ═══════════════════════════════════════════════════════════════
import { Search, Filter } from 'lucide-react';
import { uclaColors, formatSportName } from './uclaColors';
import { FilterState } from './uclaTypes';

interface UCLAFilterBarProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  sportOptions: string[];
  resultCount: number;
  totalCount: number;
}

export function UCLAFilterBar({ filters, onFiltersChange, sportOptions, resultCount, totalCount }: UCLAFilterBarProps) {
  return (
    <div className="border-b px-6 py-3" style={{ backgroundColor: uclaColors.lightBg, borderColor: uclaColors.border }}>
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>
          <Filter className="w-3.5 h-3.5" />
          Filters
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: uclaColors.textDim }} />
          <input
            type="text"
            placeholder="Search brands, athletes..."
            value={filters.search}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-8 pr-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 w-52"
            style={{ borderColor: uclaColors.border, color: uclaColors.text, '--tw-ring-color': uclaColors.blue } as React.CSSProperties}
          />
        </div>

        {/* Sport Filter */}
        <select
          value={filters.sport}
          onChange={e => onFiltersChange({ ...filters, sport: e.target.value })}
          className="px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2"
          style={{ borderColor: uclaColors.border, color: uclaColors.text, '--tw-ring-color': uclaColors.blue } as React.CSSProperties}
        >
          <option value="all">All Sports</option>
          {sportOptions.map(s => (
            <option key={s} value={s}>{formatSportName(s)}</option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={e => onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
            className="px-2 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: uclaColors.border, color: uclaColors.text, '--tw-ring-color': uclaColors.blue } as React.CSSProperties}
          />
          <span className="text-xs" style={{ color: uclaColors.textDim }}>to</span>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={e => onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
            className="px-2 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: uclaColors.border, color: uclaColors.text, '--tw-ring-color': uclaColors.blue } as React.CSSProperties}
          />
        </div>

        {/* Result count */}
        <div className="ml-auto text-xs font-medium" style={{ color: uclaColors.textMuted }}>
          Showing <span className="font-bold" style={{ color: uclaColors.blue }}>{resultCount}</span> of {totalCount} posts
        </div>
      </div>
    </div>
  );
}
