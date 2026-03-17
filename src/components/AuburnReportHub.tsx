import { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { AuburnCampaignOverview } from './AuburnCampaignOverview';
import { AuburnDudewipesReport } from '../auburn/AuburnDudewipesReport';
import { AuburnAmsterdamCafeReport } from './AuburnAmsterdamCafeReport';

interface AuburnReportHubProps {
  onBack?: () => void;
}

type AuburnView = 'landing' | 'baumhowers' | 'dudewipes' | 'amsterdam';

export function AuburnReportHub({ onBack }: AuburnReportHubProps) {
  const [activeView, setActiveView] = useState<AuburnView>('landing');

  if (activeView === 'baumhowers') {
    return <AuburnCampaignOverview onBack={() => setActiveView('landing')} />;
  }

  if (activeView === 'dudewipes') {
    return <AuburnDudewipesReport onBack={() => setActiveView('landing')} />;
  }

  if (activeView === 'amsterdam') {
    return <AuburnAmsterdamCafeReport onBack={() => setActiveView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-lg sticky top-0 z-20">
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
            <h1 className="text-2xl font-bold text-white tracking-wide">AUBURN REPORTS</h1>
            <p className="text-sm text-gray-300">Choose which report to open.</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveView('baumhowers')}
            className="text-left rounded-2xl p-8 bg-white/10 border border-[#E87722]/40 hover:bg-[#E87722]/10 hover:border-[#E87722]/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E87722]/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#E87722]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Baumhower&apos;s Report</h2>
            <p className="text-gray-300 mt-2">Open the existing Auburn x Baumhower&apos;s campaign report.</p>
          </button>

          <button
            onClick={() => setActiveView('dudewipes')}
            className="text-left rounded-2xl p-8 bg-white/10 border border-[#1770C0]/40 hover:bg-[#1770C0]/10 hover:border-[#1770C0]/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1770C0]/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#3B9FD9]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Dudewipes Report</h2>
            <p className="text-gray-300 mt-2">Open the Auburn x Dude Wipes campaign report.</p>
          </button>

          <button
            onClick={() => setActiveView('amsterdam')}
            className="text-left rounded-2xl p-8 bg-white/10 border border-[#8B4513]/40 hover:bg-[#8B4513]/10 hover:border-[#8B4513]/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#8B4513]/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#8B4513]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Diners, Drive-Ins &amp; Dives</h2>
            <p className="text-gray-300 mt-2">Amsterdam Cafe x Rocco&apos;s Chicken Joint campaign report.</p>
          </button>
        </div>
      </main>
    </div>
  );
}
