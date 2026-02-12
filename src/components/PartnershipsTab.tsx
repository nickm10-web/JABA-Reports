import { useEffect, useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { DrawerPanel, GlassCard, GlassPill } from './playfly/PlayflyUI';

interface SchoolPartnershipData {
  school: {
    _id: string;
    name: string;
  };
  followers: number;
  overall: {
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    emv: number;
  };
  sponsorPartners: Array<{
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    sponsorPartner: string;
    engagementRate: number;
    emv: number;
    engagementRateLift: number;
  }>;
}

interface BrandPartnershipData {
  totalPosts: number;
  activeBrands: number;
  activeSchools: number;
  totalSchools: number;
  avgPostsPerBrand: number;
  brandStats: Array<{
    brandName: string;
    postCount: number;
    schoolCount: number;
    avgEngagementRate: number;
  }>;
}

interface PartnershipsTabProps {
  schoolsData?: { school: { _id: string; name: string } }[];
  schoolPartnershipData: SchoolPartnershipData[];
  brandData: BrandPartnershipData | null;
  formatNumber: (num: number) => string;
  formatEMV: (emv: number) => string;
}

export function PartnershipsTab({
  schoolsData = [],
  schoolPartnershipData,
  formatNumber,
  formatEMV
}: PartnershipsTabProps) {
  const [partnershipSearchQuery, setPartnershipSearchQuery] = useState('');
  const [engagementFilter, setEngagementFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'emv' | 'posts' | 'engagement' | 'lift'>('emv');
  const [cardsToShow, setCardsToShow] = useState(20);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All Industries');
  const [sectionScope, setSectionScope] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<{
    name: string;
    totalPosts: number;
    totalEMV: number;
    totalLikes: number;
    totalComments: number;
    avgLift: number;
    industry: string;
  } | null>(null);
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [schoolTableView, setSchoolTableView] = useState<'cards' | 'table'>('cards');
  const [selectedSchoolPartner, setSelectedSchoolPartner] = useState<{
    name: string;
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    emv: number;
    engagementRateLift: number;
  } | null>(null);
  const [schoolPartnerDrawerOpen, setSchoolPartnerDrawerOpen] = useState(false);
  const [brandLogoMap, setBrandLogoMap] = useState<Record<string, string>>({});

  const normalizeBrandKey = (value: string) =>
    value.toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');

  const getSchoolAliases = (schoolName: string) => {
    const stop = new Set(['university', 'college', 'state', 'of', 'the', 'at', 'and']);
    const tokens = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t && !stop.has(t));
    const initials = tokens.map(t => t[0]).join('');
    const aliases = new Set<string>([...tokens, initials]);

    const lower = schoolName.toLowerCase();
    if (lower.includes('texas a') || lower.includes('a&m')) {
      aliases.add('tamu');
      aliases.add('aggie');
      aliases.add('aggies');
    }
    if (lower.includes('nebraska')) {
      aliases.add('husker');
      aliases.add('huskers');
    }
    if (lower.includes('louisiana state')) {
      aliases.add('lsu');
      aliases.add('tigers');
    }
    if (lower.includes('michigan state')) {
      aliases.add('msu');
      aliases.add('spartan');
      aliases.add('spartans');
    }
    if (lower.includes('penn state')) {
      aliases.add('psu');
      aliases.add('pennstate');
      aliases.add('nittany');
    }
    if (lower.includes('auburn')) {
      aliases.add('auburn');
      aliases.add('tigers');
    }
    if (lower.includes('baylor')) {
      aliases.add('baylor');
      aliases.add('bears');
    }
    if (lower.includes('virginia tech')) {
      aliases.add('vt');
      aliases.add('hokie');
      aliases.add('hokies');
    }
    if (lower.includes('washington state')) {
      aliases.add('wsu');
      aliases.add('wazzu');
      aliases.add('cougar');
      aliases.add('cougars');
    }
    if (lower.includes('cincinnati')) {
      aliases.add('uc');
      aliases.add('cincy');
      aliases.add('bearcats');
    }
    if (lower.includes('central florida')) {
      aliases.add('ucf');
      aliases.add('knights');
    }
    if (lower.includes('virginia')) {
      aliases.add('uva');
      aliases.add('cavs');
      aliases.add('cavalier');
    }
    if (lower.includes('old dominion')) {
      aliases.add('odu');
      aliases.add('monarch');
      aliases.add('monarchs');
    }
    if (lower.includes('texas at san antonio') || lower.includes('utsa')) {
      aliases.add('utsa');
      aliases.add('roadrunners');
    }

    return [...aliases].filter(a => a.length >= 2);
  };

  const isTeamPagePartner = (partner: string, schoolName: string) => {
    const key = normalizeBrandKey(partner);
    const sportTokens = [
      'football','fb','basketball','mbb','wbb','baseball','softball','soccer','volleyball','vb','vball',
      'tfxc','track','xc','crosscountry','wrest','wrestling','golf','tennis','lacrosse','hockey','swim',
      'swimming','gym','gymnastics','fieldhockey','rowing','crew','athletics'
    ];
    const hasSport = sportTokens.some(t => key.includes(t));
    if (!hasSport) return false;
    const aliases = getSchoolAliases(schoolName);
    return aliases.some(a => key.includes(a));
  };

  const isExcludedBrand = (value: string, schoolName: string) => {
    const key = normalizeBrandKey(value);
    if (key === 'huskerfootball' || key === 'huskervb' || key === 'aggiefootball') return true;
    return isTeamPagePartner(value, schoolName);
  };

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const loadBrandLogos = async () => {
      try {
        const res = await fetch('/data/socialMedia.brands.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const normalize = (value: string) =>
          value.toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');
        const map: Record<string, string> = {};
        data.forEach((item: { name?: string; logo?: string }) => {
          if (!item?.name || !item?.logo) return;
          const key = normalize(item.name);
          if (!map[key]) map[key] = item.logo;
        });
        setBrandLogoMap(map);
      } catch {
        setBrandLogoMap({});
      }
    };
    loadBrandLogos();
  }, []);

  // section scope only

  // Industry categorization function
  const categorizeByIndustry = (brandName: string): string => {
    const name = brandName.toLowerCase();

    // Food & Beverage
    if (name.includes('raising_cane') || name.includes('h-e-b') || name.includes('sheetz') ||
        name.includes('wegmans') || name.includes('gatorade') || name.includes('red_bull') ||
        name.includes('monster') || name.includes('c4') || name.includes('bodyarmor') ||
        name.includes('chipotle') || name.includes('chick-fil-a') || name.includes('buffalo') ||
        name.includes('whataburger') || name.includes('in-n-out') || name.includes('canes') ||
        name.includes('redbull') || name.includes('energy') || name.includes('drink') ||
        name.includes('food') || name.includes('restaurant') || name.includes('burger')) {
      return 'Food & Beverage';
    }

    // Athletic
    if (name.includes('nike') || name.includes('adidas') || name.includes('under_armour') ||
        name.includes('new_balance') || name.includes('puma') || name.includes('jordan') ||
        name.includes('lululemon') || name.includes('athletic') || name.includes('sport')) {
      return 'Athletic';
    }

    // Retail
    if (name.includes('dick') || name.includes('fanatics') || name.includes('amazon') ||
        name.includes('walmart') || name.includes('target') || name.includes('retail')) {
      return 'Retail';
    }

    // Auto/Tech
    if (name.includes('apple') || name.includes('samsung') || name.includes('gopro') ||
        name.includes('bose') || name.includes('beats') || name.includes('sony') ||
        name.includes('xbox') || name.includes('playstation') || name.includes('tech') ||
        name.includes('car') || name.includes('auto')) {
      return 'Auto/Tech';
    }

    // Lifestyle
    if (name.includes('oakley') || name.includes('ray-ban') || name.includes('lifestyle')) {
      return 'Lifestyle';
    }

    // Entertainment
    if (name.includes('ea_sports') || name.includes('2k') || name.includes('panini') ||
        name.includes('topps') || name.includes('spotify') || name.includes('entertainment') ||
        name.includes('gaming') || name.includes('game')) {
      return 'Entertainment';
    }

    // Financial
    if (name.includes('bank') || name.includes('credit') || name.includes('financial') ||
        name.includes('insurance') || name.includes('loan')) {
      return 'Financial';
    }

    return 'Other';
  };


  // Industry colors mapping
  const industryColors: Record<string, string> = {
    'Other': '#6B7280',
    'Athletic': '#14B8A6',
    'Food & Beverage': '#F97316',
    'Auto/Tech': '#3B82F6',
    'Entertainment': '#A855F7',
    'Financial': '#10B981',
    'Retail': '#EC4899',
    'Lifestyle': '#FBBF24'
  };

  // Industry Pill Component
  const IndustryPill = ({ industry }: { industry: string }) => {
    const bgColor = industryColors[industry] || industryColors['Other'];
    return (
      <div
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase text-white"
        style={{ backgroundColor: bgColor }}
      >
        {industry}
      </div>
    );
  };

  // Brand Card Component
  const BrandCard = ({ brand, onSelect }: { brand: {
    name: string;
    totalPosts: number;
    totalEMV: number;
    totalLikes: number;
    totalComments: number;
    avgLift: number;
    industry: string;
  }; onSelect: () => void }) => {
    // Map brand names to their company domains
    const getBrandDomain = (brandName: string): string | null => {
      const cleanName = brandName.replace('@', '').toLowerCase();

      const domainMap: Record<string, string> = {
        // Athletic Brands
        'nike': 'nike.com', 'nikebasketball': 'nike.com', 'nikerunning': 'nike.com',
        'nikesportswear': 'nike.com', 'nikestrength': 'nike.com', 'usnikefootball': 'nike.com',
        'nike_wrestling': 'nike.com', 'nikelacrosse': 'nike.com',
        'adidas': 'adidas.com', 'adidasbasketball': 'adidas.com', 'adidasfballus': 'adidas.com',
        'adidasfootball': 'adidas.com', 'adidasgolf': 'adidas.com', 'adidasrunning': 'adidas.com',
        'adidastennis': 'adidas.com', 'adidasusfootball': 'adidas.com',
        'underarmour': 'underarmour.com', 'underarmour150': 'underarmour.com',
        'newbalance': 'newbalance.com', 'puma': 'puma.com', 'lululemon': 'lululemon.com',
        'vuoriclothing': 'vuori.com', 'vuori': 'vuori.com', 'alo': 'aloyoga.com',

        // Food & Beverage
        'raisingcanes': 'raisingcanes.com', 'gatorade': 'gatorade.com', 'gatoradepoy': 'gatorade.com',
        'redbull': 'redbull.com', 'redbullusa': 'redbull.com', 'pepsi': 'pepsi.com',
        'chipotle': 'chipotle.com', 'crackerbarrel': 'crackerbarrel.com',
        'bodyarmor': 'bodyarmor.com', 'drinkprime': 'drinkprime.com', 'primevideo': 'primevideo.com',
        'subway': 'subway.com', 'starbucks': 'starbucks.com',
        'mcdonalds': 'mcdonalds.com', 'mcdonalds.nebraska': 'mcdonalds.com',
        'mcdonalds_greaterohio': 'mcdonalds.com', 'mcdonaldsinlandnw': 'mcdonalds.com', 'mcdonaldsphillyregion': 'mcdonalds.com',
        'dunkin': 'dunkindonuts.com', 'tacobell': 'tacobell.com', 'wendys': 'wendys.com',
        'pizzahut': 'pizzahut.com', 'dominos': 'dominos.com', 'papajohns': 'papajohns.com',

        // Retail & Apparel
        'heb': 'heb.com', 'target': 'target.com', 'walmart': 'walmart.com',
        'amazon': 'amazon.com', 'coach': 'coach.com', 'coachny': 'coach.com',
        'hollister': 'hollisterco.com', 'hollisterco': 'hollisterco.com',
        'americaneagle': 'ae.com', 'ae': 'ae.com',
        'gap': 'gap.com', 'oldnavy': 'oldnavy.com',
        'forever21': 'forever21.com', 'zara': 'zara.com',
        'nordstrom': 'nordstrom.com', 'macys': 'macys.com',
        'victoriassecret': 'victoriassecret.com', 'bathandbodyworks': 'bathandbodyworks.com',
        'jcrew': 'jcrew.com', 'bananarepublic': 'bananarepublic.com',
        'cvs': 'cvs.com', 'cvspharmacy': 'cvs.com', 'cvshealth': 'cvs.com',

        // Sporting Goods
        'dicks': 'dickssportinggoods.com', 'dickssportinggoods': 'dickssportinggoods.com',
        'dickshouseofsport': 'dickssportinggoods.com',
        'academy': 'academy.com', 'academysports': 'academy.com',
        'footlocker': 'footlocker.com', 'finishline': 'finishline.com',
        'jdsports': 'jdsports.com', 'scheels': 'scheels.com',
        'fanatics': 'fanatics.com', 'lids': 'lids.com',

        // Footwear
        'crocs': 'crocs.com', 'vans': 'vans.com', 'converse': 'converse.com',
        'skechers': 'skechers.com', 'birkenstock': 'birkenstock.com',

        // Insurance & Finance
        'allstate': 'allstate.com', 'statefarm': 'statefarm.com', 'geico': 'geico.com',
        'progressive': 'progressive.com', 'usaa': 'usaa.com',

        // Luxury & Watches
        'audemarspiguet': 'audemarspiguet.com', 'rolex': 'rolex.com',
        'omega': 'omegawatches.com', 'tagheuer': 'tagheuer.com',
        'hublot': 'hublot.com', 'patekphilippe': 'patek.com', 'cartier': 'cartier.com',

        // Tech & Electronics
        'apple': 'apple.com', 'microsoft': 'microsoft.com', 'google': 'google.com',
        'samsung': 'samsung.com', 'samsungmobileusa': 'samsung.com',
        'playstation': 'playstation.com', 'xbox': 'xbox.com',
        'bose': 'bose.com', 'sony': 'sony.com', 'sonycine': 'sony.com',
        'lgusa': 'lg.com',
        'tmobile': 't-mobile.com', 'verizon': 'verizon.com', 'verizonbusiness': 'verizon.com',

        // Automotive
        'ford': 'ford.com', 'chevy': 'chevrolet.com', 'chevrolet': 'chevrolet.com',
        'toyota': 'toyota.com', 'honda': 'honda.com', 'nissan': 'nissan.com',

        // Sports Performance & Outdoor
        'teamvktry': 'vktry.com', 'athleta': 'athleta.com',
        'brooks': 'brooksrunning.com', 'brooksrunning': 'brooksrunning.com',
        'oakleymeta': 'oakley.com', 'oakley': 'oakley.com',
        'yeti': 'yeti.com', 'columbiapfg': 'columbia.com', 'columbia': 'columbia.com',

        // Beverages & Supplements
        'celsiusofficial': 'celsius.com', 'celsiusbrandpartner': 'celsius.com', 'celsius': 'celsius.com',
        'monsterenergy': 'monsterenergy.com', 'monster': 'monsterenergy.com',
        'c4energy': 'c4energy.com', 'alaninutrition': 'alani.nu', 'alani': 'alani.nu',
        'buckedupenergy': 'buckedup.com', 'buckedup': 'buckedup.com',
        'liquidiv': 'liquid-iv.com', 'musclemilk': 'musclemilk.com',
        'optimum': 'optimumnutrition.com', 'optimumnutrition': 'optimumnutrition.com',

        // Other
        '7eleven': '7-eleven.com', '7brewcoffee': '7brew.com',
        'sheetz': 'sheetz.com', 'wawa': 'wawa.com',
        'aflac': 'aflac.com', 'ally': 'ally.com',
        'chickfila': 'chick-fil-a.com',
      };

      // Check manual mapping first
      if (domainMap[cleanName]) {
        return domainMap[cleanName];
      }

      // Try intelligent domain guessing for unmapped brands
      // Remove leading/trailing underscores and dots
      let guessDomain = cleanName.replace(/^[_.]+|[_.]+$/g, '');

      // Skip if it's too short or looks like a personal account
      if (guessDomain.length < 3 || guessDomain.match(/^[a-z]{1,2}$/)) {
        return null;
      }

      // Try the cleaned name + .com
      return `${guessDomain}.com`;
    };

    // Get brand logo URLs with fallbacks
    const getBrandLogoUrls = (brandName: string): string[] => {
      const normalized = normalizeBrandKey(brandName);
      const mappedLogo = brandLogoMap[normalized];
      const domain = getBrandDomain(brandName);
      if (!domain && !mappedLogo) return mappedLogo ? [mappedLogo] : [];

      const fallbacks = domain ? [
        `https://img.logo.dev/${domain}?token=pk_X-rzlmGCT0i6D7TnyHJpfQ`, // Logo.dev (higher quality)
        `https://logo.clearbit.com/${domain}`, // Clearbit fallback
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128` // Google favicon fallback
      ] : [];
      return mappedLogo ? [mappedLogo, ...fallbacks] : fallbacks;
    };

    // Get brand initials
    const getBrandInitials = (brandName: string): string => {
      const clean = brandName.replace('@', '').replace(/_/g, ' ');
      const words = clean.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return clean.substring(0, 2).toUpperCase();
    };

    // Generate consistent color based on brand name
    const getBrandColor = (brandName: string): string => {
      const colors = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-pink-500 to-pink-600',
        'from-green-500 to-green-600',
        'from-orange-500 to-orange-600',
        'from-red-500 to-red-600',
        'from-indigo-500 to-indigo-600',
        'from-teal-500 to-teal-600',
        'from-cyan-500 to-cyan-600',
        'from-emerald-500 to-emerald-600',
      ];
      const hash = brandName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    const logoUrls = getBrandLogoUrls(brand.name);
    const initials = getBrandInitials(brand.name);
    const brandColor = getBrandColor(brand.name);
    const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
    const [showLogo, setShowLogo] = useState(logoUrls.length > 0);

    return (
      <GlassCard className="p-6 hover:border-[#1770C0] transition-all cursor-pointer" onClick={onSelect}>
        {/* Industry Pill, Logo & Brand Name */}
        <div className="mb-4">
          <IndustryPill industry={brand.industry} />
          <div className="flex items-center gap-3 mt-3">
            {/* Brand Logo or Avatar */}
            {showLogo && logoUrls.length > 0 ? (
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-lg border border-gray-200">
                <img
                  src={logoUrls[currentLogoIndex]}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                  onError={() => {
                    // Try next logo URL or fall back to initials
                    if (currentLogoIndex < logoUrls.length - 1) {
                      setCurrentLogoIndex(currentLogoIndex + 1);
                    } else {
                      setShowLogo(false);
                    }
                  }}
                />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${brandColor} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-base">{initials}</span>
              </div>
            )}
            <h4 className="text-lg font-bold text-gray-900 capitalize">
              {brand.name.replace(/_/g, ' ')}
            </h4>
          </div>
        </div>

        {/* Posts & EMV Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#1770C0] font-semibold">
            {formatNumber(brand.totalPosts)} posts
          </div>
          <div className="text-green-600 font-bold font-mono text-sm">
            ${brand.totalEMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Likes & Comments Row */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <span>❤️</span>
            <span className="font-medium">{formatNumber(brand.totalLikes)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <span>💬</span>
            <span className="font-medium">{formatNumber(brand.totalComments)}</span>
          </div>
        </div>

        {/* Avg Lift */}
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${
          brand.avgLift > 0 ? 'text-green-600' : brand.avgLift < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          <span>{brand.avgLift > 0 ? '+' : ''}{brand.avgLift.toFixed(1)}% Lift</span>
          {brand.avgLift > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : brand.avgLift < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : null}
        </div>
      </GlassCard>
    );
  };

  // Network view - show all brands from school partnership data
  if (sectionScope === 'all') {
    // Aggregate all brands across schools
    const allBrands = new Map<string, {
      name: string;
      totalPosts: number;
      schools: Set<string>;
      totalEMV: number;
      avgEngagement: number;
      engagementLift: number[];
      totalLikes: number;
      totalComments: number;
    }>();

    schoolPartnershipData.forEach(school => {
      school.sponsorPartners.forEach(partner => {
        if (isExcludedBrand(partner.sponsorPartner, school.school.name)) return;
        const existing = allBrands.get(partner.sponsorPartner);
        if (existing) {
          existing.totalPosts += partner.totalContents;
          existing.schools.add(school.school.name);
          existing.totalEMV += partner.emv * partner.totalContents;
          existing.avgEngagement += partner.engagementRate;
          existing.engagementLift.push(partner.engagementRateLift);
          existing.totalLikes += partner.avgLikes * partner.totalContents;
          existing.totalComments += partner.avgComments * partner.totalContents;
        } else {
          allBrands.set(partner.sponsorPartner, {
            name: partner.sponsorPartner,
            totalPosts: partner.totalContents,
            schools: new Set([school.school.name]),
            totalEMV: partner.emv * partner.totalContents,
            avgEngagement: partner.engagementRate,
            engagementLift: [partner.engagementRateLift],
            totalLikes: partner.avgLikes * partner.totalContents,
            totalComments: partner.avgComments * partner.totalContents
          });
        }
      });
    });

    // Convert to array and calculate averages
    const brandsArray = Array.from(allBrands.values()).map(brand => ({
      name: brand.name,
      totalPosts: brand.totalPosts,
      schoolCount: brand.schools.size,
      totalEMV: brand.totalEMV,
      avgEngagement: brand.avgEngagement / brand.engagementLift.length,
      avgLift: brand.engagementLift.reduce((sum, lift) => sum + lift, 0) / brand.engagementLift.length,
      avgLikes: brand.totalLikes / brand.totalPosts,
      avgComments: brand.totalComments / brand.totalPosts,
      avgInteractionsPerPost: (brand.totalLikes + brand.totalComments) / brand.totalPosts,
      totalLikes: brand.totalLikes,
      totalComments: brand.totalComments,
      totalEngagement: brand.totalLikes + brand.totalComments,
      industry: categorizeByIndustry(brand.name)
    }));

    // Sort based on selected option
    const sortedBrands = [...brandsArray].sort((a, b) => {
      switch (sortBy) {
        case 'emv':
          return b.totalEMV - a.totalEMV;
        case 'posts':
          return b.totalPosts - a.totalPosts;
        case 'engagement':
          return b.totalEngagement - a.totalEngagement;
        case 'lift':
          return b.avgLift - a.avgLift;
        default:
          return b.totalEMV - a.totalEMV;
      }
    });

    // Filter by search query
    const filteredBrands = partnershipSearchQuery
      ? sortedBrands.filter(brand =>
          brand.name.toLowerCase().includes(partnershipSearchQuery.toLowerCase())
        )
      : sortedBrands;

    // Filter by engagement level
    const engagementFilteredBrands = engagementFilter === 'all'
      ? filteredBrands
      : filteredBrands.filter(brand => {
          if (engagementFilter === 'high') return brand.avgLift > 100;
          if (engagementFilter === 'mid') return brand.avgLift >= 0 && brand.avgLift <= 100;
          if (engagementFilter === 'low') return brand.avgLift < 0;
          return true;
        });

    // Filter by industry
    const industryFilteredBrands = selectedIndustry === 'All Industries'
      ? engagementFilteredBrands
      : engagementFilteredBrands.filter(brand => brand.industry === selectedIndustry);

    // Show cards based on cardsToShow state
    const displayedBrands = industryFilteredBrands.slice(0, cardsToShow);

    // Get unique industries for filter pills
    const availableIndustries = ['All Industries', ...Array.from(new Set(brandsArray.map(b => b.industry))).sort()];

    const filtersPanel = (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-3 block">Filter by Industry</label>
          <div className="flex flex-wrap gap-2">
            {availableIndustries.map(industry => {
              const isSelected = industry === selectedIndustry;
              return (
                <GlassPill
                  key={industry}
                  active={isSelected}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setCardsToShow(20);
                  }}
                >
                  {industry}
                </GlassPill>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Search Brands</label>
            <input
              type="text"
              placeholder="Search brands..."
              value={partnershipSearchQuery}
              onChange={(e) => setPartnershipSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="emv">Total EMV</option>
              <option value="posts">Total Posts</option>
              <option value="engagement">Total Interactions</option>
              <option value="lift">Avg Lift %</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Engagement Level</label>
            <select
              value={engagementFilter}
              onChange={(e) => setEngagementFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Engagement</option>
              <option value="high">High (&gt;100% lift)</option>
              <option value="mid">Mid (0-100% lift)</option>
              <option value="low">Low (&lt;0% lift)</option>
            </select>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl md:text-3xl pf-section-header">
              <span className="pf-header-primary">Brand </span>
              <span className="pf-header-secondary">Partnerships</span>
            </h3>
            <p className="text-gray-600 mt-2">Brands leveraging school IP across your network</p>
          </div>
          <div className="text-sm text-gray-600">
            {brandsArray.length} total brands
          </div>
        </div>

        {/* Section Scope */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="text-sm font-semibold text-gray-700" htmlFor="partnerships-scope">
              Section view:
            </label>
            <select
              id="partnerships-scope"
              value={sectionScope}
              onChange={(e) => setSectionScope(e.target.value)}
              className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none w-full md:max-w-[320px]"
              aria-label="Change school for this section only"
            >
              <option value="all">All Schools ({schoolsData.length})</option>
              {schoolsData.map((school) => (
                <option key={school.school._id} value={school.school.name}>
                  {school.school.name}
                </option>
              ))}
            </select>
            {sectionScope !== 'all' && (
              <>
                <span className="metric-badge">Override active</span>
                <button
                  onClick={() => setSectionScope('all')}
                  className="text-xs font-semibold text-[#1770C0] hover:text-[#3B9FD9]"
                >
                  Reset to All Schools
                </button>
              </>
            )}
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Sponsored Posts</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1770C0]">
              {formatNumber(schoolPartnershipData.reduce((sum, s) =>
                sum + s.sponsorPartners.reduce((pSum, p) => pSum + p.totalContents, 0), 0))}
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Active Brands</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{brandsArray.length}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Active Schools</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{schoolPartnershipData.length}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Total EMV</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
              {formatEMV(brandsArray.reduce((sum, b) => sum + b.totalEMV, 0))}
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        {isMobile ? (
          <GlassCard className="p-4 flex items-center justify-between" data-snapshot-hide="true">
            <div className="text-sm text-gray-600">Showing {displayedBrands.length} of {industryFilteredBrands.length} brands</div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="px-4 py-2 rounded-full bg-[#1770C0] text-white text-sm font-semibold"
            >
              Filters
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 space-y-4" data-snapshot-hide="true">
            {filtersPanel}
            <div className="text-sm text-gray-600">Showing {displayedBrands.length} of {industryFilteredBrands.length} brands</div>
          </GlassCard>
        )}

        {/* Brand Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">Brand Partners</h4>
              <p className="text-sm text-gray-600 mt-1">
                Showing top {cardsToShow} brands sorted by {sortBy === 'emv' ? 'Total EMV' : sortBy === 'posts' ? 'Total Posts' : sortBy === 'engagement' ? 'Total Interactions' : 'Avg Lift'}
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedBrands.map((brand) => (
              <BrandCard
                key={brand.name}
                brand={{
                  name: brand.name,
                  totalPosts: brand.totalPosts,
                  totalEMV: brand.totalEMV,
                  totalLikes: brand.totalLikes,
                  totalComments: brand.totalComments,
                  avgLift: brand.avgLift,
                  industry: brand.industry
                }}
                onSelect={() => {
                  setSelectedBrand({
                    name: brand.name,
                    totalPosts: brand.totalPosts,
                    totalEMV: brand.totalEMV,
                    totalLikes: brand.totalLikes,
                    totalComments: brand.totalComments,
                    avgLift: brand.avgLift,
                    industry: brand.industry
                  });
                  setBrandDrawerOpen(true);
                }}
              />
            ))}
          </div>

          {/* Load More / Pagination */}
          {displayedBrands.length < industryFilteredBrands.length && (
            <div className="flex justify-center pt-4" data-snapshot-hide="true">
              <button
                onClick={() => setCardsToShow(prev => prev + 20)}
                className="px-8 py-3 bg-[#1770C0] hover:bg-[#1770C0]/80 text-white rounded-lg font-semibold transition-all"
              >
                Load More ({industryFilteredBrands.length - displayedBrands.length} remaining)
              </button>
            </div>
          )}

          {/* Reset button if showing more than 20 */}
          {cardsToShow > 20 && (
            <div className="flex justify-center" data-snapshot-hide="true">
              <button
                onClick={() => setCardsToShow(20)}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all"
              >
                Show Less
              </button>
            </div>
          )}

          <DrawerPanel
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title="Filter & Search"
            side="bottom"
          >
            {filtersPanel}
          </DrawerPanel>

          <DrawerPanel
            open={brandDrawerOpen}
            onClose={() => setBrandDrawerOpen(false)}
            title={selectedBrand ? selectedBrand.name.replace(/_/g, ' ') : 'Brand'}
            side={isMobile ? 'bottom' : 'right'}
          >
            {selectedBrand && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-semibold text-gray-900">{selectedBrand.industry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Posts</span>
                  <span className="font-semibold text-gray-900">{formatNumber(selectedBrand.totalPosts)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Likes</span>
                  <span className="font-semibold text-gray-900">{formatNumber(selectedBrand.totalLikes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Comments</span>
                  <span className="font-semibold text-gray-900">{formatNumber(selectedBrand.totalComments)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total EMV</span>
                  <span className="font-semibold text-green-600">{formatEMV(selectedBrand.totalEMV)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Avg Lift</span>
                  <span className={`font-semibold ${selectedBrand.avgLift > 0 ? 'text-green-600' : selectedBrand.avgLift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {selectedBrand.avgLift > 0 ? '+' : ''}{selectedBrand.avgLift.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </DrawerPanel>
        </div>
      </div>
    );
  }

  // Individual school view
  const schoolData = schoolPartnershipData.find(s => s.school.name === sectionScope);

  if (!schoolData) {
    return (
      <div className="space-y-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{sectionScope} - Brand Partnerships</h3>
        <GlassCard className="p-8 text-center">
          <p className="text-gray-600">No partnership data available for this school</p>
        </GlassCard>
      </div>
    );
  }

  // Filter brands
  const filteredPartners = (partnershipSearchQuery
    ? schoolData.sponsorPartners.filter(p =>
        p.sponsorPartner.toLowerCase().includes(partnershipSearchQuery.toLowerCase())
      )
    : schoolData.sponsorPartners
  ).filter(p => !isExcludedBrand(p.sponsorPartner, schoolData.school.name));

  const sortedPartners = [...filteredPartners].sort((a, b) => (b.emv * b.totalContents) - (a.emv * a.totalContents));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl md:text-3xl pf-section-header">
          <span className="pf-header-primary">{sectionScope} </span>
          <span className="pf-header-secondary">Brand Partnerships</span>
        </h3>
        <p className="text-gray-600 mt-2">Brands working with your school's athletes</p>
      </div>

      {/* Section Scope */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="text-sm font-semibold text-gray-700" htmlFor="partnerships-scope-single">
            Section view:
          </label>
          <select
            id="partnerships-scope-single"
            value={sectionScope}
            onChange={(e) => setSectionScope(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none w-full md:max-w-[320px]"
            aria-label="Change school for this section only"
          >
            <option value="all">All Schools ({schoolsData.length})</option>
            {schoolsData.map((school) => (
              <option key={school.school._id} value={school.school.name}>
                {school.school.name}
              </option>
            ))}
          </select>
          {sectionScope !== 'all' && (
            <>
              <span className="metric-badge">Override active</span>
              <button
                onClick={() => setSectionScope('all')}
                className="text-xs font-semibold text-[#1770C0] hover:text-[#3B9FD9]"
              >
                Reset to All Schools
              </button>
            </>
          )}
        </div>
      </div>

      {/* School Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Total Brands</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{schoolData.sponsorPartners.length}</div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Total Posts</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{formatNumber(schoolData.overall.totalContents)}</div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Total EMV</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
            {formatEMV(schoolData.sponsorPartners.reduce((sum, p) => sum + (p.emv * p.totalContents), 0))}
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <GlassCard className="p-6" data-snapshot-hide="true">
        <input
          type="text"
          placeholder="Search brands..."
          value={partnershipSearchQuery}
          onChange={(e) => setPartnershipSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 focus:border-[#3B9FD9] focus:outline-none"
        />
      </GlassCard>

      {/* School Brands Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xl font-bold text-gray-900">Brand Partners</h4>
            <p className="text-sm text-gray-600 mt-1">Showing {sortedPartners.length} brands</p>
          </div>
          <div className="flex gap-2 md:hidden" data-snapshot-hide="true">
            <GlassPill active={schoolTableView === 'cards'} onClick={() => setSchoolTableView('cards')}>Cards</GlassPill>
            <GlassPill active={schoolTableView === 'table'} onClick={() => setSchoolTableView('table')}>Table</GlassPill>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className={`${schoolTableView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
          {sortedPartners.map((partner, index) => {
            const avgInteractionsPerPost = partner.avgLikes + partner.avgComments;
            return (
              <GlassCard
                key={`${partner.sponsorPartner}-${index}`}
                className="p-4"
                onClick={() => {
                  setSelectedSchoolPartner({
                    name: partner.sponsorPartner,
                    totalContents: partner.totalContents,
                    avgLikes: partner.avgLikes,
                    avgComments: partner.avgComments,
                    engagementRate: partner.engagementRate,
                    emv: partner.emv * partner.totalContents,
                    engagementRateLift: partner.engagementRateLift
                  });
                  setSchoolPartnerDrawerOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 capitalize">{partner.sponsorPartner.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-500">#{index + 1}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                  <div>Posts</div>
                  <div className="text-right text-gray-900 font-semibold">{formatNumber(partner.totalContents)}</div>
                  <div>Avg Likes</div>
                  <div className="text-right text-gray-900 font-semibold">{partner.avgLikes.toFixed(1)}</div>
                  <div>Avg Comments</div>
                  <div className="text-right text-gray-900 font-semibold">{partner.avgComments.toFixed(1)}</div>
                  <div>Avg Interactions</div>
                  <div className="text-right text-gray-900 font-semibold">{avgInteractionsPerPost.toFixed(1)}</div>
                  <div>Engagement Rate</div>
                  <div className="text-right text-gray-900 font-semibold">{(partner.engagementRate * 100).toFixed(2)}%</div>
                  <div>EMV</div>
                  <div className="text-right text-green-600 font-semibold">{formatEMV(partner.emv * partner.totalContents)}</div>
                  <div>Engagement Lift</div>
                  <div className={`text-right font-semibold ${partner.engagementRateLift > 0 ? 'text-green-600' : partner.engagementRateLift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {partner.engagementRateLift > 0 ? '+' : ''}{partner.engagementRateLift.toFixed(1)}%
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className={`${schoolTableView === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto`}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Brand</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Posts</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Avg Likes</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Avg Comments</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Avg Interactions Per Post</span>
                    <div className="relative group">
                      <Info className="w-3 h-3 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Likes + Comments
                      </div>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Engagement Rate</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">EMV</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Engagement Lift</th>
              </tr>
            </thead>
            <tbody>
              {sortedPartners.map((partner, index) => {
                const avgInteractionsPerPost = partner.avgLikes + partner.avgComments;
                return (
                  <tr
                    key={partner.sponsorPartner}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSchoolPartner({
                        name: partner.sponsorPartner,
                        totalContents: partner.totalContents,
                        avgLikes: partner.avgLikes,
                        avgComments: partner.avgComments,
                        engagementRate: partner.engagementRate,
                        emv: partner.emv * partner.totalContents,
                        engagementRateLift: partner.engagementRateLift
                      });
                      setSchoolPartnerDrawerOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold capitalize">
                      {partner.sponsorPartner.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 font-mono">
                      {formatNumber(partner.totalContents)}
                    </td>
                    <td className="px-6 py-4 text-right text-[#3B9FD9] font-medium">
                      {partner.avgLikes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-[#3B9FD9] font-medium">
                      {partner.avgComments.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-bold text-base">
                      {avgInteractionsPerPost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 font-medium">
                      {(partner.engagementRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-bold text-base">
                      {formatEMV(partner.emv * partner.totalContents)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        partner.engagementRateLift > 0 ? 'text-green-600' : partner.engagementRateLift < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {partner.engagementRateLift > 0 ? '+' : ''}{partner.engagementRateLift.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <DrawerPanel
        open={schoolPartnerDrawerOpen}
        onClose={() => setSchoolPartnerDrawerOpen(false)}
        title={selectedSchoolPartner ? selectedSchoolPartner.name.replace(/_/g, ' ') : 'Brand Partner'}
        side={isMobile ? 'bottom' : 'right'}
      >
        {selectedSchoolPartner && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Posts</span>
              <span className="font-semibold text-gray-900">{formatNumber(selectedSchoolPartner.totalContents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Avg Likes</span>
              <span className="font-semibold text-gray-900">{selectedSchoolPartner.avgLikes.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Avg Comments</span>
              <span className="font-semibold text-gray-900">{selectedSchoolPartner.avgComments.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Engagement Rate</span>
              <span className="font-semibold text-gray-900">{(selectedSchoolPartner.engagementRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">EMV</span>
              <span className="font-semibold text-green-600">{formatEMV(selectedSchoolPartner.emv)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Engagement Lift</span>
              <span className={`font-semibold ${selectedSchoolPartner.engagementRateLift > 0 ? 'text-green-600' : selectedSchoolPartner.engagementRateLift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {selectedSchoolPartner.engagementRateLift > 0 ? '+' : ''}{selectedSchoolPartner.engagementRateLift.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
