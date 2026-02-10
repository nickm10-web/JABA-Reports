import { useState } from 'react';
import { ArrowLeft, Trophy, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuburnCampaignDashboard } from './AuburnCampaignDashboard';
import { AuburnCampaignOverview } from './AuburnCampaignOverview';
import { AuburnIPImpact } from './AuburnIPImpact';

type View = 'hub' | 'campaign' | 'overview' | 'ip-report' | 'analytics' | 'insights';

interface AuburnReportHubProps {
  onBack: () => void;
}

export function AuburnReportHub({ onBack }: AuburnReportHubProps) {
  const [activeView, setActiveView] = useState<View>('hub');

  // Campaign Dashboard view
  if (activeView === 'campaign') {
    return <AuburnCampaignOverview onBack={() => setActiveView('hub')} />;
  }

  // IP Report view
  if (activeView === 'ip-report') {
    return <AuburnIPImpact onBack={() => setActiveView('hub')} />;
  }

  // Hub view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-blue-900/10 to-orange-500/10 opacity-30" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
            <div className="text-4xl">🐯</div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Auburn University
          </h1>

          <p className="text-lg text-gray-300">
            Tigers • <span className="text-white font-semibold">SEC</span>
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Campaign Dashboard */}
          <motion.button
            onClick={() => setActiveView('campaign')}
            className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-orange-400/50 transition-all duration-300 text-left w-full"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Campaign Dashboard
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-base mb-6">
                Baumhower's partnership campaign performance
              </p>

              {/* View button */}
              <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
                <span>View Dashboard</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Card 2: IP Report */}
          <motion.button
            onClick={() => setActiveView('ip-report')}
            className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 text-left w-full"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                IP Report
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-base mb-6">
                IP impact analysis and brand partnership performance
              </p>

              {/* View button */}
              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                <span>View Report</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>

        </div>

        {/* Stats Bar at Bottom */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">SEC</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Conference</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">2.3M</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">248</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Brand Posts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">$172K</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total EMV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
