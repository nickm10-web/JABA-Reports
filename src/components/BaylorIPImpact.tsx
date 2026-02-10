import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Share2,
  DollarSign,
  Heart,
  MessageCircle,
  Percent,
  TrendingUp,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Tag,
  AtSign,
  Info,
  Handshake,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// BAYLOR BRAND COLORS (matching JABA campaign dashboard style)
// ═══════════════════════════════════════════════════════════════
const colors = {
  green: '#154734',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  negative: '#ef4444',
  accent: '#0369a1',
  lightBg: '#f5f5f5',      // Light gray page background
  warmGray: '#78716c',
  cardBg: '#ffffff',
  cardBorder: 'transparent', // No visible borders, use shadows instead
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  headerGold: '#FFB81C',   // Baylor Gold for two-tone headers
};

// Two-tone header component matching JABA style
function SectionHeader({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <h2 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
      <span style={{ color: colors.green }}>{primary}</span>
      <span style={{ color: colors.headerGold }}>{secondary}</span>
    </h2>
  );
}


// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════
interface Partnership {
  brand: string;
  posts: number;
  avgLikes: number;
  avgComments: number;
  emv: number;
  engagementRate: number;
  liftMultiplier: number;
}

interface IPSignalData {
  posts: number;
  likes: number;
  comments: number;
  engagementRate: number;
  delta: number;
  emv?: number;
  baselineEngRate: number;
  baselinePosts: number;
  baselineLikes: number;
  baselineComments: number;
}

