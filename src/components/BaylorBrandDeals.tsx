import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Heart,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Users,
  Tag,
  Handshake,
  ExternalLink,
  Camera,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  Shield,
  Play,
  Filter,
  Calendar,
  Award,
  Eye,
  Bookmark,
  Share2,
  Hash,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// BAYLOR BRAND COLORS
// ═══════════════════════════════════════════════════════════════
const colors = {
  green: '#154734',
  gold: '#FFB81C',
  white: '#ffffff',
  lightBg: '#f8f9fa',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  border: '#e5e7eb',
  cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface SponsorPost {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image: string;
    bio?: string;
    sport: string;
    position?: string;
    year?: string;
    school?: { name: string };
    conference?: { name: string };
  };
  caption: string;
  hashtags?: string[];
  mediaType?: string;
  metrics: {
    likes: number;
    comments: number;
    engagementRate: number;
    shares?: number;
    saves?: number;
    videoViews?: number;
    impressions?: number;
    reach?: number;
    followers?: number;
    totalInteractions?: number;
    accountsEngaged?: number;
    profileLinksTaps?: number;
  };
  permalink: string;
  publishedAt: { $date: string };
  source?: string;
  sponsorPartner: string;
  url: string;
  isSponsored?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationLogo?: boolean;
  hasOrganizationInCaption?: boolean;
}

interface BrandGroup {
  key: string;
  displayName: string;
  handle: string;
  posts: SponsorPost[];
  uniqueAthletes: string[];
  sports: string[];
  sponsoredCount: number;
  dateRange: { min: string; max: string };
  athleteGroups: AthleteGroup[];
}

interface AthleteGroup {
  id: string;
  name: string;
  image: string;
  sport: string;
  position?: string;
  year?: string;
  posts: SponsorPost[];
}

type TabId = 'overview' | 'brand-index' | 'content' | 'athletes' | 'compliance';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function normalizeBrandKey(sp: string): string {
  const trimmed = (sp || '').trim().toLowerCase();
  return trimmed.startsWith('@') ? trimmed : '@' + trimmed;
}

function brandDisplayName(key: string): string {
  const name = key.replace(/^@/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}

function formatSportName(sport: string): string {
  const map: Record<string, string> = {
    'FOOTBALL': 'Football',
    'MENS_BASKETBALL': "Men's Basketball",
    'WOMENS_BASKETBALL': "Women's Basketball",
    'BASEBALL': 'Baseball',
    'SOFTBALL': 'Softball',
    'WOMENS_VOLLEYBALL': "Women's Volleyball",
    'WOMENS_SOCCER': "Women's Soccer",
    'WOMENS_TRACK_AND_FIELD': "Women's Track & Field",
    'MENS_TRACK_AND_FIELD': "Men's Track & Field",
    'WOMENS_GYMNASTICS': "Women's Gymnastics",
    'EQUESTRIAN': 'Equestrian',
    'MENS_TENNIS': "Men's Tennis",
    'WOMENS_GOLF': "Women's Golf",
    'WOMENS_CROSS_COUNTRY': "Women's Cross Country",
    'MENS_CROSS_COUNTRY': "Men's Cross Country",
  };
  return map[sport] || sport.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function metricDisplay(val: number | undefined): string {
  if (val === undefined || val === null || val === 0) return '—';
  return formatNumber(val);
}

function groupPostsByBrand(posts: SponsorPost[]): BrandGroup[] {
  const map = new Map<string, SponsorPost[]>();
  for (const p of posts) {
    const key = normalizeBrandKey(p.sponsorPartner);
    if (!key || key === '@') continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }

  const groups: BrandGroup[] = [];
  for (const [key, brandPosts] of map) {
    const athleteIds = [...new Set(brandPosts.map(p => p.athlete._id))];
    const sports = [...new Set(brandPosts.map(p => p.athlete.sport))];
    const sponsoredCount = brandPosts.filter(p => p.isSponsored).length;
    const dates = brandPosts.map(p => p.publishedAt.$date).sort();

    const athMap = new Map<string, SponsorPost[]>();
    for (const p of brandPosts) {
      if (!athMap.has(p.athlete._id)) athMap.set(p.athlete._id, []);
      athMap.get(p.athlete._id)!.push(p);
    }
    const athleteGroups: AthleteGroup[] = [...athMap.entries()]
      .map(([id, aPosts]) => ({
        id,
        name: aPosts[0].athlete.name,
        image: aPosts[0].athlete.image,
        sport: aPosts[0].athlete.sport,
        position: aPosts[0].athlete.position,
        year: aPosts[0].athlete.year,
        posts: aPosts.sort((a, b) => new Date(b.publishedAt.$date).getTime() - new Date(a.publishedAt.$date).getTime()),
      }))
      .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));

    groups.push({
      key,
      displayName: brandDisplayName(key),
      handle: key,
      posts: brandPosts,
      uniqueAthletes: athleteIds,
      sports,
      sponsoredCount,
      dateRange: { min: dates[0], max: dates[dates.length - 1] },
      athleteGroups,
    });
  }

  return groups.sort((a, b) => b.posts.length - a.posts.length || a.displayName.localeCompare(b.displayName));
}

