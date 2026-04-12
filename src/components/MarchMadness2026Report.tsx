import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search, Trophy, TrendingUp, Users, Building2, Link2 } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { exportToCSV, exportToExcel, exportToPDF, ExportData } from '../utils/exportUtils';
import { loadMarchMadnessReportData } from '../services/marchMadnessReportService';
import type {
  AthleteGrowthRecord,
  BrandLeaderboardEntry,
  MarchMadnessReportData,
  SchoolCoverageRecord,
  TournamentDealPerformance,
} from '../types/marchMadness';
import { formatEMV } from '../utils/emvCalculator';

const COLORS = {
  navy: '#091831',
  blue: '#1770C0',
  sky: '#3B9FD9',
  gold: '#F5B700',
  green: '#10b981',
  slate: '#64748b',
  border: '#dbe3ef',
  panel: '#ffffff',
  bg: '#eef4fb',
};

function fmtN(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return 'Unavailable';
  }
  return value.toLocaleString('en-US');
}

function fmtPct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return 'Unavailable';
  }
  return `${value.toFixed(1)}%`;
}

function fmtGender(gender: string): string {
  return gender === 'men' ? "Men's" : "Women's";
}

function bySchool<T extends { schoolName: string }>(rows: T[], schoolName: string | null): T[] {
  if (!schoolName) {
    return rows;
  }
  return rows.filter((row) => row.schoolName === schoolName);
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: COLORS.panel, borderColor: COLORS.border }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <Icon className="h-5 w-5" style={{ color: COLORS.blue }} />
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{note}</div>
    </div>
  );
}

