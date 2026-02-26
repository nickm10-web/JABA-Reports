import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import {
  BRAND_MAP,
  type AthleteSummary,
  type BrandOutputs,
  type BrandKey,
  type BrandSummary,
  type SponsoredRecord,
  type TalentAthleteRow,
  MOCK_SPONSORED_RECORDS,
  buildBrandOutputs,
  computeAthleteSummary,
  getAthleteBaselineLiftsForBrand,
  getAthleteBaselineEngagementRate,
  getBrandCategory,
  getInternalCategoryBenchmarkForBrand,
  matchesBrand,
  getSponsoredPostMonitorPostsForBrand,
  getTalentDiscoveryRowsForBrand,
  normalizeText,
} from './postgame/postgameData';
import { SCHOOLS } from '../data/schoolConfig';

type ReportTab = 'Overview' | 'Athlete Roster' | 'Sponsored Posts' | 'Benchmarks';
type ViewBrandKey = BrandKey | 'all';

const BRAND_KEYS = Object.keys(BRAND_MAP) as BrandKey[];
const VIEW_BRAND_KEYS: ViewBrandKey[] = ['all', ...BRAND_KEYS];
const REPORT_TABS: ReportTab[] = ['Overview', 'Athlete Roster', 'Sponsored Posts', 'Benchmarks'];

type FollowersBucket = 'All' | '<50k' | '50k-100k' | '100k-200k' | '200k+';
type EngagementBucket = 'All' | '<3%' | '3-5%' | '5-8%' | '8%+';

type BrandJsonRecord = Record<string, unknown>;
type OverviewSummary = Omit<BrandSummary, 'brandKey'>;

interface TeamSchoolLogoRow {
  schoolName?: string;
  conferenceName?: string;
  profilePicture?: string;
}

interface LineupSchoolBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '').trim();
  const expanded = clean.length === 3
    ? clean.split('').map((c) => `${c}${c}`).join('')
    : clean.padStart(6, '0').slice(0, 6);
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDate(value?: string): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatSport(sport: string): string {
  return sport
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function normalizeSchoolLabel(value: string): string {
  return normalizeText(value)
    .replace(/\b(university|college|the|of|at)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsableLogoUrl(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  const lower = trimmed.toLowerCase();
  if (lower.includes('example.')) return false;
  return /^https?:\/\//.test(lower);
}

function getTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toSponsoredRecords(payload: unknown): SponsoredRecord[] {
  if (Array.isArray(payload)) return payload as SponsoredRecord[];
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { records?: unknown }).records;
    if (Array.isArray(candidate)) return candidate as SponsoredRecord[];
  }
  return [];
}

function toBrandRecords(payload: unknown): BrandJsonRecord[] {
  if (Array.isArray(payload)) return payload.filter((item) => item && typeof item === 'object') as BrandJsonRecord[];
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { brands?: unknown; records?: unknown }).brands ?? (payload as { records?: unknown }).records;
    if (Array.isArray(candidate)) return candidate.filter((item) => item && typeof item === 'object') as BrandJsonRecord[];
  }
  return [];
}

function normalizeCompactToken(value: string): string {
  return normalizeText(value).replace(/\s+/g, '');
}

function getBrandLogo(brand: BrandJsonRecord | null | undefined): string | null {
  if (!brand || typeof brand !== 'object') return null;
  const directKeys = ['logo', 'logoUrl', 'image', 'mark', 'icon'];
  for (const key of directKeys) {
    const value = brand[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      const nestedValue = nested.url ?? nested.src ?? nested.path ?? nested.image;
      if (typeof nestedValue === 'string' && nestedValue.trim()) return nestedValue.trim();
    }
  }
  return null;
}

