import { useState } from 'react';
import { ArrowLeft, BarChart3, Target } from 'lucide-react';
import { OhioStateDashboard } from './OhioStateDashboard';
import { OhioStateIPImpact } from './OhioStateIPImpact';

// Ohio State brand colors
const colors = {
  scarlet: '#ba0c2f',
  gray: '#a7b1b7',
  lightBg: '#f9fafb',
};

type View = 'hub' | 'dashboard' | 'ip-impact';

interface OhioStateReportHubProps {
  onBack: () => void;
}

export function OhioStateReportHub({ onBack }: OhioStateReportHubProps) {
  const [activeView, setActiveView] = useState<View>('hub');

  // Dashboard view
  if (activeView === 'dashboard') {
    return <OhioStateDashboard onBack={() => setActiveView('hub')} />;
  }

  // IP Impact view
  if (activeView === 'ip-impact') {
    return <OhioStateIPImpact onBack={() => setActiveView('hub')} />;
  }

  // Hub view
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: colors.lightBg }}>
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/ohio-state-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-gray-200 flex items-center gap-2 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"
            alt="Ohio State"
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />

          <h1
            className="text-4xl font-black uppercase tracking-tight mb-3"
            style={{ color: colors.scarlet }}
          >
            Ohio State Athletics
          </h1>

          <p className="text-lg text-gray-600">
            Digital Performance & Brand Intelligence Reports
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dashboard Card */}
          <button
            onClick={() => setActiveView('dashboard')}
            className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300 text-left"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${colors.scarlet}15` }}
            >
              <BarChart3 className="w-7 h-7" style={{ color: colors.scarlet }} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Digital Performance Dashboard
            </h2>

            <p className="text-gray-600 mb-6">
              Overview of athlete reach, engagement metrics, top performers, and brand partnership performance.
            </p>

            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: colors.scarlet }}
            >
              <span>View Dashboard</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* IP Impact Card */}
          <button
            onClick={() => setActiveView('ip-impact')}
            className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300 text-left"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${colors.scarlet}15` }}
            >
              <Target className="w-7 h-7" style={{ color: colors.scarlet }} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">
              IP Impact Report
            </h2>

            <p className="text-gray-600 mb-6">
              Analyze how IP signals (logos, mentions, collaborations) affect engagement across athlete content.
            </p>

            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: colors.scarlet }}
            >
              <span>View Report</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
