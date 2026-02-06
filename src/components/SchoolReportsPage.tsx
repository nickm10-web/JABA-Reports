import { useState } from 'react';
import { FileText } from 'lucide-react';
import { SCHOOLS, SchoolConfig } from '../data/schoolConfig';
import { SchoolReportView } from './SchoolReportView';
import { PlayflyReportHub } from './PlayflyReportHub';
import { AuburnCampaignDashboard } from './AuburnCampaignDashboard';
import { OhioStateIPImpact } from './OhioStateIPImpact';

export function SchoolReportsPage() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolConfig | null>(null);

  // Show Playfly, Auburn, Kentucky, and Ohio State
  const allSchools = [SCHOOLS['playfly'], SCHOOLS['auburn'], SCHOOLS['kentucky'], SCHOOLS['ohio-state']].filter(Boolean);

  // If a school is selected, show the appropriate view
  if (selectedSchool) {
    // If Playfly is selected, show the hub with two report options
    if (selectedSchool.id === 'playfly') {
      return (
        <PlayflyReportHub
          onBack={() => setSelectedSchool(null)}
        />
      );
    }
    // If Auburn is selected, show campaign dashboard
    if (selectedSchool.id === 'auburn') {
      return (
        <AuburnCampaignDashboard onBack={() => setSelectedSchool(null)} />
      );
    }
    // If Ohio State is selected, show IP Impact report
    if (selectedSchool.id === 'ohio-state') {
      return (
        <OhioStateIPImpact onBack={() => setSelectedSchool(null)} />
      );
    }
    // If Kentucky is selected, show blank report for now
    if (selectedSchool.id === 'kentucky') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {/* Header */}
          <div className="border-b border-white/10 bg-black/30 backdrop-blur-lg sticky top-0 z-10">
            <div className="max-w-[1600px] mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">
                      {selectedSchool.name.toUpperCase()}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedSchool.mascot} • {selectedSchool.conference}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blank Content Area */}
          <div className="max-w-[1600px] mx-auto px-8 py-16">
            <div className="text-center text-gray-400">
              <p className="text-xl">Report coming soon...</p>
            </div>
          </div>
        </div>
      );
    }
    // Otherwise show regular school report view
    return (
      <SchoolReportView
        school={selectedSchool}
        onBack={() => setSelectedSchool(null)}
      />
    );
  }

  // Otherwise show the schools grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* JABA Logo */}
              <img
                src="/jaba-logo.png"
                alt="JABA"
                className="h-12"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">
                  JABA REPORTS
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Select a school to view their detailed report
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                <FileText className="w-4 h-4" />
                <span>{allSchools.length} {allSchools.length === 1 ? 'School' : 'Schools'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allSchools.map((school) => (
            <button
              key={school.id}
              onClick={() => setSelectedSchool(school)}
              className="group relative bg-white/10 backdrop-blur-lg border border-[#1770C0]/30 rounded-2xl p-6 hover:bg-[#1770C0]/10 hover:border-[#1770C0]/50 transition-all duration-300 text-left"
            >
              {/* School Logo */}
              <div className="absolute top-6 right-6 w-16 h-16 rounded-xl bg-white/5 border border-[#1770C0]/30 p-2 flex items-center justify-center group-hover:border-[#1770C0]/70 transition-colors">
                {school.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt={school.name}
                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      // Hide image on error and show fallback text
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'logo-fallback text-gray-400 text-xs font-bold';
                        fallback.textContent = school.shortName.substring(0, 3).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-xs font-bold">
                    {school.shortName.substring(0, 3).toUpperCase()}
                  </div>
                )}
              </div>

              {/* School Info */}
              <div className="pr-20">
                <h3 className="text-xl font-bold text-white tracking-wide mb-1">
                  {school.shortName.toUpperCase()}
                </h3>
                <p className="text-gray-300 text-sm mb-1">{school.mascot}</p>
                <p className="text-gray-400 text-xs">{school.conference}</p>
              </div>

              {/* Quick Stats Preview */}
              <div className="mt-6 pt-4 border-t border-[#1770C0]/20 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-[#1770C0]/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#3B9FD9]" />
                  </div>
                  <p className="text-gray-400 text-xs">Reports</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-[#1770C0]/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#3B9FD9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs">Analytics</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-[#1770C0]/25 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#3B9FD9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs">Insights</p>
                </div>
              </div>

              {/* View Report Button */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[#3B9FD9] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <FileText className="w-4 h-4" />
                <span>View Reports</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
