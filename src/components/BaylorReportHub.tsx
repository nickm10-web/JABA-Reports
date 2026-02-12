import { useState } from 'react';
import { ArrowLeft, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaylorBrandDeals } from './BaylorBrandDeals';

type View = 'hub' | 'brand-deals';

interface BaylorReportHubProps {
  onBack?: () => void;
}

export function BaylorReportHub({ onBack }: BaylorReportHubProps) {
  const [activeView, setActiveView] = useState<View>('hub');

  if (activeView === 'brand-deals') {
    return <BaylorBrandDeals onBack={() => setActiveView('hub')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-yellow-900/10 to-green-500/10 opacity-30" />

      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
            <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" alt="Baylor" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Baylor University</h1>
          <p className="text-lg text-gray-300">Bears • <span className="text-white font-semibold">Big 12</span></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 gap-6 max-w-xl mx-auto">
          <motion.button
            onClick={() => setActiveView('brand-deals')}
            className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-green-400/50 transition-all duration-300 text-left w-full"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Handshake className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Brand Deals 2025</h2>
              <p className="text-gray-300 text-base mb-6">All brand partnership posts from Baylor athletes in 2025</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <span>View Report</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">212</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Brand Posts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">115</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Athletes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">116</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">15</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Sports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