// ═══════════════════════════════════════════════════════════════
// EXCLUDED SPONSORS (not actual brand deals)
// ═══════════════════════════════════════════════════════════════
const EXCLUDED_SPONSORS = new Set([
  // Baylor team / school pages
  '@baylorbears', '@bufootball', '@baylorwbb', '@baylorsoftball', '@baylorvball',
  '@baylortrack', '@baylorfutbol', '@bayloracrotumb', '@baylor_plus',
  '@busportsministry', '@baylor.nil.store', '@baylorthreads',
  // Other school / team pages
  '@greenwavefb', '@meangreenfb', '@midwaysoftball', '@phillies',
]);

function isExcludedSponsor(sp: string): boolean {
  return EXCLUDED_SPONSORS.has(normalizeBrandKey(sp));
}

// ═══════════════════════════════════════════════════════════════
// BRAND LOGO
// ═══════════════════════════════════════════════════════════════
const brandDomains: Record<string, string> = {
  // Nike family
  '@nike': 'nike.com', '@nikebasketball': 'nike.com', '@nikerunning': 'nike.com',
  '@usnikefootball': 'nike.com', '@nikestrength': 'nike.com',
  '@nikeeyb': 'nike.com', '@nikeeybl': 'nike.com',
  // Adidas family
  '@adidas': 'adidas.com', '@adidasgolf': 'adidas.com', '@adidasbasketball': 'adidas.com',
  // Athletic / footwear
  '@on': 'on-running.com', '@newbalance': 'newbalance.com', '@hoka': 'hoka.com',
  '@gymshark': 'gymshark.com', '@tracksmithrunning': 'tracksmith.com',
  '@nfinityshoes': 'nfinityinc.com', '@nfinity': 'nfinityinc.com',
  '@teamvktry': 'vfrygear.com',
  // Fashion / apparel
  '@coach': 'coach.com', '@hollister': 'hollisterco.com', '@fashionnova': 'fashionnova.com',
  '@lululemon': 'lululemon.com', '@vuoriclothing': 'vuoriclothing.com',
  '@whitefoxboutique': 'whitefoxboutique.com', '@princesspolly': 'princesspolly.com',
  '@savagexfenty': 'savagex.com', '@edikted': 'edikted.com', '@onwardreserve': 'onwardreserve.com',
  '@tlfapparel': 'tlfapparel.com', '@neweracap': 'neweracap.com',
  // Beauty / personal care
  '@armanibeauty': 'armanibeauty.com', '@emporioarmani': 'armani.com',
  '@maccosmetics': 'maccosmetics.com', '@nyxcosmetics': 'nyxcosmetics.com',
  '@fentybeauty': 'fentybeauty.com', '@proactiv': 'proactiv.com',
  '@johnfrieda': 'johnfrieda.com', '@drteals': 'drteals.com',
  '@goodmolecules': 'goodmolecules.com', '@treehut': 'treehut.co',
  // Food / beverage
  '@subway': 'subway.com', '@subwayfreshfit': 'subway.com',
  '@raisingcanes': 'raisingcanes.com', '@mcdonalds': 'mcdonalds.com',
  '@heb': 'heb.com', '@mmschocolate': 'mms.com', '@pockyusa': 'pocky.com',
  '@c4energy': 'c4energy.com', '@musclemilk': 'musclemilk.com',
  '@drinkprime': 'drinkprime.com', '@drinkprimegirls': 'drinkprime.com',
  '@drinkolipop': 'drinkolipop.com', '@nocco.usa': 'nocco.com',
  '@herbalife24': 'herbalife.com', '@sixstarpronutrition': 'sixstarpro.com',
  '@drinkbubblr': 'drinkbubblr.com', '@drinkhalfday': 'drinkhalfday.com',
  '@drinkwtrmln': 'wtrmlnwtr.com', '@simplyprotein': 'simplyprotein.com',
  '@uptimeenergy': 'uptimeenergy.com',
  // Outdoor / sporting goods
  '@yeti': 'yeti.com', '@dicks': 'dickssportinggoods.com',
  '@bassproshops': 'basspro.com', '@callawaynexteu': 'callawaygolf.com',
  '@arcticzone': 'arcticzone.com', '@turtleboxaudio': 'turtlebox.com',
  '@cavenders': 'cavenders.com', '@badbirdie': 'badbirdie.com',
  // Entertainment / tech
  '@lamborghini': 'lamborghini.com', '@disney': 'disney.com', '@sony': 'sony.com',
  '@cisco': 'cisco.com', '@nba2k': '2k.com', '@g2a_com': 'g2a.com',
  '@raid': 'raid.com',
  // Lifestyle / retail
  '@containerstore': 'containerstore.com', '@diamondsdirect': 'diamondsdirect.com',
  '@visitmagnolia': 'magnolia.com', '@pinehurstresort': 'pinehurst.com',
  '@phillips66gas': 'phillips66.com', '@altafiber': 'altafiber.com',
  // Health / wellness
  '@iherb': 'iherb.com', '@fireflyrecovery': 'fireflyrecovery.com',
  '@torquefitnessusa': 'torquefitness.com',
  // Media
  '@cbssports': 'cbssports.com', '@overtime': 'overtime.tv',
  // Other
  '@cvspharmacy': 'cvs.com', '@popslemonade': 'drinkpops.com',
  '@projectrepatusa': 'projectrepat.com', '@bigbrandtire': 'bigbrandtire.com',
};