// ═══════════════════════════════════════════════════════════════
// BAYLOR IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalFollowers: 2190438,
  totalPosts: 6156,
  totalLikes: 5424014,
  totalComments: 212165,
  engagementRate: 0.0257,

  baseline: {
    posts: 3766,
    engagementRate: 0.0200,
  },

  postsWithIP: 2390,
  ipAdoptionRate: 38.8,
  avgLift: 169.7,
  totalEmv: 129696.78,

  collaboration: {
    posts: 189,
    likes: 5607.29,
    comments: 28.21,
    engagementRate: 0.002573,
    delta: 635.6,
    emv: 114.97,
    baselineEngRate: 0.000350,
    baselinePosts: 5967,
    baselineLikes: 731.40,
    baselineComments: 34.66,
  } as IPSignalData,

  logo: {
    posts: 1816,
    likes: 1416.45,
    comments: 40.84,
    engagementRate: 0.000665,
    delta: 111.5,
    emv: 32.41,
    baselineEngRate: 0.000314,
    baselinePosts: 4340,
    baselineLikes: 657.08,
    baselineComments: 31.80,
  } as IPSignalData,

  mention: {
    posts: 1409,
    likes: 1787.21,
    comments: 36.34,
    engagementRate: 0.000833,
    delta: 182.3,
    emv: 39.38,
    baselineEngRate: 0.000295,
    baselinePosts: 4747,
    baselineLikes: 612.14,
    baselineComments: 33.91,
  } as IPSignalData,

  partnerships: [
    { brand: "@nikebasketball", posts: 1, avgLikes: 56020, avgComments: 85, emv: 1128.9, engagementRate: 2.5625, liftMultiplier: 60.314 },
    { brand: "@undrdogathletix", posts: 1, avgLikes: 18977, avgComments: 128, emv: 392.34, engagementRate: 0.8726, liftMultiplier: 19.879 },
    { brand: "@armanibeauty", posts: 1, avgLikes: 5933, avgComments: 83, emv: 126.96, engagementRate: 0.2748, liftMultiplier: 5.575 },
    { brand: "@yeti", posts: 1, avgLikes: 4428, avgComments: 41, emv: 92.66, engagementRate: 0.2041, liftMultiplier: 3.884 },
    { brand: "@ellechina", posts: 1, avgLikes: 4430, avgComments: 33, emv: 91.9, engagementRate: 0.2038, liftMultiplier: 3.877 },
    { brand: "@nikerunning", posts: 1, avgLikes: 3471, avgComments: 68, emv: 76.22, engagementRate: 0.1616, liftMultiplier: 2.868 },
    { brand: "@lamborghini", posts: 1, avgLikes: 2684, avgComments: 850, emv: 138.68, engagementRate: 0.1614, liftMultiplier: 2.862 },
    { brand: "@usnikefootball", posts: 1, avgLikes: 3382, avgComments: 22, emv: 69.84, engagementRate: 0.1555, liftMultiplier: 2.720 },
    { brand: "@simp_calvin_22", posts: 1, avgLikes: 2247, avgComments: 16, emv: 46.54, engagementRate: 0.1034, liftMultiplier: 1.473 },
    { brand: "@tracksmithrunning", posts: 1, avgLikes: 2218, avgComments: 15, emv: 45.86, engagementRate: 0.1020, liftMultiplier: 1.440 },
    { brand: "@diamondsdirect", posts: 1, avgLikes: 1909, avgComments: 252, emv: 63.38, engagementRate: 0.0987, liftMultiplier: 1.362 },
    { brand: "@azteclink_nil", posts: 1, avgLikes: 2115, avgComments: 40, emv: 46.3, engagementRate: 0.0984, liftMultiplier: 1.355 },
    { brand: "@raid", posts: 2, avgLikes: 1974.5, avgComments: 57.5, emv: 45.24, engagementRate: 0.0928, liftMultiplier: 1.221 },
    { brand: "@dicks", posts: 1, avgLikes: 1536, avgComments: 24, emv: 33.12, engagementRate: 0.0713, liftMultiplier: 0.705 },
    { brand: "@baylorfutbol", posts: 1, avgLikes: 1402, avgComments: 10, emv: 29.04, engagementRate: 0.0645, liftMultiplier: 0.543 },
    { brand: "@thejngroup", posts: 1, avgLikes: 1343, avgComments: 61, emv: 32.96, engagementRate: 0.0641, liftMultiplier: 0.534 },
    { brand: "@bufootball", posts: 1, avgLikes: 1296, avgComments: 102, emv: 36.12, engagementRate: 0.0639, liftMultiplier: 0.528 },
    { brand: "@containerstore", posts: 1, avgLikes: 1091, avgComments: 87, emv: 30.52, engagementRate: 0.0538, liftMultiplier: 0.287 },
    { brand: "@thebowerman", posts: 1, avgLikes: 1004, avgComments: 11, emv: 21.18, engagementRate: 0.0464, liftMultiplier: 0.109 },
    { brand: "@kinatraxinc", posts: 1, avgLikes: 999, avgComments: 4, emv: 20.38, engagementRate: 0.0458, liftMultiplier: 0.096 },
    { brand: "@topguntglc", posts: 1, avgLikes: 956, avgComments: 6, emv: 19.72, engagementRate: 0.0439, liftMultiplier: 0.051 },
    { brand: "@heatonfeetfootwear", posts: 1, avgLikes: 891, avgComments: 45, emv: 22.32, engagementRate: 0.0428, liftMultiplier: 0.023 },
    { brand: "@jesuswonapparel", posts: 1, avgLikes: 909, avgComments: 7, emv: 18.88, engagementRate: 0.0418, liftMultiplier: 0.001 },
    { brand: "@phillips66gas", posts: 1, avgLikes: 875, avgComments: 18, emv: 19.3, engagementRate: 0.0408, liftMultiplier: -0.024 },
    { brand: "@seekjesusco", posts: 1, avgLikes: 829, avgComments: 48, emv: 21.38, engagementRate: 0.0401, liftMultiplier: -0.042 },
    { brand: "@jaeger", posts: 1, avgLikes: 832, avgComments: 34, emv: 20.04, engagementRate: 0.0396, liftMultiplier: -0.054 },
    { brand: "@raisingcanes", posts: 2, avgLikes: 837.5, avgComments: 16, emv: 18.35, engagementRate: 0.0390, liftMultiplier: -0.067 },
    { brand: "@midwaysoftball", posts: 1, avgLikes: 720, avgComments: 69, emv: 21.3, engagementRate: 0.0360, liftMultiplier: -0.138 },
    { brand: "@nike", posts: 5, avgLikes: 730.2, avgComments: 29.6, emv: 17.56, engagementRate: 0.0347, liftMultiplier: -0.170 },
    { brand: "@cbssports", posts: 1, avgLikes: 735, avgComments: 14, emv: 16.1, engagementRate: 0.0342, liftMultiplier: -0.181 },
    { brand: "@jimmiswimwear", posts: 1, avgLikes: 693, avgComments: 53, emv: 19.16, engagementRate: 0.0341, liftMultiplier: -0.185 },
    { brand: "@turtleboxaudio", posts: 3, avgLikes: 731.67, avgComments: 10, emv: 15.63, engagementRate: 0.0339, liftMultiplier: -0.189 },
    { brand: "@on", posts: 4, avgLikes: 716.25, avgComments: 22.75, emv: 16.6, engagementRate: 0.0338, liftMultiplier: -0.192 },
    { brand: "@popslemonade", posts: 2, avgLikes: 689.5, avgComments: 22, emv: 15.99, engagementRate: 0.0325, liftMultiplier: -0.222 },
    { brand: "@solarsoccerclub", posts: 1, avgLikes: 592, avgComments: 85, emv: 20.34, engagementRate: 0.0309, liftMultiplier: -0.260 },
    { brand: "@uwalkknox", posts: 1, avgLikes: 619, avgComments: 9, emv: 13.28, engagementRate: 0.0287, liftMultiplier: -0.314 },
    { brand: "@readygolftx", posts: 1, avgLikes: 560, avgComments: 42, emv: 15.4, engagementRate: 0.0275, liftMultiplier: -0.342 },
    { brand: "@adidas", posts: 1, avgLikes: 566, avgComments: 14, emv: 12.72, engagementRate: 0.0265, liftMultiplier: -0.366 },
    { brand: "@baylorbears", posts: 1, avgLikes: 570, avgComments: 0, emv: 11.4, engagementRate: 0.0260, liftMultiplier: -0.377 },
    { brand: "@neweracap", posts: 1, avgLikes: 561, avgComments: 2, emv: 11.42, engagementRate: 0.0257, liftMultiplier: -0.385 },
    { brand: "@cadddden", posts: 1, avgLikes: 532, avgComments: 6, emv: 11.24, engagementRate: 0.0246, liftMultiplier: -0.412 },
    { brand: "@nba2k", posts: 1, avgLikes: 486, avgComments: 22, emv: 11.92, engagementRate: 0.0232, liftMultiplier: -0.445 },
    { brand: "@corinthianinsurance", posts: 1, avgLikes: 496, avgComments: 0, emv: 9.92, engagementRate: 0.0227, liftMultiplier: -0.458 },
    { brand: "@timberhillllc", posts: 1, avgLikes: 468, avgComments: 23, emv: 11.66, engagementRate: 0.0224, liftMultiplier: -0.463 },
    { brand: "@gqdough", posts: 1, avgLikes: 468, avgComments: 22, emv: 11.56, engagementRate: 0.0224, liftMultiplier: -0.465 },
    { brand: "@realgodsstories", posts: 2, avgLikes: 451.5, avgComments: 35.5, emv: 12.58, engagementRate: 0.0222, liftMultiplier: -0.468 },
    { brand: "@subwayfreshfit", posts: 1, avgLikes: 468, avgComments: 4, emv: 9.76, engagementRate: 0.0216, liftMultiplier: -0.484 },
    { brand: "@musclemilk", posts: 1, avgLikes: 414, avgComments: 46, emv: 12.88, engagementRate: 0.0210, liftMultiplier: -0.497 },
    { brand: "@tlfapparel", posts: 2, avgLikes: 370.5, avgComments: 45, emv: 11.91, engagementRate: 0.0190, liftMultiplier: -0.546 },
    { brand: "@pinehurstresort", posts: 1, avgLikes: 380, avgComments: 33, emv: 10.9, engagementRate: 0.0189, liftMultiplier: -0.549 },
    { brand: "@einsteinenergylab", posts: 1, avgLikes: 397, avgComments: 1, emv: 8.04, engagementRate: 0.0182, liftMultiplier: -0.565 },
    { brand: "@yahoo.supply", posts: 1, avgLikes: 386, avgComments: 3, emv: 8.02, engagementRate: 0.0178, liftMultiplier: -0.575 },
    { brand: "@adidasgolf", posts: 1, avgLikes: 349, avgComments: 40, emv: 10.98, engagementRate: 0.0178, liftMultiplier: -0.575 },
    { brand: "@disney", posts: 1, avgLikes: 327, avgComments: 53, emv: 11.84, engagementRate: 0.0174, liftMultiplier: -0.585 },
    { brand: "@coach", posts: 3, avgLikes: 346, avgComments: 16.67, emv: 8.59, engagementRate: 0.0166, liftMultiplier: -0.604 },
    { brand: "@bigbrandtire", posts: 3, avgLikes: 342.33, avgComments: 5, emv: 7.35, engagementRate: 0.0159, liftMultiplier: -0.620 },
    { brand: "@mvpwhitetails", posts: 1, avgLikes: 331, avgComments: 8, emv: 7.42, engagementRate: 0.0155, liftMultiplier: -0.630 },
    { brand: "@epicfastpitcho", posts: 1, avgLikes: 310, avgComments: 23, emv: 8.5, engagementRate: 0.0152, liftMultiplier: -0.636 },
    { brand: "@torquefitnessusa", posts: 1, avgLikes: 315, avgComments: 5, emv: 6.8, engagementRate: 0.0146, liftMultiplier: -0.650 },
    { brand: "@golftorrequebrada", posts: 1, avgLikes: 292, avgComments: 23, emv: 8.14, engagementRate: 0.0144, liftMultiplier: -0.656 },
    { brand: "@cvspharmacy", posts: 1, avgLikes: 290, avgComments: 22, emv: 8, engagementRate: 0.0143, liftMultiplier: -0.659 },
    { brand: "@whitefoxboutique", posts: 1, avgLikes: 255, avgComments: 39, emv: 9, engagementRate: 0.0134, liftMultiplier: -0.679 },
    { brand: "@visitmagnolia", posts: 1, avgLikes: 267, avgComments: 5, emv: 5.84, engagementRate: 0.0124, liftMultiplier: -0.703 },
    { brand: "@tazwillco", posts: 1, avgLikes: 264, avgComments: 5, emv: 5.78, engagementRate: 0.0123, liftMultiplier: -0.706 },
    { brand: "@nolimitationstexas", posts: 1, avgLikes: 255, avgComments: 12, emv: 6.3, engagementRate: 0.0122, liftMultiplier: -0.708 },
    { brand: "@callawaynexteu", posts: 1, avgLikes: 249, avgComments: 16, emv: 6.58, engagementRate: 0.0121, liftMultiplier: -0.710 },
    { brand: "@apexgymnasticsok", posts: 1, avgLikes: 263, avgComments: 1, emv: 5.36, engagementRate: 0.0121, liftMultiplier: -0.711 },
    { brand: "@madseasonllc", posts: 1, avgLikes: 229, avgComments: 23, emv: 6.88, engagementRate: 0.0115, liftMultiplier: -0.725 },
    { brand: "@c4energy", posts: 1, avgLikes: 233, avgComments: 13, emv: 5.96, engagementRate: 0.0112, liftMultiplier: -0.731 },
    { brand: "@show_me_sportz", posts: 1, avgLikes: 216, avgComments: 6, emv: 4.92, engagementRate: 0.0101, liftMultiplier: -0.757 },
    { brand: "@baylorvball", posts: 1, avgLikes: 202, avgComments: 19, emv: 5.94, engagementRate: 0.0101, liftMultiplier: -0.758 },
    { brand: "@drinkolipop", posts: 15, avgLikes: 196.53, avgComments: 17.93, emv: 5.72, engagementRate: 0.0098, liftMultiplier: -0.766 },
    { brand: "@casadobrasilwaco", posts: 1, avgLikes: 195, avgComments: 6, emv: 4.5, engagementRate: 0.0092, liftMultiplier: -0.780 },
    { brand: "@balicustomizedtours", posts: 1, avgLikes: 188, avgComments: 10, emv: 4.76, engagementRate: 0.0090, liftMultiplier: -0.784 },
    { brand: "@kt.worldwide_", posts: 1, avgLikes: 190, avgComments: 7, emv: 4.5, engagementRate: 0.0090, liftMultiplier: -0.785 },
    { brand: "@gameplanskincare", posts: 1, avgLikes: 172, avgComments: 9, emv: 4.34, engagementRate: 0.0083, liftMultiplier: -0.802 },
    { brand: "@leonessachocolatier", posts: 3, avgLikes: 169.67, avgComments: 4.33, emv: 3.83, engagementRate: 0.0079, liftMultiplier: -0.810 },
    { brand: "@thehomeofgolf", posts: 1, avgLikes: 168, avgComments: 3, emv: 3.66, engagementRate: 0.0078, liftMultiplier: -0.813 },
    { brand: "@baylorwbb", posts: 1, avgLikes: 160, avgComments: 6, emv: 3.8, engagementRate: 0.0076, liftMultiplier: -0.819 },
    { brand: "@subway", posts: 2, avgLikes: 147.5, avgComments: 16, emv: 4.55, engagementRate: 0.0075, liftMultiplier: -0.821 },
    { brand: "@treehut", posts: 1, avgLikes: 153, avgComments: 3, emv: 3.36, engagementRate: 0.0071, liftMultiplier: -0.830 },
    { brand: "@hollister", posts: 3, avgLikes: 136.33, avgComments: 17.67, emv: 4.49, engagementRate: 0.0070, liftMultiplier: -0.832 },
    { brand: "@shopsidelinebags", posts: 1, avgLikes: 148, avgComments: 5, emv: 3.46, engagementRate: 0.0070, liftMultiplier: -0.833 },
    { brand: "@busportsministry", posts: 2, avgLikes: 127.5, avgComments: 25, emv: 5.05, engagementRate: 0.0070, liftMultiplier: -0.833 },
    { brand: "@derbylanellc", posts: 1, avgLikes: 135, avgComments: 9, emv: 3.6, engagementRate: 0.0066, liftMultiplier: -0.843 },
    { brand: "@casadobrasil", posts: 2, avgLikes: 135.5, avgComments: 3.5, emv: 3.06, engagementRate: 0.0063, liftMultiplier: -0.848 },
    { brand: "@postgame.official", posts: 2, avgLikes: 116, avgComments: 19.5, emv: 4.27, engagementRate: 0.0062, liftMultiplier: -0.852 },
    { brand: "@winreality", posts: 1, avgLikes: 117, avgComments: 2, emv: 2.54, engagementRate: 0.0054, liftMultiplier: -0.870 },
    { brand: "@litt_strength", posts: 1, avgLikes: 113, avgComments: 6, emv: 2.86, engagementRate: 0.0054, liftMultiplier: -0.870 },
    { brand: "@goodmolecules", posts: 1, avgLikes: 116, avgComments: 1, emv: 2.42, engagementRate: 0.0053, liftMultiplier: -0.872 },
    { brand: "@athlete_asset_protection", posts: 1, avgLikes: 106, avgComments: 10, emv: 3.12, engagementRate: 0.0053, liftMultiplier: -0.873 },
    { brand: "@atgequestrianllc", posts: 1, avgLikes: 93, avgComments: 15, emv: 3.36, engagementRate: 0.0049, liftMultiplier: -0.882 },
    { brand: "@newbalance", posts: 1, avgLikes: 103, avgComments: 2, emv: 2.26, engagementRate: 0.0048, liftMultiplier: -0.885 },
    { brand: "@drinkprimegirls", posts: 1, avgLikes: 98, avgComments: 4, emv: 2.36, engagementRate: 0.0047, liftMultiplier: -0.889 },
    { brand: "@athletesthread", posts: 6, avgLikes: 94, avgComments: 7.5, emv: 2.63, engagementRate: 0.0046, liftMultiplier: -0.889 },
    { brand: "@erikcaddeoperformancehorses", posts: 1, avgLikes: 90, avgComments: 11, emv: 2.9, engagementRate: 0.0046, liftMultiplier: -0.890 },
    { brand: "@drinkprime", posts: 3, avgLikes: 94.67, avgComments: 3.33, emv: 2.23, engagementRate: 0.0045, liftMultiplier: -0.893 },
    { brand: "@baylorthreads", posts: 60, avgLikes: 90.25, avgComments: 2.63, emv: 2.07, engagementRate: 0.0042, liftMultiplier: -0.898 },
    { brand: "@houstonskyline", posts: 1, avgLikes: 0, avgComments: 88, emv: 8.8, engagementRate: 0.0040, liftMultiplier: -0.904 },
    { brand: "@cavenders", posts: 3, avgLikes: 61.33, avgComments: 25.67, emv: 3.79, engagementRate: 0.0040, liftMultiplier: -0.905 },
    { brand: "@meangreenfb", posts: 1, avgLikes: 0, avgComments: 82, emv: 8.2, engagementRate: 0.0037, liftMultiplier: -0.910 },
    { brand: "@teamvktry", posts: 2, avgLikes: 66, avgComments: 10.5, emv: 2.37, engagementRate: 0.0035, liftMultiplier: -0.916 },
    { brand: "@pockyusa", posts: 2, avgLikes: 71.5, avgComments: 3, emv: 1.73, engagementRate: 0.0034, liftMultiplier: -0.919 },
    { brand: "@fashionnova", posts: 2, avgLikes: 0, avgComments: 35, emv: 3.5, engagementRate: 0.0016, liftMultiplier: -0.962 },
    { brand: "@maccosmetics", posts: 1, avgLikes: 0, avgComments: 14, emv: 1.4, engagementRate: 0.0006, liftMultiplier: -0.985 },
    { brand: "@onwardreserve", posts: 1, avgLikes: 0, avgComments: 11, emv: 1.1, engagementRate: 0.0005, liftMultiplier: -0.988 },
    { brand: "@lululemon", posts: 1, avgLikes: 0, avgComments: 18, emv: 1.8, engagementRate: 0.0008, liftMultiplier: -0.980 },
    { brand: "@princesspolly", posts: 1, avgLikes: 3, avgComments: 54, emv: 5.46, engagementRate: 0.0026, liftMultiplier: -0.938 },
  ] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}