function DataTable({
  title,
  subtitle,
  headers,
  rows,
}: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: COLORS.panel, borderColor: COLORS.border }}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: COLORS.border }}>
              {headers.map((header) => (
                <th key={header} className="px-3 py-3 font-semibold text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={headers.length}>
                  No rows available for the current filter.
                </td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-b last:border-b-0" style={{ borderColor: COLORS.border }}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="px-3 py-3 text-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function buildExportData(
  schoolName: string | null,
  summary: MarchMadnessReportData['totals'],
  growthRows: AthleteGrowthRecord[],
  dealRows: TournamentDealPerformance[],
  brandRows: BrandLeaderboardEntry[],
  coverageRows: SchoolCoverageRecord[],
  manualOnlyRows: TournamentDealPerformance[]
): ExportData {
  return {
    reportName: '2026 March Madness Master Report',
    schoolName: schoolName || 'All Participating Schools',
    dateGenerated: new Date().toLocaleString(),
    metrics: [
      { label: 'Participating entries', value: summary.participatingSchools },
      { label: 'Schools with local data', value: summary.schoolsWithLocalData },
      { label: 'Basketball athletes evaluated', value: summary.basketballAthletesEvaluated },
      { label: 'Verified tournament deals', value: summary.verifiedTournamentDeals },
      { label: 'Measured tournament EMV', value: formatEMV(summary.totalMeasuredEMV) },
    ],
    tables: [
      {
        title: 'Athlete Growth',
        headers: ['Athlete', 'School', 'Gender', 'Before', 'After', 'Growth', 'Growth %'],
        rows: growthRows.map((row) => [
          row.athleteName,
          row.schoolName,
          fmtGender(row.gender),
          fmtN(row.followersBefore),
          fmtN(row.followersAfter),
          fmtN(row.absoluteGrowth),
          fmtPct(row.percentGrowth),
        ]),
      },
      {
        title: 'Deal Performance',
        headers: ['Athlete', 'School', 'Gender', 'Brand', 'Posts', 'Engagement', 'EMV', 'Verification'],
        rows: dealRows.map((row) => [
          row.athleteName,
          row.schoolName,
          fmtGender(row.gender),
          row.brandName,
          row.postCount,
          fmtN(row.totalEngagement),
          formatEMV(row.totalEMV),
          row.verificationStatus,
        ]),
      },
      {
        title: 'Brand Leaderboard',
        headers: ['Brand', 'Deals', 'Athletes', 'Schools', 'Engagement', 'EMV'],
        rows: brandRows.map((row) => [
          row.brandName,
          row.totalDeals,
          row.athletesActivated,
          row.schoolsActivated,
          fmtN(row.totalEngagement),
          formatEMV(row.totalEMV),
        ]),
      },
      {
        title: 'Coverage Appendix',
        headers: ['School', 'Gender', 'Seed', 'Has Local Data', 'Coverage Status'],
        rows: coverageRows.map((row) => [
          row.schoolName,
          fmtGender(row.gender),
          row.seed,
          row.hasLocalData ? 'Yes' : 'No',
          row.coverageStatus,
        ]),
      },
      {
        title: 'Verified Partnerships Observed',
        headers: ['Athlete', 'School', 'Gender', 'Brand', 'Verification', 'Evidence URLs'],
        rows: manualOnlyRows.map((row) => [
          row.athleteName,
          row.schoolName,
          fmtGender(row.gender),
          row.brandName,
          row.verificationStatus,
          row.evidenceUrls.join(', '),
        ]),
      },
    ],
  };
}

export function MarchMadness2026Report() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportData, setReportData] = useState<MarchMadnessReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState(searchParams.get('school') || '');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await loadMarchMadnessReportData();
        setReportData(data);
      } catch (error) {
        console.error('Error loading March Madness report:', error);
        setReportData(null);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const schoolFilter = searchParams.get('school');

  const schoolOptions = useMemo(() => {
    if (!reportData) {
      return [];
    }
    return Array.from(new Set(reportData.coverage.map((row) => row.schoolName))).sort();
  }, [reportData]);

  const filteredGrowth = useMemo(() => {
    if (!reportData) {
      return [];
    }
    return bySchool(
      reportData.growthRecords.filter((row) => row.growthStatus === 'available'),
      schoolFilter
    ).slice(0, 25);
  }, [reportData, schoolFilter]);

  const filteredDeals = useMemo(() => {
    if (!reportData) {
      return [];
    }
    return bySchool(reportData.dealPerformances, schoolFilter).slice(0, 25);
  }, [reportData, schoolFilter]);

  const filteredBrands = useMemo(() => {
    if (!reportData) {
      return [];
    }
    if (!schoolFilter) {
      return reportData.brandLeaderboard.slice(0, 25);
    }

    const schoolDeals = reportData.dealPerformances.filter((deal) => deal.schoolName === schoolFilter);
    const brandMap = new Map<string, BrandLeaderboardEntry & { athletes: Set<string>; schools: Set<string> }>();
    for (const deal of schoolDeals) {
      const existing = brandMap.get(deal.brandName);
      if (existing) {
        existing.totalEMV += deal.totalEMV;
        existing.totalEngagement += deal.totalEngagement;
        existing.totalDeals += 1;
        existing.athletes.add(deal.athleteName);
        existing.schools.add(deal.schoolName);
      } else {
        brandMap.set(deal.brandName, {
          brandName: deal.brandName,
          totalEMV: deal.totalEMV,
          totalEngagement: deal.totalEngagement,
          totalDeals: 1,
          athletesActivated: 0,
          schoolsActivated: 0,
          athletes: new Set([deal.athleteName]),
          schools: new Set([deal.schoolName]),
        });
      }
    }
    return Array.from(brandMap.values())
      .map((entry) => ({
        brandName: entry.brandName,
        totalEMV: entry.totalEMV,
        totalEngagement: entry.totalEngagement,
        totalDeals: entry.totalDeals,
        athletesActivated: entry.athletes.size,
        schoolsActivated: entry.schools.size,
      }))
      .sort((a, b) => b.totalEMV - a.totalEMV)
      .slice(0, 25);
  }, [reportData, schoolFilter]);

  const filteredCoverage = useMemo(() => {
    if (!reportData) {
      return [];
    }
    return bySchool(reportData.coverage, schoolFilter);
  }, [reportData, schoolFilter]);

  const filteredManualOnly = useMemo(() => {
    if (!reportData) {
      return [];
    }
    return bySchool(reportData.manualOnlyDeals, schoolFilter);
  }, [reportData, schoolFilter]);

  const displayedTotals = useMemo(() => {
    if (!reportData || !schoolFilter) {
      return reportData?.totals || null;
    }

    return {
      participatingSchools: filteredCoverage.length,
      schoolsWithLocalData: filteredCoverage.filter((row) => row.hasLocalData).length,
      basketballAthletesEvaluated: reportData.growthRecords.filter((row) => row.schoolName === schoolFilter).length,
      verifiedTournamentDeals: filteredDeals.length + filteredManualOnly.length,
      totalMeasuredEMV: filteredDeals.reduce((sum, row) => sum + row.totalEMV, 0),
    };
  }, [reportData, schoolFilter, filteredCoverage, filteredDeals, filteredManualOnly]);

  const displayedUnavailableGrowth = useMemo(() => {
    if (!reportData) {
      return 0;
    }
    if (!schoolFilter) {
      return reportData.growthUnavailableCount;
    }
    return reportData.growthRecords.filter((row) => row.schoolName === schoolFilter && row.growthStatus === 'unavailable').length;
  }, [reportData, schoolFilter]);

  const exportData = useMemo(() => {
    if (!reportData || !displayedTotals) {
      return null;
    }
    return buildExportData(
      schoolFilter,
      displayedTotals,
      filteredGrowth,
      filteredDeals,
      filteredBrands,
      filteredCoverage,
      filteredManualOnly
    );
  }, [reportData, displayedTotals, schoolFilter, filteredGrowth, filteredDeals, filteredBrands, filteredCoverage, filteredManualOnly]);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!exportData) {
      return;
    }
    if (format === 'pdf') {
      await exportToPDF(exportData);
      return;
    }
    if (format === 'csv') {
      await exportToCSV(exportData);
      return;
    }
    await exportToExcel(exportData);
  };

  const applySchoolFilter = (nextSchool: string) => {
    setSchoolSearch(nextSchool);
    if (nextSchool) {
      setSearchParams({ school: nextSchool });
      return;
    }
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-24" style={{ backgroundColor: COLORS.bg }}>
        <div className="mx-auto max-w-5xl rounded-3xl border px-8 py-12 text-center text-slate-600 shadow-sm" style={{ backgroundColor: COLORS.panel, borderColor: COLORS.border }}>
          Loading 2026 March Madness report...
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen px-6 py-24" style={{ backgroundColor: COLORS.bg }}>
        <div className="mx-auto max-w-5xl rounded-3xl border px-8 py-12 text-center text-slate-600 shadow-sm" style={{ backgroundColor: COLORS.panel, borderColor: COLORS.border }}>
          Unable to load the March Madness report.
        </div>
      </div>
    );
  }

  const growthRows = filteredGrowth.map((row) => [
    row.athleteName,
    row.schoolName,
    fmtGender(row.gender),
    fmtN(row.followersBefore),
    fmtN(row.followersAfter),
    fmtN(row.absoluteGrowth),
    fmtPct(row.percentGrowth),
  ]);

  const dealRows = filteredDeals.map((row) => [
    row.athleteName,
    row.schoolName,
    fmtGender(row.gender),
    row.brandName,
    row.postCount,
    fmtN(row.totalEngagement),
    formatEMV(row.totalEMV),
    row.verificationStatus,
  ]);

  const brandRows = filteredBrands.map((row) => [
    row.brandName,
    row.totalDeals,
    row.athletesActivated,
    row.schoolsActivated,
    fmtN(row.totalEngagement),
    formatEMV(row.totalEMV),
  ]);

  const coverageRows = filteredCoverage.map((row) => [
    row.schoolName,
    fmtGender(row.gender),
    row.seed,
    row.hasLocalData ? 'Yes' : 'No',
    row.coverageStatus,
  ]);

  const manualOnlyRows = filteredManualOnly.map((row) => [
    row.athleteName,
    row.schoolName,
    fmtGender(row.gender),
    row.brandName,
    row.verificationStatus,
    row.evidenceUrls.join(', ') || 'None',
  ]);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.bg} 22%, ${COLORS.bg} 100%)` }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] border p-8 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 100%)`, borderColor: 'rgba(255,255,255,0.14)' }}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ borderColor: 'rgba(255,255,255,0.22)' }}>
                2026 retrospective • men + women
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">March Madness Master Report</h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200 md:text-lg">
                A tournament-window readout of athlete follower growth, verified brand partnerships, and EMV-ranked deal performance across all 2026 NCAA participants.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                {reportData.windows.map((window) => (
                  <div key={window.gender} className="rounded-full bg-white/10 px-4 py-2">
                    {fmtGender(window.gender)}: {window.selectionSunday} to {window.titleGame}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <label className="relative min-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={schoolSearch}
                    onChange={(event) => setSchoolSearch(event.target.value)}
                    list="march-madness-schools"
                    placeholder="Filter to one school"
                    className="w-full rounded-xl border bg-white px-10 py-3 text-slate-900 outline-none"
                    style={{ borderColor: COLORS.border }}
                  />
                  <datalist id="march-madness-schools">
                    {schoolOptions.map((school) => (
                      <option key={school} value={school} />
                    ))}
                  </datalist>
                </label>
                <button
                  onClick={() => applySchoolFilter(schoolSearch)}
                  className="rounded-xl px-5 py-3 font-semibold text-white"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.navy }}
                >
                  Apply filter
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => applySchoolFilter('')}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: 'rgba(255,255,255,0.22)' }}
                >
                  Clear filter
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: 'white', color: COLORS.navy }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Participating Entries" value={fmtN(displayedTotals?.participatingSchools)} note="Each tournament entry counted once by gender" icon={Building2} />
          <SummaryCard label="Schools With Local Data" value={fmtN(displayedTotals?.schoolsWithLocalData)} note="Roster and content files found in this workspace" icon={Users} />
          <SummaryCard label="Athletes Evaluated" value={fmtN(displayedTotals?.basketballAthletesEvaluated)} note={`${displayedUnavailableGrowth.toLocaleString()} missing exact snapshot pairs`} icon={TrendingUp} />
          <SummaryCard label="Verified Deals" value={fmtN(displayedTotals?.verifiedTournamentDeals)} note="Measured deals plus manual-only verified appendix rows" icon={Link2} />
          <SummaryCard label="Measured EMV" value={formatEMV(displayedTotals?.totalMeasuredEMV || 0)} note="Measured only from local posts inside the tournament window" icon={Trophy} />
        </section>

        <div className="mt-8 space-y-8">
          <DataTable
            title="Follower Growth Leaderboard"
            subtitle="Top 25 basketball athletes with exact before/after snapshot pairs inside the March Madness methodology."
            headers={['Athlete', 'School', 'Gender', 'Before', 'After', 'Growth', 'Growth %']}
            rows={growthRows}
          />

          <DataTable
            title="Brand Deal Leaderboard"
            subtitle="Top 25 athlete-brand deals ranked by total EMV, then average EMV per post, then total engagement."
            headers={['Athlete', 'School', 'Gender', 'Brand', 'Posts', 'Engagement', 'EMV', 'Verification']}
            rows={dealRows}
          />

          <DataTable
            title="Brand Leaderboard"
            subtitle="Brands ranked by total tournament EMV across the current view."
            headers={['Brand', 'Deals', 'Athletes', 'Schools', 'Engagement', 'EMV']}
            rows={brandRows}
          />

          <DataTable
            title="Coverage Appendix"
            subtitle="Participating schools remain in scope even when the workspace has no local athlete or content data for them."
            headers={['School', 'Gender', 'Seed', 'Has Local Data', 'Coverage Status']}
            rows={coverageRows}
          />

          <DataTable
            title="Verified Partnerships Observed"
            subtitle="Manual-only verified partnerships appear here and are excluded from EMV rankings unless measurable local posts exist."
            headers={['Athlete', 'School', 'Gender', 'Brand', 'Verification', 'Evidence URLs']}
            rows={manualOnlyRows}
          />
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        reportName="2026 March Madness Master Report"
      />
    </div>
  );
}