function getBrandMonogram(label: string): string {
  const parts = label
    .split(/[^a-zA-Z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return label.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function logoPreferenceScore(logoUrl: string): number {
  const normalized = logoUrl.toLowerCase();
  if (normalized.includes('logo_hollister.png')) return 10;
  if (normalized.endsWith('.png')) return 3;
  if (normalized.endsWith('.webp')) return 2;
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 1;
  return 0;
}

function getRecordTotalInteractions(record: SponsoredRecord): number {
  const explicit = record.metrics.totalInteractions;
  if (typeof explicit === 'number' && explicit > 0) return explicit;
  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const shares = record.metrics.shares || 0;
  const saves = record.metrics.saves || 0;
  return likes + comments + shares + saves;
}

const EMV_UPLIFT_FACTOR = 1.6;

function normalizeEngagementRate(er: number): number {
  if (!Number.isFinite(er) || er <= 0) return 0;
  return er > 1 ? er / 100 : er;
}

function getEstimatedInteractionsForRecord(record: SponsoredRecord): number {
  const explicitTotal = record.metrics.totalInteractions;
  if (typeof explicitTotal === 'number' && explicitTotal > 0) return explicitTotal;

  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const shares = record.metrics.shares || 0;
  const saves = record.metrics.saves || 0;
  const direct = likes + comments + shares + saves;
  if (direct > 0) return direct;

  const accountsEngaged = record.metrics.accountsEngaged || 0;
  if (accountsEngaged > 0) return accountsEngaged;

  const impressions = record.metrics.impressions || 0;
  if (impressions > 0) return impressions * 0.018;

  const reach = record.metrics.reach || 0;
  if (reach > 0) return reach * 0.022;

  const followers = record.metrics.followers || 0;
  const engagementRate = normalizeEngagementRate(record.metrics.engagementRate || 0);
  if (followers > 0 && engagementRate > 0) return followers * engagementRate;

  return 0;
}

function getRecordEmv(record: SponsoredRecord): number {
  const explicit = record.metrics.emv;
  if (typeof explicit === 'number' && explicit > 0) return explicit * EMV_UPLIFT_FACTOR;
  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const videoViews = record.metrics.videoViews || 0;
  const interactionWeighted = likes * 0.35 + comments * 2 + videoViews * 0.02;
  const estimatedInteractions = getEstimatedInteractionsForRecord(record);
  const fallbackWeighted = estimatedInteractions * 0.9;
  const followers = record.metrics.followers || 0;
  const followerFloor = followers > 0 ? Math.max(180, followers * 0.004) : 180;
  const blended = Math.max(interactionWeighted, fallbackWeighted, followerFloor);
  return blended * EMV_UPLIFT_FACTOR;
}

function getRecordPublishedAt(record: SponsoredRecord): string | undefined {
  if (!record.publishedAt) return undefined;
  return typeof record.publishedAt === 'string' ? record.publishedAt : record.publishedAt.$date;
}

function dedupeRecordsById(records: SponsoredRecord[]): SponsoredRecord[] {
  const map = new Map<string, SponsoredRecord>();
  records.forEach((record) => {
    map.set(record._id, record);
  });
  return [...map.values()];
}

function computeOverviewSummary(records: SponsoredRecord[], displayName: string): OverviewSummary {
  const athletes = new Set(records.map((record) => record.athlete._id));
  const totalLikes = records.reduce((sum, record) => sum + (record.metrics.likes || 0), 0);
  const totalComments = records.reduce((sum, record) => sum + (record.metrics.comments || 0), 0);
  const totalInteractions = records.reduce((sum, record) => sum + getRecordTotalInteractions(record), 0);
  const avgEngagementRate = records.length
    ? records.reduce((sum, record) => sum + (record.metrics.engagementRate || 0), 0) / records.length
    : 0;
  const estimatedEmv = records.reduce((sum, record) => sum + getRecordEmv(record), 0);
  const activeCampaigns = Math.max(
    1,
    Math.min(
      12,
      Math.round((athletes.size * 0.4) + (records.length * 0.15)),
    ),
  );
  return {
    displayName,
    activeCampaigns,
    posts: records.length,
    athletes: athletes.size,
    totalLikes,
    totalComments,
    totalInteractions,
    avgEngagementRate,
    estimatedEmv,
  };
}

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function matchesFollowersBucket(followers: number, bucket: FollowersBucket): boolean {
  if (bucket === 'All') return true;
  if (bucket === '<50k') return followers < 50_000;
  if (bucket === '50k-100k') return followers >= 50_000 && followers < 100_000;
  if (bucket === '100k-200k') return followers >= 100_000 && followers < 200_000;
  return followers >= 200_000;
}

function matchesEngagementBucket(er: number, bucket: EngagementBucket): boolean {
  if (bucket === 'All') return true;
  const p = er * 100;
  if (bucket === '<3%') return p < 3;
  if (bucket === '3-5%') return p >= 3 && p < 5;
  if (bucket === '5-8%') return p >= 5 && p < 8;
  return p >= 8;
}

export function PostgameReport({ onBack }: { onBack?: () => void }) {
  const [selectedBrand, setSelectedBrand] = useState<ViewBrandKey>('all');
  const [activeTab, setActiveTab] = useState<ReportTab>('Overview');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(true);
  const [sourceRecords, setSourceRecords] = useState<SponsoredRecord[]>(MOCK_SPONSORED_RECORDS);
  const [brandData, setBrandData] = useState<BrandOutputs>(() => buildBrandOutputs(MOCK_SPONSORED_RECORDS));
  const [brandRegistry, setBrandRegistry] = useState<BrandJsonRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const tabBrandKey: BrandKey = selectedBrand === 'all' ? 'CVS' : selectedBrand;
  const allBrandUnionRecords = useMemo(
    () => dedupeRecordsById(BRAND_KEYS.flatMap((brandKey) => brandData.recordsByBrand[brandKey] || [])),
    [brandData.recordsByBrand],
  );
  const allBrandSummary = useMemo(
    () => computeOverviewSummary(allBrandUnionRecords, 'All Brands'),
    [allBrandUnionRecords],
  );
  const allBrandAthletes = useMemo(
    () => computeAthleteSummary(allBrandUnionRecords),
    [allBrandUnionRecords],
  );
  const summary: OverviewSummary = selectedBrand === 'all'
    ? allBrandSummary
    : brandData.brandSummaries[selectedBrand];
  const athletes = selectedBrand === 'all'
    ? allBrandAthletes
    : brandData.athletesByBrand[selectedBrand];
  const matchedRecords = selectedBrand === 'all'
    ? allBrandUnionRecords
    : (brandData.recordsByBrand[selectedBrand] || []);
  const generatedAt = useMemo(() => getTimestamp(), []);
  const brandLogos = useMemo(() => {
    const empty = {} as Record<BrandKey, string | null>;
    BRAND_KEYS.forEach((key) => { empty[key] = null; });
    if (brandRegistry.length === 0) return empty;

    const candidates = brandRegistry
      .map((record) => {
        const rawName = String(
          record.name
          ?? record.brand
          ?? record.displayName
          ?? record.title
          ?? record.handle
          ?? '',
        );
        return {
          record,
          compactName: normalizeCompactToken(rawName),
        };
      })
      .filter((entry) => Boolean(entry.compactName));

    BRAND_KEYS.forEach((brandKey) => {
      const def = BRAND_MAP[brandKey];
      const tokens = new Set<string>(
        [brandKey, def.displayName, ...def.aliases, ...(def.handleAliases ?? [])]
          .map((value) => normalizeCompactToken(String(value).replace(/^[@#]/, '')))
          .filter(Boolean),
      );
      let bestScore = -1;
      let bestLogoPreference = -1;
      let bestLogo: string | null = null;

      for (const candidate of candidates) {
        for (const token of tokens) {
          let score = -1;
          if (candidate.compactName === token) score = 100;
          else if (candidate.compactName.includes(token)) score = 80;
          else if (token.includes(candidate.compactName)) score = 60;
          const logo = getBrandLogo(candidate.record);
          if (!logo || logo.includes('example.com')) continue;
          const preference = logoPreferenceScore(logo);
          if (score < bestScore) continue;
          if (score === bestScore && preference <= bestLogoPreference) continue;
          bestScore = score;
          bestLogoPreference = preference;
          bestLogo = logo;
        }
      }
      if (brandKey === 'Hollister') {
        empty[brandKey] = '/logo_hollister.png';
        return;
      }
      empty[brandKey] = bestLogo;
    });
    return empty;
  }, [brandRegistry]);

  useEffect(() => {
    let active = true;
    const loadRealDataset = async () => {
      try {
        const basePath = `${import.meta.env.BASE_URL}data/all_roster_sponsored.json`.replace(/([^:]\/)\/+/g, '$1');
        const candidates = [basePath, '/data/all_roster_sponsored.json', 'data/all_roster_sponsored.json'];
        const brandCandidates = [
          `${import.meta.env.BASE_URL}data/socialMedia.brands.json`.replace(/([^:]\/)\/+/g, '$1'),
          '/data/socialMedia.brands.json',
          'data/socialMedia.brands.json',
        ];
        let dataset: SponsoredRecord[] = [];
        for (const path of candidates) {
          const response = await fetch(path);
          if (!response.ok) continue;
          const payload = await response.json();
          const parsed = toSponsoredRecords(payload);
          if (parsed.length > 0) {
            dataset = parsed;
            break;
          }
        }
        if (dataset.length === 0) throw new Error('Dataset unavailable');
        for (const path of brandCandidates) {
          const response = await fetch(path);
          if (!response.ok) continue;
          const payload = await response.json();
          const parsed = toBrandRecords(payload);
          if (parsed.length > 0) {
            if (active) setBrandRegistry(parsed);
            break;
          }
        }
        if (!active) return;
        setSourceRecords(dataset);
        setBrandData(buildBrandOutputs(dataset));
      } catch {
        if (!active) return;
        setSourceRecords(MOCK_SPONSORED_RECORDS);
        setBrandData(buildBrandOutputs(MOCK_SPONSORED_RECORDS));
        setBrandRegistry([]);
      } finally {
        if (active) setIsDataLoading(false);
      }
    };
    loadRealDataset();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setSelectedBrand('all');
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setContentVisible(false);
    const timer = window.setTimeout(() => setContentVisible(true), 70);
    return () => window.clearTimeout(timer);
  }, [activeTab, selectedBrand]);

  return (
    <div className="dark">
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05070B] dark:text-slate-100">
        <div className="pointer-events-none fixed inset-0 opacity-70 dark:opacity-100">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-400/20" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/30" />
        </div>

        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0F19]/80">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-950">
                  <img src="/Postgame_logo.png" alt="Postgame logo" className="h-full w-full object-contain" loading="lazy" />
                </div>
                <div>
                <h1 className="text-xl font-black tracking-tight sm:text-3xl">Postgame Brand Campaign Intelligence</h1>
                <p className="text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-300">
                  End-to-End Campaign Operations • Powered by JABA AI
                </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden rounded-full border border-emerald-300/60 bg-emerald-100/70 px-3 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-200 sm:flex sm:items-center sm:gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Generated by JABA AI · {generatedAt}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <BrandSelector
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            brandLogos={brandLogos}
          />
          <TabsContainer activeTab={activeTab} onTabChange={setActiveTab} />
          {isInitialLoading || isDataLoading ? (
            <SkeletonPostgame />
          ) : (
            <div className={`transform transition-all duration-300 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}>
              {activeTab === 'Overview' && (
                <OverviewTab
                  brandKey={selectedBrand}
                  summary={summary}
                  athletes={athletes}
                  ncaaAthleteIds={new Set(matchedRecords.filter((record) => String(record.athlete?.league?.name || '').toUpperCase() === 'NCAA').map((record) => record.athlete._id))}
                />
              )}
              {activeTab === 'Athlete Roster' && (
                <TalentDiscoveryTab
                  brandKey={tabBrandKey}
                  records={sourceRecords}
                />
              )}
              {activeTab === 'Sponsored Posts' && <SponsoredPostMonitorTab brandKey={tabBrandKey} records={sourceRecords} />}
              {activeTab === 'Benchmarks' && <BenchmarksTab brandKey={tabBrandKey} summaries={brandData.brandSummaries} records={sourceRecords} />}
              {activeTab !== 'Overview' && activeTab !== 'Athlete Roster' && activeTab !== 'Sponsored Posts' && activeTab !== 'Benchmarks' && (
                <PlaceholderPanel tab={activeTab} />
              )}
            </div>
          )}
          {!isInitialLoading && matchedRecords.length === 0 && (
            <FriendlyBrandEmptyState />
          )}

        </main>
      </div>
    </div>
  );
}

function BrandSelector({
  selectedBrand,
  onSelectBrand,
  brandLogos,
}: {
  selectedBrand: ViewBrandKey;
  onSelectBrand: (brand: ViewBrandKey) => void;
  brandLogos: Record<BrandKey, string | null>;
}) {
  const renderBrandCard = (brandKey: ViewBrandKey) => {
    const isActive = selectedBrand === brandKey;
    const logo = brandKey === 'all' ? null : brandLogos[brandKey];
    const displayName = brandKey === 'all' ? 'All Brands' : BRAND_MAP[brandKey].displayName;
    return (
      <button
        key={brandKey}
        onClick={() => onSelectBrand(brandKey)}
        aria-label={`Select brand: ${displayName}`}
        className={`group relative z-0 h-24 w-24 rounded-2xl border p-2 transition duration-200 hover:z-20 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
          isActive
            ? 'border-cyan-400 bg-cyan-50/80 shadow-[0_10px_24px_-14px_rgba(8,145,178,0.6)] dark:border-cyan-300/70 dark:bg-cyan-500/12 dark:shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_28px_-16px_rgba(34,211,238,0.8)]'
            : 'border-slate-200/80 bg-white hover:border-cyan-300 hover:shadow-[0_8px_20px_-16px_rgba(14,116,144,0.5)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-cyan-400/50 dark:hover:shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_0_24px_-16px_rgba(34,211,238,0.75)]'
        }`}
      >
        {isActive && (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500 ring-2 ring-white dark:bg-cyan-300 dark:ring-[#0A0F19]" />
        )}
        <div className="flex h-full w-full items-center justify-center">
          {brandKey === 'all' ? (
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 p-1 shadow-sm dark:border-white/15 dark:bg-slate-950">
              <img src="/Postgame_logo.png" alt="All Brands logo" className="h-full w-full object-contain" loading="lazy" />
            </div>
          ) : logo ? (
            <div className="h-16 w-16 overflow-hidden rounded-xl">
              <img src={logo} alt={`${displayName} logo`} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-bold tracking-wide text-white">
              {getBrandMonogram(displayName)}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Brands</h2>
      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3 px-1 md:w-full md:min-w-0 md:justify-between">
          {VIEW_BRAND_KEYS.map((brandKey) => (
            <div key={brandKey} className="shrink-0">
              {renderBrandCard(brandKey)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabsContainer({ activeTab, onTabChange }: { activeTab: ReportTab; onTabChange: (tab: ReportTab) => void }) {
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = idx;
    const last = REPORT_TABS.length - 1;
    let target = currentIndex;
    if (event.key === 'ArrowLeft') target = currentIndex === 0 ? last : currentIndex - 1;
    if (event.key === 'ArrowRight') target = currentIndex === last ? 0 : currentIndex + 1;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = last;
    onTabChange(REPORT_TABS[target]);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Postgame report tabs">
        {REPORT_TABS.map((tab, idx) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              onKeyDown={(event) => onTabKeyDown(event, idx)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-800 dark:border-indigo-300/50 dark:bg-indigo-400/15 dark:text-indigo-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:border-indigo-400/40'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function OverviewTab({
  brandKey,
  summary,
  athletes,
  ncaaAthleteIds,
}: {
  brandKey: ViewBrandKey;
  summary: OverviewSummary;
  athletes: AthleteSummary[];
  ncaaAthleteIds: Set<string>;
}) {
  const viewLabel = brandKey === 'all' ? 'All Brands' : BRAND_MAP[brandKey].displayName;
  const filteredAthletes = useMemo(
    () => athletes.filter((athlete) => ncaaAthleteIds.has(athlete.athleteId)),
    [athletes, ncaaAthleteIds],
  );
  const topAthletes = useMemo(
    () => [...filteredAthletes].sort((a, b) => (b.totalEmv - a.totalEmv) || (b.avgEngagementRate - a.avgEngagementRate)).slice(0, 5),
    [filteredAthletes],
  );
  const leaderboardGroups = useMemo(() => ([
    {
      key: 'emv',
      title: 'Top 5 by EMV',
      rows: [...filteredAthletes].sort((a, b) => b.totalEmv - a.totalEmv).slice(0, 5),
      value: (row: AthleteSummary) => formatCurrency(row.totalEmv),
    },
    {
      key: 'likes',
      title: 'Top 5 by Likes',
      rows: [...filteredAthletes].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 5),
      value: (row: AthleteSummary) => formatNumber(row.totalLikes),
    },
    {
      key: 'engagement',
      title: 'Top 5 by Engagement',
      rows: [...filteredAthletes].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 5),
      value: (row: AthleteSummary) => formatPercent(row.avgEngagementRate),
    },
    {
      key: 'interactions',
      title: 'Top 5 by Interactions',
      rows: [...filteredAthletes].sort((a, b) => b.totalInteractions - a.totalInteractions).slice(0, 5),
      value: (row: AthleteSummary) => formatNumber(row.totalInteractions),
    },
  ]), [filteredAthletes]);
  const totalAthleteEmv = useMemo(
    () => filteredAthletes.reduce((sum, athlete) => sum + athlete.totalEmv, 0),
    [filteredAthletes],
  );
  const topFiveEmvShare = useMemo(() => {
    const topFiveEmv = topAthletes.reduce((sum, athlete) => sum + athlete.totalEmv, 0);
    return totalAthleteEmv > 0 ? topFiveEmv / totalAthleteEmv : 0;
  }, [topAthletes, totalAthleteEmv]);
  const strategicHeadline = useMemo(
    () => `${viewLabel} is generating ${formatCurrency(summary.estimatedEmv)} in estimated media value with ${formatPercent(summary.avgEngagementRate)} average engagement across ${formatNumber(summary.posts)} sponsored posts.`,
    [viewLabel, summary.estimatedEmv, summary.avgEngagementRate, summary.posts],
  );

  return (
    <div id="panel-Overview" role="tabpanel" aria-labelledby="tab-Overview" className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Overview</h3>
          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200">
            {viewLabel}
          </span>
        </div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Powered by JABA AI</p>
        <p className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{strategicHeadline}</p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <PrimaryCountCard label="Estimated EMV" value={summary.estimatedEmv} formatter={formatCurrency} className="lg:col-span-2" />
          <PrimaryCountCard label="Total Engagement" value={summary.totalInteractions} formatter={formatNumber} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CountCard label="Athletes Engaged" value={summary.athletes} formatter={formatNumber} />
          <CountCard label="Sponsored Posts" value={summary.posts} formatter={formatNumber} />
          <CountCard label="Active Campaigns" value={summary.activeCampaigns} formatter={formatNumber} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Athlete Impact</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Top 5 leaderboards across key performance metrics.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {leaderboardGroups.map((board) => (
            <article key={board.key} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">{board.title}</h4>
              <div className="mt-2 space-y-1.5">
                {board.rows.map((athlete, index) => (
                  <div key={`${board.key}-${athlete.athleteId}`} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{index + 1}. {athlete.athleteName}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{athlete.school}</p>
                    </div>
                    <p className="ml-3 text-sm font-bold text-slate-900 dark:text-white">{board.value(athlete)}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Performance Concentration: Top 5 athletes drive {formatPercent(topFiveEmvShare)} of EMV.
        </p>
      </section>

    </div>
  );
}

function TalentDiscoveryTab({
  brandKey,
  records,
}: {
  brandKey: BrandKey;
  records: SponsoredRecord[];
}) {
  const [sportFilter, setSportFilter] = useState('All');
  const [conferenceFilter, setConferenceFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [followersBucket, setFollowersBucket] = useState<FollowersBucket>('All');
  const [engagementBucket, setEngagementBucket] = useState<EngagementBucket>('All');
  const [teamSchoolLogoRows, setTeamSchoolLogoRows] = useState<TeamSchoolLogoRow[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [failedLogoUrls, setFailedLogoUrls] = useState<Record<string, true>>({});

  const allRows = useMemo(() => getTalentDiscoveryRowsForBrand(brandKey, records), [brandKey, records]);
  const ncaaAthleteIds = useMemo(() => {
    const ids = new Set<string>();
    records.forEach((record) => {
      const leagueName = String(record.athlete?.league?.name || '').toUpperCase();
      if (leagueName === 'NCAA') ids.add(record.athlete._id);
    });
    return ids;
  }, [records]);
  const ncaaRows = useMemo(
    () => allRows.filter((row) => ncaaAthleteIds.has(row.athleteId)),
    [allRows, ncaaAthleteIds],
  );
  const sports = useMemo(() => ['All', ...new Set(ncaaRows.map((r) => r.sport))], [ncaaRows]);
  const conferences = useMemo(() => ['All', ...new Set(ncaaRows.map((r) => r.conference))], [ncaaRows]);
  const schools = useMemo(() => ['All', ...new Set(ncaaRows.map((r) => r.school))], [ncaaRows]);

  const filteredRows = useMemo(
    () => allRows.filter((row) =>
      ncaaAthleteIds.has(row.athleteId) &&
      (sportFilter === 'All' || row.sport === sportFilter) &&
      (conferenceFilter === 'All' || row.conference === conferenceFilter) &&
      (schoolFilter === 'All' || row.school === schoolFilter) &&
      matchesFollowersBucket(row.followers, followersBucket) &&
      matchesEngagementBucket(row.avgEngagementRate, engagementBucket),
    ),
    [allRows, ncaaAthleteIds, sportFilter, conferenceFilter, schoolFilter, followersBucket, engagementBucket],
  );
  useEffect(() => {
    if (schoolFilter !== 'All' && !schools.includes(schoolFilter)) {
      setSchoolFilter('All');
    }
  }, [schoolFilter, schools]);
  const athleteImageById = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((record) => {
      const id = record.athlete._id;
      const image = record.athlete.image;
      if (!map.has(id) && image) map.set(id, image);
    });
    return map;
  }, [records]);
  const athleteSchoolById = useMemo(() => {
    const map = new Map<string, { schoolId?: string; schoolName?: string; logo?: string; image?: string }>();
    records.forEach((record) => {
      const school = (record.athlete.school || {}) as { _id?: string; name?: string; logo?: string; image?: string };
      if (!map.has(record.athlete._id)) {
        map.set(record.athlete._id, {
          schoolId: school._id,
          schoolName: school.name,
          logo: school.logo,
          image: school.image,
        });
      }
    });
    return map;
  }, [records]);
  const averageEngagementRate = useMemo(
    () => filteredRows.length > 0 ? filteredRows.reduce((sum, row) => sum + row.avgEngagementRate, 0) / filteredRows.length : 0,
    [filteredRows],
  );
  useEffect(() => {
    let cancelled = false;
    const loadTeamSchoolLogos = async () => {
      const candidates = [
        `${import.meta.env.BASE_URL}data/Teams.json`,
        '/data/Teams.json',
        'data/Teams.json',
      ];
      for (const url of candidates) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const payload = await response.json();
          const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
          if (!cancelled) setTeamSchoolLogoRows(rows as TeamSchoolLogoRow[]);
          return;
        } catch {
          continue;
        }
      }
    };
    loadTeamSchoolLogos();
    return () => {
      cancelled = true;
    };
  }, []);
  const schoolLogoMap = useMemo(() => {
    const bySchoolName = new Map<string, string>();
    const bySchoolId = new Map<string, string>();

    Object.values(SCHOOLS).forEach((school) => {
      if (!school.logoUrl) return;
      if (school.id) bySchoolId.set(school.id, school.logoUrl);
      [school.dataName, school.name, school.shortName].forEach((name) => {
        const normalized = normalizeSchoolLabel(name);
        if (normalized && !bySchoolName.has(normalized)) bySchoolName.set(normalized, school.logoUrl as string);
      });
    });

    teamSchoolLogoRows.forEach((row) => {
      const schoolName = (row.schoolName || '').trim();
      const logo = (row.profilePicture || '').trim();
      if (!schoolName || !isUsableLogoUrl(logo)) return;
      const normalized = normalizeSchoolLabel(schoolName);
      if (normalized && !bySchoolName.has(normalized)) bySchoolName.set(normalized, logo);
    });

    const hardcodedFallbacks: Record<string, string> = {
      [normalizeSchoolLabel('Iowa')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png',
      [normalizeSchoolLabel('Kansas')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
      [normalizeSchoolLabel('Iowa State')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/66.png',
      [normalizeSchoolLabel('Illinois')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/356.png',
      [normalizeSchoolLabel('Rutgers')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/164.png',
      [normalizeSchoolLabel('San Diego State University')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png',
      [normalizeSchoolLabel('Virginia Tech')]: 'https://a.espncdn.com/i/teamlogos/ncaa/500/259.png',
    };
    Object.entries(hardcodedFallbacks).forEach(([key, logo]) => {
      if (!bySchoolName.has(key)) bySchoolName.set(key, logo);
    });

    return { bySchoolName, bySchoolId };
  }, [teamSchoolLogoRows]);
  const schoolBrandingByName = useMemo(() => {
    const entries = Object.values(SCHOOLS);
    const map = new Map<string, LineupSchoolBranding>();
    const conferencePalette: Record<string, { primary: string; secondary: string }> = {
      SEC: { primary: '#0F172A', secondary: '#EAB308' },
      'Big 10': { primary: '#0C2340', secondary: '#38BDF8' },
      'Big Ten': { primary: '#0C2340', secondary: '#38BDF8' },
      ACC: { primary: '#1E293B', secondary: '#F97316' },
      'Big 12': { primary: '#1F2937', secondary: '#A78BFA' },
      AAC: { primary: '#0B3B66', secondary: '#22D3EE' },
      'Mountain West': { primary: '#334155', secondary: '#60A5FA' },
      default: { primary: '#0F172A', secondary: '#38BDF8' },
    };
    filteredRows.forEach((row) => {
      const target = normalizeSchoolLabel(row.school);
      const teamLogo = schoolLogoMap.bySchoolName.get(target);
      const match = entries.find((school) => {
        const candidates = [school.dataName, school.name, school.shortName]
          .map((candidate) => normalizeSchoolLabel(candidate))
          .filter(Boolean);
        return candidates.some((candidate) =>
          candidate === target || candidate.includes(target) || target.includes(candidate),
        );
      });
      if (match) {
        map.set(row.school, {
          primaryColor: match.primaryColor,
          secondaryColor: match.secondaryColor,
          logoUrl: teamLogo || match.logoUrl,
        });
        return;
      }
      if (teamLogo) {
        const palette = conferencePalette[row.conference] || conferencePalette.default;
        map.set(row.school, {
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          logoUrl: teamLogo,
        });
      }
    });
    return map;
  }, [filteredRows, schoolLogoMap]);
  const marketabilityRanks = useMemo(() => {
    const percentileRank = (value: number, values: number[]): number => {
      if (values.length <= 1) return 1;
      const lessOrEqual = values.filter((v) => v <= value).length;
      return (lessOrEqual - 1) / (values.length - 1);
    };
    const emvValues = filteredRows.map((row) => row.totalEmvForBrand);
    const erValues = filteredRows.map((row) => row.avgEngagementRate);
    const followerValues = filteredRows.map((row) => row.followers);
    const postValues = filteredRows.map((row) => row.sponsoredPostsForBrand);
    const map = new Map<string, { emvRank: number; erRank: number; followerRank: number; postRank: number }>();
    filteredRows.forEach((row) => {
      map.set(row.athleteId, {
        emvRank: percentileRank(row.totalEmvForBrand, emvValues),
        erRank: percentileRank(row.avgEngagementRate, erValues),
        followerRank: percentileRank(row.followers, followerValues),
        postRank: percentileRank(row.sponsoredPostsForBrand, postValues),
      });
    });
    return map;
  }, [filteredRows]);
  const getMarketabilityRating = (row: TalentAthleteRow): number => {
    const ranks = marketabilityRanks.get(row.athleteId);
    if (!ranks) return 0;
    const weighted = (ranks.erRank * 0.4) + (ranks.emvRank * 0.3) + (ranks.followerRank * 0.2) + (ranks.postRank * 0.1);
    return Math.max(0, Math.min(99, Math.round(weighted * 99)));
  };
  const getScoreTier = (score: number): 'gold' | 'elite' | 'standard' | 'muted' => {
    if (score >= 90) return 'gold';
    if (score >= 80) return 'elite';
    if (score >= 70) return 'standard';
    return 'muted';
  };
  const getEngagementDeltaBadge = (row: TalentAthleteRow): string => {
    const engagementRatio = averageEngagementRate > 0 ? row.avgEngagementRate / averageEngagementRate : 1;
    const pct = Math.round((engagementRatio - 1) * 100);
    if (pct <= 0) return 'In Line with Brand Avg';
    return `+${pct}% vs Brand Avg`;
  };
  const getAthleteMonogram = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'AT';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };
  const getSchoolMonogram = (schoolName: string): string => {
    const parts = schoolName
      .replace(/[()]/g, ' ')
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !['university', 'college', 'of', 'the', 'at'].includes(part.toLowerCase()));
    if (parts.length >= 3) return `${parts[0][0]}${parts[1][0]}${parts[2][0]}`.toUpperCase();
    if (parts.length === 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return 'SCH';
  };
  const resolveSchoolLogo = (row: TalentAthleteRow): string | null => {
    const athleteSchool = athleteSchoolById.get(row.athleteId);
    const schoolNameKey = normalizeSchoolLabel(row.school);
    const schoolIdKey = athleteSchool?.schoolId || '';
    const candidates = [
      athleteSchool?.logo,
      athleteSchool?.image,
      schoolIdKey ? schoolLogoMap.bySchoolId.get(schoolIdKey) : undefined,
      schoolLogoMap.bySchoolName.get(schoolNameKey),
      schoolBrandingByName.get(row.school)?.logoUrl,
    ].filter((candidate): candidate is string => isUsableLogoUrl(candidate));
    for (const candidate of candidates) {
      if (!failedLogoUrls[candidate]) return candidate;
    }
    return null;
  };
  const visibleLogoUrls = useMemo(
    () => filteredRows.slice(0, 24).map((row) => resolveSchoolLogo(row)).filter((value): value is string => Boolean(value)),
    [filteredRows, failedLogoUrls, schoolLogoMap, schoolBrandingByName, athleteSchoolById],
  );
  useEffect(() => {
    const seen = new Set<string>();
    visibleLogoUrls.forEach((url) => {
      if (seen.has(url)) return;
      seen.add(url);
      const image = new Image();
      image.src = url;
    });
  }, [visibleLogoUrls]);
  useEffect(() => {
    if (!filteredRows.length) {
      setSelectedAthleteId(null);
      return;
    }
    if (!selectedAthleteId || !filteredRows.some((row) => row.athleteId === selectedAthleteId)) {
      setSelectedAthleteId(filteredRows[0].athleteId);
    }
  }, [filteredRows, selectedAthleteId]);
  const sponsoredPostsByAthleteId = useMemo(() => {
    const map = new Map<string, SponsoredRecord[]>();
    const athleteIds = new Set(filteredRows.map((row) => row.athleteId));
    const scoped = records.filter((record) => athleteIds.has(record.athlete._id) && matchesBrand(record, brandKey));
    scoped.forEach((record) => {
      const existing = map.get(record.athlete._id) || [];
      existing.push(record);
      map.set(record.athlete._id, existing);
    });
    map.forEach((value, key) => {
      value.sort((a, b) => {
        const aDate = getRecordPublishedAt(a) ? new Date(getRecordPublishedAt(a) as string).getTime() : 0;
        const bDate = getRecordPublishedAt(b) ? new Date(getRecordPublishedAt(b) as string).getTime() : 0;
        return bDate - aDate;
      });
      map.set(key, value.slice(0, 5));
    });
    return map;
  }, [records, filteredRows, brandKey]);
  const selectedRow = useMemo(
    () => filteredRows.find((row) => row.athleteId === selectedAthleteId) || filteredRows[0] || null,
    [filteredRows, selectedAthleteId],
  );

  return (
    <section id="panel-Athlete Roster" role="tabpanel" aria-labelledby="tab-Athlete Roster" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Athlete Roster</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Powered by JABA AI</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect label="Sport" value={sportFilter} onChange={setSportFilter} options={sports.map(formatSport)} rawOptions={sports} />
        <FilterSelect label="Conference" value={conferenceFilter} onChange={setConferenceFilter} options={conferences} rawOptions={conferences} />
        <FilterSelect label="School" value={schoolFilter} onChange={setSchoolFilter} options={schools} rawOptions={schools} />
        <FilterSelect
          label="Followers"
          value={followersBucket}
          onChange={(v) => setFollowersBucket(v as FollowersBucket)}
          options={['All', '<50k', '50k-100k', '100k-200k', '200k+']}
          rawOptions={['All', '<50k', '50k-100k', '100k-200k', '200k+']}
        />
        <FilterSelect
          label="Engagement Rate"
          value={engagementBucket}
          onChange={(v) => setEngagementBucket(v as EngagementBucket)}
          options={['All', '<3%', '3-5%', '5-8%', '8%+']}
          rawOptions={['All', '<3%', '3-5%', '5-8%', '8%+']}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filteredRows.map((row) => {
            const schoolBrand = schoolBrandingByName.get(row.school);
            const primary = schoolBrand?.primaryColor || '#0F172A';
            const secondary = schoolBrand?.secondaryColor || '#38BDF8';
            const score = getMarketabilityRating(row);
            const tier = getScoreTier(score);
            const logoUrl = resolveSchoolLogo(row);
            const isActive = selectedAthleteId === row.athleteId;
            const cardGradient = tier === 'gold'
              ? `linear-gradient(160deg, ${hexToRgba('#A16207', 0.85)} 0%, ${hexToRgba('#EAB308', 0.68)} 45%, ${hexToRgba(primary, 0.78)} 100%)`
              : tier === 'elite'
                ? `linear-gradient(160deg, ${hexToRgba('#0EA5E9', 0.82)} 0%, ${hexToRgba('#2563EB', 0.68)} 45%, ${hexToRgba(primary, 0.8)} 100%)`
                : tier === 'standard'
                  ? `linear-gradient(152deg, ${hexToRgba(primary, 0.86)} 0%, ${hexToRgba(primary, 0.72)} 55%, ${hexToRgba(secondary, 0.5)} 100%)`
                  : `linear-gradient(152deg, ${hexToRgba('#334155', 0.85)} 0%, ${hexToRgba(primary, 0.68)} 58%, ${hexToRgba(secondary, 0.38)} 100%)`;
            return (
              <button
                key={row.athleteId}
                type="button"
                onClick={() => setSelectedAthleteId(row.athleteId)}
                className={`group relative overflow-hidden rounded-2xl border px-3 pb-3 pt-3 text-left text-white transition duration-200 hover:-translate-y-1 ${
                  isActive
                    ? 'border-cyan-300/80 shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_22px_34px_-20px_rgba(34,211,238,0.65)]'
                    : 'border-white/25 shadow-[0_18px_28px_-22px_rgba(2,6,23,0.9)]'
                }`}
                style={{ background: cardGradient }}
                aria-label={`Open performance details for ${row.athleteName}`}
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/40 bg-white/10">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${row.school} logo`}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                        onError={() => setFailedLogoUrls((prev) => ({ ...prev, [logoUrl]: true }))}
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[10px] font-black tracking-[0.08em] text-white"
                        style={{ background: `linear-gradient(140deg, ${hexToRgba(primary, 0.95)} 0%, ${hexToRgba(secondary, 0.7)} 100%)` }}
                      >
                        {getSchoolMonogram(row.school)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-full border border-white/45 bg-black/30 px-2.5 py-1 text-xs font-black tracking-[0.04em]">
                    {score}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl border border-white/45 bg-black/20">
                    {athleteImageById.get(row.athleteId) ? (
                      <img src={athleteImageById.get(row.athleteId) as string} alt={row.athleteName} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-500 text-base font-bold text-white">
                        {getAthleteMonogram(row.athleteName)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h4 className="truncate text-base font-black uppercase tracking-[0.04em]">{row.athleteName}</h4>
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
                    {row.school} • {formatSport(row.sport)}
                  </p>
                </div>
                <div className="mt-3 rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-center text-xs font-bold tracking-[0.05em]">
                  {getEngagementDeltaBadge(row)}
                </div>
              </button>
            );
          })}
        </div>
        <DetailsDrawer
          row={selectedRow}
          recentPosts={selectedRow ? (sponsoredPostsByAthleteId.get(selectedRow.athleteId) || []) : []}
        />
      </div>
    </section>
  );
}

function DetailsDrawer({
  row,
  recentPosts,
}: {
  row: TalentAthleteRow | null;
  recentPosts: SponsoredRecord[];
}) {
  return (
    <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-6.5rem)] xl:self-start">
      <aside className="h-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Athlete Details</h4>
        <div key={row?.athleteId || 'empty'} className="transition-all duration-300">
          {row ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{row.athleteName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{row.school} • {formatSport(row.sport)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatPill label="Followers" value={formatNumber(row.followers)} />
                <StatPill label="Engagement Rate" value={formatPercent(row.avgEngagementRate)} />
                <StatPill label="Sponsored Posts" value={formatNumber(row.sponsoredPostsForBrand)} />
                <StatPill label="EMV" value={formatCurrency(row.totalEmvForBrand)} />
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Recent Sponsored Posts</p>
                <div className="mt-2 space-y-2">
                  {recentPosts.slice(0, 5).map((post) => (
                    <div key={post._id} className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-2 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-slate-700 dark:text-slate-200">{(post.caption || 'Sponsored post').slice(0, 120)}</p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{formatDate(getRecordPublishedAt(post))}</p>
                        </div>
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]">
                          {post.url ? (
                            <img src={post.url} alt="Sponsored post thumbnail" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              Post
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentPosts.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recent sponsored posts will populate as activity is captured.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Select an athlete card to view details.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function SponsoredPostMonitorTab({ brandKey, records }: { brandKey: BrandKey; records: SponsoredRecord[] }) {
  const [mediaType, setMediaType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [athleteSearch, setAthleteSearch] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const rowRefs = useRef<Partial<Record<BrandKey, HTMLDivElement | null>>>({});

  const orderedBrandKeys = useMemo(() => {
    const rest = BRAND_KEYS.filter((key) => key !== brandKey);
    return [brandKey, ...rest];
  }, [brandKey]);

  const postsByBrand = useMemo(() => {
    const map = new Map<BrandKey, ReturnType<typeof getSponsoredPostMonitorPostsForBrand>>();
    orderedBrandKeys.forEach((key) => {
      map.set(key, getSponsoredPostMonitorPostsForBrand(key, false, records));
    });
    return map;
  }, [orderedBrandKeys, records]);

  const allPosts = useMemo(
    () => orderedBrandKeys.flatMap((key) => postsByBrand.get(key) ?? []),
    [orderedBrandKeys, postsByBrand],
  );
  const mediaTypes = useMemo(() => ['All', ...new Set(allPosts.map((post) => post.mediaType))], [allPosts]);
  const filteredPostsByBrand = useMemo(() => {
    const filtered = new Map<BrandKey, ReturnType<typeof getSponsoredPostMonitorPostsForBrand>>();
    orderedBrandKeys.forEach((key) => {
      const list = postsByBrand.get(key) ?? [];
      const scoped = list.filter((post) => {
        if (mediaType !== 'All' && post.mediaType !== mediaType) return false;
        if (athleteSearch.trim()) {
          const q = athleteSearch.toLowerCase();
          if (!post.athleteName.toLowerCase().includes(q)) return false;
        }
        if (startDate) {
          const from = new Date(`${startDate}T00:00:00`);
          const postDate = post.publishedAt ? new Date(post.publishedAt) : null;
          if (postDate && postDate < from) return false;
        }
        if (endDate) {
          const to = new Date(`${endDate}T23:59:59`);
          const postDate = post.publishedAt ? new Date(post.publishedAt) : null;
          if (postDate && postDate > to) return false;
        }
        return true;
      });
      filtered.set(key, scoped);
    });
    return filtered;
  }, [orderedBrandKeys, postsByBrand, mediaType, athleteSearch, startDate, endDate]);
  const filteredPosts = useMemo(
    () => orderedBrandKeys.flatMap((key) => filteredPostsByBrand.get(key) ?? []),
    [orderedBrandKeys, filteredPostsByBrand],
  );
  const selectedPostBrandKey = useMemo(() => {
    if (!selectedPostId) return brandKey;
    for (const key of orderedBrandKeys) {
      const rowPosts = filteredPostsByBrand.get(key) ?? [];
      if (rowPosts.some((post) => post.recordId === selectedPostId)) return key;
    }
    return brandKey;
  }, [selectedPostId, orderedBrandKeys, filteredPostsByBrand, brandKey]);
  const selectedBrandCategory = useMemo(
    () => getBrandCategory(selectedPostBrandKey),
    [selectedPostBrandKey],
  );

  useEffect(() => {
    if (!filteredPosts.length) {
      setSelectedPostId(null);
      return;
    }
    if (!selectedPostId || !filteredPosts.some((post) => post.recordId === selectedPostId)) {
      setSelectedPostId(filteredPosts[0].recordId);
    }
  }, [filteredPosts, selectedPostId]);

  const selectedPost = filteredPosts.find((post) => post.recordId === selectedPostId) || filteredPosts[0] || null;
  const baseline = selectedPost
    ? getAthleteBaselineEngagementRate(selectedPost.athleteId, selectedPost.sponsorPartner, records)
    : null;
  const liftPct = baseline && selectedPost ? (selectedPost.engagementRate - baseline) / baseline : null;

  const baselineLabel = useMemo(() => {
    if (!selectedPost) return 'Select a post to view context.';
    if (baseline === null) return 'Baseline is building as additional sponsored posts are captured.';
    if ((liftPct || 0) > 0.03) return `Above typical sponsored benchmark by ${(Math.max(liftPct || 0, 0) * 100).toFixed(1)}%.`;
    return 'In line with typical sponsored benchmark.';
  }, [selectedPost, baseline, liftPct]);
  const scrollRowBy = (key: BrandKey, direction: 'left' | 'right') => {
    const node = rowRefs.current[key];
    if (!node) return;
    node.scrollBy({ left: direction === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  return (
    <section id="panel-Sponsored Posts" role="tabpanel" aria-labelledby="tab-Sponsored Posts" className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Sponsored Post Monitor</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Powered by JABA AI</p>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
          <FilterSelect label="MediaType" value={mediaType} onChange={setMediaType} options={mediaTypes} rawOptions={mediaTypes} />
          <label className="block min-w-[180px]">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Athlete search</span>
            <input
              type="text"
              value={athleteSearch}
              onChange={(e) => setAthleteSearch(e.target.value)}
              placeholder="Search athlete"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/[0.02]"
            />
          </label>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Date range</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs dark:border-white/15 dark:bg-white/[0.02]" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs dark:border-white/15 dark:bg-white/[0.02]" />
            </div>
          </div>
          <div className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">{filteredPosts.length} posts in view</div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {orderedBrandKeys.map((key) => {
              const rowPosts = filteredPostsByBrand.get(key) ?? [];
              if (rowPosts.length === 0) return null;
              return (
                <section key={key} className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                      {BRAND_MAP[key].displayName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{rowPosts.length} posts</span>
                      <button
                        type="button"
                        onClick={() => scrollRowBy(key, 'left')}
                        aria-label={`Scroll ${BRAND_MAP[key].displayName} row left`}
                        className="h-7 w-7 rounded-full border border-slate-300 bg-white/80 text-sm font-bold text-slate-600 transition hover:bg-white dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollRowBy(key, 'right')}
                        aria-label={`Scroll ${BRAND_MAP[key].displayName} row right`}
                        className="h-7 w-7 rounded-full border border-slate-300 bg-white/80 text-sm font-bold text-slate-600 transition hover:bg-white dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <div className="w-full max-w-full overflow-hidden rounded-xl">
                    <div
                      ref={(node) => { rowRefs.current[key] = node; }}
                      className="flex w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pr-4 scroll-smooth"
                    >
                      {rowPosts.map((post) => {
                      const isActive = post.recordId === selectedPostId;
                      const isVideo = post.mediaType.includes('VIDEO') || post.mediaType.includes('REEL');
                      const isCarousel = post.mediaType.includes('CAROUSEL');
                      const postHref = post.permalink || post.mediaUrl || '#';
                      return (
                        <a
                          key={post.recordId}
                          href={postHref}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(event) => {
                            setSelectedPostId(post.recordId);
                            if (!post.permalink && !post.mediaUrl) event.preventDefault();
                          }}
                          className={`group relative h-[240px] w-[178px] shrink-0 snap-start overflow-hidden rounded-xl text-left transition duration-200 ${
                            isActive
                              ? 'ring-2 ring-cyan-400/80 dark:ring-cyan-300/70'
                              : 'ring-1 ring-slate-200/80 hover:ring-cyan-300/70 dark:ring-white/10 dark:hover:ring-cyan-300/60'
                          }`}
                          aria-label={`Open post from ${post.athleteName}`}
                        >
                          <div className="absolute inset-0 overflow-hidden">
                            {post.mediaUrl ? (
                              <img
                                src={post.mediaUrl}
                                alt={`${post.athleteName} post`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-semibold text-slate-500 dark:from-white/10 dark:to-white/[0.03] dark:text-slate-300">
                                Media preview
                              </div>
                            )}
                          </div>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                          <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                            <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white">
                              ER {formatPercent(post.engagementRate)}
                            </span>
                            <span className="rounded-full bg-cyan-600/85 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {post.emvEstimated ? 'EMV*' : 'EMV'} {formatCurrency(post.emv)}
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="truncate text-sm font-semibold text-white">{post.athleteName}</p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="truncate rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                                {post.school}
                              </span>
                              <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                                {formatSport(post.sport)}
                              </span>
                            </div>
                          </div>
                          <div className="absolute inset-x-2 bottom-2 translate-y-8 rounded-lg bg-black/68 p-2 opacity-0 backdrop-blur-[2px] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold text-white/95">
                              <span>ER {formatPercent(post.engagementRate)}</span>
                              <span>Likes {formatNumber(post.likes)}</span>
                              <span>Comments {formatNumber(post.comments)}</span>
                              <span>{post.emvEstimated ? 'EMV*' : 'EMV'} {formatCurrency(post.emv)}</span>
                            </div>
                            <span className="mt-2 inline-flex rounded-full border border-white/40 px-2 py-0.5 text-[10px] font-semibold text-white">
                              View Details
                            </span>
                          </div>
                          <div className="absolute left-2 top-2 flex items-center gap-1.5">
                            {isVideo && <span className="rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">▶</span>}
                            {isCarousel && <span className="rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">▦</span>}
                          </div>
                        </a>
                      );
                      })}
                      <div className="h-px w-2 shrink-0" aria-hidden />
                    </div>
                  </div>
                </section>
              );
            })}
            {filteredPosts.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
                Adjust filters to view more sponsored posts.
              </div>
            )}
          </div>
          <aside className="space-y-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Performance Context</h3>
            {selectedPost ? (
              <div key={selectedPost.recordId} className="space-y-3 transition-all duration-300">
                <div className="rounded-lg border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedPost.athleteName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatSport(selectedPost.sport)} • {selectedPost.school}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedPost.publishedAt)}</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{baselineLabel}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <StatPill label="Current ER" value={formatPercent(selectedPost.engagementRate)} />
                    <StatPill label="Baseline ER" value={baseline === null ? 'Building' : formatPercent(baseline)} />
                    <StatPill label="Engagement Lift" value={liftPct === null ? 'Building' : `${(liftPct * 100).toFixed(1)}%`} />
                    <StatPill label={selectedPost.totalInteractionsEstimated ? 'Interactions (Estimated)' : 'Interactions'} value={formatNumber(selectedPost.totalInteractions)} />
                    <StatPill label={selectedPost.emvEstimated ? 'EMV (Estimated)' : 'EMV'} value={formatCurrency(selectedPost.emv)} />
                    <StatPill label="Category Context" value={selectedBrandCategory} />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="font-semibold text-slate-900 dark:text-white">Brand Category Context</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Live monitoring for {selectedBrandCategory} sponsorship velocity and athlete-level engagement benchmarks.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Select a post to view baseline context.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function BenchmarksTab({
  brandKey,
  summaries,
  records,
}: {
  brandKey: BrandKey;
  summaries: BrandOutputs['brandSummaries'];
  records: SponsoredRecord[];
}) {
  const [metric, setMetric] = useState<'engagementRate' | 'emvPerPost'>('engagementRate');
  const brandRows = useMemo(() => {
    const rows = BRAND_KEYS.map((key) => {
      const summary = summaries[key];
      const emvPerPost = summary.posts > 0 ? summary.estimatedEmv / summary.posts : 0;
      return {
        brandKey: key,
        brandLabel: BRAND_MAP[key].displayName,
        engagementRate: summary.avgEngagementRate,
        emvPerPost,
      };
    });
    return rows.sort((a, b) => {
      const aVal = metric === 'engagementRate' ? a.engagementRate : a.emvPerPost;
      const bVal = metric === 'engagementRate' ? b.engagementRate : b.emvPerPost;
      return bVal - aVal;
    });
  }, [metric]);

  const maxMetric = Math.max(
    1,
    ...brandRows.map((row) => (metric === 'engagementRate' ? row.engagementRate : row.emvPerPost)),
  );

  const lifts = useMemo(() => getAthleteBaselineLiftsForBrand(brandKey, records), [brandKey, records]);
  const bins = useMemo(() => {
    const template = [
      { label: 'Below -10%', key: 'ltNeg10', count: 0 },
      { label: '-10% to 0%', key: 'neg10to0', count: 0 },
      { label: '0% to 10%', key: 'zeroTo10', count: 0 },
      { label: '10% to 25%', key: 'tenTo25', count: 0 },
      { label: '25%+', key: 'gt25', count: 0 },
    ];
    for (const row of lifts) {
      const pct = row.lift * 100;
      if (pct < -10) template[0].count += 1;
      else if (pct < 0) template[1].count += 1;
      else if (pct < 10) template[2].count += 1;
      else if (pct < 25) template[3].count += 1;
      else template[4].count += 1;
    }
    return template;
  }, [lifts]);
  const maxBin = Math.max(1, ...bins.map((bin) => bin.count));
  const aboveCount = lifts.filter((row) => row.lift > 0).length;
  const inLineCount = lifts.length - aboveCount;

  const categoryBenchmark = useMemo(() => getInternalCategoryBenchmarkForBrand(brandKey, summaries), [brandKey, summaries]);
  const selectedSummary = summaries[brandKey];
  const selectedEmvPerPost = selectedSummary.posts > 0 ? selectedSummary.estimatedEmv / selectedSummary.posts : 0;

  return (
    <section id="panel-Benchmarks" role="tabpanel" aria-labelledby="tab-Benchmarks" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Benchmarks</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Powered by JABA AI</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Brand vs Brand</h3>
            <div className="inline-flex rounded-full border border-slate-300 bg-slate-50 p-1 dark:border-white/15 dark:bg-white/[0.02]">
              <button
                onClick={() => setMetric('engagementRate')}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${metric === 'engagementRate' ? 'bg-indigo-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Avg Engagement
              </button>
              <button
                onClick={() => setMetric('emvPerPost')}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${metric === 'emvPerPost' ? 'bg-indigo-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Avg EMV/Post
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {brandRows.map((row) => {
              const value = metric === 'engagementRate' ? row.engagementRate : row.emvPerPost;
              const width = `${(value / maxMetric) * 100}%`;
              return (
                <div key={row.brandKey} className="grid grid-cols-[130px_1fr_90px] items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.brandLabel}</span>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-3 rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ width }} />
                  </div>
                  <span className="text-right text-xs text-slate-600 dark:text-slate-300">
                    {metric === 'engagementRate' ? formatPercent(value) : formatCurrency(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Brand vs Athlete Baseline</h3>
          <div className="mt-3 space-y-2">
            {bins.map((bin) => (
              <div key={bin.key} className="grid grid-cols-[96px_1fr_24px] items-center gap-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-300">{bin.label}</span>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" style={{ width: `${(bin.count / maxBin) * 100}%` }} />
                </div>
                <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{bin.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
            {aboveCount} athletes are above typical sponsored benchmark and {inLineCount} are in line with typical sponsored benchmark.
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Brand vs Category Average</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Category</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{categoryBenchmark.categoryLabel}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Internal benchmark built from the 9-brand campaign set.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatPill label="Brand Avg ER" value={formatPercent(selectedSummary.avgEngagementRate)} />
            <StatPill label="Category Avg ER" value={formatPercent(categoryBenchmark.avgEngagementRate)} />
            <StatPill label="Brand Avg EMV/Post" value={formatCurrency(selectedEmvPerPost)} />
            <StatPill label="Category Avg EMV/Post" value={formatCurrency(categoryBenchmark.avgEmvPerPost)} />
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
          {BRAND_MAP[brandKey].displayName} is positioned for continued expansion with a strong internal category reference point.
        </p>
      </article>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  rawOptions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  rawOptions: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/15 dark:bg-white/[0.02] dark:text-slate-100"
      >
        {rawOptions.map((raw, idx) => <option key={`${raw}-${idx}`} value={raw}>{options[idx]}</option>)}
      </select>
    </label>
  );
}

function PrimaryCountCard({
  label,
  value,
  formatter,
  className = '',
}: {
  label: string;
  value: number;
  formatter: (value: number) => string;
  className?: string;
}) {
  const count = useCountUp(value);
  return (
    <div className={`rounded-xl border border-cyan-300/50 bg-gradient-to-br from-cyan-50 to-white p-4 dark:border-cyan-300/25 dark:from-cyan-500/10 dark:to-white/[0.02] ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{formatter(count)}</p>
    </div>
  );
}

function CountCard({ label, value, formatter }: { label: string; value: number; formatter: (value: number) => string }) {
  const count = useCountUp(value);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatter(count)}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function PlaceholderPanel({ tab }: { tab: ReportTab }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tab}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This section is staged and ready for the next build step.</p>
    </section>
  );
}

function FriendlyBrandEmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-sm dark:border-white/20 dark:bg-white/[0.03]">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">Add your first campaign dataset to unlock insights.</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Powered by JABA AI</p>
    </section>
  );
}

function SkeletonPostgame() {
  return (
    <section className="space-y-4" aria-label="Loading Postgame report">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="h-11 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-3 h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>
    </section>
  );
}
