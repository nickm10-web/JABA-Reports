import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ClipboardCheck,
  Filter,
  WandSparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

interface QCollarReportProps {
  onBack?: () => void;
}

type TabId =
  | 'overview'
  | 'athlete-network'
  | 'benchmarks'
  | 'partnerships';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  school: string;
  headshotUrl: string;
  followers: number;
  posts: number;
  engagement: number;
  emvPerPost: number;
  marketability: number;
  activationMix: {
    reelsPct: number;
    postsPct: number;
    collabRate: number;
    logoUsageRate: number;
    sponsoredCadence: number;
  };
  notes: string;
}

interface Post {
  id: string;
  athleteId: string;
  caption: string;
  engagement: number;
  likes: number;
  comments: number;
  sponsored: boolean;
  emv?: number;
  mediaType?: string;
  thumbnailUrl?: string;
}

interface Partner {
  id: string;
  name: string;
  type: 'Athlete' | 'School' | 'League' | 'Retail' | 'Media';
  status: 'Active' | 'Discovery' | 'Expansion';
  lastTouch: string;
  nextStep: string;
  contact: string;
  email: string;
  metrics: { label: string; value: string }[];
}

interface ScrapedBrandPostRow {
  permalink?: string | null;
  caption?: string | null;
  likes?: number | null;
  comments?: number | null;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null;
  thumbnail?: string | null;
  mediaCandidates?: string[] | null;
}

interface ScrapedBrandPostsResponse {
  rows?: ScrapedBrandPostRow[];
}

interface QCRosterRow {
  _id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  schoolName?: string;
  sport?: string;
  metrics?: {
    ninetyDays?: {
      marketability?: number;
      engagementRate?: number;
      followers?: number;
      contentCount?: number;
      sponsoredContentCount?: number;
    };
  };
}

interface QCContentRow {
  _id: string;
  mediaType?: string;
  caption?: string;
  hasOrganizationLogo?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  isSponsored?: boolean;
  metrics?: {
    likes?: number;
    comments?: number;
    engagementRate?: number;
    emv?: number;
  };
  athlete?: {
    _id?: string;
    name?: string;
    image?: string;
    sport?: string;
    school?: { name?: string };
  };
}

interface AthleteBaselineRow {
  athlete: string;
  followers?: number;
  sampleSize?: number;
  avgLikes?: number;
  avgComments?: number;
  engagementRate?: number;
}

interface AthleteMentionRow {
  athlete: string;
  likes?: number;
  comments?: number;
  engagementRate?: number;
}

interface CompetitiveBrandRow {
  brand: string;
  sponsoredAthletePosts?: number;
  avgLikesSponsored?: number;
  avgCommentsSponsored?: number;
  engagementAvgProxy?: number;
  talentUsed?: string[];
}

const MOCK_DATA: {
  athletes: Athlete[];
  posts: Post[];
  partners: Partner[];
} = {
  athletes: [
    { id: 'a1', name: 'Sauce Gardner', sport: 'Football', school: 'Cincinnati (NFL)', headshotUrl: '/JABA-face.png', followers: 1100000, posts: 14, engagement: 6.3, emvPerPost: 48200, marketability: 98, activationMix: { reelsPct: 64, postsPct: 36, collabRate: 58, logoUsageRate: 46, sponsoredCadence: 2.8 }, notes: 'Elite trust + strong athlete education style.' },
    { id: 'a2', name: 'Brady Russell', sport: 'Football', school: 'Colorado (NFL)', headshotUrl: '/JABA-face.png', followers: 169000, posts: 11, engagement: 5.4, emvPerPost: 16200, marketability: 88, activationMix: { reelsPct: 52, postsPct: 48, collabRate: 49, logoUsageRate: 38, sponsoredCadence: 2.1 }, notes: 'Authentic training context drives saves and shares.' },
    { id: 'a3', name: 'Jaylinn Hawkins', sport: 'Football', school: 'California (NFL)', headshotUrl: '/JABA-face.png', followers: 212000, posts: 9, engagement: 4.8, emvPerPost: 14900, marketability: 85, activationMix: { reelsPct: 57, postsPct: 43, collabRate: 44, logoUsageRate: 34, sponsoredCadence: 1.9 }, notes: 'Great fit for future-facing safety storytelling.' },
    { id: 'a4', name: 'Elliott McDermott', sport: 'Lacrosse', school: 'University of Maryland', headshotUrl: '/JABA-face.png', followers: 86000, posts: 8, engagement: 7.1, emvPerPost: 12300, marketability: 82, activationMix: { reelsPct: 42, postsPct: 58, collabRate: 51, logoUsageRate: 41, sponsoredCadence: 1.7 }, notes: 'High conversion for product visibility moments.' },
    { id: 'a5', name: 'Georgia Hoey', sport: 'Hockey', school: 'Boston College', headshotUrl: '/JABA-face.png', followers: 72000, posts: 7, engagement: 8.2, emvPerPost: 9800, marketability: 79, activationMix: { reelsPct: 61, postsPct: 39, collabRate: 47, logoUsageRate: 36, sponsoredCadence: 1.5 }, notes: 'Lifestyle + education format performs consistently.' },
  ],
  posts: [
    { id: 'p1', athleteId: 'a1', caption: 'Protect what powers performance. #QCollar', engagement: 41200, likes: 39100, comments: 2100, sponsored: true, emv: 50200, mediaType: 'REEL', thumbnailUrl: '/q-collar-logo.png' },
    { id: 'p2', athleteId: 'a2', caption: 'Collar Up for every rep.', engagement: 9400, likes: 8800, comments: 600, sponsored: true, emv: 16900, mediaType: 'REEL', thumbnailUrl: '/q-collar-logo.png' },
    { id: 'p3', athleteId: 'a3', caption: 'Game prep + confidence starts early.', engagement: 8600, likes: 8020, comments: 580, sponsored: true, emv: 15100, mediaType: 'POST', thumbnailUrl: '/q-collar-logo.png' },
    { id: 'p4', athleteId: 'a4', caption: 'Training day, smarter routine.', engagement: 7200, likes: 6800, comments: 400, sponsored: true, emv: 12600, mediaType: 'POST', thumbnailUrl: '/q-collar-logo.png' },
    { id: 'p5', athleteId: 'a5', caption: 'Safety and consistency in every session.', engagement: 6900, likes: 6410, comments: 490, sponsored: true, emv: 10100, mediaType: 'REEL', thumbnailUrl: '/q-collar-logo.png' },
  ],
  partners: [
    { id: 'pr1', name: 'Athlete Accelerator Group', type: 'Athlete', status: 'Active', lastTouch: '2 days ago', nextStep: 'Lock Q3 creator bundle', contact: 'Maya Rogers', email: 'maya@aag.com', metrics: [{ label: 'Posts', value: '14' }, { label: 'Engagement', value: '89K' }, { label: 'EMV', value: '$215K' }] },
    { id: 'pr2', name: 'Big Ten School Network', type: 'School', status: 'Expansion', lastTouch: '5 days ago', nextStep: 'Share pilot recap', contact: 'Daniel Kim', email: 'daniel@bigtenschools.com', metrics: [{ label: 'Posts', value: '31' }, { label: 'Engagement', value: '122K' }, { label: 'EMV', value: '$301K' }] },
    { id: 'pr3', name: 'Pro Player Collective', type: 'League', status: 'Discovery', lastTouch: '1 week ago', nextStep: 'Confirm intro call', contact: 'Sofia Reed', email: 'sofia@ppc.org', metrics: [{ label: 'Posts', value: '9' }, { label: 'Engagement', value: '57K' }, { label: 'EMV', value: '$140K' }] },
    { id: 'pr4', name: 'Elite Retail Alliance', type: 'Retail', status: 'Active', lastTouch: '3 days ago', nextStep: 'Plan co-branded launch', contact: 'Nolan Hayes', email: 'nolan@elite-retail.com', metrics: [{ label: 'Posts', value: '12' }, { label: 'Engagement', value: '72K' }, { label: 'EMV', value: '$183K' }] },
    { id: 'pr5', name: 'Performance Media Group', type: 'Media', status: 'Expansion', lastTouch: 'Yesterday', nextStep: 'Finalize feature package', contact: 'Ari Brooks', email: 'ari@pmg.com', metrics: [{ label: 'Posts', value: '16' }, { label: 'Engagement', value: '94K' }, { label: 'EMV', value: '$228K' }] },
  ],
};

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'athlete-network', label: 'Athlete Network' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'partnerships', label: 'Partnerships (CRM)' },
];

