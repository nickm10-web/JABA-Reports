import { useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

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
  selectedSchool: string;
  schoolPartnershipData: SchoolPartnershipData[];
  brandData: BrandPartnershipData | null;
  formatNumber: (num: number) => string;
  formatEMV: (emv: number) => string;
}

export function PartnershipsTab({
  selectedSchool,
  schoolPartnershipData,
  formatNumber,
  formatEMV
}: PartnershipsTabProps) {
  const [partnershipSearchQuery, setPartnershipSearchQuery] = useState('');
  const [engagementFilter, setEngagementFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'emv' | 'posts' | 'engagement' | 'lift'>('emv');
  const [cardsToShow, setCardsToShow] = useState(20);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All Industries');

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
  const BrandCard = ({ brand }: { brand: {
    name: string;
    totalPosts: number;
    totalEMV: number;
    totalLikes: number;
    totalComments: number;
    avgLift: number;
    industry: string;
  }}) => {
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
      const domain = getBrandDomain(brandName);
      if (!domain) return [];

      return [
        `https://img.logo.dev/${domain}?token=pk_X-rzlmGCT0i6D7TnyHJpfQ`, // Logo.dev (higher quality)
        `https://logo.clearbit.com/${domain}`, // Clearbit fallback
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128` // Google favicon fallback
      ];
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
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-[#3B9FD9]/50 transition-all">
        {/* Industry Pill, Logo & Brand Name */}
        <div className="mb-4">
          <IndustryPill industry={brand.industry} />
          <div className="flex items-center gap-3 mt-3">
            {/* Brand Logo or Avatar */}
            {showLogo && logoUrls.length > 0 ? (
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-lg">
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
            <h4 className="text-lg font-bold text-white capitalize">
              {brand.name.replace(/_/g, ' ')}
            </h4>
          </div>
        </div>

        {/* Posts & EMV Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#3B9FD9] font-semibold">
            {formatNumber(brand.totalPosts)} posts
          </div>
          <div className="text-green-400 font-bold font-mono text-sm">
            ${brand.totalEMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Likes & Comments Row */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-1.5 text-white/80">
            <span>❤️</span>
            <span className="font-medium">{formatNumber(brand.totalLikes)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <span>💬</span>
            <span className="font-medium">{formatNumber(brand.totalComments)}</span>
          </div>
        </div>

        {/* Avg Lift */}
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${
          brand.avgLift > 0 ? 'text-green-400' : brand.avgLift < 0 ? 'text-red-400' : 'text-white/60'
        }`}>
          <span>{brand.avgLift > 0 ? '+' : ''}{brand.avgLift.toFixed(1)}% Lift</span>
          {brand.avgLift > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : brand.avgLift < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : null}
        </div>
      </div>
    );
  };

  // Network view - show all brands from school partnership data
  if (selectedSchool === 'all') {
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

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Brand Partnerships</h3>
            <p className="text-white/60 mt-2">Brands leveraging school IP across your network</p>
          </div>
          <div className="text-sm text-white/60">
            {brandsArray.length} total brands
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
            <div className="text-sm text-white/60 mb-2">Sponsored Posts</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#3B9FD9]">
              {formatNumber(schoolPartnershipData.reduce((sum, s) =>
                sum + s.sponsorPartners.reduce((pSum, p) => pSum + p.totalContents, 0), 0))}
            </div>
          </div>
          <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
            <div className="text-sm text-white/60 mb-2">Active Brands</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{brandsArray.length}</div>
          </div>
          <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
            <div className="text-sm text-white/60 mb-2">Active Schools</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{schoolPartnershipData.length}</div>
          </div>
          <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
            <div className="text-sm text-white/60 mb-2">Total EMV</div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-400">
              {formatEMV(brandsArray.reduce((sum, b) => sum + b.totalEMV, 0))}
            </div>
          </div>
        </div>

        {/* Industry Filter Pills */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 md:p-6">
          <label className="text-sm text-white/60 mb-3 block">Filter by Industry</label>
          <div className="flex flex-wrap gap-2">
            {availableIndustries.map(industry => {
              const isSelected = industry === selectedIndustry;
              const bgColor = industry === 'All Industries' ? '#1770C0' : industryColors[industry] || industryColors['Other'];
              return (
                <button
                  key={industry}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setCardsToShow(20); // Reset pagination when filtering
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isSelected
                      ? 'text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  style={isSelected ? { backgroundColor: bgColor } : {}}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-white/60 mb-2 block">Search Brands</label>
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={partnershipSearchQuery}
                  onChange={(e) => setPartnershipSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#3B9FD9] focus:outline-none"
                />
              </div>

              <div className="w-full md:w-auto md:min-w-[200px]">
                <label className="text-sm text-white/60 mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#3B9FD9] focus:outline-none"
                >
                  <option value="emv">Total EMV</option>
                  <option value="posts">Total Posts</option>
                  <option value="engagement">Total Interactions</option>
                  <option value="lift">Avg Lift %</option>
                </select>
              </div>

              <div className="w-full md:w-auto md:min-w-[200px]">
                <label className="text-sm text-white/60 mb-2 block">Engagement Level</label>
                <select
                  value={engagementFilter}
                  onChange={(e) => setEngagementFilter(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#3B9FD9] focus:outline-none"
                >
                  <option value="all">All Engagement</option>
                  <option value="high">High (&gt;100% lift)</option>
                  <option value="mid">Mid (0-100% lift)</option>
                  <option value="low">Low (&lt;0% lift)</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-white/60 text-center md:text-left">
              Showing {displayedBrands.length} of {industryFilteredBrands.length} brands
            </div>
          </div>
        </div>

        {/* Brand Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-white">Brand Partners</h4>
              <p className="text-sm text-white/60 mt-1">
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
              />
            ))}
          </div>

          {/* Load More / Pagination */}
          {displayedBrands.length < industryFilteredBrands.length && (
            <div className="flex justify-center pt-4">
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
            <div className="flex justify-center">
              <button
                onClick={() => setCardsToShow(20)}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Individual school view
  const schoolData = schoolPartnershipData.find(s => s.school.name === selectedSchool);

  if (!schoolData) {
    return (
      <div className="space-y-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white">{selectedSchool} - Brand Partnerships</h3>
        <div className="bg-black/40 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/60">No partnership data available for this school</p>
        </div>
      </div>
    );
  }

  // Filter brands
  const filteredPartners = partnershipSearchQuery
    ? schoolData.sponsorPartners.filter(p =>
        p.sponsorPartner.toLowerCase().includes(partnershipSearchQuery.toLowerCase())
      )
    : schoolData.sponsorPartners;

  const sortedPartners = [...filteredPartners].sort((a, b) => (b.emv * b.totalContents) - (a.emv * a.totalContents));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-white">{selectedSchool} - Brand Partnerships</h3>
        <p className="text-white/60 mt-2">Brands working with your school's athletes</p>
      </div>

      {/* School Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
          <div className="text-sm text-white/60 mb-2">Total Brands</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{schoolData.sponsorPartners.length}</div>
        </div>
        <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
          <div className="text-sm text-white/60 mb-2">Total Posts</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{formatNumber(schoolData.overall.totalContents)}</div>
        </div>
        <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
          <div className="text-sm text-white/60 mb-2">Total EMV</div>
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-400">
            {formatEMV(schoolData.sponsorPartners.reduce((sum, p) => sum + (p.emv * p.totalContents), 0))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <input
          type="text"
          placeholder="Search brands..."
          value={partnershipSearchQuery}
          onChange={(e) => setPartnershipSearchQuery(e.target.value)}
          className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#3B9FD9] focus:outline-none"
        />
      </div>

      {/* School Brands Table */}
      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h4 className="text-xl font-bold text-white">Brand Partners</h4>
          <p className="text-sm text-white/60 mt-1">Showing {sortedPartners.length} brands</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1770C0]/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Brand</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Posts</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Avg Likes</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Avg Comments</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Avg Interactions Per Post</span>
                    <div className="relative group">
                      <Info className="w-3 h-3 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Likes + Comments
                      </div>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Engagement Rate</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">EMV</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Engagement Lift</th>
              </tr>
            </thead>
            <tbody>
              {sortedPartners.map((partner, index) => {
                const avgInteractionsPerPost = partner.avgLikes + partner.avgComments;
                return (
                  <tr
                    key={partner.sponsorPartner}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white/60 font-mono text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold capitalize">
                      {partner.sponsorPartner.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-right text-white/80 font-mono">
                      {formatNumber(partner.totalContents)}
                    </td>
                    <td className="px-6 py-4 text-right text-[#3B9FD9] font-medium">
                      {partner.avgLikes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-[#3B9FD9] font-medium">
                      {partner.avgComments.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-bold text-base">
                      {avgInteractionsPerPost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white/80 font-medium">
                      {(partner.engagementRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-green-400 font-bold text-base">
                      {formatEMV(partner.emv * partner.totalContents)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        partner.engagementRateLift > 0 ? 'text-green-400' : partner.engagementRateLift < 0 ? 'text-red-400' : 'text-white/60'
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
      </div>
    </div>
  );
}