const localBrandLogos: Record<string, string> = {};

function getBrandLogoUrl(brand: string): string {
  const key = normalizeBrandKey(brand);
  if (localBrandLogos[key]) return localBrandLogos[key];
  const mapped = brandDomains[key];
  if (mapped) return `https://icons.duckduckgo.com/ip3/${mapped}.ico`;
  const handle = key.replace('@', '').replace(/_+$/, '');
  if (handle.includes('.')) return `https://icons.duckduckgo.com/ip3/${handle}.ico`;
  return `https://icons.duckduckgo.com/ip3/${handle}.com.ico`;
}

function BrandLogo({ brand, size = 32 }: { brand: string; size?: number }) {
  const [hasError, setHasError] = useState(false);
  if (hasError || !brand) {
    return (
      <div className="rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}>
        <span className="font-bold text-gray-400" style={{ fontSize: size * 0.3 }}>
          {(brand || '?').replace('@', '').slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <img src={getBrandLogoUrl(brand)} alt={brand}
      className="rounded-full object-contain bg-white border border-gray-100 flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setHasError(true)} />
  );
}

// ═══════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Badge({ children, color = colors.green }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: color + '18', color }}>
      {children}
    </span>
  );
}

function AthleteAvatar({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}>
        <span className="font-bold text-gray-500" style={{ fontSize: size * 0.3 }}>
          {name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
    );
  }
  return (
    <img src={src} alt={name}
      className="rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setErr(true)} />
  );
}