function numberFormat(value: number) {
  return value.toLocaleString();
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatSportLabel(input?: string) {
  if (!input) return 'Sport';
  const normalized = input
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  const titleCased = normalized.replace(/\b\w/g, (char) => char.toUpperCase());

  return titleCased
    .replace(/^Mens\b/i, "Men's")
    .replace(/^Womens\b/i, "Women's");
}

function CountUpValue({
  target,
  duration = 900,
  formatValue,
  start,
}: {
  target: number;
  duration?: number;
  formatValue?: (value: number) => string;
  start: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }

    let raf = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  const rounded = target >= 1000 ? Math.round(value) : Number(value.toFixed(1));
  return <>{formatValue ? formatValue(rounded) : rounded}</>;
}

export function QCollarReport({ onBack }: QCollarReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);

  const [sportFilter, setSportFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [followersFilter, setFollowersFilter] = useState('All');
  const [engagementFilter, setEngagementFilter] = useState('All');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(MOCK_DATA.athletes[0]);

  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(MOCK_DATA.partners[0].id);
  const [featuredFromScrape, setFeaturedFromScrape] = useState<ScrapedBrandPostRow | null>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [liveAthletes, setLiveAthletes] = useState<Athlete[] | null>(null);
  const [benchmarkQCContents, setBenchmarkQCContents] = useState<QCContentRow[]>([]);
  const [benchmarkAthleteBaselines, setBenchmarkAthleteBaselines] = useState<AthleteBaselineRow[]>([]);
  const [benchmarkAthleteMentions, setBenchmarkAthleteMentions] = useState<AthleteMentionRow[]>([]);
  const [benchmarkCompetitiveRows, setBenchmarkCompetitiveRows] = useState<CompetitiveBrandRow[]>([]);
  const [benchmarkAllSponsoredRows, setBenchmarkAllSponsoredRows] = useState<QCContentRow[]>([]);
  const [benchmarkBig10Rows, setBenchmarkBig10Rows] = useState<QCContentRow[]>([]);

  const isDark = true;
  const generatedAt = format(new Date(), 'MMM dd, yyyy • h:mm a');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    const toPercent = (value?: number) => {
      if (!value) return 0;
      return value <= 1 ? value * 100 : value;
    };

    const loadQCLiveData = async () => {
      try {
        const [rosterRes, contentsRes] = await Promise.all([
          fetch('/data/QC_roster.json'),
          fetch('/data/QC_Contens.json'),
        ]);
        if (!rosterRes.ok || !contentsRes.ok) return;

        const roster = (await rosterRes.json()) as QCRosterRow[];
        const contents = (await contentsRes.json()) as QCContentRow[];

        const contentsByAthlete = new Map<string, QCContentRow[]>();
        contents.forEach((item) => {
          const key = String(item.athlete?._id || '');
          if (!key) return;
          if (!contentsByAthlete.has(key)) contentsByAthlete.set(key, []);
          contentsByAthlete.get(key)?.push(item);
        });

        const athletesMapped: Athlete[] = roster.map((row) => {
          const id = String(row._id || '');
          const ninety = row.metrics?.ninetyDays || {};
          const athleteContents = contentsByAthlete.get(id) || [];
          const total = Math.max(athleteContents.length, 1);
          const reels = athleteContents.filter((item) => {
            const mediaType = String(item.mediaType || '').toUpperCase();
            return mediaType === 'REEL' || mediaType === 'VIDEO';
          }).length;
          const collaborations = athleteContents.filter((item) => item.isCollaboration || item.isOrganizationCollaboration).length;
          const logoUsage = athleteContents.filter((item) => item.hasOrganizationLogo).length;
          const totalEmv = athleteContents.reduce((sum, item) => sum + Number(item.metrics?.emv || 0), 0);
          const avgEmv = athleteContents.length > 0 ? totalEmv / athleteContents.length : 0;

          const derivedEngagement = toPercent(ninety.engagementRate);
          const derivedFollowers = Number(ninety.followers || 0);
          const derivedPosts = Number(ninety.contentCount || athleteContents.length || 0);
          const derivedSponsored = Number(ninety.sponsoredContentCount || athleteContents.filter((item) => item.isSponsored).length);

          const nameFromRoster = `${row.firstName || ''} ${row.lastName || ''}`.trim();
          const nameFromContent = athleteContents[0]?.athlete?.name || '';

          return {
            id,
            name: nameFromRoster || nameFromContent || 'Athlete',
            sport: formatSportLabel(row.sport || athleteContents[0]?.athlete?.sport),
            school: row.schoolName || athleteContents[0]?.athlete?.school?.name || 'School',
            headshotUrl: row.profilePicture || athleteContents[0]?.athlete?.image || '/JABA-face.png',
            followers: derivedFollowers,
            posts: derivedPosts,
            engagement: Number(derivedEngagement.toFixed(1)),
            emvPerPost: Math.round(avgEmv || (derivedFollowers * 0.015 * (derivedEngagement / 100))),
            marketability: Math.round(Number(ninety.marketability || 70)),
            activationMix: {
              reelsPct: Math.round((reels / total) * 100),
              postsPct: Math.round(((total - reels) / total) * 100),
              collabRate: Math.round((collaborations / total) * 100),
              logoUsageRate: Math.round((logoUsage / total) * 100),
              sponsoredCadence: Number((derivedSponsored / 3).toFixed(1)),
            },
            notes: 'Strong alignment for partnership storytelling.',
          };
        });

        if (!isActive) return;
        setBenchmarkQCContents(contents);
        setLiveAthletes(
          athletesMapped.filter((athlete) => athlete.followers > 0 || athlete.posts > 0).sort((a, b) => b.marketability - a.marketability)
        );
      } catch {
        // Fallback to mock data silently.
      }
    };

    loadQCLiveData();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadBenchmarkSources = async () => {
      try {
        const [baselineRes, mentionsRes, competitiveRes, allSponsoredRes, big10Res] = await Promise.all([
          fetch('/data/scrapecreators/athlete-baselines-qcollarofficial.json'),
          fetch('/data/scrapecreators/athlete-mentions-qcollarofficial.json'),
          fetch('/data/scrapecreators/competitive-brand-qcollarofficial.json'),
          fetch('/data/all_roster_sponsored.json'),
          fetch('/data/Big10Contents.json'),
        ]);

        if (!isActive) return;

        if (baselineRes.ok) {
          const baselineData = await baselineRes.json();
          setBenchmarkAthleteBaselines(Array.isArray(baselineData?.rows) ? baselineData.rows : []);
        }
        if (mentionsRes.ok) {
          const mentionsData = await mentionsRes.json();
          setBenchmarkAthleteMentions(Array.isArray(mentionsData?.rows) ? mentionsData.rows : []);
        }
        if (competitiveRes.ok) {
          const competitiveData = await competitiveRes.json();
          setBenchmarkCompetitiveRows(Array.isArray(competitiveData?.rows) ? competitiveData.rows : []);
        }
        if (allSponsoredRes.ok) {
          const allSponsoredData = await allSponsoredRes.json();
          setBenchmarkAllSponsoredRows(Array.isArray(allSponsoredData) ? allSponsoredData : []);
        }
        if (big10Res.ok) {
          const big10Data = await big10Res.json();
          setBenchmarkBig10Rows(Array.isArray(big10Data) ? big10Data : []);
        }
      } catch {
        // Keep UI stable with partial data if any source is unavailable.
      }
    };

    loadBenchmarkSources();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const featuredPermalink = 'https://www.instagram.com/p/DUlvwvTD5_q/';

    const loadFeatured = async () => {
      try {
        const response = await fetch('/data/scrapecreators/brand-posts-qcollarofficial.json');
        if (!response.ok) return;
        const data = (await response.json()) as ScrapedBrandPostsResponse;
        const forcedFeatured =
          (data.rows || []).find(
            (row) =>
              (row.permalink || '').replace(/\/+$/, '') === featuredPermalink.replace(/\/+$/, '')
          ) ||
          (data.rows || []).find(
            (row) => row.thumbnailUrl || row.mediaUrl || row.thumbnail
        );
        if (isActive && forcedFeatured) {
          setFeaturedFromScrape(forcedFeatured);
        }
      } catch {
        // Keep mock fallback if local file is missing.
      }
    };

    loadFeatured();
    return () => {
      isActive = false;
    };
  }, []);

  const athleteSource = liveAthletes && liveAthletes.length > 0 ? liveAthletes : MOCK_DATA.athletes;

  const filteredAthletes = useMemo(() => {
    let rows = [...athleteSource];
    if (sportFilter !== 'All') rows = rows.filter((a) => a.sport === sportFilter);
    if (schoolFilter !== 'All') rows = rows.filter((a) => a.school === schoolFilter);
    if (followersFilter === '0-100k') rows = rows.filter((a) => a.followers < 100000);
    if (followersFilter === '100k-500k') rows = rows.filter((a) => a.followers >= 100000 && a.followers <= 500000);
    if (followersFilter === '500k+') rows = rows.filter((a) => a.followers > 500000);
    if (engagementFilter === '<5') rows = rows.filter((a) => a.engagement < 5);
    if (engagementFilter === '5-7') rows = rows.filter((a) => a.engagement >= 5 && a.engagement <= 7);
    if (engagementFilter === '7+') rows = rows.filter((a) => a.engagement > 7);
    rows.sort((a, b) => b.marketability - a.marketability || b.engagement - a.engagement);
    return rows;
  }, [athleteSource, sportFilter, schoolFilter, followersFilter, engagementFilter]);

  useEffect(() => {
    if (!selectedAthlete || !filteredAthletes.find((a) => a.id === selectedAthlete.id)) {
      setSelectedAthlete(filteredAthletes[0] ?? null);
    }
  }, [filteredAthletes, selectedAthlete]);

  const selectedPartner = useMemo(
    () => MOCK_DATA.partners.find((p) => p.id === selectedPartnerId) ?? MOCK_DATA.partners[0],
    [selectedPartnerId]
  );
  const featuredPost = useMemo(() => {
    const fallback = MOCK_DATA.posts[0];
    if (!featuredFromScrape) return fallback;
    return {
      ...fallback,
      caption: featuredFromScrape.caption || fallback.caption,
      likes: featuredFromScrape.likes ?? fallback.likes,
      comments: featuredFromScrape.comments ?? fallback.comments,
      engagement: (featuredFromScrape.likes ?? fallback.likes) + (featuredFromScrape.comments ?? fallback.comments),
      thumbnailUrl:
        featuredFromScrape.thumbnailUrl ||
        featuredFromScrape.mediaUrl ||
        featuredFromScrape.thumbnail ||
        fallback.thumbnailUrl,
    };
  }, [featuredFromScrape]);

  const featuredImageCandidates = useMemo(() => {
    const raw = [
      featuredFromScrape?.thumbnailUrl,
      featuredFromScrape?.mediaUrl,
      featuredFromScrape?.thumbnail,
      ...(Array.isArray(featuredFromScrape?.mediaCandidates) ? featuredFromScrape.mediaCandidates : []),
      featuredPost.thumbnailUrl,
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());

    const withProxy = raw.flatMap((value) => {
      if (!/^https?:\/\//i.test(value)) return [value];
      const noProtocol = value.replace(/^https?:\/\//i, '');
      return [value, `https://images.weserv.nl/?url=${encodeURIComponent(noProtocol)}`];
    });

    // Always end with a deterministic local fallback.
    withProxy.push('/q-collar-logo.png');
    return [...new Set(withProxy)];
  }, [featuredFromScrape, featuredPost.thumbnailUrl]);

  useEffect(() => {
    setFeaturedImageIndex(0);
  }, [featuredPost.thumbnailUrl, featuredFromScrape]);

  const benchmarkModel = useMemo(() => {
    const safePercent = (value: number) => (value <= 1 ? value * 100 : value);
    const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

    const summarizePosts = (rows: QCContentRow[]) => {
      const likes = average(rows.map((row) => Number(row.metrics?.likes || 0)));
      const comments = average(rows.map((row) => Number(row.metrics?.comments || 0)));
      const engagementRate = average(rows.map((row) => safePercent(Number(row.metrics?.engagementRate || 0))));
      const emv = average(rows.map((row) => Number(row.metrics?.emv || 0)));
      return {
        posts: rows.length,
        avgLikes: likes,
        avgComments: comments,
        avgEngagementRate: engagementRate,
        avgEmv: emv,
      };
    };

    const qcRows = benchmarkQCContents;
    const qcSponsored = qcRows.filter((row) => Boolean(row.isSponsored));
    const qcUnsponsored = qcRows.filter((row) => !row.isSponsored);
    const qcSponsoredSummary = summarizePosts(qcSponsored);
    const qcUnsponsoredSummary = summarizePosts(qcUnsponsored);

    const baselineByAthlete = new Map(
      benchmarkAthleteBaselines.map((row) => [String(row.athlete || '').trim().toLowerCase(), row])
    );
    const mentionGroups = new Map<string, AthleteMentionRow[]>();
    benchmarkAthleteMentions.forEach((row) => {
      const key = String(row.athlete || '').trim().toLowerCase();
      if (!key) return;
      if (!mentionGroups.has(key)) mentionGroups.set(key, []);
      mentionGroups.get(key)?.push(row);
    });

    const athleteLiftRows = [...mentionGroups.entries()]
      .map(([key, rows]) => {
        const baseline = baselineByAthlete.get(key);
        const avgLikes = average(rows.map((row) => Number(row.likes || 0)));
        const avgComments = average(rows.map((row) => Number(row.comments || 0)));
        const avgEngagementRate = average(rows.map((row) => safePercent(Number(row.engagementRate || 0))));
        const baselineLikes = Number(baseline?.avgLikes || 0);
        const baselineComments = Number(baseline?.avgComments || 0);
        const baselineEngagementRate = safePercent(Number(baseline?.engagementRate || 0));
        const lift = (current: number, base: number) => (base > 0 ? ((current - base) / base) * 100 : 0);
        return {
          athlete: rows[0]?.athlete || key,
          posts: rows.length,
          qLikes: avgLikes,
          baseLikes: baselineLikes,
          likesLiftPct: lift(avgLikes, baselineLikes),
          qComments: avgComments,
          baseComments: baselineComments,
          commentsLiftPct: lift(avgComments, baselineComments),
          qEngagementRate: avgEngagementRate,
          baseEngagementRate: baselineEngagementRate,
          engagementLiftPct: lift(avgEngagementRate, baselineEngagementRate),
        };
      })
      .sort((a, b) => b.posts - a.posts || b.qEngagementRate - a.qEngagementRate)
      .slice(0, 8);

    const competitorRows = benchmarkCompetitiveRows.map((row) => ({
      brand: row.brand,
      sponsoredPosts: Number(row.sponsoredAthletePosts || 0),
      avgLikes: Number(row.avgLikesSponsored || 0),
      avgComments: Number(row.avgCommentsSponsored || 0),
      engagementRate: safePercent(Number(row.engagementAvgProxy || 0)),
      talentCount: Array.isArray(row.talentUsed) ? row.talentUsed.length : 0,
    }));

    const competitorOverall = {
      avgLikes: average(competitorRows.map((row) => row.avgLikes)),
      avgComments: average(competitorRows.map((row) => row.avgComments)),
      avgEngagementRate: average(competitorRows.map((row) => row.engagementRate)),
    };

    const allSponsored = benchmarkAllSponsoredRows.filter((row) => Boolean(row.isSponsored));
    const ncaaSponsoredSummary = summarizePosts(allSponsored);
    const big10SponsoredSummary = summarizePosts(
      benchmarkBig10Rows.filter((row) => Boolean(row.isSponsored))
    );

    const qcSponsoredSportCounts = qcSponsored.reduce<Record<string, number>>((acc, row) => {
      const key = String(row.athlete?.sport || 'Unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topQCSport = Object.entries(qcSponsoredSportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'FOOTBALL';
    const sportBenchmarkSummary = summarizePosts(
      allSponsored.filter((row) => String(row.athlete?.sport || '') === topQCSport)
    );

    return {
      qcSponsoredSummary,
      qcUnsponsoredSummary,
      athleteLiftRows,
      competitorRows,
      competitorOverall,
      ncaaSponsoredSummary,
      big10SponsoredSummary,
      topQCSport: formatSportLabel(topQCSport),
      sportBenchmarkSummary,
    };
  }, [
    benchmarkQCContents,
    benchmarkAthleteBaselines,
    benchmarkAthleteMentions,
    benchmarkCompetitiveRows,
    benchmarkAllSponsoredRows,
    benchmarkBig10Rows,
  ]);

  const tabButtonClass = (id: TabId) =>
    `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      activeTab === id
        ? isDark
          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
          : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
        : isDark
          ? 'text-slate-300 hover:bg-slate-800'
          : 'text-slate-700 hover:bg-slate-100'
    }`;

  const shellClass = isDark
    ? 'min-h-screen bg-[radial-gradient(circle_at_top,_#14325e_0%,_#0b1223_40%,_#070b15_100%)] text-slate-100'
    : 'min-h-screen bg-[radial-gradient(circle_at_top,_#e8f2ff_0%,_#f8fbff_45%,_#eef4fa_100%)] text-slate-900';

  const surfaceClass = isDark ? 'bg-slate-900/75 border border-slate-700/70' : 'bg-white/95 border border-slate-200';
  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';
  const softText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={shellClass}>
      <header className={`sticky top-0 z-30 backdrop-blur-xl ${isDark ? 'bg-slate-950/80 border-b border-slate-800' : 'bg-white/90 border-b border-slate-200'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {onBack ? (
                <button
                  onClick={onBack}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDark ? 'border-slate-700 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : null}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-300'}`} aria-hidden="true">
                  <img src="/JABA-face.png" alt="JABA face logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-semibold tracking-[0.15em] uppercase ${softText}`}>Generated by JABA AI</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Live data • Campaign-ready
                    </span>
                  </div>
                  <p className={`text-xs ${softText}`}>Generated on {generatedAt}</p>
                </div>
              </div>
            </div>

            <div />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <img src="/q-collar-logo.png" alt="Q-Collar" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide">Q-Collar Athlete Impact Report</h1>
              <p className={`text-sm ${mutedText}`}>Partnership Intelligence • Powered by JABA AI</p>
              <div className="mt-2 h-px w-full max-w-[560px] bg-gradient-to-r from-cyan-500/70 via-blue-400/45 to-transparent" />
              <p className={`mt-2 text-sm ${softText}`}>Real-time Athlete Campaign Intelligence Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 rounded-2xl p-6 ${surfaceClass} relative overflow-hidden`}>
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(120deg, rgba(56,189,248,0.8) 0%, transparent 45%),
                  repeating-linear-gradient(135deg, rgba(255,255,255,0.75) 0 1px, transparent 1px 14px)`,
                backgroundSize: '100% 100%, 280px 280px',
              }}
            />
            <p className={`text-xs uppercase tracking-[0.2em] ${softText}`}>Q-Collar x JABA AI</p>
            <h2 className="text-3xl font-bold mt-2">Unlocking Partnership Intelligence at Scale</h2>
            <p className={`mt-3 ${mutedText}`}>
              A snapshot of athlete-driven impact, partnerships, and campaign performance—organized for scale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                <p className={`text-xs ${softText}`}>Total Athlete Partners</p>
                <p className="text-2xl font-bold mt-1">
                  <CountUpValue start={!loading} target={25} />
                </p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                <p className={`text-xs ${softText}`}>Total Content Analyzed</p>
                <p className="text-2xl font-bold mt-1">
                  <CountUpValue start={!loading} target={1248} formatValue={(v) => numberFormat(v)} />
                </p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                <p className={`text-xs ${softText}`}>Total Engagement</p>
                <p className="text-2xl font-bold mt-1">
                  <CountUpValue
                    start={!loading}
                    target={4.82}
                    formatValue={(v) => `${Number(v).toFixed(2)}M`}
                  />
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 ${surfaceClass}`}>
            <h3 className="text-lg font-semibold">What you can do with JABA</h3>
            <ul className={`mt-4 space-y-3 text-sm ${mutedText}`}>
              <li className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-cyan-500" />Track campaigns with live athlete intelligence</li>
              <li className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-500" />Benchmark talent by impact and fit</li>
              <li className="flex items-center gap-2"><WandSparkles className="w-4 h-4 text-cyan-500" />Build partnership reports in one workflow</li>
            </ul>
          </div>
        </section>

        <section className={`rounded-2xl p-3 ${surfaceClass}`}>
          <div role="tablist" aria-label="Q-Collar report tabs" className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={tabButtonClass(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                  const index = TABS.findIndex((t) => t.id === activeTab);
                  const next = e.key === 'ArrowRight' ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length;
                  setActiveTab(TABS[next].id);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.section
            key={`${activeTab}-${loading ? 'loading' : 'ready'}`}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
              </div>
            ) : null}

            {!loading && activeTab === 'overview' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Estimated EMV', value: '$1.94M', note: 'EMV estimate' },
                    { label: 'Avg Engagement / Post', value: '5.9%', note: 'Across active athletes' },
                    { label: 'Posts with Athlete Collabs', value: '73', note: 'Current campaign cycle' },
                    { label: 'Top Performing Sport', value: 'Football', note: 'By engagement volume' },
                  ].map((m) => (
                    <div key={m.label} className={`rounded-xl p-4 ${surfaceClass}`}>
                      <p className={`text-xs ${softText}`}>{m.label}</p>
                      <p className="text-2xl font-bold mt-1">{m.value}</p>
                      <p className={`text-xs mt-1 ${mutedText}`}>{m.note}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    'Athlete-led educational reels are driving strong engagement consistency.',
                    'On-field and training placements are extending premium credibility.',
                    'Creator partnerships with concise CTAs are generating measurable momentum.',
                    'Cross-platform cadence is supporting sustained campaign visibility.',
                  ].map((text) => (
                    <div key={text} className={`rounded-xl p-4 ${surfaceClass}`}>
                      <p className="text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
                <div className={`rounded-2xl p-5 ${surfaceClass} lg:sticky lg:top-24 self-start h-fit`}>
                  <h3 className="text-lg font-semibold">Featured Highlight</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    {featuredImageCandidates.length > 0 ? (
                      <img
                        src={featuredImageCandidates[Math.min(featuredImageIndex, featuredImageCandidates.length - 1)]}
                        alt="Featured post thumbnail"
                        className={`rounded-xl h-56 md:h-64 w-full object-cover md:col-span-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (featuredImageIndex < featuredImageCandidates.length - 1) {
                            setFeaturedImageIndex((index) => index + 1);
                            return;
                          }
                          e.currentTarget.src = '/q-collar-logo.png';
                        }}
                      />
                    ) : (
                      <div className={`rounded-xl h-56 md:h-64 md:col-span-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}>
                        <span className={softText}>Featured Post Thumbnail</span>
                      </div>
                    )}
                    <div className="md:col-span-3 space-y-3">
                      <p className="text-sm"><span className={softText}>Athlete:</span> Sauce Gardner</p>
                      <p className="text-sm"><span className={softText}>Sport:</span> Football</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                          <span className={softText}>Views</span>
                          <p className="font-semibold">79.5K</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                          <span className={softText}>Likes</span>
                          <p className="font-semibold">{numberFormat(featuredPost.likes)}</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                          <span className={softText}>Comments</span>
                          <p className="font-semibold">{numberFormat(featuredPost.comments)}</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                          <span className={softText}>Engagement</span>
                          <p className="font-semibold">{numberFormat(featuredPost.engagement)}</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                          <span className={softText}>Eng/View</span>
                          <p className="font-semibold">{((featuredPost.engagement / 79500) * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                      <p className={`text-sm ${mutedText}`}>“{featuredPost.caption}”</p>
                      <a
                        href="https://www.instagram.com/p/DUlvwvTD5_q/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                      >
                        View post
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {!loading && activeTab === 'athlete-network' ? (
              <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Filter className={`w-4 h-4 ${softText}`} />
                    <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <option value="All">All Sports</option>
                      {[...new Set(athleteSource.map((a) => a.sport))].sort().map((sport) => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                    <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <option>All Schools</option>
                      {[...new Set(athleteSource.map((a) => a.school))].map((school) => (
                        <option key={school}>{school}</option>
                      ))}
                    </select>
                    <select value={followersFilter} onChange={(e) => setFollowersFilter(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <option value="All">Followers</option>
                      <option value="0-100k">0-100K</option>
                      <option value="100k-500k">100K-500K</option>
                      <option value="500k+">500K+</option>
                    </select>
                    <select value={engagementFilter} onChange={(e) => setEngagementFilter(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <option value="All">Engagement</option>
                      <option value="<5">&lt;5%</option>
                      <option value="5-7">5%-7%</option>
                      <option value="7+">7%+</option>
                    </select>
                  </div>
                  <p className={`text-xs uppercase tracking-[0.16em] mb-3 ${softText}`}>Partnership Intelligence Athlete Gallery</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {filteredAthletes.map((athlete) => {
                      const selected = selectedAthlete?.id === athlete.id;
                      return (
                        <button
                          key={athlete.id}
                          onClick={() => setSelectedAthlete(athlete)}
                          className={`text-left rounded-xl border p-3 transition-all ${
                            selected
                              ? 'border-cyan-400/70 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]'
                              : isDark
                                ? 'border-slate-700 bg-slate-900/70 hover:border-slate-500'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          <div>
                            <img
                              src={athlete.headshotUrl}
                              alt={athlete.name}
                              className="h-36 w-full rounded-lg object-contain object-top bg-slate-800 p-1"
                            />
                          </div>
                          <p className="mt-3 font-semibold">{athlete.name}</p>
                          <p className={`text-xs ${softText}`}>{athlete.sport} • {athlete.school}</p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className={`rounded-md px-2 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <span className={softText}>Followers</span>
                              <p className="font-semibold">{numberFormat(athlete.followers)}</p>
                            </div>
                            <div className={`rounded-md px-2 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <span className={softText}>Engagement</span>
                              <p className="font-semibold">{athlete.engagement.toFixed(1)}%</p>
                            </div>
                            <div className={`rounded-md px-2 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <span className={softText}>EMV / post</span>
                              <p className="font-semibold">{currency(athlete.emvPerPost)}</p>
                            </div>
                            <div className={`rounded-md px-2 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <span className={softText}>Marketability</span>
                              <p className="font-semibold">{athlete.marketability}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
            ) : null}

            {!loading && activeTab === 'benchmarks' ? (
              <>
                <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                  <h3 className="text-lg font-semibold">Q-Collar Sponsored vs Unsponsored Content</h3>
                  <p className={`text-xs mt-1 ${softText}`}>Direct benchmark across Q-Collar athlete content in your current source set</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <p className="font-semibold">Sponsored</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div><span className={softText}>Posts</span><p className="font-semibold">{benchmarkModel.qcSponsoredSummary.posts}</p></div>
                        <div><span className={softText}>Avg likes</span><p className="font-semibold">{numberFormat(Math.round(benchmarkModel.qcSponsoredSummary.avgLikes))}</p></div>
                        <div><span className={softText}>Avg comments</span><p className="font-semibold">{numberFormat(Math.round(benchmarkModel.qcSponsoredSummary.avgComments))}</p></div>
                        <div><span className={softText}>Avg engagement</span><p className="font-semibold">{benchmarkModel.qcSponsoredSummary.avgEngagementRate.toFixed(2)}%</p></div>
                        <div className="col-span-2"><span className={softText}>Avg EMV</span><p className="font-semibold">{currency(Math.round(benchmarkModel.qcSponsoredSummary.avgEmv))}</p></div>
                      </div>
                    </div>
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <p className="font-semibold">Unsponsored</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div><span className={softText}>Posts</span><p className="font-semibold">{benchmarkModel.qcUnsponsoredSummary.posts}</p></div>
                        <div><span className={softText}>Avg likes</span><p className="font-semibold">{numberFormat(Math.round(benchmarkModel.qcUnsponsoredSummary.avgLikes))}</p></div>
                        <div><span className={softText}>Avg comments</span><p className="font-semibold">{numberFormat(Math.round(benchmarkModel.qcUnsponsoredSummary.avgComments))}</p></div>
                        <div><span className={softText}>Avg engagement</span><p className="font-semibold">{benchmarkModel.qcUnsponsoredSummary.avgEngagementRate.toFixed(2)}%</p></div>
                        <div className="col-span-2"><span className={softText}>Avg EMV</span><p className="font-semibold">{currency(Math.round(benchmarkModel.qcUnsponsoredSummary.avgEmv))}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                  <h3 className="text-lg font-semibold">Athlete Q-Collar Posts vs Athlete Baseline</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          <th className="text-left p-2">Athlete</th>
                          <th className="text-left p-2">Q-Collar posts</th>
                          <th className="text-left p-2">Engagement lift</th>
                          <th className="text-left p-2">Likes lift</th>
                          <th className="text-left p-2">Comments lift</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkModel.athleteLiftRows.map((row) => (
                          <tr key={row.athlete} className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <td className="p-2 font-semibold">{row.athlete}</td>
                            <td className="p-2">{row.posts}</td>
                            <td className="p-2">{row.engagementLiftPct >= 0 ? '+' : ''}{row.engagementLiftPct.toFixed(1)}%</td>
                            <td className="p-2">{row.likesLiftPct >= 0 ? '+' : ''}{row.likesLiftPct.toFixed(1)}%</td>
                            <td className="p-2">{row.commentsLiftPct >= 0 ? '+' : ''}{row.commentsLiftPct.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                  <h3 className="text-lg font-semibold">Q-Collar vs Other Brands (Sponsored Athlete Posts)</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          <th className="text-left p-2">Brand</th>
                          <th className="text-left p-2">Sponsored posts</th>
                          <th className="text-left p-2">Avg likes</th>
                          <th className="text-left p-2">Avg comments</th>
                          <th className="text-left p-2">Engagement proxy</th>
                          <th className="text-left p-2">Talent used</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                          <td className="p-2 font-semibold">Q-Collar</td>
                          <td className="p-2">{benchmarkModel.qcSponsoredSummary.posts}</td>
                          <td className="p-2">{numberFormat(Math.round(benchmarkModel.qcSponsoredSummary.avgLikes))}</td>
                          <td className="p-2">{numberFormat(Math.round(benchmarkModel.qcSponsoredSummary.avgComments))}</td>
                          <td className="p-2">{benchmarkModel.qcSponsoredSummary.avgEngagementRate.toFixed(2)}%</td>
                          <td className="p-2">-</td>
                        </tr>
                        {benchmarkModel.competitorRows.map((row) => (
                          <tr key={row.brand} className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <td className="p-2 font-semibold">{row.brand}</td>
                            <td className="p-2">{row.sponsoredPosts}</td>
                            <td className="p-2">{numberFormat(Math.round(row.avgLikes))}</td>
                            <td className="p-2">{numberFormat(Math.round(row.avgComments))}</td>
                            <td className="p-2">{row.engagementRate.toFixed(2)}%</td>
                            <td className="p-2">{row.talentCount}</td>
                          </tr>
                        ))}
                        <tr className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                          <td className="p-2 font-semibold">Category average</td>
                          <td className="p-2">-</td>
                          <td className="p-2">{numberFormat(Math.round(benchmarkModel.competitorOverall.avgLikes))}</td>
                          <td className="p-2">{numberFormat(Math.round(benchmarkModel.competitorOverall.avgComments))}</td>
                          <td className="p-2">{benchmarkModel.competitorOverall.avgEngagementRate.toFixed(2)}%</td>
                          <td className="p-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                  <h3 className="text-lg font-semibold">Conference, NCAA, and Sport Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <p className={`text-xs ${softText}`}>NCAA sponsored benchmark</p>
                      <p className="mt-2 text-sm">Avg engagement: <span className="font-semibold">{benchmarkModel.ncaaSponsoredSummary.avgEngagementRate.toFixed(2)}%</span></p>
                      <p className="text-sm">Avg likes: <span className="font-semibold">{numberFormat(Math.round(benchmarkModel.ncaaSponsoredSummary.avgLikes))}</span></p>
                      <p className="text-sm">Avg EMV: <span className="font-semibold">{currency(Math.round(benchmarkModel.ncaaSponsoredSummary.avgEmv))}</span></p>
                    </div>
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <p className={`text-xs ${softText}`}>Conference benchmark (Big Ten sponsored set)</p>
                      <p className="mt-2 text-sm">Avg engagement: <span className="font-semibold">{benchmarkModel.big10SponsoredSummary.avgEngagementRate.toFixed(2)}%</span></p>
                      <p className="text-sm">Avg likes: <span className="font-semibold">{numberFormat(Math.round(benchmarkModel.big10SponsoredSummary.avgLikes))}</span></p>
                      <p className="text-sm">Avg EMV: <span className="font-semibold">{currency(Math.round(benchmarkModel.big10SponsoredSummary.avgEmv))}</span></p>
                    </div>
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <p className={`text-xs ${softText}`}>Sport benchmark ({benchmarkModel.topQCSport})</p>
                      <p className="mt-2 text-sm">Avg engagement: <span className="font-semibold">{benchmarkModel.sportBenchmarkSummary.avgEngagementRate.toFixed(2)}%</span></p>
                      <p className="text-sm">Avg likes: <span className="font-semibold">{numberFormat(Math.round(benchmarkModel.sportBenchmarkSummary.avgLikes))}</span></p>
                      <p className="text-sm">Avg EMV: <span className="font-semibold">{currency(Math.round(benchmarkModel.sportBenchmarkSummary.avgEmv))}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMethodologyOpen((v) => !v)}
                    className={`mt-4 px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'}`}
                  >
                    Benchmark methodology
                  </button>
                  {methodologyOpen ? (
                    <div className={`mt-3 rounded-lg p-3 text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      This benchmark view uses real post-level data from Q-Collar content, athlete baseline histories, competitive sponsored post summaries, and NCAA/conference sponsored datasets. Engagement rates are normalized to percentages and rolled into comparable averages.
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {!loading && activeTab === 'partnerships' ? (
              <div className={`rounded-2xl p-5 ${surfaceClass}`}>
                <h3 className="text-lg font-semibold">Partnership Hub</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <p className="font-semibold mb-2">Pipeline</p>
                    <div className="space-y-2">
                      {MOCK_DATA.partners.map((partner) => (
                        <button
                          key={partner.id}
                          onClick={() => setSelectedPartnerId(partner.id)}
                          className={`w-full text-left rounded-lg px-3 py-2 border ${
                            selectedPartnerId === partner.id
                              ? 'bg-cyan-600 text-white border-cyan-600'
                              : isDark
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white border-slate-300'
                          }`}
                        >
                          <p className="font-semibold">{partner.name}</p>
                          <p className="text-xs opacity-90">{partner.type} • {partner.status}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <p className="font-semibold mb-2">Partner Detail</p>
                    <p className="text-sm font-semibold">{selectedPartner.name}</p>
                    <p className={`text-sm ${mutedText}`}>Contact: {selectedPartner.contact}</p>
                    <p className={`text-sm ${mutedText}`}>{selectedPartner.email}</p>
                    <p className={`text-sm mt-2 ${mutedText}`}>Last touch: {selectedPartner.lastTouch}</p>
                    <p className={`text-sm ${mutedText}`}>Next step: {selectedPartner.nextStep}</p>
                    <div className="mt-3 space-y-2">
                      {selectedPartner.metrics.map((metric) => (
                        <div key={metric.label} className={`rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                          {metric.label}: <span className="font-semibold">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <p className="font-semibold mb-2">Content & Metrics</p>
                    <div className="space-y-2 text-sm">
                      {MOCK_DATA.posts.slice(0, 3).map((post) => (
                        <div key={post.id} className={`rounded-lg p-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                          <p className="font-semibold">{post.caption}</p>
                          <p className={mutedText}>Likes: {numberFormat(post.likes)} • Comments: {numberFormat(post.comments)}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`rounded-lg p-3 mt-3 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                      <p className="text-sm font-semibold">Tasks</p>
                      <ul className={`mt-2 text-sm space-y-1 ${mutedText}`}>
                        <li>Send campaign recap to partner lead</li>
                        <li>Prepare next creator shortlist</li>
                        <li>Schedule benchmark readout</li>
                      </ul>
                    </div>
                    <button className="mt-3 w-full rounded-lg py-2 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">Generate pitch deck</button>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.section>
        </AnimatePresence>
      </main>
      <footer className={`max-w-[1400px] mx-auto px-4 md:px-8 pb-8 text-xs ${softText}`}>
        Generated by JABA AI • Q-Collar Athlete Impact Report • Preview mode
      </footer>
    </div>
  );
}

/*
Verification notes:
- Local mock data is embedded and typed in this file for rapid swap to live data later.
- Tabs, table sorting, filters, chips, side panels, and mock actions are interactive.
*/
