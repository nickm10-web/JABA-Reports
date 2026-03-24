import { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { ClemsonIPImpact } from './ClemsonIPImpact';
import { ClemsonHardeesCampaignReport } from './ClemsonHardeesCampaignReport';

interface ClemsonReportHubProps {
  onBack?: () => void;
}

type ClemsonView = 'landing' | 'ip' | 'hardees';

export function ClemsonReportHub({ onBack }: ClemsonReportHubProps) {
  const [activeView, setActiveView] = useState<ClemsonView>('landing');

  if (activeView === 'ip') {
    return <ClemsonIPImpact onBack={() => setActiveView('landing')} />;
  }

  if (activeView === 'hardees') {
    return <ClemsonHardeesCampaignReport onBack={() => setActiveView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#351C54] via-[#522D80] to-[#1E1036]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Back to reports"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">CLEMSON REPORTS</h1>
            <p className="text-sm text-orange-100/80">Choose which report to open.</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setActiveView('ip')}
            className="text-left rounded-2xl p-8 bg-white/10 border border-[#F56600]/40 hover:bg-[#F56600]/10 hover:border-[#F56600]/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F56600]/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#FF8A33]" />
            </div>
            <h2 className="text-2xl font-bold text-white">IP Impact Report</h2>
            <p className="text-orange-100/80 mt-2">Open the existing Clemson IP impact report.</p>
          </button>

          <button
            onClick={() => setActiveView('hardees')}
            className="text-left rounded-2xl p-8 bg-white/10 border border-[#F56600]/40 hover:bg-[#F56600]/10 hover:border-[#F56600]/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F56600]/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#FF8A33]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Hardee&apos;s Campaign Report</h2>
            <p className="text-orange-100/80 mt-2">Open the Clemson x Hardee&apos;s multi-sport campaign report.</p>
          </button>
        </div>
      </main>
    </div>
  );
}