function formatPercent(num: number, decimals = 2): string {
  return (num * 100).toFixed(decimals) + '%';
}

function formatDelta(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(1) + '%';
}

function formatLift(num: number): string {
  if (num >= 0) return '+' + num.toFixed(1) + 'x';
  return num.toFixed(1) + 'x';
}

// Calculate EMV formula: (likes × $0.20) + (comments × $2.00)
function calculateEMV(likes: number, comments: number): number {
  return (likes * 0.20) + (comments * 2.00);
}

// ═══════════════════════════════════════════════════════════════
// BRAND LOGO UTILITIES
// ═══════════════════════════════════════════════════════════════

const brandDomains: Record<string, string> = {
  '@nike': 'nike.com',
  '@nikebasketball': 'nike.com',
  '@nikerunning': 'nike.com',
  '@usnikefootball': 'nike.com',
  '@lamborghini': 'lamborghini.com',
  '@yeti': 'yeti.com',
  '@armanibeauty': 'armani.com',
  '@adidas': 'adidas.com',
  '@adidasgolf': 'adidas.com',
  '@coach': 'coach.com',
  '@disney': 'disney.com',
  '@lululemon': 'lululemon.com',
  '@subway': 'subway.com',
  '@maccosmetics': 'maccosmetics.com',
  '@newbalance': 'newbalance.com',
  '@hollister': 'hollister.com',
  '@raisingcanes': 'raisingcanes.com',
  '@containerstore': 'containerstore.com',
  '@cvspharmacy': 'cvs.com',
  '@drinkolipop': 'drinkolipop.com',
  '@cbssports': 'cbssports.com',
  '@c4energy': 'c4energy.com',
  '@fashionnova': 'fashionnova.com',
  '@neweracap': 'neweracap.com',
  '@goodmolecules': 'goodmolecules.com',
  '@nba2k': 'nba2k.com',
  '@musclemilk': 'musclemilk.com',
  '@whitefoxboutique': 'whitefoxboutique.com.au',
  '@onwardreserve': 'onwardreserve.com',
  '@treehut': 'treehut.co',
  '@princesspolly': 'princesspolly.com',
  '@ellechina': 'elle.com',
};

function getBrandLogoUrl(brand: string): string {
  const mapped = brandDomains[brand];
  if (mapped) return `https://icons.duckduckgo.com/ip3/${mapped}.ico`;
  const handle = brand.replace('@', '').replace(/_+$/, '');
  if (handle.includes('.')) return `https://icons.duckduckgo.com/ip3/${handle}.ico`;
  return `https://icons.duckduckgo.com/ip3/${handle}.com.ico`;
}

