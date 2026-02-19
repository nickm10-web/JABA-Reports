// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Header + Tabs
// ═══════════════════════════════════════════════════════════════
import { ArrowLeft, Download, LayoutGrid, BarChart3, Tag, Camera, Zap, Users, Shield } from 'lucide-react';
import { uclaColors } from './uclaColors';
import { UCLATabId } from './uclaTypes';
import { useNilContext } from './NilReportContext';

const UCLA_TABS: { id: UCLATabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'benchmarks', label: 'Benchmarks', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'brand-deals', label: 'Brand Deals', icon: <Tag className="w-4 h-4" /> },
  { id: 'content', label: 'Content', icon: <Camera className="w-4 h-4" /> },
  { id: 'opportunity', label: 'Opportunity', icon: <Zap className="w-4 h-4" /> },
  { id: 'athletes', label: 'Athletes', icon: <Users className="w-4 h-4" /> },
  { id: 'ip-intelligence', label: 'IP Intelligence', icon: <Shield className="w-4 h-4" /> },
];

interface UCLAHeaderProps {
  activeTab: UCLATabId;
  onTabChange: (tab: UCLATabId) => void;
  onBack?: () => void;
  onExport: () => void;
}

export function UCLAHeader({ activeTab, onTabChange, onBack, onExport }: UCLAHeaderProps) {
  const { shortName, nickname, conference, colors, benchmark } = useNilContext();
  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: uclaColors.border }}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack}
                className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: uclaColors.textMuted }}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <img
                src={benchmark.logoUrl}
                alt={shortName}
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold tracking-tight" style={{ color: uclaColors.text }}>
                  {shortName} <span style={{ color: colors.primary }}>NIL Intelligence</span>
                </h1>
                <p className="text-[11px] font-medium" style={{ color: uclaColors.textDim }}>
                  {nickname} &bull; {conference} &bull; 2025 Report
                </p>
              </div>
            </div>
          </div>

          <button onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: colors.secondary, color: '#000' }}>
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 -mb-px overflow-x-auto">
          {UCLA_TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive ? 'border-current' : 'border-transparent hover:opacity-70'
                }`}
                style={{ color: isActive ? colors.primary : uclaColors.textMuted }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