function ExpandCaption({ text, limit = 180 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= limit) return <p className="text-sm text-gray-600 leading-relaxed">{text}</p>;
  return (
    <p className="text-sm text-gray-600 leading-relaxed">
      {expanded ? text : text.slice(0, limit) + '...'}
      <button onClick={() => setExpanded(!expanded)}
        className="ml-1 font-semibold hover:underline" style={{ color: colors.green }}>
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════
// POST TILE
// ═══════════════════════════════════════════════════════════════
function PostTile({ post }: { post: SponsorPost }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow print:shadow-none print:break-inside-avoid">
      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block relative">
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {!imgErr ? (
            <img src={post.url} alt="" className="w-full h-full object-cover" onError={() => setImgErr(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Camera className="w-10 h-10 text-gray-300" /></div>
          )}
          {post.mediaType === 'VIDEO' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </div>
            </div>
          )}
        </div>
      </a>

      <div className="p-3">
        <p className="text-[11px] text-gray-400 mb-1.5">{formatDate(post.publishedAt.$date)}</p>
        <ExpandCaption text={post.caption} />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {metricDisplay(post.metrics.likes)}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {metricDisplay(post.metrics.comments)}</span>
          {(post.metrics.saves ?? 0) > 0 && <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> {metricDisplay(post.metrics.saves)}</span>}
          {(post.metrics.shares ?? 0) > 0 && <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {metricDisplay(post.metrics.shares)}</span>}
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {post.metrics.engagementRate > 0 ? (post.metrics.engagementRate * 100).toFixed(2) + '%' : '—'}
          </span>
        </div>

        {(post.metrics.impressions ?? 0) > 0 && (
          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(post.metrics.impressions!)} impr.</span>
            {(post.metrics.reach ?? 0) > 0 && <span>{formatNumber(post.metrics.reach!)} reach</span>}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {post.isCollaboration && <Badge color="#7c3aed">Collab</Badge>}
          {post.isOrganizationCollaboration && <Badge color="#0369a1">Org Collab</Badge>}
          {post.hasOrganizationLogo && <Badge color={colors.gold}>Org Logo</Badge>}
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {post.hashtags.slice(0, 4).map(h => (
              <span key={h} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                #{h.replace(/^#/, '')}
              </span>
            ))}
            {post.hashtags.length > 4 && <span className="text-[10px] text-gray-400">+{post.hashtags.length - 4}</span>}
          </div>
        )}

        <a href={post.permalink} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.green + '10', color: colors.green }}>
          View Post <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'brand-index', label: 'Brand Index', icon: <Tag className="w-4 h-4" /> },
  { id: 'content', label: 'Content', icon: <Camera className="w-4 h-4" /> },
  { id: 'athletes', label: 'Athletes', icon: <Users className="w-4 h-4" /> },
  { id: 'compliance', label: 'IP Usage', icon: <Shield className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════
// PRINT STYLES
// ═══════════════════════════════════════════════════════════════
const printStyles = `
@media print {
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .no-print { display: none !important; }
  .print-break { page-break-before: always; }
  .sticky { position: relative !important; }
  header { position: relative !important; }
  * { box-shadow: none !important; }
  @page { margin: 0.75in; size: letter; }
}
`;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface BaylorBrandDealsProps {
  onBack?: () => void;
}

export function BaylorBrandDeals({ onBack }: BaylorBrandDealsProps) {
  const [posts, setPosts] = useState<SponsorPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTabRaw] = useState<TabId>('overview');
  const switchTab = (tab: TabId) => {
    setActiveTabRaw(tab);
    window.scrollTo({ top: 0 });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [collabOnly, setCollabOnly] = useState(false);
  const [collapsedBrands, setCollapsedBrands] = useState<Set<string>>(new Set());
  const [brandIndexSort, setBrandIndexSort] = useState<'posts' | 'athletes' | 'name'>('posts');
  const [athleteSort, setAthleteSort] = useState<'posts' | 'likes' | 'brands' | 'name'>('posts');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const brandRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load data
  useEffect(() => {
    fetch('/data/BaylorSponsorContens.json')
      .then(res => res.json())
      .then((data: SponsorPost[]) => {
        const filtered = data.filter(p => {
          const d = p.publishedAt?.$date;
          return d && d >= '2025-01-01' && d < '2026-01-01' && !isExcludedSponsor(p.sponsorPartner);
        });
        setPosts(filtered);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Sport options for filter
  const sportOptions = useMemo(() => {
    const sports = [...new Set(posts.map(p => p.athlete.sport))];
    return sports.sort((a, b) => formatSportName(a).localeCompare(formatSportName(b)));
  }, [posts]);

  // Apply search + toggles + sport filter (for content tab)
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (sportFilter !== 'all') result = result.filter(p => p.athlete.sport === sportFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.athlete.name.toLowerCase().includes(term) ||
        p.sponsorPartner.toLowerCase().includes(term) ||
        p.caption.toLowerCase().includes(term)
      );
    }
    if (collabOnly) result = result.filter(p => p.isCollaboration);
    return result;
  }, [posts, searchTerm, collabOnly, sportFilter]);

  // Brand groups
  const brandGroups = useMemo(() => groupPostsByBrand(filteredPosts), [filteredPosts]);
  const allBrandGroups = useMemo(() => groupPostsByBrand(posts), [posts]);

  // Stats
  const stats = useMemo(() => {
    const totalLikes = posts.reduce((s, p) => s + p.metrics.likes, 0);
    const totalComments = posts.reduce((s, p) => s + p.metrics.comments, 0);
    const totalEMV = totalLikes * 0.20 + totalComments * 2.00;
    const totalImpressions = posts.reduce((s, p) => s + (p.metrics.impressions || 0), 0);
    const totalReach = posts.reduce((s, p) => s + (p.metrics.reach || 0), 0);
    const totalSaves = posts.reduce((s, p) => s + (p.metrics.saves || 0), 0);
    const totalShares = posts.reduce((s, p) => s + (p.metrics.shares || 0), 0);
    const uniqueAthletes = new Set(posts.map(p => p.athlete._id)).size;
    const uniqueBrands = new Set(posts.filter(p => p.sponsorPartner).map(p => normalizeBrandKey(p.sponsorPartner))).size;
    const uniqueSports = new Set(posts.map(p => p.athlete.sport)).size;
    const brandCounts = new Map<string, number>();
    for (const p of posts) {
      const k = normalizeBrandKey(p.sponsorPartner);
      brandCounts.set(k, (brandCounts.get(k) || 0) + 1);
    }
    const top5Brands = [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const athCounts = new Map<string, { name: string; count: number; image: string }>();
    for (const p of posts) {
      const existing = athCounts.get(p.athlete._id);
      if (existing) existing.count++;
      else athCounts.set(p.athlete._id, { name: p.athlete.name, count: 1, image: p.athlete.image });
    }
    const top5Athletes = [...athCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);

    // Top hashtags
    const hashCounts = new Map<string, number>();
    for (const p of posts) {
      if (p.hashtags) {
        for (const h of p.hashtags) {
          const tag = h.toLowerCase().replace(/^#/, '');
          if (tag) hashCounts.set(tag, (hashCounts.get(tag) || 0) + 1);
        }
      }
    }
    const topHashtags = [...hashCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    return { totalPosts: posts.length, totalLikes, totalComments, totalEMV, totalImpressions, totalReach, totalSaves, totalShares, uniqueAthletes, uniqueBrands, uniqueSports, top5Brands, top5Athletes, topHashtags };
  }, [posts]);

  // Athlete index data
  const athleteIndex = useMemo(() => {
    const map = new Map<string, { name: string; sport: string; image: string; posts: number; brands: Set<string>; followers: number; totalLikes: number; totalComments: number }>();
    for (const p of posts) {
      const existing = map.get(p.athlete._id);
      if (existing) {
        existing.posts++;
        existing.brands.add(normalizeBrandKey(p.sponsorPartner));
        existing.totalLikes += p.metrics.likes;
        existing.totalComments += p.metrics.comments;
        if (p.metrics.followers && p.metrics.followers > existing.followers) existing.followers = p.metrics.followers;
      } else {
        map.set(p.athlete._id, {
          name: p.athlete.name,
          sport: p.athlete.sport,
          image: p.athlete.image,
          posts: 1,
          brands: new Set([normalizeBrandKey(p.sponsorPartner)]),
          followers: p.metrics.followers || 0,
          totalLikes: p.metrics.likes,
          totalComments: p.metrics.comments,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.posts - a.posts || a.name.localeCompare(b.name));
  }, [posts]);

  const toggleBrand = (key: string) => {
    setCollapsedBrands(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const scrollToBrand = (key: string) => {
    // Switch to content tab, expand the brand, then scroll
    setActiveTabRaw('content');
    setCollapsedBrands(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    // Slight delay for tab switch and render
    setTimeout(() => {
      brandRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Sorted brand index
  const sortedBrandIndex = useMemo(() => {
    const sorted = [...allBrandGroups];
    if (brandIndexSort === 'athletes') sorted.sort((a, b) => b.uniqueAthletes.length - a.uniqueAthletes.length);
    else if (brandIndexSort === 'name') sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return sorted;
  }, [allBrandGroups, brandIndexSort]);

  // Sorted athlete index (with sport filter)
  const sortedAthleteIndex = useMemo(() => {
    let filtered = athleteIndex;
    if (sportFilter !== 'all') filtered = filtered.filter(a => a.sport === sportFilter);
    const sorted = [...filtered];
    if (athleteSort === 'likes') sorted.sort((a, b) => b.totalLikes - a.totalLikes);
    else if (athleteSort === 'brands') sorted.sort((a, b) => b.brands.size - a.brands.size);
    else if (athleteSort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [athleteIndex, athleteSort, sportFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.green }} />
          <p className="text-gray-500">Loading brand deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightBg }}>
      <style>{printStyles}</style>

      {/* ═══ STICKY HEADER ═══ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" alt="Baylor" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}>
                  <span style={{ color: colors.green }}>BRAND </span>
                  <span style={{ color: colors.gold }}>PARTNERSHIPS 2025</span>
                </h1>
              </div>
            </div>
            <div />
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-current'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                  }`}
                  style={isActive ? { color: colors.green, borderColor: colors.green } : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: OVERVIEW                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Cover Banner */}
            <section className="mb-8">
              <div className="rounded-2xl overflow-hidden relative"
                style={{
                  background: `radial-gradient(ellipse 120% 80% at 50% 20%, #1a5c45 0%, ${colors.green} 50%, #0d2e22 100%)`,
                  boxShadow: '0 8px 32px rgba(13, 46, 34, 0.45), 0 2px 8px rgba(0,0,0,0.12)',
                }}>
                {/* Subtle inner highlight for depth */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.15)',
                  }} />
                {/* Very faint noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                  }} />

                <div className="px-8 py-14 md:py-20 text-center relative z-10">
                  <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" alt="Baylor" className="w-20 h-20 mx-auto mb-6 object-contain drop-shadow-lg" />

                  <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-6 uppercase"
                    style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.14em' }}>
                    Baylor Athletics
                  </h2>

                  <div className="w-10 h-1.5 mx-auto mb-6 rounded-full"
                    style={{ backgroundColor: colors.gold }} />

                  <h3 className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ fontFamily: "'Oswald', sans-serif", color: colors.gold }}>
                    2025 Brand Partnerships Report
                  </h3>

                  <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                    Sponsored social activity tracked across athlete accounts
                  </p>

                  <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-white/40 tracking-wide">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-white/20">|</span>
                    <span>JABA Social Sponsorship Dataset</span>
                  </div>
                </div>
              </div>
            </section>

            {/* KPI Cards */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight"
                style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic', color: colors.green }}>
                Executive Summary
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Summary of all sponsored athlete social activity for Baylor during the 2025 calendar year.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                {[
                  { label: 'Total Posts', value: stats.totalPosts.toString(), icon: <LayoutGrid className="w-6 h-6 text-white" /> },
                  { label: 'Brands', value: stats.uniqueBrands.toString(), icon: <Tag className="w-6 h-6 text-white" /> },
                  { label: 'Athletes', value: stats.uniqueAthletes.toString(), icon: <Users className="w-6 h-6 text-white" /> },
                  { label: 'Sports', value: stats.uniqueSports.toString(), icon: <Award className="w-6 h-6 text-white" /> },
                  { label: 'Est. EMV', value: formatCurrency(stats.totalEMV), icon: <DollarSign className="w-6 h-6 text-white" /> },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-xl p-4 relative overflow-hidden" style={{ backgroundColor: colors.green }}>
                    <div className="absolute top-2 right-2 opacity-15">{kpi.icon}</div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-1">{kpi.label}</p>
                    <p className="text-2xl font-black text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Top 5s + Hashtags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.green }}>
                    <Handshake className="w-4 h-4 inline mr-1.5 -mt-0.5" />Top 5 Brands
                  </h4>
                  <div className="space-y-2">
                    {stats.top5Brands.map(([key, count], i) => (
                      <button key={key} onClick={() => scrollToBrand(key)}
                        className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: i === 0 ? colors.gold : colors.green }}>
                          {i + 1}
                        </span>
                        <BrandLogo brand={key} size={24} />
                        <span className="text-sm font-medium flex-1 truncate">{brandDisplayName(key)}</span>
                        <span className="text-sm font-bold" style={{ color: colors.green }}>{count}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => switchTab('brand-index')}
                    className="mt-3 pt-3 border-t border-gray-100 w-full text-left text-xs font-semibold hover:underline"
                    style={{ color: colors.green }}>
                    View all brands →
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.green }}>
                    <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />Top 5 Athletes
                  </h4>
                  <div className="space-y-2">
                    {stats.top5Athletes.map((ath, i) => (
                      <div key={ath.name} className="flex items-center gap-3 px-2 py-1 -mx-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: i === 0 ? colors.gold : colors.green }}>
                          {i + 1}
                        </span>
                        <AthleteAvatar src={ath.image} name={ath.name} size={24} />
                        <span className="text-sm font-medium flex-1 truncate">{ath.name}</span>
                        <span className="text-sm font-bold" style={{ color: colors.green }}>{ath.count}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => switchTab('athletes')}
                    className="mt-3 pt-3 border-t border-gray-100 w-full text-left text-xs font-semibold hover:underline"
                    style={{ color: colors.green }}>
                    View all athletes →
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.green }}>
                    <Hash className="w-4 h-4 inline mr-1.5 -mt-0.5" />Top Hashtags
                  </h4>
                  <div className="space-y-1.5">
                    {stats.topHashtags.map(([tag, count], i) => (
                      <div key={tag} className="flex items-center gap-2 px-2 py-1 -mx-2">
                        <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                        <span className="text-sm font-medium flex-1 truncate">#{tag}</span>
                        <span className="text-xs font-semibold text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                  {stats.topHashtags.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No hashtag data available</p>
                  )}
                </div>
              </div>

            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: BRAND INDEX                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'brand-index' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight"
              style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic', color: colors.green }}>
              Brand Index
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {allBrandGroups.length} brands across {stats.totalPosts} posts. Click a brand to view its content.
            </p>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: colors.green }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:text-yellow-300"
                        onClick={() => setBrandIndexSort('name')}>
                        Brand {brandIndexSort === 'name' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-yellow-300 text-white"
                        onClick={() => setBrandIndexSort('posts')}>
                        Posts {brandIndexSort === 'posts' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-yellow-300 text-white"
                        onClick={() => setBrandIndexSort('athletes')}>
                        Athletes {brandIndexSort === 'athletes' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Sports</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white hidden lg:table-cell">Date Range</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBrandIndex.map((bg, i) => {
                      const topSports = bg.sports.slice(0, 3).map(formatSportName);
                      const moreSports = bg.sports.length > 3 ? bg.sports.length - 3 : 0;
                      return (
                        <tr key={bg.key}
                          className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                          onClick={() => scrollToBrand(bg.key)}>
                          <td className="px-4 py-3 text-sm text-gray-400 font-medium">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <BrandLogo brand={bg.handle} size={28} />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{bg.displayName}</p>
                                <p className="text-[11px] text-gray-400">{bg.handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: colors.green }}>{bg.posts.length}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{bg.uniqueAthletes.length}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                            {topSports.join(', ')}{moreSports > 0 && <span className="text-gray-400"> +{moreSports}</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                            {formatShortDate(bg.dateRange.min)} – {formatShortDate(bg.dateRange.max)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: CONTENT (Brand Details)                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 no-print">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search brands or athletes..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800" />
                </div>
                <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800"
                  style={{ accentColor: colors.green }}>
                  <option value="all">All Sports</option>
                  {sportOptions.map(s => (
                    <option key={s} value={s}>{formatSportName(s)}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={collabOnly} onChange={(e) => setCollabOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300" style={{ accentColor: colors.green }} />
                  Collaborations only
                </label>
                <div className="text-xs text-gray-400 ml-auto">
                  <Filter className="w-3.5 h-3.5 inline mr-1" />
                  {filteredPosts.length} of {posts.length} posts · {brandGroups.length} brands
                </div>
              </div>
            </div>

            {/* Brand Sections */}
            {brandGroups.map((bg) => {
              const isCollapsed = collapsedBrands.has(bg.key);

              return (
                <div key={bg.key}
                  ref={el => { brandRefs.current[bg.key] = el; }}
                  className="mb-6"
                  style={{ scrollMarginTop: '140px' }}>

                  {/* Brand Header */}
                  <div className="bg-white rounded-t-xl border border-gray-100 overflow-hidden"
                    style={{ borderLeft: `4px solid ${colors.green}` }}>
                    <button
                      onClick={() => toggleBrand(bg.key)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors text-left">
                      <BrandLogo brand={bg.handle} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{bg.displayName}</h3>
                          <span className="text-xs text-gray-400">{bg.handle}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="font-semibold" style={{ color: colors.green }}>{bg.posts.length} posts</span>
                          <span>{bg.uniqueAthletes.length} athletes</span>
                          <span className="hidden sm:inline">
                            {formatShortDate(bg.dateRange.min)} – {formatShortDate(bg.dateRange.max)}
                          </span>
                        </div>
                      </div>
                      {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </button>
                  </div>

                  {/* Brand Content */}
                  {!isCollapsed && (
                    <div className="bg-white border-x border-b border-gray-100 rounded-b-xl px-5 pb-5">
                      {bg.athleteGroups.map((ag) => (
                        <div key={ag.id} className="mt-5 first:mt-3">
                          <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100">
                            <AthleteAvatar src={ag.image} name={ag.name} size={36} />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{ag.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatSportName(ag.sport)}
                                {ag.position ? ` · ${ag.position}` : ''}
                                {ag.year ? ` · ${ag.year.charAt(0) + ag.year.slice(1).toLowerCase()}` : ''}
                              </p>
                            </div>
                            <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full"
                              style={{ backgroundColor: colors.green + '12', color: colors.green }}>
                              {ag.posts.length} {ag.posts.length === 1 ? 'post' : 'posts'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {ag.posts.map(post => (
                              <PostTile key={post._id} post={post} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {brandGroups.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: ATHLETES                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'athletes' && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic', color: colors.green }}>
                  Athlete Index
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {sortedAthleteIndex.length} athletes{sportFilter !== 'all' ? ` in ${formatSportName(sportFilter)}` : ''} with brand partnership posts in 2025.
                </p>
              </div>
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 no-print">
                <option value="all">All Sports</option>
                {sportOptions.map(s => (
                  <option key={s} value={s}>{formatSportName(s)}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: colors.green }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:text-yellow-300"
                        onClick={() => setAthleteSort('name')}>
                        Athlete {athleteSort === 'name' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white hidden sm:table-cell">Sport</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:text-yellow-300"
                        onClick={() => setAthleteSort('posts')}>
                        Posts {athleteSort === 'posts' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white hidden sm:table-cell cursor-pointer hover:text-yellow-300"
                        onClick={() => setAthleteSort('likes')}>
                        Likes {athleteSort === 'likes' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:text-yellow-300"
                        onClick={() => setAthleteSort('brands')}>
                        Brands {athleteSort === 'brands' && '▼'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white hidden lg:table-cell">Top Brands</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAthleteIndex.map((ath, i) => {
                      const topBrands = [...ath.brands].slice(0, 3).map(brandDisplayName);
                      return (
                        <tr key={ath.name + i} className={`border-b border-gray-50 hover:bg-gray-50/30 ${i % 2 === 1 ? 'bg-gray-50/20' : ''}`}>
                          <td className="px-4 py-2.5 text-sm text-gray-400 font-medium">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <AthleteAvatar src={ath.image} name={ath.name} size={28} />
                              <span className="text-sm font-medium">{ath.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{formatSportName(ath.sport)}</td>
                          <td className="px-4 py-2.5 text-sm text-right font-bold" style={{ color: colors.green }}>{ath.posts}</td>
                          <td className="px-4 py-2.5 text-sm text-right text-gray-600 hidden sm:table-cell">{formatNumber(ath.totalLikes)}</td>
                          <td className="px-4 py-2.5 text-sm text-right text-gray-600">{ath.brands.size}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{topBrands.join(', ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: COMPLIANCE                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'compliance' && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic', color: colors.green }}>
                  IP Usage
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete log of all {sportFilter !== 'all' ? `${formatSportName(sportFilter)} ` : ''}{posts.filter(p => sportFilter === 'all' || p.athlete.sport === sportFilter).length} sponsored posts in 2025.
                </p>
              </div>
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 no-print">
                <option value="all">All Sports</option>
                {sportOptions.map(s => (
                  <option key={s} value={s}>{formatSportName(s)}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: colors.green }}>
                      {['#', 'Date', 'Athlete', 'Sport', 'Brand', 'Source', 'Collab', 'Org Collab', 'Org Logo', 'Link'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-white whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts
                      .filter(p => sportFilter === 'all' || p.athlete.sport === sportFilter)
                      .sort((a, b) => new Date(b.publishedAt.$date).getTime() - new Date(a.publishedAt.$date).getTime())
                      .map((p, i) => (
                        <tr key={p._id} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatShortDate(p.publishedAt.$date)}</td>
                          <td className="px-3 py-2 font-medium">{p.athlete.name}</td>
                          <td className="px-3 py-2 text-gray-500">{formatSportName(p.athlete.sport)}</td>
                          <td className="px-3 py-2 font-medium" style={{ color: colors.green }}>{p.sponsorPartner}</td>
                          <td className="px-3 py-2 text-gray-500">{p.source || '—'}</td>
                          <td className="px-3 py-2">{p.isCollaboration ? '✓' : '—'}</td>
                          <td className="px-3 py-2">{p.isOrganizationCollaboration ? '✓' : '—'}</td>
                          <td className="px-3 py-2">{p.hasOrganizationLogo ? '✓' : '—'}</td>
                          <td className="px-3 py-2">
                            <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                              className="hover:underline" style={{ color: colors.green }}>
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-8 mt-8 border-t border-gray-200">
          <p>Generated from JABA social sponsorship dataset</p>
          <p className="mt-1">Baylor University · Big 12 Conference · {new Date().getFullYear()}</p>
        </footer>

      </main>
    </div>
  );
}