function BrandLogo({ brand, size = 'sm' }: { brand: string; size?: 'sm' | 'md' }) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getBrandLogoUrl(brand);
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  if (hasError) {
    return (
      <div className={`${dim} rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
        <span className="text-xs font-bold text-gray-400">
          {brand.replace('@', '').slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={brand}
      className={`${dim} rounded-full object-contain bg-white border border-gray-100 flex-shrink-0`}
      onError={() => setHasError(true)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// TOOLTIP COMPONENT
// ═══════════════════════════════════════════════════════════════
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
        <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl max-w-sm text-center">
          {content}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI CARD COMPONENT (matching existing dashboard style)
// ═══════════════════════════════════════════════════════════════
function KPICard({
  label,
  value,
  subLabel,
  icon,
  tooltip,
}: {
  label: string;
  value: string;
  subLabel?: string;
  icon: React.ReactNode;
  tooltip: string;
}) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[120px]"
      style={{ backgroundColor: colors.green }}
    >
      {icon && (
        <div className="absolute top-3 right-3 opacity-20">
          {icon}
        </div>
      )}
      <div className="flex items-center justify-center gap-1 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{label}</p>
        <Tooltip content={tooltip}>
          <Info className="w-3 h-3 text-white/60 cursor-help" />
        </Tooltip>
      </div>
      <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
      {subLabel && (
        <p className="text-xs text-white/70">{subLabel}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IP MODE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
function IPModeCard({
  title,
  icon,
  posts,
  delta,
  avgEngagement,
  emv,
  tooltip,
}: {
  title: string;
  icon: React.ReactNode;
  posts: number;
  delta: number;
  avgEngagement: string;
  emv: string;
  tooltip: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-4 hover:shadow-lg transition-shadow"
      style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${colors.green}15` }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold uppercase tracking-wide text-gray-900">{title}</h3>
              <Tooltip content={tooltip}>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500">{posts} posts with this signal</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Engagement Delta vs Baseline
          </p>
          <Tooltip content="Percent difference vs baseline engagement rate.">
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <p
          className="text-3xl font-black"
          style={{ color: delta >= 0 ? colors.positive : colors.negative }}
        >
          {formatDelta(delta)}
        </p>
        <p className="text-xs text-gray-500">vs posts without {title.toLowerCase()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1 text-gray-500">Avg Eng</p>
          <p className="font-bold text-gray-900">{avgEngagement}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1 text-gray-500">EMV</p>
          <p className="font-bold text-gray-900">{emv}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════
type TabId = 'overview' | 'withvswithout' | 'partnerships' | 'bestcollaborators' | 'benchmark';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'withvswithout', label: 'With vs Without' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'bestcollaborators', label: 'Best Collaborators' },
  { id: 'benchmark', label: 'Benchmarks' },
];

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
function OverviewTab() {
  return (
    <div className="space-y-4">
      {/* Data Source Context */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          Data reflects <span className="font-semibold">Baylor athlete personal social media accounts</span>, not official team pages.
          Metrics track how athletes use Baylor IP (logos, mentions, collaborations) in their own content.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Total Likes"
          value={formatNumber(ipData.totalLikes)}
          subLabel="across all athletes"
          icon={<Heart className="w-8 h-8 text-white" />}
          tooltip="Sum of all likes on posts from Baylor athletes' personal accounts"
        />
        <KPICard
          label="Total Comments"
          value={formatNumber(ipData.totalComments)}
          subLabel="across all athletes"
          icon={<MessageCircle className="w-8 h-8 text-white" />}
          tooltip="Sum of all comments on posts from Baylor athletes' personal accounts"
        />
        <KPICard
          label="IP Usage"
          value={ipData.ipAdoptionRate + '%'}
          subLabel="adoption rate"
          icon={<Percent className="w-8 h-8 text-white" />}
          tooltip="Percent of athlete posts containing any Baylor IP signal"
        />
        <KPICard
          label="Posts with IP"
          value={formatNumber(ipData.postsWithIP)}
          subLabel={'of ' + formatNumber(ipData.totalPosts) + ' total'}
          icon={<FileText className="w-8 h-8 text-white" />}
          tooltip="Number of athlete posts containing at least one IP signal (logo, mention, or collaboration)"
        />
        <KPICard
          label="Avg Lift"
          value={formatDelta(ipData.avgLift)}
          subLabel="vs without IP"
          icon={<TrendingUp className="w-8 h-8 text-white" />}
          tooltip="Weighted average engagement lift across all IP signals (collab, logo, mention) vs posts without IP"
        />
        <KPICard
          label="Total EMV"
          value={formatCurrency(ipData.totalEmv)}
          subLabel="earned media value"
          icon={<DollarSign className="w-8 h-8 text-white" />}
          tooltip="Estimated earned media value: (likes × $0.20) + (comments × $2.00)"
        />
      </div>

      {/* Performance by IP Mode */}
      <div>
        <div className="mb-4">
          <SectionHeader primary="PERFORMANCE " secondary="BY IP MODE" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <IPModeCard
            title="Collaboration"
            icon={<Users className="w-5 h-5" style={{ color: colors.green }} />}
            posts={ipData.collaboration.posts}
            delta={ipData.collaboration.delta}
            avgEngagement={formatPercent(ipData.collaboration.engagementRate)}
            emv={formatCurrency(ipData.collaboration.emv!)}
            tooltip="Athlete posts co-authored or tagged with official Baylor account"
          />
          <IPModeCard
            title="Visual IP"
            icon={<Tag className="w-5 h-5" style={{ color: colors.green }} />}
            posts={ipData.logo.posts}
            delta={ipData.logo.delta}
            avgEngagement={formatPercent(ipData.logo.engagementRate)}
            emv={formatCurrency(ipData.logo.emv!)}
            tooltip="Athlete posts with Baylor logo detected in media"
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.green }} />}
            posts={ipData.mention.posts}
            delta={ipData.mention.delta}
            avgEngagement={formatPercent(ipData.mention.engagementRate)}
            emv={formatCurrency(ipData.mention.emv!)}
            tooltip="Athlete posts with @mention or text reference to Baylor"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WITH VS WITHOUT TAB
// ═══════════════════════════════════════════════════════════════
function WithVsWithoutTab() {
  const [selectedSignal, setSelectedSignal] = useState<'collab' | 'logo' | 'mention'>('mention');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'likes' | 'comments'>('engagement');

  // Baylor overall data from ip-impact JSON
  const signalData: Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }> = {
    mention: { with: { posts: 1409, avgLikes: 1787, avgComments: 36, engagementRate: 0.000833 }, without: { posts: 4747, avgLikes: 612, avgComments: 34, engagementRate: 0.000295 } },
    logo: { with: { posts: 1816, avgLikes: 1416, avgComments: 41, engagementRate: 0.000665 }, without: { posts: 4340, avgLikes: 657, avgComments: 32, engagementRate: 0.000314 } },
    collab: { with: { posts: 189, avgLikes: 5607, avgComments: 28, engagementRate: 0.002573 }, without: { posts: 5967, avgLikes: 731, avgComments: 35, engagementRate: 0.000350 } },
  };

  const currentSignalData = signalData[selectedSignal];

  const signals = [
    { id: 'collab' as const, label: 'Collab', data: ipData.collaboration },
    { id: 'logo' as const, label: 'Visual IP', data: ipData.logo },
    { id: 'mention' as const, label: 'Mention', data: ipData.mention },
  ];

  const metrics = [
    { id: 'engagement' as const, label: 'Engagement Rate' },
    { id: 'likes' as const, label: 'Avg Likes' },
    { id: 'comments' as const, label: 'Avg Comments' },
  ];

  const currentSignal = signals.find(s => s.id === selectedSignal);

  // Use sport-specific data if available, otherwise fall back to overall data
  const withoutEngRate = currentSignalData?.without?.engagementRate || currentSignal?.data?.baselineEngRate || 0;
  const withEngRate = currentSignalData?.with?.engagementRate || currentSignal?.data?.engagementRate || 0;
  const withoutPosts = currentSignalData?.without?.posts || currentSignal?.data?.baselinePosts || 0;
  const withPosts = currentSignalData?.with?.posts || currentSignal?.data?.posts || 0;

  // Avg likes/comments per post from sport data
  const baselineAvgLikes = currentSignalData?.without?.avgLikes || currentSignal?.data?.baselineLikes || 0;
  const baselineAvgComments = currentSignalData?.without?.avgComments || currentSignal?.data?.baselineComments || 0;
  const withAvgLikes = currentSignalData?.with?.avgLikes || currentSignal?.data?.likes || 0;
  const withAvgComments = currentSignalData?.with?.avgComments || currentSignal?.data?.comments || 0;

  // Calculate deltas
  const engDelta = withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0;
  const likesDelta = baselineAvgLikes > 0 ? ((withAvgLikes - baselineAvgLikes) / baselineAvgLikes) * 100 : 0;
  const commentsDelta = baselineAvgComments > 0 ? ((withAvgComments - baselineAvgComments) / baselineAvgComments) * 100 : 0;

  // Get current metric values based on selection
  const getMetricValues = () => {
    switch (selectedMetric) {
      case 'engagement':
        return {
          withoutValue: formatPercent(withoutEngRate),
          withValue: formatPercent(withEngRate),
          withoutRaw: withoutEngRate,
          withRaw: withEngRate,
          delta: engDelta,
          isPercent: true,
        };
      case 'likes':
        return {
          withoutValue: formatNumber(Math.round(baselineAvgLikes)),
          withValue: formatNumber(Math.round(withAvgLikes)),
          withoutRaw: baselineAvgLikes,
          withRaw: withAvgLikes,
          delta: likesDelta,
          isPercent: false,
        };
      case 'comments':
        return {
          withoutValue: formatNumber(Math.round(baselineAvgComments)),
          withValue: formatNumber(Math.round(withAvgComments)),
          withoutRaw: baselineAvgComments,
          withRaw: withAvgComments,
          delta: commentsDelta,
          isPercent: false,
        };
    }
  };

  const metricValues = getMetricValues();
  const maxValue = Math.max(metricValues.withoutRaw, metricValues.withRaw);

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Signal Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">IP Signal</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {signals.map((signal) => (
              <button
                key={signal.id}
                onClick={() => setSelectedSignal(signal.id)}
                className="px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: selectedSignal === signal.id ? colors.green : colors.white,
                  color: selectedSignal === signal.id ? colors.white : colors.text,
                }}
              >
                {signal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Metric</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className="px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: selectedMetric === metric.id ? colors.green : colors.white,
                  color: selectedMetric === metric.id ? colors.white : colors.text,
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Value Cards */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          {/* Without IP Card (Solo) */}
          <div
            className="rounded-xl p-5 border-2"
            style={{ borderColor: colors.green, backgroundColor: `${colors.green}08` }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.green }}>
              Without {currentSignal?.label}
            </p>
            <p className="text-4xl font-black" style={{ color: colors.green }}>
              {metricValues.withoutValue}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatNumber(withoutPosts)} posts
            </p>
          </div>

          {/* With IP Card */}
          <div className="rounded-xl p-5 border border-gray-300 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
              With {currentSignal?.label}
            </p>
            <p className="text-4xl font-black text-gray-400">
              {metricValues.withValue}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatNumber(withPosts)} posts
            </p>
          </div>
        </div>

        {/* Middle Column - Comparison Bars */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-4 px-4">
          {/* Without Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">WITHOUT {currentSignal?.label.toUpperCase()}</span>
              <span className="text-sm font-bold text-gray-900">{metricValues.withoutValue}</span>
            </div>
            <div className="h-12 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full transition-all duration-500 rounded-lg"
                style={{
                  width: `${maxValue > 0 ? (metricValues.withoutRaw / maxValue) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #d1d5db 0%, #6b7280 100%)'
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{formatNumber(withoutPosts)} posts</span>
          </div>

          {/* With Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.green }}>WITH {currentSignal?.label.toUpperCase()}</span>
              <span className="text-sm font-bold" style={{ color: colors.green }}>{metricValues.withValue}</span>
            </div>
            <div className="h-12 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full transition-all duration-500 rounded-lg"
                style={{
                  width: `${maxValue > 0 ? (metricValues.withRaw / maxValue) * 100 : 0}%`,
                  background: `linear-gradient(90deg, #ef4444 0%, ${colors.green} 100%)`
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{formatNumber(withPosts)} posts</span>
          </div>

          {/* Lift Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: engDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20` }}>
              <TrendingUp
                className="w-5 h-5"
                style={{ color: engDelta >= 0 ? colors.positive : colors.negative }}
              />
              <span className="font-bold text-lg" style={{ color: engDelta >= 0 ? colors.positive : colors.negative }}>
                {formatDelta(metricValues.delta)} lift
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Delta Cards */}
        <div className="col-span-12 md:col-span-4 space-y-3">
          {/* Engagement Delta */}
          <div className="rounded-xl p-4 border border-gray-200 bg-white flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: engDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20` }}
            >
              <TrendingUp
                className="w-6 h-6"
                style={{ color: engDelta >= 0 ? colors.positive : colors.negative }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-black"
                style={{ color: engDelta >= 0 ? colors.positive : colors.negative }}
              >
                {formatDelta(engDelta)}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500">Engagement</p>
            </div>
          </div>

          {/* Likes Delta */}
          <div className="rounded-xl p-4 border border-gray-200 bg-white flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: likesDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20` }}
            >
              <Heart
                className="w-6 h-6"
                style={{ color: likesDelta >= 0 ? colors.positive : colors.negative }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-black"
                style={{ color: likesDelta >= 0 ? colors.positive : colors.negative }}
              >
                {formatDelta(likesDelta)}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500">Avg Likes</p>
            </div>
          </div>

          {/* Comments Delta */}
          <div className="rounded-xl p-4 border border-gray-200 bg-white flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: commentsDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20` }}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{ color: commentsDelta >= 0 ? colors.positive : colors.negative }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-black"
                style={{ color: commentsDelta >= 0 ? colors.positive : colors.negative }}
              >
                {formatDelta(commentsDelta)}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500">Avg Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <SectionHeader primary="DETAILED " secondary="COMPARISON" />
          <p className="text-sm text-gray-500 mt-2">Complete performance breakdown with and without {currentSignal?.label}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: colors.lightBg }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Metric</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Without {currentSignal?.label}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">With {currentSignal?.label}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Lift</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Engagement Rate</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatPercent(withoutEngRate)}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatPercent(withEngRate)}</td>
                <td className="px-5 py-4 text-right">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: engDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: engDelta >= 0 ? colors.positive : colors.negative }}
                  >
                    {formatDelta(engDelta)}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Avg Likes per Post</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(Math.round(baselineAvgLikes))}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(Math.round(withAvgLikes))}</td>
                <td className="px-5 py-4 text-right">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: likesDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: likesDelta >= 0 ? colors.positive : colors.negative }}
                  >
                    {formatDelta(likesDelta)}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Avg Comments per Post</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(Math.round(baselineAvgComments))}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(Math.round(withAvgComments))}</td>
                <td className="px-5 py-4 text-right">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: commentsDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: commentsDelta >= 0 ? colors.positive : colors.negative }}
                  >
                    {formatDelta(commentsDelta)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Post Volume</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(withoutPosts)} posts</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(withPosts)} posts</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs text-gray-500">
                    {((withPosts / (withPosts + withoutPosts)) * 100).toFixed(1)}% of total
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.positive, backgroundColor: `${colors.positive}08` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.positive }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: colors.positive }}>✨ Performance Boost</p>
              <p className="text-sm text-gray-700">
                Posts <span className="font-bold">with {currentSignal?.label.toLowerCase()}</span> get{' '}
                <span className="font-bold" style={{ color: colors.green }}>
                  {Math.abs(likesDelta).toFixed(0)}% more likes
                </span>{' '}
                and{' '}
                <span className="font-bold" style={{ color: colors.green }}>
                  {Math.abs(commentsDelta).toFixed(0)}% more comments
                </span>{' '}
                on average than posts without.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.accent, backgroundColor: `${colors.accent}08` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent }}>
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: colors.accent }}>📊 Sample Size</p>
              <p className="text-sm text-gray-700">
                Analysis based on <span className="font-bold">{formatNumber(withPosts)} posts with {currentSignal?.label.toLowerCase()}</span>{' '}
                compared to <span className="font-bold">{formatNumber(withoutPosts)} posts without</span>.
                This represents <span className="font-bold">{((withPosts / (withPosts + withoutPosts)) * 100).toFixed(1)}%</span> of all athlete content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PARTNERSHIPS TAB
