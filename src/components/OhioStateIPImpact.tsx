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
// OHIO STATE BRAND COLORS (matching JABA campaign dashboard style)
// ═══════════════════════════════════════════════════════════════
const colors = {
  scarlet: '#ba0c2f',
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
  headerGray: '#6b7280',   // Gray color for two-tone headers
};

// Two-tone header component matching JABA style
function SectionHeader({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <h2 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
      <span style={{ color: colors.scarlet }}>{primary}</span>
      <span style={{ color: colors.headerGray }}>{secondary}</span>
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
// OHIO STATE IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalFollowers: 5543153,
  totalPosts: 8918,
  totalLikes: 15258768,
  totalComments: 401948,
  engagementRate: 0.0283,

  baseline: {
    posts: 6517,
    engagementRate: 0.0276,
  },

  postsWithIP: 2686,
  ipAdoptionRate: 30.1,

  // Weighted average lift: (23*790.4 + 1206*159.3 + 1929*80.0) / 3158 = 115.5%
  avgLift: 115.5,

  // Total EMV: (likes × $0.20) + (comments × $2.00)
  totalEmv: 3855650,

  collaboration: {
    posts: 23,
    likes: 15118.96, // avg likes per post from source: 15118.95652173913
    comments: 204.17, // avg comments per post from source: 204.17391304347825
    engagementRate: 0.0027643, // 0.276% from source: 0.002764334745005705
    delta: 790.4, // from source: 790.3662699521296
    emv: 322.8,
    baselineEngRate: 0.0003105, // 0.031% - no collab eng rate from source
    baselinePosts: 8895,
    baselineLikes: 1676.33, // avg from source collaboration.no.likes
    baselineComments: 44.66, // avg from source collaboration.no.comments
  } as IPSignalData,

  logo: {
    posts: 1206,
    likes: 3676.50, // avg likes per post from source: 3676.495854063018
    comments: 70.32, // avg comments per post from source: 70.31923714759536
    engagementRate: 0.0006759, // 0.068% from source: 0.0006759357158661529
    delta: 159.3, // from source: 159.33809863867512
    emv: 80.56,
    baselineEngRate: 0.0002606, // 0.026% - no logo eng rate from source
    baselinePosts: 7712,
    baselineLikes: 1403.64, // avg from source logo.no.likes
    baselineComments: 41.12, // avg from source logo.no.comments
  } as IPSignalData,

  mention: {
    posts: 1929,
    likes: 2647.25, // avg likes per post from source: 2647.249351995853
    comments: 47.38, // avg comments per post from source: 47.37532400207361
    engagementRate: 0.0004861, // 0.049% from source: 0.0004861176799554201
    delta: 80.0, // from source: 79.99837958578766
    emv: 57.68,
    baselineEngRate: 0.0002701, // 0.027% - no mention eng rate from source
    baselinePosts: 6989,
    baselineLikes: 1452.59, // avg from source orgInCaption.no.likes
    baselineComments: 44.44, // avg from source orgInCaption.no.comments
  } as IPSignalData,

  partnerships: [
    { brand: "@redbullusa", posts: 1, avgLikes: 171980, avgComments: 631, emv: 3502.7, engagementRate: 3.113, liftMultiplier: 97.2 },
    { brand: "@epicpartner", posts: 1, avgLikes: 37682, avgComments: 121, emv: 765.74, engagementRate: 0.681, liftMultiplier: 20.5 },
    { brand: "@discover", posts: 1, avgLikes: 23610, avgComments: 114, emv: 483.6, engagementRate: 0.427, liftMultiplier: 12.5 },
    { brand: "@dickssportinggoods", posts: 2, avgLikes: 20788, avgComments: 174, emv: 433.21, engagementRate: 0.378, liftMultiplier: 10.9 },
    { brand: "@thehenrylegacy", posts: 1, avgLikes: 15460, avgComments: 226, emv: 331.8, engagementRate: 0.282, liftMultiplier: 7.9 },
    { brand: "@easportscollege", posts: 4, avgLikes: 14822, avgComments: 139, emv: 310.37, engagementRate: 0.269, liftMultiplier: 7.5 },
    { brand: "@gianteagle", posts: 2, avgLikes: 13628, avgComments: 153, emv: 287.87, engagementRate: 0.248, liftMultiplier: 6.8 },
    { brand: "@naturemadevitamins", posts: 1, avgLikes: 11208, avgComments: 21, emv: 226.26, engagementRate: 0.202, liftMultiplier: 5.3 },
    { brand: "@defensesoap", posts: 1, avgLikes: 10148, avgComments: 33, emv: 206.26, engagementRate: 0.183, liftMultiplier: 4.7 },
    { brand: "@lv", posts: 1, avgLikes: 10029, avgComments: 139, emv: 214.48, engagementRate: 0.183, liftMultiplier: 4.7 },
    { brand: "@rebelcrystalofficial", posts: 1, avgLikes: 9275, avgComments: 2, emv: 185.7, engagementRate: 0.167, liftMultiplier: 4.2 },
    { brand: "@paycom", posts: 1, avgLikes: 9006, avgComments: 33, emv: 183.42, engagementRate: 0.163, liftMultiplier: 4.1 },
    { brand: "@athleteps", posts: 1, avgLikes: 8334, avgComments: 45, emv: 171.18, engagementRate: 0.151, liftMultiplier: 3.7 },
    { brand: "@doordash", posts: 2, avgLikes: 7652, avgComments: 23, emv: 155.38, engagementRate: 0.138, liftMultiplier: 3.3 },
    { brand: "@cliffkeenathletic", posts: 1, avgLikes: 6996, avgComments: 16, emv: 141.52, engagementRate: 0.126, liftMultiplier: 2.9 },
    { brand: "@allstate", posts: 2, avgLikes: 6636, avgComments: 44, emv: 137.13, engagementRate: 0.12, liftMultiplier: 2.8 },
    { brand: "@keybank", posts: 2, avgLikes: 5581, avgComments: 48, emv: 116.47, engagementRate: 0.101, liftMultiplier: 2.2 },
    { brand: "@wingstop", posts: 2, avgLikes: 5565, avgComments: 258, emv: 137.1, engagementRate: 0.105, liftMultiplier: 2.3 },
    { brand: "@serialashaeco", posts: 1, avgLikes: 4917, avgComments: 72, emv: 105.54, engagementRate: 0.09, liftMultiplier: 1.8 },
    { brand: "@paycomsoftware", posts: 5, avgLikes: 4866, avgComments: 28, emv: 100.18, engagementRate: 0.088, liftMultiplier: 1.7 },
    { brand: "@the.courageousathlete", posts: 1, avgLikes: 4013, avgComments: 22, emv: 82.46, engagementRate: 0.072, liftMultiplier: 1.2 },
    { brand: "@directv", posts: 4, avgLikes: 3776, avgComments: 29, emv: 78.45, engagementRate: 0.068, liftMultiplier: 1.1 },
    { brand: "@jlabaudio", posts: 1, avgLikes: 3769, avgComments: 113, emv: 86.68, engagementRate: 0.07, liftMultiplier: 1.2 },
    { brand: "@rivalsdotcom", posts: 1, avgLikes: 2802, avgComments: 95, emv: 65.54, engagementRate: 0.052, liftMultiplier: 0.6 },
    { brand: "@leesfamouschick", posts: 1, avgLikes: 2797, avgComments: 27, emv: 58.64, engagementRate: 0.05, liftMultiplier: 0.6 },
    { brand: "@heydude", posts: 12, avgLikes: 2651, avgComments: 42, emv: 57.3, engagementRate: 0.048, liftMultiplier: 0.5 },
    { brand: "@nike_wrestling", posts: 1, avgLikes: 2646, avgComments: 20, emv: 54.92, engagementRate: 0.048, liftMultiplier: 0.5 },
    { brand: "@chipotle", posts: 2, avgLikes: 2366, avgComments: 35, emv: 50.87, engagementRate: 0.043, liftMultiplier: 0.3 },
    { brand: "@oikos", posts: 1, avgLikes: 2353, avgComments: 31, emv: 50.16, engagementRate: 0.043, liftMultiplier: 0.3 },
    { brand: "@celsiusbrandpartner", posts: 1, avgLikes: 2237, avgComments: 12, emv: 45.94, engagementRate: 0.04, liftMultiplier: 0.2 },
    { brand: "@gametimeapp", posts: 1, avgLikes: 2141, avgComments: 41, emv: 46.92, engagementRate: 0.039, liftMultiplier: 0.2 },
    { brand: "@peppermayo", posts: 2, avgLikes: 2060, avgComments: 34, emv: 44.66, engagementRate: 0.037, liftMultiplier: 0.1 },
    { brand: "@nash", posts: 1, avgLikes: 2007, avgComments: 18, emv: 41.94, engagementRate: 0.036, liftMultiplier: 0.1 },
    { brand: "@ricartautomotive", posts: 1, avgLikes: 1839, avgComments: 55, emv: 42.28, engagementRate: 0.034, liftMultiplier: 0 },
    { brand: "@seatgeek", posts: 2, avgLikes: 1753, avgComments: 23, emv: 37.36, engagementRate: 0.032, liftMultiplier: 0 },
    { brand: "@crackerbarrel", posts: 1, avgLikes: 1659, avgComments: 32, emv: 36.38, engagementRate: 0.03, liftMultiplier: -0.1 },
    { brand: "@aladdinseatery", posts: 1, avgLikes: 1656, avgComments: 32, emv: 36.32, engagementRate: 0.03, liftMultiplier: -0.1 },
    { brand: "@his_huddle", posts: 1, avgLikes: 1642, avgComments: 13, emv: 34.14, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@pressplay", posts: 1, avgLikes: 1627, avgComments: 26, emv: 35.14, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@mcdonalds_greaterohio", posts: 1, avgLikes: 1626, avgComments: 8, emv: 33.32, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@_yarn.lab_", posts: 1, avgLikes: 1622, avgComments: 101, emv: 42.54, engagementRate: 0.031, liftMultiplier: -0.1 },
    { brand: "@shootaway", posts: 2, avgLikes: 1471, avgComments: 38, emv: 33.22, engagementRate: 0.027, liftMultiplier: -0.2 },
    { brand: "@whereimfrom", posts: 3, avgLikes: 1461, avgComments: 30, emv: 32.25, engagementRate: 0.026, liftMultiplier: -0.2 },
    { brand: "@aabonnbc", posts: 1, avgLikes: 1427, avgComments: 28, emv: 31.34, engagementRate: 0.026, liftMultiplier: -0.2 },
    { brand: "@brooksrunning", posts: 6, avgLikes: 1310, avgComments: 30, emv: 29.22, engagementRate: 0.024, liftMultiplier: -0.3 },
    { brand: "@kinatraxinc", posts: 1, avgLikes: 1294, avgComments: 3, emv: 26.18, engagementRate: 0.023, liftMultiplier: -0.3 },
    { brand: "@wrestlingbucks", posts: 2, avgLikes: 1285, avgComments: 15, emv: 27.25, engagementRate: 0.023, liftMultiplier: -0.3 },
    { brand: "@stxmlax", posts: 2, avgLikes: 1231, avgComments: 5, emv: 25.13, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@qpeezy_0", posts: 1, avgLikes: 1221, avgComments: 16, emv: 26.02, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@gvartwork", posts: 1, avgLikes: 1213, avgComments: 47, emv: 28.96, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@krogerco", posts: 1, avgLikes: 1203, avgComments: 18, emv: 25.86, engagementRate: 0.022, liftMultiplier: -0.4 },
    { brand: "@littlewesttavern", posts: 1, avgLikes: 1172, avgComments: 28, emv: 26.24, engagementRate: 0.021, liftMultiplier: -0.4 },
    { brand: "@brody_marcet9", posts: 1, avgLikes: 1137, avgComments: 47, emv: 27.44, engagementRate: 0.021, liftMultiplier: -0.4 },
    { brand: "@nikelacrosse", posts: 2, avgLikes: 1085, avgComments: 34, emv: 25.15, engagementRate: 0.02, liftMultiplier: -0.4 },
    { brand: "@starbucks", posts: 1, avgLikes: 1068, avgComments: 16, emv: 22.96, engagementRate: 0.019, liftMultiplier: -0.4 },
    { brand: "@adoreme", posts: 1, avgLikes: 1042, avgComments: 71, emv: 27.94, engagementRate: 0.02, liftMultiplier: -0.4 },
    { brand: "@bauerhockey", posts: 2, avgLikes: 1039, avgComments: 38, emv: 24.64, engagementRate: 0.019, liftMultiplier: -0.4 },
    { brand: "@slimchickens", posts: 1, avgLikes: 985, avgComments: 16, emv: 21.3, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@hollister", posts: 45, avgLikes: 979, avgComments: 19, emv: 21.59, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@donatospizza", posts: 4, avgLikes: 972, avgComments: 18, emv: 21.28, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@kamaruclothing", posts: 1, avgLikes: 969, avgComments: 77, emv: 27.08, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@honeystinger", posts: 2, avgLikes: 964, avgComments: 18, emv: 21.08, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@alltohim_apparel", posts: 1, avgLikes: 956, avgComments: 36, emv: 22.72, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@bobboydlincoln", posts: 1, avgLikes: 950, avgComments: 35, emv: 22.5, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@phillies", posts: 1, avgLikes: 932, avgComments: 93, emv: 27.94, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@goodyearblimp", posts: 1, avgLikes: 915, avgComments: 18, emv: 20.1, engagementRate: 0.016, liftMultiplier: -0.5 },
    { brand: "@tmobile", posts: 1, avgLikes: 911, avgComments: 5, emv: 18.72, engagementRate: 0.016, liftMultiplier: -0.5 },
    { brand: "@yungluth", posts: 1, avgLikes: 835, avgComments: 10, emv: 17.7, engagementRate: 0.015, liftMultiplier: -0.6 },
    { brand: "@statefarm", posts: 1, avgLikes: 826, avgComments: 11, emv: 17.62, engagementRate: 0.015, liftMultiplier: -0.6 },
    { brand: "@nhljets", posts: 1, avgLikes: 785, avgComments: 34, emv: 19.1, engagementRate: 0.014, liftMultiplier: -0.6 },
    { brand: "@dickshouseofsport", posts: 1, avgLikes: 754, avgComments: 17, emv: 16.78, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@raisingcanes", posts: 1, avgLikes: 746, avgComments: 14, emv: 16.32, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@thefoundationohio", posts: 3, avgLikes: 744, avgComments: 13, emv: 16.18, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@gainbridgelife", posts: 1, avgLikes: 734, avgComments: 3, emv: 14.98, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@alex.dixon_", posts: 1, avgLikes: 696, avgComments: 43, emv: 18.22, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@neweracap", posts: 5, avgLikes: 688, avgComments: 16, emv: 15.38, engagementRate: 0.012, liftMultiplier: -0.6 },
    { brand: "@underarmour", posts: 1, avgLikes: 669, avgComments: 35, emv: 16.88, engagementRate: 0.012, liftMultiplier: -0.6 },
    { brand: "@princesspolly", posts: 2, avgLikes: 653, avgComments: 26, emv: 15.71, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@undrdawg", posts: 1, avgLikes: 641, avgComments: 36, emv: 16.42, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@thriveresidents", posts: 3, avgLikes: 637, avgComments: 50, emv: 17.75, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@olyforest", posts: 2, avgLikes: 627, avgComments: 16, emv: 14.14, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@nolteroofing", posts: 1, avgLikes: 626, avgComments: 0, emv: 12.52, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@hockeycanada", posts: 1, avgLikes: 622, avgComments: 53, emv: 17.73, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@gatorade", posts: 2, avgLikes: 615, avgComments: 30, emv: 15.35, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@ohiobeef", posts: 1, avgLikes: 615, avgComments: 14, emv: 13.7, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@dannydlawn", posts: 2, avgLikes: 612, avgComments: 47, emv: 16.98, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@rhoback", posts: 1, avgLikes: 591, avgComments: 3, emv: 12.12, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@tytusgrills", posts: 3, avgLikes: 576, avgComments: 9, emv: 12.45, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@puregreenhighstreet", posts: 1, avgLikes: 567, avgComments: 1, emv: 11.44, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@carterscamera", posts: 1, avgLikes: 565, avgComments: 84, emv: 19.7, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@7brewcoffee", posts: 2, avgLikes: 560, avgComments: 6, emv: 11.8, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@raisinbran_us", posts: 1, avgLikes: 559, avgComments: 28, emv: 13.98, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@allinklusivesports", posts: 1, avgLikes: 557, avgComments: 14, emv: 12.54, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@popeyes", posts: 3, avgLikes: 554, avgComments: 15, emv: 12.63, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@ikoniik.co", posts: 1, avgLikes: 531, avgComments: 9, emv: 11.52, engagementRate: 0.009, liftMultiplier: -0.7 },
    { brand: "@theviewonfifth", posts: 7, avgLikes: 530, avgComments: 4, emv: 11.07, engagementRate: 0.009, liftMultiplier: -0.7 },
    { brand: "@liquidiv", posts: 1, avgLikes: 523, avgComments: 41, emv: 14.56, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@bankofamerica", posts: 1, avgLikes: 497, avgComments: 19, emv: 11.84, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@clever_made", posts: 6, avgLikes: 483, avgComments: 23, emv: 12, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@brittanyshope", posts: 1, avgLikes: 464, avgComments: 36, emv: 12.88, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@clevermade", posts: 1, avgLikes: 463, avgComments: 18, emv: 11.06, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@glocknerautomotive", posts: 1, avgLikes: 462, avgComments: 11, emv: 10.34, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@americaneagle", posts: 17, avgLikes: 447, avgComments: 30, emv: 11.95, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@citybarbecue", posts: 1, avgLikes: 444, avgComments: 2, emv: 9.08, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@palshealth", posts: 1, avgLikes: 439, avgComments: 15, emv: 10.28, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@colab_collective", posts: 4, avgLikes: 412, avgComments: 11, emv: 9.36, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@ohiostswimdive", posts: 1, avgLikes: 410, avgComments: 33, emv: 11.5, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@chickfila", posts: 3, avgLikes: 406, avgComments: 34, emv: 11.53, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@big_tasty_hawk", posts: 1, avgLikes: 406, avgComments: 2, emv: 8.32, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@gooseitcompany", posts: 1, avgLikes: 403, avgComments: 0, emv: 8.06, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@comfrt", posts: 1, avgLikes: 394, avgComments: 14, emv: 9.27, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@pursuityourself", posts: 14, avgLikes: 391, avgComments: 12, emv: 9.08, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@xx_xyathletics", posts: 1, avgLikes: 387, avgComments: 5, emv: 8.24, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@statsports", posts: 1, avgLikes: 383, avgComments: 6, emv: 8.26, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@laorganicsco", posts: 1, avgLikes: 362, avgComments: 23, emv: 9.53, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@jesselee_pakele", posts: 1, avgLikes: 362, avgComments: 21, emv: 9.34, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@ohiopoultry", posts: 1, avgLikes: 359, avgComments: 3, emv: 7.48, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@c4energy", posts: 11, avgLikes: 358, avgComments: 35, emv: 10.69, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@prodigydanceconvention", posts: 1, avgLikes: 343, avgComments: 10, emv: 7.86, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@spartancombat", posts: 1, avgLikes: 341, avgComments: 6, emv: 7.42, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@newbalance", posts: 1, avgLikes: 336, avgComments: 3, emv: 7.02, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@dwccollection", posts: 1, avgLikes: 330, avgComments: 32, emv: 9.8, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@ritfit.sports", posts: 1, avgLikes: 329, avgComments: 8, emv: 7.38, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@fanoutfitters", posts: 1, avgLikes: 324, avgComments: 7, emv: 7.18, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@ritzpartner", posts: 1, avgLikes: 313, avgComments: 7, emv: 6.96, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@bwwings", posts: 1, avgLikes: 308, avgComments: 11, emv: 7.26, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkolipop", posts: 5, avgLikes: 302, avgComments: 18, emv: 7.85, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@vertical_protein", posts: 1, avgLikes: 295, avgComments: 49, emv: 10.8, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@carhartt", posts: 2, avgLikes: 290, avgComments: 11, emv: 6.96, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkunwell", posts: 1, avgLikes: 289, avgComments: 14, emv: 7.18, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@ramblercolumbus", posts: 5, avgLikes: 285, avgComments: 6, emv: 6.35, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@bckr.hq", posts: 2, avgLikes: 283, avgComments: 5, emv: 6.21, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drpepper", posts: 4, avgLikes: 280, avgComments: 42, emv: 9.84, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkbubblr", posts: 3, avgLikes: 278, avgComments: 16, emv: 7.2, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@rmhcofcentraloh", posts: 1, avgLikes: 278, avgComments: 9, emv: 6.46, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@thebuckeyecorner", posts: 2, avgLikes: 273, avgComments: 12, emv: 6.71, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@homage", posts: 3, avgLikes: 264, avgComments: 21, emv: 7.45, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@foresightsports_upnext", posts: 3, avgLikes: 264, avgComments: 13, emv: 6.58, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@porkrindsdotcom", posts: 1, avgLikes: 261, avgComments: 17, emv: 6.92, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@vegiworks", posts: 1, avgLikes: 258, avgComments: 11, emv: 6.26, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@amazon", posts: 5, avgLikes: 257, avgComments: 17, emv: 6.65, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@monsterenergy", posts: 1, avgLikes: 255, avgComments: 5, emv: 5.6, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@gymshark", posts: 1, avgLikes: 245, avgComments: 5, emv: 5.4, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@elf.skin", posts: 1, avgLikes: 241, avgComments: 14, emv: 6.14, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@boohoo", posts: 1, avgLikes: 237, avgComments: 5, emv: 5.24, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@tiktok", posts: 1, avgLikes: 236, avgComments: 3, emv: 5.02, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@skims", posts: 1, avgLikes: 234, avgComments: 6, emv: 5.28, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@revahealth", posts: 1, avgLikes: 232, avgComments: 6, emv: 5.24, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@thecollectiveclub", posts: 6, avgLikes: 230, avgComments: 9, emv: 5.69, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@hyperice", posts: 2, avgLikes: 229, avgComments: 9, emv: 5.66, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@creamofwheat", posts: 1, avgLikes: 227, avgComments: 26, emv: 6.92, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@rawnutrition", posts: 1, avgLikes: 226, avgComments: 9, emv: 5.54, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@trophynuts", posts: 2, avgLikes: 226, avgComments: 10, emv: 5.66, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@pnwcomponents", posts: 1, avgLikes: 224, avgComments: 0, emv: 4.48, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@chubbiesshorts", posts: 1, avgLikes: 222, avgComments: 13, emv: 5.78, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@brewed.fresh.daily", posts: 1, avgLikes: 221, avgComments: 7, emv: 5.2, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@lionsnotsheep", posts: 2, avgLikes: 217, avgComments: 15, emv: 5.84, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@drinkag1", posts: 1, avgLikes: 217, avgComments: 5, emv: 4.84, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@primesports", posts: 2, avgLikes: 216, avgComments: 2, emv: 4.52, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@fanatics", posts: 1, avgLikes: 215, avgComments: 0, emv: 4.3, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@flonaseallergy", posts: 1, avgLikes: 210, avgComments: 3, emv: 4.5, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bngsportnutrition", posts: 1, avgLikes: 205, avgComments: 6, emv: 4.82, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidasrunning", posts: 1, avgLikes: 204, avgComments: 4, emv: 4.52, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidasfootball", posts: 3, avgLikes: 202, avgComments: 5, emv: 4.6, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@eatsurgent", posts: 1, avgLikes: 197, avgComments: 26, emv: 6.34, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@adidasbaseball", posts: 1, avgLikes: 196, avgComments: 8, emv: 4.8, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@buffalowildwings", posts: 1, avgLikes: 195, avgComments: 3, emv: 4.22, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@kindsnacks", posts: 1, avgLikes: 193, avgComments: 8, emv: 4.74, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidas", posts: 3, avgLikes: 192, avgComments: 11, emv: 5.11, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bodybuildingcom", posts: 1, avgLikes: 191, avgComments: 3, emv: 4.16, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@eatumami", posts: 1, avgLikes: 190, avgComments: 7, emv: 4.62, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@kelloggs", posts: 1, avgLikes: 188, avgComments: 5, emv: 4.36, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@buckedupsupp", posts: 4, avgLikes: 187, avgComments: 8, emv: 4.67, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@paniniamerica", posts: 2, avgLikes: 186, avgComments: 8, emv: 4.62, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@reebok", posts: 1, avgLikes: 186, avgComments: 6, emv: 4.44, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bambooboutique", posts: 1, avgLikes: 16, avgComments: 0, emv: 0.32, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@powerade_us", posts: 1, avgLikes: 3, avgComments: 137, emv: 13.76, engagementRate: 0.002, liftMultiplier: -1 },
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
      style={{ backgroundColor: colors.scarlet }}
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
            style={{ backgroundColor: `${colors.scarlet}15` }}
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
  { id: 'benchmark', label: 'Benchmark' },
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
          Data reflects <span className="font-semibold">Ohio State athlete personal social media accounts</span>, not official team pages.
          Metrics track how athletes use Ohio State IP (logos, mentions, collaborations) in their own content.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Total Likes"
          value={formatNumber(ipData.totalLikes)}
          subLabel="across all athletes"
          icon={<Heart className="w-8 h-8 text-white" />}
          tooltip="Sum of all likes on posts from Ohio State athletes' personal accounts"
        />
        <KPICard
          label="Total Comments"
          value={formatNumber(ipData.totalComments)}
          subLabel="across all athletes"
          icon={<MessageCircle className="w-8 h-8 text-white" />}
          tooltip="Sum of all comments on posts from Ohio State athletes' personal accounts"
        />
        <KPICard
          label="IP Usage"
          value={ipData.ipAdoptionRate + '%'}
          subLabel="adoption rate"
          icon={<Percent className="w-8 h-8 text-white" />}
          tooltip="Percent of athlete posts containing any Ohio State IP signal"
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
            icon={<Users className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={ipData.collaboration.posts}
            delta={ipData.collaboration.delta}
            avgEngagement={formatPercent(ipData.collaboration.engagementRate)}
            emv="—"
            tooltip="Athlete posts co-authored or tagged with official Ohio State account"
          />
          <IPModeCard
            title="Visual IP"
            icon={<Tag className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={ipData.logo.posts}
            delta={ipData.logo.delta}
            avgEngagement={formatPercent(ipData.logo.engagementRate)}
            emv="—"
            tooltip="Athlete posts with Ohio State logo detected in media"
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={ipData.mention.posts}
            delta={ipData.mention.delta}
            avgEngagement={formatPercent(ipData.mention.engagementRate)}
            emv="—"
            tooltip="Athlete posts with @mention or text reference to Ohio State"
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
  const [selectedSport, setSelectedSport] = useState<string>('ALL_SPORTS');

  // Sport data (would be loaded from /data/ohio-state-by-sport.json)
  const sportData: any = {
    'ALL_SPORTS': {
      mention: { with: { posts: 1929, avgLikes: 2647, avgComments: 47, engagementRate: 0.00049 }, without: { posts: 6989, avgLikes: 1453, avgComments: 44, engagementRate: 0.00027 } },
      logo: { with: { posts: 1206, avgLikes: 3676, avgComments: 70, engagementRate: 0.00068 }, without: { posts: 7712, avgLikes: 1404, avgComments: 41, engagementRate: 0.00026 } },
      collab: { with: { posts: 23, avgLikes: 15119, avgComments: 204, engagementRate: 0.00276 }, without: { posts: 8895, avgLikes: 1676, avgComments: 45, engagementRate: 0.00031 } }
    },
    'FOOTBALL': {
      mention: { with: { posts: 309, avgLikes: 8500, avgComments: 120, engagementRate: 0.0015 }, without: { posts: 1189, avgLikes: 6200, avgComments: 92, engagementRate: 0.0011 } },
      logo: { with: { posts: 344, avgLikes: 9100, avgComments: 125, engagementRate: 0.0016 }, without: { posts: 1154, avgLikes: 5800, avgComments: 88, engagementRate: 0.001 } },
      collab: { with: { posts: 22, avgLikes: 18000, avgComments: 250, engagementRate: 0.0032 }, without: { posts: 1476, avgLikes: 6650, avgComments: 98, engagementRate: 0.0012 } }
    },
    'MENS_BASKETBALL': {
      mention: { with: { posts: 82, avgLikes: 4200, avgComments: 52, engagementRate: 0.0014 }, without: { posts: 130, avgLikes: 2400, avgComments: 31, engagementRate: 0.00085 } },
      logo: { with: { posts: 55, avgLikes: 5100, avgComments: 61, engagementRate: 0.0017 }, without: { posts: 157, avgLikes: 2200, avgComments: 30, engagementRate: 0.00075 } },
      collab: { with: { posts: 1, avgLikes: 12000, avgComments: 180, engagementRate: 0.004 }, without: { posts: 211, avgLikes: 3000, avgComments: 38, engagementRate: 0.001 } }
    },
    'MENS_WRESTLING': {
      mention: { with: { posts: 148, avgLikes: 1800, avgComments: 42, engagementRate: 0.00062 }, without: { posts: 320, avgLikes: 980, avgComments: 28, engagementRate: 0.00034 } },
      logo: { with: { posts: 96, avgLikes: 2100, avgComments: 48, engagementRate: 0.00072 }, without: { posts: 372, avgLikes: 900, avgComments: 26, engagementRate: 0.00031 } },
      collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 468, avgLikes: 1250, avgComments: 32, engagementRate: 0.00043 } }
    },
    'WOMENS_BASKETBALL': {
      mention: { with: { posts: 122, avgLikes: 2650, avgComments: 38, engagementRate: 0.00089 }, without: { posts: 263, avgLikes: 1420, avgComments: 24, engagementRate: 0.00048 } },
      logo: { with: { posts: 88, avgLikes: 3100, avgComments: 44, engagementRate: 0.00105 }, without: { posts: 297, avgLikes: 1300, avgComments: 22, engagementRate: 0.00044 } },
      collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 385, avgLikes: 1850, avgComments: 28, engagementRate: 0.00063 } }
    },
    'MENS_GYMNASTICS': {
      mention: { with: { posts: 100, avgLikes: 920, avgComments: 22, engagementRate: 0.00031 }, without: { posts: 128, avgLikes: 530, avgComments: 14, engagementRate: 0.00018 } },
      logo: { with: { posts: 59, avgLikes: 1100, avgComments: 26, engagementRate: 0.00037 }, without: { posts: 169, avgLikes: 490, avgComments: 13, engagementRate: 0.00017 } },
      collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 228, avgLikes: 692, avgComments: 17, engagementRate: 0.00024 } }
    }
  };

  const sports = [
    { id: 'ALL_SPORTS', label: 'All Sports', icon: '🏆' },
    { id: 'FOOTBALL', label: 'Football', icon: '🏈' },
    { id: 'MENS_BASKETBALL', label: "Men's Basketball", icon: '🏀' },
    { id: 'WOMENS_BASKETBALL', label: "Women's Basketball", icon: '🏀' },
    { id: 'MENS_WRESTLING', label: 'Wrestling', icon: '🤼' },
    { id: 'MENS_GYMNASTICS', label: "Men's Gymnastics", icon: '🤸' },
  ];

  // Get data for selected sport and signal
  const currentSportData = sportData[selectedSport];
  const currentSignalData = currentSportData?.[selectedSignal];

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
        {/* Sport Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Team/Sport</p>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 pr-10 text-sm font-semibold rounded-lg border border-gray-200 appearance-none cursor-pointer transition-colors hover:border-gray-300"
              style={{
                backgroundColor: colors.white,
                color: colors.text,
              }}
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.icon} {sport.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

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
                  backgroundColor: selectedSignal === signal.id ? colors.scarlet : colors.white,
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
                  backgroundColor: selectedMetric === metric.id ? colors.scarlet : colors.white,
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
            style={{ borderColor: colors.scarlet, backgroundColor: `${colors.scarlet}08` }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.scarlet }}>
              Without {currentSignal?.label}
            </p>
            <p className="text-4xl font-black" style={{ color: colors.scarlet }}>
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

        {/* Middle Column - Gradient Distribution Slider */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-3 px-4">
          <div className="space-y-2">
            {/* Labels */}
            <div className="flex justify-between text-xs uppercase tracking-wider text-gray-400">
              <span>WITHOUT {currentSignal?.label.toUpperCase()}</span>
              <span>WITH {currentSignal?.label.toUpperCase()}</span>
            </div>

            {/* Gradient Slider Bar */}
            <div className="relative">
              <div
                className="h-16 rounded-lg overflow-hidden shadow-inner"
                style={{
                  background: `linear-gradient(90deg, #9ca3af 0%, ${colors.scarlet} 100%)`
                }}
              >
                {/* Without Marker */}
                <div
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center transition-all duration-500"
                  style={{
                    left: `${maxValue > 0 ? (metricValues.withoutRaw / maxValue) * 100 : 0}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="w-1 h-full bg-white shadow-lg"></div>
                  <div
                    className="absolute -bottom-10 px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: colors.gray, color: colors.white }}
                  >
                    {metricValues.withoutValue}
                  </div>
                </div>

                {/* With Marker */}
                <div
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center transition-all duration-500"
                  style={{
                    left: `${maxValue > 0 ? (metricValues.withRaw / maxValue) * 100 : 0}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="w-1 h-full bg-white shadow-lg"></div>
                  <div
                    className="absolute -top-10 px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: colors.scarlet, color: colors.white }}
                  >
                    {metricValues.withValue}
                  </div>
                </div>
              </div>

              {/* Scale */}
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span>{metricValues.isPercent ? formatPercent(maxValue / 2) : formatNumber(Math.round(maxValue / 2))}</span>
                <span>{metricValues.isPercent ? formatPercent(maxValue) : formatNumber(Math.round(maxValue))}</span>
              </div>
            </div>

            {/* Lift Indicator */}
            <div className="flex items-center justify-center gap-2 pt-4">
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
                <span className="font-bold" style={{ color: colors.scarlet }}>
                  {Math.abs(likesDelta).toFixed(0)}% more likes
                </span>{' '}
                and{' '}
                <span className="font-bold" style={{ color: colors.scarlet }}>
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
                  backgroundColor: sortKey === option.key ? colors.scarlet : colors.white,
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
            <span style={{ color: colors.scarlet }}>TOP 10 </span>
            <span style={{ color: colors.headerGray }}>BY {sortOptions.find(o => o.key === sortKey)?.label.toUpperCase()}</span>
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {top10.map((partner, idx) => (
            <div
              key={partner.brand}
              className="rounded-2xl p-4 bg-white hover:shadow-lg transition-shadow"
              style={{
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                borderLeft: idx < 3 ? `4px solid ${colors.scarlet}` : 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: idx < 3 ? colors.scarlet : colors.gray,
                    color: colors.white,
                  }}
                >
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-gray-900 truncate flex-1" title={partner.brand}>
                  {partner.brand.replace('@', '')}
                </p>
              </div>
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>
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
                <tr style={{ backgroundColor: colors.scarlet }}>
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
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {partnership.brand}
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

// Top 5 Athletes by Collab (posts with isOrganizationCollaboration)
const topCollabAthletes = [
  { rank: 1, name: "Davison Igbinosun", sport: "Football", posts: 2, emv: 16154, lift: 694 },
  { rank: 2, name: "Jeremiah Smith", sport: "Football", posts: 1, emv: 13056, lift: 694 },
  { rank: 3, name: "Brandon Inniss", sport: "Football", posts: 1, emv: 10714, lift: 694 },
  { rank: 4, name: "Jermaine Mathews Jr.", sport: "Football", posts: 2, emv: 9047, lift: 694 },
  { rank: 5, name: "Kayden McDonald", sport: "Football", posts: 2, emv: 6720, lift: 694 },
];

// Top 5 Athletes by Logo (posts with hasOrganizationLogo)
const topLogoAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 12, emv: 145803, lift: 144 },
  { rank: 2, name: "Julian Sayin", sport: "Football", posts: 2, emv: 76500, lift: 144 },
  { rank: 3, name: "Caleb Downs", sport: "Football", posts: 11, emv: 71398, lift: 144 },
  { rank: 4, name: "Brandon Inniss", sport: "Football", posts: 9, emv: 64552, lift: 144 },
  { rank: 5, name: "James Peoples", sport: "Football", posts: 10, emv: 36586, lift: 144 },
];

// Top 5 Athletes by Mention (posts with hasOrganizationInCaption)
const topMentionAthletes = [
  { rank: 1, name: "Caleb Downs", sport: "Football", posts: 7, emv: 76113, lift: 44 },
  { rank: 2, name: "Carson Hinzman", sport: "Football", posts: 10, emv: 55665, lift: 44 },
  { rank: 3, name: "Quincy Porter", sport: "Football", posts: 8, emv: 45994, lift: 44 },
  { rank: 4, name: "JJ Coleman", sport: "W. Gymnastics", posts: 3, emv: 31904, lift: 44 },
  { rank: 5, name: "John Mobley Jr.", sport: "M. Basketball", posts: 14, emv: 26776, lift: 44 },
];

// Signal summary stats
const signalStats = {
  collab: { posts: 23, totalEmv: 79086, avgEmv: 3439, lift: 694 },
  logo: { posts: 735, totalEmv: 775595, avgEmv: 1055, lift: 144 },
  mention: { posts: 1929, totalEmv: 1204091, avgEmv: 624, lift: 44 },
};

// Reusable athlete table component for IP signals
function IPSignalTable({
  title,
  icon,
  athletes,
  avgEmv,
  lift,
}: {
  title: string;
  icon: React.ReactNode;
  athletes: typeof topCollabAthletes;
  avgEmv: number;
  lift: number;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{ backgroundColor: colors.scarlet }}
      >
        {/* Polka dot pattern */}
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
      <div className="grid grid-cols-[40px_1fr_70px_90px_70px] gap-2 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
        <span className="text-center">#</span>
        <span>Athlete</span>
        <span className="text-center">Posts</span>
        <span className="text-right">EMV</span>
        <span className="text-right">Lift</span>
      </div>

      {/* Table Body */}
      <div>
        {athletes.map((athlete, idx) => (
          <div
            key={athlete.name}
            className={`grid grid-cols-[40px_1fr_70px_90px_70px] gap-2 px-5 py-3 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto"
              style={{
                backgroundColor: idx < 3 ? colors.scarlet : 'transparent',
                color: idx < 3 ? 'white' : colors.scarlet,
                border: idx >= 3 ? `2px solid ${colors.scarlet}` : 'none',
              }}
            >
              {athlete.rank}
            </span>
            <div>
              <p className="text-gray-900 font-semibold">{athlete.name}</p>
              <p className="text-xs text-gray-500">{athlete.sport}</p>
            </div>
            <span className="text-center text-gray-600">{athlete.posts}</span>
            <span className="text-right font-bold" style={{ color: colors.scarlet }}>{formatCurrency(athlete.emv)}</span>
            <span className="text-right font-medium" style={{ color: colors.positive }}>+{lift}%</span>
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
          style={{ backgroundColor: colors.scarlet }}
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
          style={{ backgroundColor: colors.scarlet }}
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
          style={{ backgroundColor: colors.scarlet }}
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
          athletes={topCollabAthletes}
          avgEmv={signalStats.collab.avgEmv}
          lift={signalStats.collab.lift}
        />
        <IPSignalTable
          title="logo"
          icon={<Tag className="w-5 h-5 text-white" />}
          athletes={topLogoAthletes}
          avgEmv={signalStats.logo.avgEmv}
          lift={signalStats.logo.lift}
        />
        <IPSignalTable
          title="mention"
          icon={<AtSign className="w-5 h-5 text-white" />}
          athletes={topMentionAthletes}
          avgEmv={signalStats.mention.avgEmv}
          lift={signalStats.mention.lift}
        />
      </div>

      {/* Info Banner */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Top 5 athletes</span> for each IP signal type, ranked by total EMV.
          Lift represents engagement increase vs posts without any IP signals.
          EMV formula: (likes × $0.20) + (comments × $2.00).
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BENCHMARK TAB
// ═══════════════════════════════════════════════════════════════

// Big 10 Conference benchmark data (17 schools - all current Big 10 members)
const big10Schools = [
  { name: 'Nebraska', conf: 'Big 10', followers: 3012749, posts: 3049, ipPosts: 1658, adoption: 54.4, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Indiana', conf: 'Big 10', followers: 900000, posts: 1635, ipPosts: 831, adoption: 50.8, logo: 50.8, mention: 0, collab: 0 },
  { name: 'Michigan', conf: 'Big 10', followers: 4500000, posts: 4042, ipPosts: 2024, adoption: 50.1, logo: 50.0, mention: 0, collab: 0.1 },
  { name: 'Michigan State', conf: 'Big 10', followers: 802304, posts: 2216, ipPosts: 1039, adoption: 46.9, logo: 38.3, mention: 20.1, collab: 2.93 },
  { name: 'Oregon', conf: 'Big 10', followers: 1800000, posts: 2073, ipPosts: 948, adoption: 45.7, logo: 44.9, mention: 0, collab: 2.36 },
  { name: 'Maryland', conf: 'Big 10', followers: 858916, posts: 2120, ipPosts: 925, adoption: 43.6, logo: 38.1, mention: 18.5, collab: 0 },
  { name: 'Rutgers', conf: 'Big 10', followers: 800000, posts: 2036, ipPosts: 732, adoption: 35.9, logo: 35.9, mention: 0, collab: 0 },
  { name: 'Purdue', conf: 'Big 10', followers: 1300000, posts: 5142, ipPosts: 1772, adoption: 34.5, logo: 31.4, mention: 12.7, collab: 3.29 },
  { name: 'Iowa', conf: 'Big 10', followers: 1500000, posts: 2254, ipPosts: 753, adoption: 33.4, logo: 33.4, mention: 0, collab: 0 },
  { name: 'Ohio State', conf: 'Big 10', followers: 5543153, posts: 8918, ipPosts: 2401, adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 },
  { name: 'Washington', conf: 'Big 10', followers: 1600000, posts: 2344, ipPosts: 615, adoption: 26.2, logo: 24.1, mention: 0, collab: 4.14 },
  { name: 'Penn State', conf: 'Big 10', followers: 4032162, posts: 7202, ipPosts: 1686, adoption: 23.4, logo: 7.6, mention: 18.8, collab: 0.01 },
  { name: 'Minnesota', conf: 'Big 10', followers: 1200000, posts: 2354, ipPosts: 357, adoption: 15.2, logo: 11.5, mention: 0, collab: 5.35 },
  { name: 'Illinois', conf: 'Big 10', followers: 1100000, posts: 2731, ipPosts: 374, adoption: 13.7, logo: 12.6, mention: 0, collab: 1.90 },
  { name: 'Wisconsin', conf: 'Big 10', followers: 2000000, posts: 5664, ipPosts: 510, adoption: 9.0, logo: 9.0, mention: 0, collab: 0 },
  { name: 'UCLA', conf: 'Big 10', followers: 2500000, posts: 6482, ipPosts: 514, adoption: 7.9, logo: 7.9, mention: 0, collab: 0 },
  { name: 'USC', conf: 'Big 10', followers: 3000000, posts: 5328, ipPosts: 353, adoption: 6.6, logo: 6.6, mention: 0, collab: 0.02 },
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
  { name: 'Baylor', conf: 'Big 12', posts: 6486, adoption: 38.3, logo: 29.8, mention: 21.9, collab: 2.99 },
  { name: 'Alabama', conf: 'SEC', posts: 5653, adoption: 37.4, logo: 33.0, mention: 16.7, collab: 2.49 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 35.9, logo: 35.9, mention: 0, collab: 0 },
  { name: 'Purdue', conf: 'Big 10', posts: 5142, adoption: 34.4, logo: 31.4, mention: 12.7, collab: 3.28 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.3, logo: 34.3, mention: 0, collab: 0 },
  { name: 'Arkansas', conf: 'SEC', posts: 5597, adoption: 34.0, logo: 31.1, mention: 10.3, collab: 0.91 },
  { name: 'Auburn', conf: 'SEC', posts: 5314, adoption: 33.7, logo: 12.3, mention: 25.9, collab: 0.39 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 0, collab: 0 },
  { name: 'Texas A&M', conf: 'SEC', posts: 3419, adoption: 32.3, logo: 15.4, mention: 24.5, collab: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 6782, adoption: 31.0, logo: 27.4, mention: 10.9, collab: 3.05 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 29.9, logo: 29.2, mention: 0, collab: 1.06 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 28.1, logo: 23.1, mention: 11.9, collab: 0.25 },
  { name: 'Texas', conf: 'SEC', posts: 5723, adoption: 27.1, logo: 27.1, mention: 0, collab: 0 },
  { name: 'Ohio State', conf: 'Big 10', posts: 8918, adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 },
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
  adoption: 30.8,
  logo: 27.0,
  mention: 6.6,
  collab: 1.2,
};

const ncaaD1Avg = {
  adoption: 31.4,
  logo: 28.1,
  mention: 6.5,
  collab: 1.3,
};

const ohioStateRank = {
  conference: { adoption: 10, logo: 14, mention: 1, collab: 7, total: 17 },
  ncaa: { adoption: 41, logo: 66, mention: 6, collab: 35, total: 71 },
};

function BenchmarkTab() {
  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');

  // Dynamic data based on benchmark type
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big10Schools : ncaaD1Schools;
  const avg = isConference ? conferenceAvg : ncaaD1Avg;
  const ranks = isConference ? ohioStateRank.conference : ohioStateRank.ncaa;
  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';

  // Ohio State metrics
  const ohioState = { adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 };
  const adoptionDelta = ohioState.adoption - avg.adoption;
  const logoDelta = ohioState.logo - avg.logo;
  const mentionDelta = ohioState.mention - avg.mention;
  const collabDelta = ohioState.collab - avg.collab;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Benchmark</span> shows how often Ohio State athletes use IP elements (logos, mentions, collaborations) in social content compared to other schools.
        </p>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.scarlet }}></span> {benchmarkLabel}: Compare against {isConference ? 'other Big 10 schools' : '71 NCAA D1 schools'}</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setBenchmarkType('conference')}
            className="px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: benchmarkType === 'conference' ? colors.scarlet : colors.white,
              color: benchmarkType === 'conference' ? colors.white : colors.text,
            }}
          >
            🏈 Big 10
          </button>
          <button
            onClick={() => setBenchmarkType('ncaa')}
            className="px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: benchmarkType === 'ncaa' ? colors.scarlet : colors.white,
              color: benchmarkType === 'ncaa' ? colors.white : colors.text,
            }}
          >
            🏆 NCAA D1
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
            <p className="text-4xl font-black" style={{ color: colors.scarlet }}>#{ranks.adoption}</p>
            <p className="text-sm text-gray-500 mb-1">of {ranks.total} schools</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs {benchmarkLabel}</p>
        </div>

        {/* Your Adoption */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Your IP Adoption</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{ohioState.adoption}%</p>
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
              ? <>Ohio State leads the Big 10 in <span className="font-semibold">mention rate</span> ({ohioState.mention}%), outperforming the conference average by {mentionDelta.toFixed(1)}%.</>
              : <>Ohio State ranks <span className="font-semibold">#{ranks.mention} in mention rate</span> among {ranks.total} NCAA D1 schools, with {ohioState.mention}% vs {avg.mention}% average.</>
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.scarlet}15` }}>
                <Tag className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Visual IP</h4>
                <p className="text-xs text-gray-500">% of posts with visual IP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ranks.logo}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ohio State</span>
                <span className="font-semibold">{ohioState.logo}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ohioState.logo / 60) * 100}%`, backgroundColor: colors.scarlet }} />
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
                <span className="text-gray-600">Ohio State</span>
                <span className="font-semibold">{ohioState.mention}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ohioState.mention / 30) * 100}%`, backgroundColor: colors.positive }} />
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
              {mentionDelta >= 0 ? '↑' : '↓'} {Math.abs(mentionDelta).toFixed(1)}% vs {benchmarkLabel.toLowerCase()} {isConference && '• #1 in Big 10'}
            </span>
          </div>
        </div>

        {/* Collaboration */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.scarlet}15` }}>
                <Users className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Collaboration</h4>
                <p className="text-xs text-gray-500">% of posts with collabs</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ranks.collab}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ohio State</span>
                <span className="font-semibold">{ohioState.collab}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ohioState.collab / 10) * 100}%`, backgroundColor: colors.scarlet }} />
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.scarlet}15` }}>
                <Percent className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">IP Adoption</h4>
                <p className="text-xs text-gray-500">% of posts with any IP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ranks.adoption}</p>
              <p className="text-xs text-gray-400">of {ranks.total} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ohio State</span>
                <span className="font-semibold">{ohioState.adoption}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ohioState.adoption / 60) * 100}%`, backgroundColor: colors.scarlet }} />
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
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <SectionHeader primary="PERFORMANCE " secondary="DISTRIBUTION" />
        <p className="text-sm text-gray-500 mt-2 mb-4">How Ohio State's IP adoption compares across {benchmarkLabel.toLowerCase()}</p>

        {/* Filters for metric selection */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">View by:</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold rounded-md" style={{ backgroundColor: colors.scarlet, color: colors.white }}>
              IP ADOPTION
            </button>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="relative mb-8">
          {/* Labels */}
          <div className="flex justify-between text-xs uppercase tracking-wider text-gray-400 mb-3">
            <span>WORST</span>
            <span>AVERAGE</span>
            <span>TOP</span>
          </div>

          {/* Bar */}
          <div className="relative h-12 rounded-lg overflow-hidden" style={{ background: `linear-gradient(90deg, #e5e7eb 0%, #9ca3af 50%, #374151 100%)` }}>
            {/* Ohio State Marker */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
              style={{
                left: `${((ohioState.adoption - 5) / 55) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="w-1 h-full" style={{ backgroundColor: colors.scarlet }}></div>
              <div
                className="absolute -top-12 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
                style={{ backgroundColor: colors.scarlet }}
              >
                <p className="text-white font-bold text-sm">OHIO STATE</p>
                <p className="text-white text-xs">Top {Math.round(((ranks.adoption) / ranks.total) * 100)}%</p>
                <p className="text-white text-xs opacity-90">of {isConference ? 'conference' : 'D1 schools'}</p>
              </div>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>6.6%</span>
            <span>{avg.adoption.toFixed(1)}%</span>
            <span>60.8%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">WORST</p>
            <p className="text-2xl font-bold text-gray-900">6.6%</p>
            <p className="text-xs text-gray-400">USC</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">MEDIAN</p>
            <p className="text-2xl font-bold text-gray-900">{avg.adoption.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{benchmarkLabel} average</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">BEST</p>
            <p className="text-2xl font-bold" style={{ color: colors.scarlet }}>60.8%</p>
            <p className="text-xs text-gray-400">Stanford</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Card */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: colors.scarlet }}>
        <div className="mb-3">
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-3xl font-bold uppercase tracking-tight text-white">
            LEADERBOARD
          </h3>
          <p className="text-white/80 text-sm mt-1">Ohio State's IP adoption rankings</p>
        </div>

        <div className="space-y-3">
          {/* In Conference */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black text-white border-2 border-white/30">
              #{ranks.adoption}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-xs uppercase tracking-wider">In the {isConference ? 'Big Ten' : 'Conference'}</p>
              <p className="text-white text-xl font-bold">{isConference ? 'Big Ten' : 'Conference'} Schools</p>
            </div>
          </div>

          {/* In NCAA */}
          {!isConference && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black text-white border-2 border-white/30">
                #{ranks.adoption}
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs uppercase tracking-wider">In the NCAA</p>
                <p className="text-white text-xl font-bold">NCAA D1 Schools</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="mb-4">
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl font-bold uppercase tracking-tight">
            <span style={{ color: colors.scarlet }}>{benchmarkLabel} </span>
            <span style={{ color: colors.headerGray }}>IP ADOPTION RANKINGS</span>
          </h3>
        </div>
        <div className="rounded-2xl bg-white overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr style={{ backgroundColor: colors.scarlet }}>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">School</th>
                {!isConference && <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Conf</th>}
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Posts</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Adoption</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Visual IP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Mention</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, idx) => (
                <tr
                  key={school.name}
                  className={`border-b border-gray-100 ${school.name === 'Ohio State' ? 'bg-red-50' : idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-3 py-3 text-center">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                      style={{
                        backgroundColor: school.name === 'Ohio State' ? colors.scarlet : idx < 3 ? colors.gray : '#e5e7eb',
                        color: school.name === 'Ohio State' || idx < 3 ? colors.white : colors.text,
                      }}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${school.name === 'Ohio State' ? 'text-red-700' : 'text-gray-900'}`}>
                    {school.name}
                  </td>
                  {!isConference && <td className="px-4 py-3 text-xs text-gray-500">{school.conf}</td>}
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(school.posts)}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: school.name === 'Ohio State' ? colors.scarlet : colors.text }}>
                    {school.adoption}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{school.logo}%</td>
                  <td className="px-4 py-3 text-right text-gray-600">{school.mention}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">* Based on {schools.length} {isConference ? 'Big 10' : 'NCAA D1'} schools with available IP data</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface OhioStateIPImpactProps {
  onBack?: () => void;
}

export function OhioStateIPImpact({ onBack }: OhioStateIPImpactProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: colors.lightBg }}>
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/ohio-state-bg.jpg)',
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
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"
                alt="Ohio State"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1
                  className="text-2xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.scarlet }}>IP </span>
                  <span style={{ color: colors.headerGray }}>IMPACT</span>
                </h1>
                <p className="text-sm text-gray-500">Ohio State Athlete Social Media</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.scarlet, color: colors.scarlet }}
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
                  color: activeTab === tab.id ? colors.scarlet : colors.textMuted,
                  borderColor: activeTab === tab.id ? colors.scarlet : 'transparent',
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
