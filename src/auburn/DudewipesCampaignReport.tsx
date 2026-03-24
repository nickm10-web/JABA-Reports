interface DudewipesCampaignReportProps {
  onBack?: () => void;
}

export function DudewipesCampaignReport({ onBack }: DudewipesCampaignReportProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Dudewipes Campaign Report</h1>
        <p className="mt-3 text-gray-600">Placeholder report shell for Prompt 2.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-6 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm hover:bg-black transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}

export default DudewipesCampaignReport;