// ═══════════════════════════════════════════════════════════════
function PartnershipsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Partnership>('emv');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const sortOptions: { key: keyof Partnership; label: string }[] = [
    { key: 'emv', label: 'EMV' },
    { key: 'avgLikes', label: 'Avg Likes' },
    { key: 'avgComments', label: 'Avg Comments' },
    { key: 'liftMultiplier', label: 'Eng Lift' },
    { key: 'posts', label: 'Posts' },
  ];

  const allSorted = useMemo(() => {
    const result = [...ipData.partnerships];
    result.sort((a, b) => {
      // For EMV, calculate dynamically using correct formula
      if (sortKey === 'emv') {
        const aEmv = calculateEMV(a.avgLikes, a.avgComments);
        const bEmv = calculateEMV(b.avgLikes, b.avgComments);
        return sortDir === 'desc' ? bEmv - aEmv : aEmv - bEmv;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return sortDir === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
    return result;
  }, [sortKey, sortDir]);

  const top10 = allSorted.slice(0, 10);

  const filteredAndSorted = useMemo(() => {
    let result = [...allSorted];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.brand.toLowerCase().includes(term));
    }
    return result;
  }, [allSorted, searchTerm]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: keyof Partnership) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Partnership }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === 'desc' ? (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    );
  };

  const getDisplayValue = (p: Partnership) => {
    switch (sortKey) {
      case 'emv': return formatCurrency(calculateEMV(p.avgLikes, p.avgComments));
      case 'avgLikes': return formatNumber(p.avgLikes);
      case 'avgComments': return formatNumber(p.avgComments);
      case 'liftMultiplier': return formatLift(p.liftMultiplier);
      case 'posts': return p.posts.toString();
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort By Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sort By</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSort(option.key)}
                className="px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: sortKey === option.key ? colors.green : colors.white,
                  color: sortKey === option.key ? colors.white : colors.text,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500 ml-auto">
          {ipData.partnerships.length} partnerships analyzed
        </p>
      </div>

      {/* Top 10 Highlight Section */}
      <div>
        <div className="mb-4">
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl font-bold uppercase tracking-tight">
            <span style={{ color: colors.green }}>TOP 10 </span>
            <span style={{ color: colors.headerGold }}>BY {sortOptions.find(o => o.key === sortKey)?.label.toUpperCase()}</span>
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {top10.map((partner, idx) => (
            <div
              key={partner.brand}
              className="rounded-2xl p-4 bg-white hover:shadow-lg transition-shadow"
              style={{
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                borderLeft: idx < 3 ? `4px solid ${colors.green}` : 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: idx < 3 ? colors.green : colors.gray,
                    color: colors.white,
                  }}
                >
                  {idx + 1}
                </span>
                <BrandLogo brand={partner.brand} />
                <p className="text-sm font-semibold text-gray-900 truncate flex-1" title={partner.brand}>
                  {partner.brand.replace('@', '')}
                </p>
              </div>
              <p className="text-2xl font-black" style={{ color: colors.green }}>
                {getDisplayValue(partner)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {partner.posts} {partner.posts === 1 ? 'post' : 'posts'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Table */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <SectionHeader primary="ALL " secondary="PARTNERSHIPS" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-64 bg-white"
            />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.green }}>
                  <th className="text-center px-2 py-3 text-xs font-semibold uppercase tracking-wider text-white w-12">
                    #
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                    onClick={() => handleSort('brand')}
                  >
                    Partner <SortIcon columnKey="brand" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                    onClick={() => handleSort('posts')}
                  >
                    Posts <SortIcon columnKey="posts" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                    onClick={() => handleSort('avgLikes')}
                  >
                    Avg Likes <SortIcon columnKey="avgLikes" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                    onClick={() => handleSort('avgComments')}
                  >
                    Avg Comments <SortIcon columnKey="avgComments" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10"
                    style={{ color: sortKey === 'emv' ? '#fcd34d' : '#ffffff' }}
                    onClick={() => handleSort('emv')}
                  >
                    EMV <SortIcon columnKey="emv" />
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                    onClick={() => handleSort('liftMultiplier')}
                  >
                    Eng Lift <SortIcon columnKey="liftMultiplier" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((partnership, index) => {
                  const globalRank = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={partnership.brand}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                    >
                      <td className="px-2 py-3 text-center text-sm text-gray-400 font-medium">
                        {globalRank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <BrandLogo brand={partnership.brand} />
                          <span className="font-medium text-gray-900">{partnership.brand}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {partnership.posts}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatNumber(partnership.avgLikes)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatNumber(partnership.avgComments)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(calculateEMV(partnership.avgLikes, partnership.avgComments))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-medium"
                          style={{
                            color: partnership.liftMultiplier >= 0 ? colors.positive : colors.negative,
                          }}
                        >
                          {formatLift(partnership.liftMultiplier)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BEST COLLABORATORS TAB
// ═══════════════════════════════════════════════════════════════

// Signal summary stats
const signalStats = {
  collab: { posts: 189, totalEmv: 21729, avgEmv: 115, lift: 636 },
  logo: { posts: 1816, totalEmv: 58857, avgEmv: 32, lift: 112 },
  mention: { posts: 1409, totalEmv: 55487, avgEmv: 39, lift: 182 },
};

// Format sport names from JSON format (e.g. MENS_BASKETBALL → M. Basketball)
function formatSportName(sport: string): string {
  const map: Record<string, string> = {
    'FOOTBALL': 'Football', 'MENS_BASKETBALL': 'M. Basketball', 'WOMENS_BASKETBALL': 'W. Basketball',
    'BASEBALL': 'Baseball', 'SOFTBALL': 'Softball', 'WOMENS_VOLLEYBALL': 'W. Volleyball',
    'MENS_GOLF': 'M. Golf', 'WOMENS_GOLF': 'W. Golf', 'WOMENS_GYMNASTICS': 'W. Gymnastics',
    'WOMENS_TENNIS': 'W. Tennis', 'MENS_TENNIS': 'M. Tennis', 'SWIMMING_AND_DIVING': 'Swim & Dive',
    'WOMENS_SOCCER': 'W. Soccer', 'EQUESTRIAN': 'Equestrian', 'TRACK_AND_FIELD': 'Track & Field',
    'MENS_SWIMMING_AND_DIVING': 'M. Swim & Dive', 'WOMENS_SWIMMING_AND_DIVING': 'W. Swim & Dive',
    'CROSS_COUNTRY': 'Cross Country',
    'WOMENS_TRACK_AND_FIELD': 'W. Track & Field',
  };
  return map[sport] || sport.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

type AthleteSignalData = { posts: number; emv: number; avgLikes: number; avgComments: number; engagementRate: number; lift: number };
type BaylorAthlete = { name: string; sport: string; totalPosts: number; totalEmv: number; engagementRate: number; collab?: AthleteSignalData; logo?: AthleteSignalData; mention?: AthleteSignalData };

const baylorAthletes: BaylorAthlete[] = [
  {
    name: 'Taliah Scott', sport: 'WOMENS_BASKETBALL', totalPosts: 76, totalEmv: 5716.76, engagementRate: 0.000523,
    logo: { posts: 36, emv: 2709.34, avgLikes: 0, avgComments: 0, engagementRate: 0.000529, lift: 36.4 },
    mention: { posts: 40, emv: 3007.42, avgLikes: 0, avgComments: 0, engagementRate: 0.000517, lift: 34.9 },
  },
  {
    name: 'Yuting Deng', sport: 'WOMENS_BASKETBALL', totalPosts: 38, totalEmv: 884.85, engagementRate: 0.003632,
    collab: { posts: 5, emv: 118.26, avgLikes: 0, avgComments: 0, engagementRate: 0.003852, lift: -31.48 },
    logo: { posts: 14, emv: 325.96, avgLikes: 0, avgComments: 0, engagementRate: 0.003558, lift: -49.56 },
    mention: { posts: 19, emv: 440.63, avgLikes: 0, avgComments: 0, engagementRate: 0.003485, lift: -61.92 },
  },
  {
    name: 'Tounde Yessoufou', sport: 'MENS_BASKETBALL', totalPosts: 5, totalEmv: 1589.39, engagementRate: 0.003805,
    collab: { posts: 5, emv: 1589.39, avgLikes: 0, avgComments: 0, engagementRate: 0.003805, lift: 220.89 },
  },
  {
    name: 'Cameron Carr', sport: 'MENS_BASKETBALL', totalPosts: 24, totalEmv: 2143.9, engagementRate: 0.0018,
    mention: { posts: 24, emv: 2143.9, avgLikes: 0, avgComments: 0, engagementRate: 0.0018, lift: 6.86 },
  },
  {
    name: 'Josh Cameron', sport: 'FOOTBALL', totalPosts: 22, totalEmv: 1052.05, engagementRate: 0.003919,
    logo: { posts: 13, emv: 568.38, avgLikes: 0, avgComments: 0, engagementRate: 0.001974, lift: -52.95 },
  },
  {
    name: 'Gabe Craig', sport: 'BASEBALL', totalPosts: 9, totalEmv: 165.08, engagementRate: 0.002743,
    collab: { posts: 9, emv: 165.08, avgLikes: 0, avgComments: 0, engagementRate: 0.002743, lift: 66.75 },
  },
  {
    name: 'Bailey Warren', sport: 'WOMENS_VOLLEYBALL', totalPosts: 7, totalEmv: 154.41, engagementRate: 0.009908,
    collab: { posts: 7, emv: 154.41, avgLikes: 0, avgComments: 0, engagementRate: 0.009908, lift: 224.6 },
  },
  {
    name: 'Jacob Redding', sport: 'FOOTBALL', totalPosts: 5, totalEmv: 182.83, engagementRate: 0.011033,
    collab: { posts: 5, emv: 182.83, avgLikes: 0, avgComments: 0, engagementRate: 0.011033, lift: 136.1 },
  },
  {
    name: 'Palmer Williams', sport: 'FOOTBALL', totalPosts: 12, totalEmv: 326.91, engagementRate: 0.006539,
    logo: { posts: 12, emv: 326.91, avgLikes: 0, avgComments: 0, engagementRate: 0.006539, lift: 14.85 },
  },
  {
    name: 'Ty Johnson', sport: 'BASEBALL', totalPosts: 12, totalEmv: 259.52, engagementRate: 0.002756,
    logo: { posts: 12, emv: 259.52, avgLikes: 0, avgComments: 0, engagementRate: 0.002756, lift: 22.72 },
  },
  {
    name: 'Tyler Isgrig', sport: 'WOMENS_SOCCER', totalPosts: 19, totalEmv: 1602.19, engagementRate: 0.000818,
    mention: { posts: 19, emv: 1602.19, avgLikes: 0, avgComments: 0, engagementRate: 0.000818, lift: -71.59 },
  },
  {
    name: 'Alyssa Jones', sport: 'WOMENS_TRACK_AND_FIELD', totalPosts: 18, totalEmv: 412.06, engagementRate: 0.001661,
    mention: { posts: 18, emv: 412.06, avgLikes: 0, avgComments: 0, engagementRate: 0.001661, lift: 75.43 },
  },
];

type SignalSortKey = 'emv' | 'posts' | 'emvPerPost' | 'engagementRate' | 'lift';

// Reusable sortable athlete table component for IP signals
function IPSignalTable({
  title,
  icon,
  signalKey,
  avgEmv,
  lift,
}: {
  title: string;
  icon: React.ReactNode;
  signalKey: 'collab' | 'logo' | 'mention';
  avgEmv: number;
  lift: number;
}) {
  const [sortKey, setSortKey] = useState<SignalSortKey>('emv');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SignalSortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const top5 = useMemo(() => {
    const withSignal = (baylorAthletes as BaylorAthlete[])
      .filter((a) => a[signalKey] != null)
      .map((a) => {
        const sig = a[signalKey]!;
        return { name: a.name, sport: a.sport, ...sig, emvPerPost: sig.posts > 0 ? sig.emv / sig.posts : 0 };
      });

    withSignal.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

    return withSignal.slice(0, 5);
  }, [signalKey, sortKey, sortDir]);

  const SortArrow = ({ col }: { col: SignalSortKey }) => {
    if (sortKey !== col) return null;
    return <span className="ml-0.5">{sortDir === 'desc' ? '▼' : '▲'}</span>;
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{ backgroundColor: colors.green }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }}
        />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3
              className="text-white font-bold text-lg uppercase"
              style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
            >
              {title}
            </h3>
            <p className="text-xs text-white/80">
              {formatCurrency(avgEmv)} avg EMV • <span className="text-white font-semibold">+{lift}%</span> lift
            </p>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_55px_80px_80px_80px_65px] gap-2 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
        <span className="text-center">#</span>
        <span>Athlete</span>
        <span className="text-center cursor-pointer hover:text-gray-800" onClick={() => handleSort('posts')}>Posts<SortArrow col="posts" /></span>
        <span className="text-right cursor-pointer hover:text-gray-800" onClick={() => handleSort('emv')}>EMV<SortArrow col="emv" /></span>
        <span className="text-right cursor-pointer hover:text-gray-800" onClick={() => handleSort('emvPerPost')}>EMV/Post<SortArrow col="emvPerPost" /></span>
        <span className="text-right cursor-pointer hover:text-gray-800" onClick={() => handleSort('engagementRate')}>Eng Rate<SortArrow col="engagementRate" /></span>
        <span className="text-right cursor-pointer hover:text-gray-800" onClick={() => handleSort('lift')}>Lift<SortArrow col="lift" /></span>
      </div>

      {/* Table Body */}
      <div>
        {top5.map((athlete, idx) => (
          <div
            key={athlete.name}
            className={`grid grid-cols-[40px_1fr_55px_80px_80px_80px_65px] gap-2 px-5 py-3 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto"
              style={{
                backgroundColor: idx < 3 ? colors.green : 'transparent',
                color: idx < 3 ? 'white' : colors.green,
                border: idx >= 3 ? `2px solid ${colors.green}` : 'none',
              }}
            >
              {idx + 1}
            </span>
            <div>
              <p className="text-gray-900 font-semibold">{athlete.name}</p>
              <p className="text-xs text-gray-500">{formatSportName(athlete.sport)}</p>
            </div>
            <span className="text-center text-gray-600">{athlete.posts}</span>
            <span className="text-right font-bold" style={{ color: colors.green }}>{formatCurrency(athlete.emv)}</span>
            <span className="text-right text-gray-700">{formatCurrency(athlete.emvPerPost)}</span>
            <span className="text-right text-gray-700">{(athlete.engagementRate * 100).toFixed(2)}%</span>
            <span className="text-right font-medium" style={{ color: athlete.lift >= 0 ? colors.positive : colors.negative }}>{athlete.lift >= 0 ? '+' : ''}{athlete.lift}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestCollaboratorsTab() {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{ backgroundColor: colors.green }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />
          <div className="relative z-10">
            <Handshake className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Collab Posts</p>
            <p className="text-3xl font-black text-white">{signalStats.collab.posts}</p>
            <p className="text-sm text-white/90 mt-1 font-semibold">+{signalStats.collab.lift}% lift</p>
          </div>
        </div>
        <div
          className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{ backgroundColor: colors.green }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />
          <div className="relative z-10">
            <Tag className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Visual IP Posts</p>
            <p className="text-3xl font-black text-white">{formatNumber(signalStats.logo.posts)}</p>
            <p className="text-sm text-white/90 mt-1 font-semibold">+{signalStats.logo.lift}% lift</p>
          </div>
        </div>
        <div
          className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{ backgroundColor: colors.green }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />
          <div className="relative z-10">
            <AtSign className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Mention Posts</p>
            <p className="text-3xl font-black text-white">{formatNumber(signalStats.mention.posts)}</p>
            <p className="text-sm text-white/90 mt-1 font-semibold">+{signalStats.mention.lift}% lift</p>
          </div>
        </div>
      </div>

      {/* Three IP Signal Tables - STACKED VERTICALLY */}
      <div className="space-y-6">
        <IPSignalTable
          title="collab"
          icon={<Handshake className="w-5 h-5 text-white" />}
          signalKey="collab"
          avgEmv={signalStats.collab.avgEmv}
          lift={signalStats.collab.lift}
        />
        <IPSignalTable
          title="logo"
          icon={<Tag className="w-5 h-5 text-white" />}
          signalKey="logo"
          avgEmv={signalStats.logo.avgEmv}
          lift={signalStats.logo.lift}
        />
        <IPSignalTable
          title="mention"
          icon={<AtSign className="w-5 h-5 text-white" />}
          signalKey="mention"
          avgEmv={signalStats.mention.avgEmv}
          lift={signalStats.mention.lift}
        />
      </div>

      {/* Info Banner */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Top 5 athletes</span> for each IP signal type. Click column headers to re-rank.
          EMV formula: (likes × $0.20) + (comments × $2.00).
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BENCHMARK TAB
// ═══════════════════════════════════════════════════════════════

// Big 12 Conference benchmark data (16 schools)
const big12Schools = [
  { name: 'Texas Tech', conf: 'Big 12', followers: 1800000, posts: 2355, ipPosts: 1246, adoption: 52.9, logo: 52.3, mention: 0, collab: 1.18 },
  { name: 'Houston', conf: 'Big 12', followers: 2000000, posts: 1987, ipPosts: 965, adoption: 48.6, logo: 47.2, mention: 0, collab: 3.97 },
  { name: 'BYU', conf: 'Big 12', followers: 1500000, posts: 5050, ipPosts: 2298, adoption: 45.5, logo: 39.7, mention: 15.0, collab: 3.36 },
  { name: 'West Virginia', conf: 'Big 12', followers: 1200000, posts: 2288, ipPosts: 952, adoption: 41.6, logo: 41.6, mention: 0, collab: 0 },
  { name: 'Arizona', conf: 'Big 12', followers: 2000000, posts: 4312, ipPosts: 1777, adoption: 41.2, logo: 38.8, mention: 9.6, collab: 1.60 },
  { name: 'Baylor', conf: 'Big 12', followers: 2190438, posts: 6156, ipPosts: 2390, adoption: 38.8, logo: 29.5, mention: 22.9, collab: 3.07 },
  { name: 'Arizona State', conf: 'Big 12', followers: 1800000, posts: 6782, ipPosts: 2102, adoption: 31.0, logo: 27.4, mention: 10.9, collab: 3.05 },
  { name: 'Cincinnati', conf: 'Big 12', followers: 1000000, posts: 4309, ipPosts: 1125, adoption: 26.1, logo: 10.8, mention: 18.6, collab: 0.51 },
  { name: 'TCU', conf: 'Big 12', followers: 1500000, posts: 1707, ipPosts: 439, adoption: 25.7, logo: 25.7, mention: 0, collab: 0 },
  { name: 'Colorado', conf: 'Big 12', followers: 1200000, posts: 1418, ipPosts: 349, adoption: 24.6, logo: 24.6, mention: 0, collab: 0 },
  { name: 'UCF', conf: 'Big 12', followers: 1000000, posts: 1756, ipPosts: 420, adoption: 23.9, logo: 16.6, mention: 10.9, collab: 0 },
  { name: 'Kansas', conf: 'Big 12', followers: 1500000, posts: 2423, ipPosts: 557, adoption: 23.0, logo: 22.4, mention: 0, collab: 0.82 },
  { name: 'Iowa State', conf: 'Big 12', followers: 1000000, posts: 2248, ipPosts: 506, adoption: 22.5, logo: 22.4, mention: 0, collab: 0.13 },
  { name: 'Kansas State', conf: 'Big 12', followers: 900000, posts: 1680, ipPosts: 306, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Utah', conf: 'Big 12', followers: 1200000, posts: 2152, ipPosts: 392, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', followers: 1200000, posts: 1934, ipPosts: 348, adoption: 18.0, logo: 18.0, mention: 0, collab: 0 },
];

// NCAA D1 schools benchmark data (71 schools with 1000+ posts)
const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1564, adoption: 56.7, logo: 53.5, mention: 14.6, collab: 1.34 },
  { name: 'Nebraska', conf: 'Big 10', posts: 3049, adoption: 54.3, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Miami', conf: 'ACC', posts: 1553, adoption: 53.8, logo: 53.8, mention: 0, collab: 0 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 53.2, logo: 50.2, mention: 21.6, collab: 4.56 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 52.9, logo: 52.3, mention: 0, collab: 1.18 },
  { name: 'Indiana', conf: 'Big 10', posts: 1635, adoption: 50.8, logo: 50.8, mention: 0, collab: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.0, logo: 50.0, mention: 0, collab: 0.09 },
  { name: 'Virginia Tech', conf: 'SEC', posts: 3735, adoption: 49.6, logo: 45.9, mention: 16.0, collab: 0.10 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.6, logo: 47.2, mention: 0, collab: 3.97 },
  { name: 'Kentucky', conf: 'SEC', posts: 2924, adoption: 48.5, logo: 46.5, mention: 0, collab: 6.63 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2216, adoption: 46.8, logo: 38.3, mention: 20.1, collab: 2.93 },
  { name: 'Notre Dame', conf: 'ACC', posts: 2747, adoption: 46.7, logo: 43.4, mention: 19.0, collab: 0.07 },
  { name: 'Oregon', conf: 'Big 10', posts: 2073, adoption: 45.7, logo: 44.9, mention: 0, collab: 2.36 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2813, adoption: 45.6, logo: 45.6, mention: 0, collab: 0 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.5, logo: 44.7, mention: 0, collab: 3.07 },
  { name: 'BYU', conf: 'Big 12', posts: 5050, adoption: 45.5, logo: 39.7, mention: 15.0, collab: 3.36 },
  { name: 'Maryland', conf: 'Big 10', posts: 2120, adoption: 43.6, logo: 38.1, mention: 18.4, collab: 0 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.4, logo: 43.1, mention: 0, collab: 1.25 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 42.1, logo: 36.9, mention: 17.9, collab: 2.64 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.6, logo: 41.6, mention: 0, collab: 0 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logo: 41.5, mention: 0, collab: 0.54 },
  { name: 'UTSA', conf: 'AAC', posts: 3339, adoption: 41.4, logo: 32.7, mention: 19.1, collab: 9.52 },
  { name: 'Arizona', conf: 'Big 12', posts: 4312, adoption: 41.2, logo: 38.8, mention: 9.6, collab: 1.60 },
  { name: 'Missouri', conf: 'SEC', posts: 5643, adoption: 40.5, logo: 35.5, mention: 20.1, collab: 1.94 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logo: 38.9, mention: 0, collab: 5.61 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logo: 40.1, mention: 0, collab: 0 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 39.9, logo: 38.5, mention: 0, collab: 6.10 },
  { name: 'Baylor', conf: 'Big 12', posts: 6156, adoption: 38.8, logo: 29.5, mention: 22.9, collab: 3.07 },
  { name: 'Alabama', conf: 'SEC', posts: 5653, adoption: 37.4, logo: 33.0, mention: 16.7, collab: 2.49 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 35.9, logo: 35.9, mention: 0, collab: 0 },
  { name: 'Purdue', conf: 'Big 10', posts: 5142, adoption: 34.4, logo: 31.4, mention: 12.7, collab: 3.28 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.3, logo: 34.3, mention: 0, collab: 0 },
  { name: 'Arkansas', conf: 'SEC', posts: 5597, adoption: 34.0, logo: 31.1, mention: 10.3, collab: 0.91 },
  { name: 'Baylor', conf: 'SEC', posts: 5314, adoption: 33.7, logo: 12.3, mention: 25.9, collab: 0.39 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 0, collab: 0 },
  { name: 'Texas A&M', conf: 'SEC', posts: 3419, adoption: 32.3, logo: 15.4, mention: 24.5, collab: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 6782, adoption: 31.0, logo: 27.4, mention: 10.9, collab: 3.05 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 29.9, logo: 29.2, mention: 0, collab: 1.06 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 28.1, logo: 23.1, mention: 11.9, collab: 0.25 },
  { name: 'Texas', conf: 'SEC', posts: 5723, adoption: 27.1, logo: 27.1, mention: 0, collab: 0 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.7, logo: 26.7, mention: 0, collab: 0.02 },
  { name: 'Washington', conf: 'Big 10', posts: 2344, adoption: 26.2, logo: 24.1, mention: 0, collab: 4.13 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4309, adoption: 26.1, logo: 10.8, mention: 18.6, collab: 0.51 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.7, logo: 25.7, mention: 0, collab: 0 },
  { name: 'LSU', conf: 'SEC', posts: 4269, adoption: 25.7, logo: 10.1, mention: 18.6, collab: 0 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logo: 24.6, mention: 0, collab: 0 },
  { name: 'UCF', conf: 'Big 12', posts: 1756, adoption: 23.9, logo: 16.6, mention: 10.9, collab: 0 },
  { name: 'Penn State', conf: 'Big 10', posts: 7202, adoption: 23.4, logo: 7.6, mention: 18.8, collab: 0.01 },
  { name: 'San Diego', conf: 'WCC', posts: 1974, adoption: 23.1, logo: 20.3, mention: 9.2, collab: 0.05 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.0, logo: 22.4, mention: 0, collab: 0.82 },
  { name: 'Virginia', conf: 'ACC', posts: 5926, adoption: 22.7, logo: 7.8, mention: 18.0, collab: 0.60 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.5, logo: 22.4, mention: 0, collab: 0.13 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logo: 18.0, mention: 0, collab: 0 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.3, logo: 15.2, mention: 0, collab: 1.94 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.1, logo: 11.5, mention: 0, collab: 5.35 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 13.7, logo: 12.4, mention: 0, collab: 1.70 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.6, logo: 12.5, mention: 0, collab: 1.90 },
  { name: 'Georgia', conf: 'SEC', posts: 5016, adoption: 12.7, logo: 12.7, mention: 0, collab: 0 },
  { name: 'Florida', conf: 'SEC', posts: 2735, adoption: 12.6, logo: 12.6, mention: 0, collab: 0 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.2, logo: 11.7, mention: 0, collab: 1.02 },
  { name: 'Pittsburgh', conf: 'ACC', posts: 2475, adoption: 11.7, logo: 11.6, mention: 0, collab: 0.16 },
  { name: 'UNC', conf: 'ACC', posts: 2744, adoption: 11.1, logo: 11.1, mention: 0, collab: 0 },
  { name: 'Clemson', conf: 'ACC', posts: 3013, adoption: 10.2, logo: 10.2, mention: 0, collab: 0.03 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5664, adoption: 9.0, logo: 9.0, mention: 0, collab: 0 },
  { name: 'UCLA', conf: 'Big 10', posts: 6482, adoption: 7.9, logo: 7.9, mention: 0, collab: 0 },
  { name: 'Creighton', conf: 'Big East', posts: 2553, adoption: 7.4, logo: 6.4, mention: 0, collab: 1.25 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.3, logo: 7.3, mention: 0, collab: 0 },
  { name: 'USC', conf: 'Big 10', posts: 5328, adoption: 6.6, logo: 6.6, mention: 0, collab: 0.01 },
];

const conferenceAvg = {
  adoption: 31.2,
  logo: 28.4,
  mention: 5.4,
  collab: 1.1,
};

const ncaaD1Avg = {
  adoption: 31.4,
  logo: 28.1,
  mention: 6.5,
  collab: 1.3,
};

const baylorRank = {
  conference: { adoption: 6, logo: 6, mention: 1, collab: 4, total: 16 },
  ncaa: { adoption: 28, logo: 33, mention: 1, collab: 13, total: 70 },
};

function BenchmarkTab() {
  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');
  const [distMetric, setDistMetric] = useState<'adoption' | 'logo' | 'mention' | 'collab'>('adoption');
  type RankSortKey = 'posts' | 'adoption' | 'logo' | 'mention' | 'collab';
  const [rankSortKey, setRankSortKey] = useState<RankSortKey>('adoption');
  const [rankSortDir, setRankSortDir] = useState<'desc' | 'asc'>('desc');

  // Dynamic data based on benchmark type
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big12Schools : ncaaD1Schools;
  const avg = isConference ? conferenceAvg : ncaaD1Avg;
  const ranks = isConference ? baylorRank.conference : baylorRank.ncaa;
  const benchmarkLabel = isConference ? 'Big 12' : 'NCAA D1';

  // Baylor metrics
  const baylor = { adoption: 38.8, logo: 29.5, mention: 22.9, collab: 3.07 };
  const adoptionDelta = baylor.adoption - avg.adoption;
  const logoDelta = baylor.logo - avg.logo;
  const mentionDelta = baylor.mention - avg.mention;
  const collabDelta = baylor.collab - avg.collab;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Benchmarks</span> shows how often Baylor athletes use IP elements (logos, mentions, collaborations) in social content compared to other schools.
        </p>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.green }}></span> {benchmarkLabel}: Compare against {isConference ? 'other SEC schools' : '71 NCAA D1 schools'}</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setBenchmarkType('conference')}
            className="px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: benchmarkType === 'conference' ? colors.green : colors.white,
              color: benchmarkType === 'conference' ? colors.white : colors.text,
            }}
          >
            SEC
          </button>
          <button
            onClick={() => setBenchmarkType('ncaa')}
            className="px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: benchmarkType === 'ncaa' ? colors.green : colors.white,
              color: benchmarkType === 'ncaa' ? colors.white : colors.text,
            }}
          >
            NCAA D1
          </button>
        </div>
        <span className="text-xs text-gray-400">{schools.length} schools compared</span>
      </div>

      {/* Summary Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Rank */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Overall IP Adoption</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.green }}>#{ranks.adoption}</p>
            <p className="text-sm text-gray-500 mb-1">of {ranks.total} schools</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs {benchmarkLabel}</p>
        </div>

        {/* Your Adoption */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Your IP Adoption</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{baylor.adoption}%</p>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: adoptionDelta >= 0 ? colors.positive : colors.negative }}
            >
              {adoptionDelta >= 0 ? '↑' : '↓'} {Math.abs(adoptionDelta).toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs {avg.adoption}% {benchmarkLabel.toLowerCase()} avg</p>
        </div>

        {/* Insight */}
        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.positive, backgroundColor: `${colors.positive}08` }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.positive }}>💡 Key Insight</p>
          <p className="text-sm text-gray-700">
            {isConference
              ? <>Baylor leads the SEC in <span className="font-semibold">mention rate</span> ({baylor.mention}%), outperforming the conference average by {mentionDelta.toFixed(1)}%.</>
              : <>Baylor ranks <span className="font-semibold">#{ranks.mention} in mention rate</span> among {ranks.total} NCAA D1 schools, with {baylor.mention}% vs {avg.mention}% average.</>
            }
          </p>
        </div>
      </div>

      {/* IP Signal Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.green}15` }}>
                <Tag className="w-5 h-5" style={{ color: colors.green }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Visual IP</h4>
                <p className="text-xs text-gray-500">% of posts with visual IP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.green }}>#{ranks.logo}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Baylor</span>
                <span className="font-semibold">{baylor.logo}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(baylor.logo / 60) * 100}%`, backgroundColor: colors.green }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{benchmarkLabel} Avg</span>
                <span className="text-gray-500">{avg.logo}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(avg.logo / 60) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: logoDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: logoDelta >= 0 ? colors.positive : colors.negative }}
            >
              {logoDelta >= 0 ? '↑' : '↓'} {Math.abs(logoDelta).toFixed(1)}% vs {benchmarkLabel.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Mention */}
        <div className="rounded-xl border-2 bg-white p-5" style={{ borderColor: isConference || ranks.mention <= 5 ? colors.positive : colors.cardBorder }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.positive}15` }}>
                <AtSign className="w-5 h-5" style={{ color: colors.positive }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Mention</h4>
                <p className="text-xs text-gray-500">% of posts with mentions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.positive }}>#{ranks.mention}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Baylor</span>
                <span className="font-semibold">{baylor.mention}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(baylor.mention / 30) * 100}%`, backgroundColor: colors.positive }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{benchmarkLabel} Avg</span>
                <span className="text-gray-500">{avg.mention}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(avg.mention / 30) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: mentionDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: mentionDelta >= 0 ? colors.positive : colors.negative }}
            >
              {mentionDelta >= 0 ? '↑' : '↓'} {Math.abs(mentionDelta).toFixed(1)}% vs {benchmarkLabel.toLowerCase()} {isConference && '• #1 in SEC'}
            </span>
          </div>
        </div>

        {/* Collaboration */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.green}15` }}>
                <Users className="w-5 h-5" style={{ color: colors.green }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Collaboration</h4>
                <p className="text-xs text-gray-500">% of posts with collabs</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.green }}>#{ranks.collab}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Baylor</span>
                <span className="font-semibold">{baylor.collab}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(baylor.collab / 10) * 100}%`, backgroundColor: colors.green }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{benchmarkLabel} Avg</span>
                <span className="text-gray-500">{avg.collab}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(avg.collab / 10) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: collabDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: collabDelta >= 0 ? colors.positive : colors.negative }}
            >
              {collabDelta >= 0 ? '↑' : '↓'} {Math.abs(collabDelta).toFixed(2)}% vs {benchmarkLabel.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Adoption Rate */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.green}15` }}>
                <Percent className="w-5 h-5" style={{ color: colors.green }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">IP Adoption</h4>
                <p className="text-xs text-gray-500">% of posts with any IP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.green }}>#{ranks.adoption}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Baylor</span>
                <span className="font-semibold">{baylor.adoption}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(baylor.adoption / 60) * 100}%`, backgroundColor: colors.green }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{benchmarkLabel} Avg</span>
                <span className="text-gray-500">{avg.adoption}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(avg.adoption / 60) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: adoptionDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: adoptionDelta >= 0 ? colors.positive : colors.negative }}
            >
              {adoptionDelta >= 0 ? '↑' : '↓'} {Math.abs(adoptionDelta).toFixed(1)}% vs {benchmarkLabel.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Distribution Slider */}
      {(() => {
        const distMetrics = [
          { id: 'adoption' as const, label: 'IP Adoption' },
          { id: 'logo' as const, label: 'Logo' },
          { id: 'mention' as const, label: 'Mention' },
          { id: 'collab' as const, label: 'Collab' },
        ];
        const metricLabel = distMetrics.find(m => m.id === distMetric)?.label || 'IP Adoption';
        const baylorVal = baylor[distMetric];
        const schoolValues = schools.map(s => ({ name: s.name, value: s[distMetric] }));
        const minSchool = schoolValues.reduce((a, b) => a.value < b.value ? a : b);
        const maxSchool = schoolValues.reduce((a, b) => a.value > b.value ? a : b);
        const avgVal = avg[distMetric];
        const range = maxSchool.value - minSchool.value;
        const baylorPct = range > 0 ? ((baylorVal - minSchool.value) / range) * 100 : 50;
        const rankVal = ranks[distMetric];

        return (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <SectionHeader primary="PERFORMANCE " secondary="DISTRIBUTION" />
            <p className="text-sm text-gray-500 mt-2 mb-4">How Baylor's {metricLabel.toLowerCase()} compares across {benchmarkLabel}</p>

            {/* Metric selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">View by:</span>
              <div className="flex gap-2">
                {distMetrics.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setDistMetric(m.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                    style={{
                      backgroundColor: distMetric === m.id ? colors.green : '#f3f4f6',
                      color: distMetric === m.id ? colors.white : colors.text,
                    }}
                  >
                    {m.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="relative mt-6 mb-8">
              <div className="flex justify-between text-xs uppercase tracking-wider text-gray-400 mb-3">
                <span>WORST</span>
                <span>AVERAGE</span>
                <span>TOP</span>
              </div>

              <div className="relative h-12 rounded-lg overflow-hidden" style={{ background: `linear-gradient(90deg, #e5e7eb 0%, #9ca3af 50%, #374151 100%)` }}>
                {/* Baylor Marker */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{ left: `${Math.min(Math.max(baylorPct, 2), 98)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-1 h-full" style={{ backgroundColor: colors.green }}></div>
                </div>
              </div>

              {/* Baylor label below bar */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: `${Math.min(Math.max(baylorPct, 5), 95)}%`, transform: 'translateX(-50%)', top: 'calc(100% - 16px)' }}
              >
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent" style={{ borderBottomColor: colors.green }}></div>
                <div className="px-3 py-2 rounded-lg shadow-lg whitespace-nowrap" style={{ backgroundColor: colors.green }}>
                  <p className="text-white font-bold text-sm">AUBURN — {baylorVal.toFixed(1)}%</p>
                  <p className="text-white text-xs">#{rankVal} of {ranks.total} {isConference ? 'in SEC' : 'in NCAA D1'}</p>
                </div>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{minSchool.value.toFixed(1)}%</span>
                <span>{avgVal.toFixed(1)}%</span>
                <span>{maxSchool.value.toFixed(1)}%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">WORST</p>
                <p className="text-2xl font-bold text-gray-900">{minSchool.value.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">{minSchool.name}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">MEDIAN</p>
                <p className="text-2xl font-bold text-gray-900">{avgVal.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">{benchmarkLabel} average</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">BEST</p>
                <p className="text-2xl font-bold" style={{ color: colors.green }}>{maxSchool.value.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">{maxSchool.name}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Rankings Table */}
      {(() => {
        const handleRankSort = (key: RankSortKey) => {
          if (rankSortKey === key) {
            setRankSortDir(rankSortDir === 'desc' ? 'asc' : 'desc');
          } else {
            setRankSortKey(key);
            setRankSortDir('desc');
          }
        };
        const sortedSchools = [...schools].sort((a, b) => {
          const aVal = a[rankSortKey];
          const bVal = b[rankSortKey];
          return rankSortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
        const sortLabel = { posts: 'POSTS', adoption: 'IP ADOPTION', logo: 'VISUAL IP', mention: 'MENTION', collab: 'COLLAB' }[rankSortKey];
        const RankArrow = ({ col }: { col: RankSortKey }) => {
          if (rankSortKey !== col) return null;
          return <span className="ml-0.5">{rankSortDir === 'desc' ? '▼' : '▲'}</span>;
        };
        const thClass = "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors";

        return (
          <div>
            <div className="mb-4">
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl font-bold uppercase tracking-tight">
                <span style={{ color: colors.green }}>{benchmarkLabel} </span>
                <span style={{ color: colors.headerGold }}>{sortLabel} RANKINGS</span>
              </h3>
            </div>
            <div className="rounded-2xl bg-white overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr style={{ backgroundColor: colors.green }}>
                    <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">School</th>
                    {!isConference && <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Conf</th>}
                    <th className={thClass} style={{ color: rankSortKey === 'posts' ? '#fcd34d' : '#ffffff' }} onClick={() => handleRankSort('posts')}>Posts<RankArrow col="posts" /></th>
                    <th className={thClass} style={{ color: rankSortKey === 'adoption' ? '#fcd34d' : '#ffffff' }} onClick={() => handleRankSort('adoption')}>Adoption<RankArrow col="adoption" /></th>
                    <th className={thClass} style={{ color: rankSortKey === 'logo' ? '#fcd34d' : '#ffffff' }} onClick={() => handleRankSort('logo')}>Visual IP<RankArrow col="logo" /></th>
                    <th className={thClass} style={{ color: rankSortKey === 'mention' ? '#fcd34d' : '#ffffff' }} onClick={() => handleRankSort('mention')}>Mention<RankArrow col="mention" /></th>
                    <th className={thClass} style={{ color: rankSortKey === 'collab' ? '#fcd34d' : '#ffffff' }} onClick={() => handleRankSort('collab')}>Collab<RankArrow col="collab" /></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSchools.map((school, idx) => {
                    const isBaylor = school.name === 'Baylor';
                    return (
                      <tr
                        key={school.name}
                        className={`border-b border-gray-100 ${isBaylor ? 'bg-green-50' : idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="px-3 py-3 text-center">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                            style={{
                              backgroundColor: isBaylor ? colors.green : idx < 3 ? colors.gray : '#e5e7eb',
                              color: isBaylor || idx < 3 ? colors.white : colors.text,
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-semibold ${isBaylor ? 'text-green-700' : 'text-gray-900'}`}>
                          {school.name}
                        </td>
                        {!isConference && <td className="px-4 py-3 text-xs text-gray-500">{school.conf}</td>}
                        <td className={`px-4 py-3 text-right ${rankSortKey === 'posts' ? 'font-semibold' : 'text-gray-600'}`} style={rankSortKey === 'posts' && isBaylor ? { color: colors.green } : undefined}>
                          {formatNumber(school.posts)}
                        </td>
                        <td className={`px-4 py-3 text-right ${rankSortKey === 'adoption' ? 'font-semibold' : 'text-gray-600'}`} style={rankSortKey === 'adoption' && isBaylor ? { color: colors.green } : undefined}>
                          {school.adoption}%
                        </td>
                        <td className={`px-4 py-3 text-right ${rankSortKey === 'logo' ? 'font-semibold' : 'text-gray-600'}`} style={rankSortKey === 'logo' && isBaylor ? { color: colors.green } : undefined}>
                          {school.logo}%
                        </td>
                        <td className={`px-4 py-3 text-right ${rankSortKey === 'mention' ? 'font-semibold' : 'text-gray-600'}`} style={rankSortKey === 'mention' && isBaylor ? { color: colors.green } : undefined}>
                          {school.mention}%
                        </td>
                        <td className={`px-4 py-3 text-right ${rankSortKey === 'collab' ? 'font-semibold' : 'text-gray-600'}`} style={rankSortKey === 'collab' && isBaylor ? { color: colors.green } : undefined}>
                          {school.collab}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">* Based on {schools.length} {isConference ? 'SEC' : 'NCAA D1'} schools with available IP data</p>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface BaylorIPImpactProps {
  onBack?: () => void;
}

export function BaylorIPImpact({ onBack }: BaylorIPImpactProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: colors.lightBg }}>
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/baylor-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <img
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png"
                alt="Baylor"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1
                  className="text-2xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.green }}>IP </span>
                  <span style={{ color: colors.headerGold }}>IMPACT</span>
                </h1>
                <p className="text-sm text-gray-500">Baylor Athlete Social Media</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.green, color: colors.green }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 mt-4 -mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2"
                style={{
                  backgroundColor: activeTab === tab.id ? colors.white : 'transparent',
                  color: activeTab === tab.id ? colors.green : colors.textMuted,
                  borderColor: activeTab === tab.id ? colors.green : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'withvswithout' && <WithVsWithoutTab />}
        {activeTab === 'partnerships' && <PartnershipsTab />}
        {activeTab === 'bestcollaborators' && <BestCollaboratorsTab />}
        {activeTab === 'benchmark' && <BenchmarkTab />}
      </main>
    </div>
  );
}
