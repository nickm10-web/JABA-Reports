// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — SVG Visualization Primitives
// ═══════════════════════════════════════════════════════════════
import { uclaColors } from './uclaColors';

// ─── Sparkline Chart ────────────────────────────────────────
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function SparklineChart({ data, width = 120, height = 40, color = uclaColors.gold, showArea = true }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const areaPoints = `${pad},${height - pad} ${polyline} ${width - pad},${height - pad}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {showArea && (
        <polygon points={areaPoints} fill={color} opacity={0.15} />
      )}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(points[points.length - 1].split(',')[0])} cy={parseFloat(points[points.length - 1].split(',')[1])} r={3} fill={color} />
    </svg>
  );
}

// ─── Donut Chart ────────────────────────────────────────────
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, size = 160, thickness = 24, centerLabel, centerValue }: DonutProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const offset = circumference * (1 - pct);
    const rotation = (cumulative / total) * 360 - 90;
    cumulative += seg.value;
    return { ...seg, pct, offset, rotation };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={arc.offset}
            transform={`rotate(${arc.rotation} ${cx} ${cy})`}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-lg font-bold" style={{ color: uclaColors.text }}>{centerValue}</span>}
          {centerLabel && <span className="text-xs" style={{ color: uclaColors.textMuted }}>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Percentile Bar ─────────────────────────────────────────
interface PercentileBarProps {
  label: string;
  percentile: number;
  color?: string;
  value?: string;
}

export function PercentileBar({ label, percentile, color = uclaColors.blue, value }: PercentileBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium" style={{ color: uclaColors.text }}>{label}</span>
        <div className="flex items-center gap-2">
          {value && <span className="text-xs" style={{ color: uclaColors.textMuted }}>{value}</span>}
          <span className="text-sm font-bold" style={{ color }}>{percentile}th</span>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: uclaColors.border }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentile}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ───────────────────────────────────
interface HBarData {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
}

interface HBarChartProps {
  bars: HBarData[];
  maxValue?: number;
  formatValue?: (v: number) => string;
}

export function HorizontalBarChart({ bars, maxValue, formatValue = (v) => String(v) }: HBarChartProps) {
  const max = maxValue || Math.max(...bars.map(b => b.value));

  return (
    <div className="space-y-2.5">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${bar.highlight ? 'font-bold' : 'font-medium'}`}
              style={{ color: bar.highlight ? uclaColors.blue : uclaColors.text }}>
              {bar.label}
            </span>
            <span className={`text-sm ${bar.highlight ? 'font-bold' : ''}`}
              style={{ color: bar.highlight ? uclaColors.blue : uclaColors.textMuted }}>
              {formatValue(bar.value)}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: uclaColors.border }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(bar.value / max) * 100}%`,
                backgroundColor: bar.color || (bar.highlight ? uclaColors.blue : uclaColors.textDim),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bump Chart (Rank Over Time) ────────────────────────────
interface BumpSeries {
  label: string;
  color: string;
  data: number[]; // rank per month (1 = best)
  highlight?: boolean;
}

interface BumpChartProps {
  series: BumpSeries[];
  months: string[];
  width?: number;
  height?: number;
  maxRank?: number;
}

export function BumpChart({ series, months, width = 600, height = 240, maxRank = 9 }: BumpChartProps) {
  const padX = 40;
  const padY = 20;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  function getX(i: number) { return padX + (i / (months.length - 1)) * plotW; }
  function getY(rank: number) { return padY + ((rank - 1) / (maxRank - 1)) * plotH; }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      {Array.from({ length: maxRank }, (_, i) => (
        <line key={i} x1={padX} y1={getY(i + 1)} x2={width - padX} y2={getY(i + 1)}
          stroke={uclaColors.border} strokeWidth={0.5} />
      ))}

      {/* Month labels */}
      {months.map((m, i) => (
        <text key={i} x={getX(i)} y={height - 2} textAnchor="middle"
          className="text-[10px]" fill={uclaColors.textDim}>
          {m}
        </text>
      ))}

      {/* Rank labels */}
      {[1, 3, 5, 7, 9].filter(r => r <= maxRank).map(r => (
        <text key={r} x={padX - 8} y={getY(r) + 4} textAnchor="end"
          className="text-[10px]" fill={uclaColors.textDim}>
          #{r}
        </text>
      ))}

      {/* Lines */}
      {series.map((s, si) => {
        const points = s.data.map((rank, i) => `${getX(i)},${getY(rank)}`).join(' ');
        return (
          <g key={si}>
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth={s.highlight ? 3 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.highlight ? 1 : 0.4}
            />
            {/* End dot + label */}
            <circle
              cx={getX(s.data.length - 1)}
              cy={getY(s.data[s.data.length - 1])}
              r={s.highlight ? 5 : 3}
              fill={s.color}
              opacity={s.highlight ? 1 : 0.5}
            />
            <text
              x={getX(s.data.length - 1) + 8}
              y={getY(s.data[s.data.length - 1]) + 4}
              className="text-[9px] font-medium"
              fill={s.color}
              opacity={s.highlight ? 1 : 0.5}
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Heatmap Grid ───────────────────────────────────────────
interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  status: 'active' | 'competitor' | 'none';
  brandCount?: number;
}

interface HeatmapGridProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  onCellClick?: (cell: HeatmapCell) => void;
  rowFormatter?: (r: string) => string;
}

export function HeatmapGrid({ rows, cols, cells, onCellClick, rowFormatter }: HeatmapGridProps) {
  function getCell(row: string, col: string) {
    return cells.find(c => c.row === row && c.col === col);
  }

  function cellColor(status: string) {
    if (status === 'active') return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
    if (status === 'competitor') return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
    return { bg: '#f3f4f6', text: '#9ca3af', border: '#e5e7eb' };
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `140px repeat(${cols.length}, 1fr)` }}>
        {/* Header row */}
        <div />
        {cols.map(col => (
          <div key={col} className="text-[10px] font-semibold text-center px-1 py-2 truncate"
            style={{ color: uclaColors.textMuted, minWidth: 80 }}>
            {col}
          </div>
        ))}

        {/* Data rows */}
        {rows.map(row => (
          <>
            <div key={`label-${row}`} className="text-xs font-medium flex items-center pr-2 truncate"
              style={{ color: uclaColors.text }}>
              {rowFormatter ? rowFormatter(row) : row}
            </div>
            {cols.map(col => {
              const cell = getCell(row, col);
              const status = cell?.status || 'none';
              const c = cellColor(status);
              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => cell && onCellClick?.(cell)}
                  className="rounded-md text-[10px] font-semibold py-2 px-1 transition-all hover:scale-105 border"
                  style={{
                    backgroundColor: c.bg,
                    color: c.text,
                    borderColor: c.border,
                    minWidth: 80,
                    cursor: cell && onCellClick ? 'pointer' : 'default',
                  }}
                >
                  {status === 'active' ? `${cell?.brandCount || 0} brands` : status === 'competitor' ? 'Gap' : '—'}
                </button>
              );
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: uclaColors.textMuted }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac' }} />
          Active deals
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047' }} />
          Competitor has, UCLA gap
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }} />
          No activity
        </div>
      </div>
    </div>
  );
}

// ─── Engagement Ring ────────────────────────────────────────
interface RingData {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface EngagementRingProps {
  rings: RingData[];
  size?: number;
}

export function EngagementRing({ rings, size = 120 }: EngagementRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const baseThickness = 8;
  const gap = 4;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const radius = (size / 2) - (baseThickness / 2) - i * (baseThickness + gap) - 4;
          if (radius <= 0) return null;
          const circumference = 2 * Math.PI * radius;
          const pct = Math.min(ring.value / ring.max, 1);
          const dashOffset = circumference * (1 - pct);

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={radius} fill="none"
                stroke={ring.color} strokeWidth={baseThickness} opacity={0.15} />
              <circle cx={cx} cy={cy} r={radius} fill="none"
                stroke={ring.color} strokeWidth={baseThickness}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                className="transition-all duration-700"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
