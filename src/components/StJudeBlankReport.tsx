import { ArrowLeft } from 'lucide-react';

interface StJudeBlankReportProps {
  onBack: () => void;
}

export function StJudeBlankReport({ onBack }: StJudeBlankReportProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-2 bg-[#C8102E]" />

      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>

          <img
            src="/st-jude-logo.svg"
            alt="St. Jude"
            className="h-12 w-auto"
          />

          <div>
            <h1 className="text-2xl font-bold text-black tracking-wide">ST. JUDE REPORT</h1>
            <p className="text-sm text-gray-600">Blank template ready to build from scratch</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900">This report is intentionally blank.</h2>
          <p className="mt-2 text-gray-600">We can add sections and visuals here as you define them.</p>
        </div>
      </main>
    </div>
  );
}
