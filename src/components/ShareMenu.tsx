import { useState } from 'react';
import { Share2, Mail, Link2, FileJson, FileSpreadsheet, Image, Check, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { getNetworkMetrics, PLAYFLY_MAX_PARTNERS } from '../data/playflyNetworkData';
import { getIPPerformanceMetrics } from '../data/playflyIPAnalytics';
import { CURRENT_BRAND_PARTNERS } from '../data/playflyBrandData';
import { generateExecutiveReportPDF } from '../utils/pdfExport';
import { buildScrapeCreatorsAIPrompt } from '../services/scrapeCreatorsClient';

interface ShareMenuProps {
  onClose: () => void;
}

export function ShareMenu({ onClose }: ShareMenuProps) {
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccessMessage('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleCopyForAI = async () => {
    try {
      await navigator.clipboard.writeText(buildScrapeCreatorsAIPrompt());
      showSuccessMessage('ScrapeCreators AI prompt copied!');
    } catch (err) {
      alert('Failed to copy AI prompt');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Playfly Executive Report - ${format(new Date(), 'MMM dd, yyyy')}`);
    const body = encodeURIComponent(
      `Here's the latest Playfly network analysis showing:\n\n` +
      `• 252,171 social media posts tracked\n` +
      `• 450M+ total followers across platforms\n` +
      `• 40+ partner schools\n` +
      `• 2.5X revenue growth delivered\n\n` +
      `View the full report: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showSuccessMessage('Opening email client...');
  };

  const handleDownloadCSV = () => {
    const headers = [
      'School Name',
      'Mascot',
      'Conference',
      'Tier',
      'Athletes',
      'Posts',
      'Likes',
      'Comments',
      'Engagement Rate',
      'Partnership Start',
    ];

    const rows = PLAYFLY_MAX_PARTNERS.map(school => [
      school.schoolName,
      school.mascot,
      school.conference,
      school.tier,
      school.athletesTracked.toString(),
      school.totalPosts.toString(),
      school.totalLikes.toString(),
      school.totalComments.toString(),
      (school.averageEngagementRate * 100).toFixed(1) + '%',
      format(school.partnershipStartDate, 'MMM yyyy'),
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Playfly_Schools_Data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessMessage('CSV file downloaded!');
  };

  const handleDownloadJSON = () => {
    const networkMetrics = getNetworkMetrics();
    const ipMetrics = getIPPerformanceMetrics();

    const data = {
      reportGenerated: new Date().toISOString(),
      networkMetrics,
      ipMetrics,
      schools: PLAYFLY_MAX_PARTNERS.map(school => ({
        id: school.schoolId,
        name: school.schoolName,
        mascot: school.mascot,
        conference: school.conference,
        tier: school.tier,
        athletesTracked: school.athletesTracked,
        totalPosts: school.totalPosts,
        totalLikes: school.totalLikes,
        totalComments: school.totalComments,
        averageEngagementRate: school.averageEngagementRate,
        activeBrands: school.activeBrands,
        partnershipStartDate: school.partnershipStartDate.toISOString(),
      })),
      brands: CURRENT_BRAND_PARTNERS.map(brand => ({
        name: brand.brandName,
        category: brand.industryCategory,
        value: brand.estimatedValue,
        roi: brand.estimatedROI,
        campaigns: brand.activeCampaigns.length,
      })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Playfly_Report_Data_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessMessage('JSON data exported!');
  };

  const handleDownloadPDF = () => {
    try {
      generateExecutiveReportPDF();
      showSuccessMessage('PDF report generated!');
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleScreenshot = () => {
    alert(
      'Screenshot feature requires html2canvas library.\n\n' +
      'To implement:\n' +
      '1. Install: npm install html2canvas\n' +
      '2. Capture each section as PNG\n' +
      '3. Download with section names'
    );
    showSuccessMessage('Screenshot feature coming soon...');
  };

  const shareOptions = [
    {
      icon: Sparkles,
      label: 'Copy for AI',
      description: 'Copy ScrapeCreators API prompt for AI tools',
      action: handleCopyForAI,
      color: 'teal',
    },
    {
      icon: Link2,
      label: 'Copy Link',
      description: 'Copy report URL to clipboard',
      action: handleCopyLink,
      color: 'blue',
    },
    {
      icon: Mail,
      label: 'Share via Email',
      description: 'Open email with pre-filled content',
      action: handleEmailShare,
      color: 'purple',
    },
    {
      icon: FileText,
      label: 'Download PDF',
      description: 'Export full executive report as PDF',
      action: handleDownloadPDF,
      color: 'red',
    },
    {
      icon: FileSpreadsheet,
      label: 'Download CSV',
      description: 'Export schools data as spreadsheet',
      action: handleDownloadCSV,
      color: 'green',
    },
    {
      icon: FileJson,
      label: 'Download JSON',
      description: 'Export complete data structure',
      action: handleDownloadJSON,
      color: 'indigo',
    },
    {
      icon: Image,
      label: 'Download as Images',
      description: 'Save each section as PNG (coming soon)',
      action: handleScreenshot,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', icon: 'text-blue-600' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', icon: 'text-purple-600' },
      red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', icon: 'text-red-600' },
      green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', icon: 'text-green-600' },
      indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', icon: 'text-indigo-600' },
      orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', icon: 'text-orange-600' },
      teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', icon: 'text-teal-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Share Report</h3>
              <p className="text-sm text-gray-600">Choose how to share or export</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {shareOptions.map((option, index) => {
            const colors = getColorClasses(option.color);
            const Icon = option.icon;

            return (
              <button
                key={index}
                onClick={option.action}
                className={`w-full flex items-start gap-4 p-4 rounded-lg ${colors.bg} ${colors.hover} transition-all duration-200 text-left`}
              >
                <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-900 font-semibold">{showSuccess}</span>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
