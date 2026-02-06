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
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// OHIO STATE BRAND COLORS (matching existing dashboard)
// ═══════════════════════════════════════════════════════════════
const colors = {
  scarlet: '#ba0c2f',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  negative: '#ef4444',
  accent: '#0369a1',
  lightBg: '#f9fafb',
  warmGray: '#78716c',
  cardBg: '#ffffff',
  cardBorder: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
};

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

  postsWithIP: 2401,
  ipAdoptionRate: 26.9,

  // Weighted average lift: (23*-97.7 + 735*-72.5 + 1929*-50.3) / 2687 = -56.8%
  avgLift: -56.8,

  // Total EMV: (likes × $0.20) + (comments × $2.00)
  totalEmv: 3855650,

  collaboration: {
    posts: 23,
    likes: 347756,
    comments: 4696,
    engagementRate: 0.0006358, // 0.064% from source: 0.06358330718996932
    delta: -97.7, // from source: -97.69763573452875
    emv: undefined,
    baselineEngRate: 0.02762, // 2.76% - no collab eng rate from source
    baselinePosts: 8895,
    baselineLikes: 14911012, // from source collaboration.no.likes
    baselineComments: 397252, // from source collaboration.no.comments
  } as IPSignalData,

  logo: {
    posts: 735,
    likes: 3316932,
    comments: 56104,
    engagementRate: 0.006085, // 0.61% from source: 0.6085049429449269
    delta: -72.5, // from source: -72.54944790228912
    emv: undefined,
    baselineEngRate: 0.02217, // 2.22% - no logo eng rate from source
    baselinePosts: 8183,
    baselineLikes: 11941836, // from source logo.no.likes
    baselineComments: 345844, // from source logo.no.comments
  } as IPSignalData,

  mention: {
    posts: 1929,
    likes: 5106584,
    comments: 91387,
    engagementRate: 0.009377, // 0.94% from source: 0.9377282207436815
    delta: -50.3, // from source: -50.31924222563008
    emv: undefined,
    baselineEngRate: 0.01888, // 1.89% - no mention eng rate from source
    baselinePosts: 6989,
    baselineLikes: 10152184, // from source orgInCaption.no.likes
    baselineComments: 310561, // from source orgInCaption.no.comments
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
      className="rounded-xl p-6 text-center relative overflow-hidden"
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
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
    <div className="space-y-8">
      {/* Data Source Context */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3">
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
        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
          Performance by IP Mode
        </h3>
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
            title="Logo"
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

  const signals = [
    { id: 'collab' as const, label: 'Collab', data: ipData.collaboration },
    { id: 'logo' as const, label: 'Logo', data: ipData.logo },
    { id: 'mention' as const, label: 'Mention', data: ipData.mention },
  ];

  const metrics = [
    { id: 'engagement' as const, label: 'Engagement Rate' },
    { id: 'likes' as const, label: 'Avg Likes' },
    { id: 'comments' as const, label: 'Avg Comments' },
  ];

  const currentSignal = signals.find(s => s.id === selectedSignal);

  // Calculate values for comparison - use signal-specific baseline from source data
  const withoutEngRate = currentSignal?.data?.baselineEngRate || 0;
  const withEngRate = currentSignal?.data?.engagementRate || 0;
  const withoutPosts = currentSignal?.data?.baselinePosts || 0;
  const withPosts = currentSignal?.data?.posts || 0;

  // Calculate avg likes/comments per post - use signal-specific baseline from source data
  const baselineAvgLikes = currentSignal?.data ? currentSignal.data.baselineLikes / currentSignal.data.baselinePosts : 0;
  const baselineAvgComments = currentSignal?.data ? currentSignal.data.baselineComments / currentSignal.data.baselinePosts : 0;
  const withAvgLikes = currentSignal?.data ? currentSignal.data.likes / currentSignal.data.posts : 0;
  const withAvgComments = currentSignal?.data ? currentSignal.data.comments / currentSignal.data.posts : 0;

  // Calculate deltas
  const engDelta = currentSignal?.data?.delta || 0;
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
    <div className="space-y-6">
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

        {/* Middle Column - Bar Chart */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-4 px-4">
          {/* Without IP Bar */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Without {currentSignal?.label}</p>
            <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? (metricValues.withoutRaw / maxValue) * 100 : 0}%`,
                  backgroundColor: colors.scarlet,
                }}
              />
            </div>
          </div>

          {/* With IP Bar */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">With {currentSignal?.label}</p>
            <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? (metricValues.withRaw / maxValue) * 100 : 0}%`,
                  backgroundColor: colors.gray,
                }}
              />
            </div>
          </div>

          {/* Scale */}
          <div className="flex justify-between text-xs text-gray-400 pt-1">
            <span>0</span>
            <span>{metricValues.isPercent ? formatPercent(maxValue / 2) : formatNumber(Math.round(maxValue / 2))}</span>
            <span>{metricValues.isPercent ? formatPercent(maxValue) : formatNumber(Math.round(maxValue))}</span>
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
    <div className="space-y-8">
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
        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
          Top 10 by {sortOptions.find(o => o.key === sortKey)?.label}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {top10.map((partner, idx) => (
            <div
              key={partner.brand}
              className="rounded-xl p-4 border bg-white hover:shadow-md transition-shadow"
              style={{ borderColor: idx < 3 ? colors.scarlet : colors.cardBorder }}
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
          <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">
            All Partnerships
          </h3>
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

        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
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

// Ohio State Athletes by EMV (processed from sponsored-posts data - 591 posts total)
// EMV formula: (totalLikes × $0.20) + (totalComments × $2.00)
const allAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 9, avgLikes: 32369, avgComments: 224, totalEmv: 62301 },
  { rank: 2, name: "Julian Sayin", sport: "Football", posts: 7, avgLikes: 8282, avgComments: 128, totalEmv: 13391 },
  { rank: 3, name: "Bo Jackson", sport: "Football", posts: 1, avgLikes: 36233, avgComments: 763, totalEmv: 8773 },
  { rank: 4, name: "Jesse Mendez", sport: "Wrestling", posts: 6, avgLikes: 5789, avgComments: 29, totalEmv: 7295 },
  { rank: 5, name: "Carnell Tate", sport: "Football", posts: 7, avgLikes: 3812, avgComments: 56, totalEmv: 6133 },
  { rank: 6, name: "Caleb Downs", sport: "Football", posts: 9, avgLikes: 3233, avgComments: 17, totalEmv: 6129 },
  { rank: 7, name: "Tavien St. Clair", sport: "Football", posts: 4, avgLikes: 6634, avgComments: 53, totalEmv: 5737 },
  { rank: 8, name: "Seini Henry", sport: "W. Basketball", posts: 2, avgLikes: 10188, avgComments: 149, totalEmv: 4671 },
  { rank: 9, name: "Emma Hellenkamp", sport: "Dance", posts: 4, avgLikes: 5503, avgComments: 31, totalEmv: 4657 },
  { rank: 10, name: "Slane Glover", sport: "Cheer", posts: 19, avgLikes: 809, avgComments: 29, totalEmv: 4181 },
  { rank: 11, name: "Nolan Baudo", sport: "Football", posts: 2, avgLikes: 5460, avgComments: 266, totalEmv: 3248 },
  { rank: 12, name: "James Peoples", sport: "Football", posts: 8, avgLikes: 1503, avgComments: 18, totalEmv: 2704 },
  { rank: 13, name: "Nic Bouzakis", sport: "Wrestling", posts: 4, avgLikes: 2889, avgComments: 18, totalEmv: 2459 },
  { rank: 14, name: "Lincoln Kienholz", sport: "Football", posts: 3, avgLikes: 3969, avgComments: 12, totalEmv: 2454 },
  { rank: 15, name: "Jermaine Mathews Jr.", sport: "Football", posts: 1, avgLikes: 10029, avgComments: 139, totalEmv: 2284 },
  { rank: 16, name: "Sonny Styles", sport: "Football", posts: 6, avgLikes: 1478, avgComments: 24, totalEmv: 2064 },
  { rank: 17, name: "Ben Davino", sport: "Wrestling", posts: 3, avgLikes: 3101, avgComments: 16, totalEmv: 1957 },
  { rank: 18, name: "Brandon Cannon", sport: "Wrestling", posts: 2, avgLikes: 4591, avgComments: 12, totalEmv: 1887 },
  { rank: 19, name: "Colin White", sport: "M. Basketball", posts: 5, avgLikes: 1398, avgComments: 5, totalEmv: 1454 },
  { rank: 20, name: "Brandon Inniss", sport: "Football", posts: 3, avgLikes: 1551, avgComments: 24, totalEmv: 1079 },
  { rank: 21, name: "Ethan Onianwa", sport: "Football", posts: 2, avgLikes: 2222, avgComments: 21, totalEmv: 975 },
  { rank: 22, name: "Brynn Melius", sport: "Dance", posts: 5, avgLikes: 777, avgComments: 19, totalEmv: 974 },
  { rank: 23, name: "Joey Velazquez", sport: "Football", posts: 4, avgLikes: 434, avgComments: 70, totalEmv: 911 },
  { rank: 24, name: "Devin Royal", sport: "M. Basketball", posts: 6, avgLikes: 558, avgComments: 8, totalEmv: 776 },
  { rank: 25, name: "John Mobley Jr.", sport: "M. Basketball", posts: 2, avgLikes: 1471, avgComments: 38, totalEmv: 741 },
  { rank: 26, name: "Joy Dunne", sport: "W. Hockey", posts: 3, avgLikes: 898, avgComments: 30, totalEmv: 721 },
  { rank: 27, name: "Gabe Cupps", sport: "M. Basketball", posts: 4, avgLikes: 780, avgComments: 11, totalEmv: 712 },
  { rank: 28, name: "Eric Mensah", sport: "Football", posts: 3, avgLikes: 701, avgComments: 39, totalEmv: 659 },
  { rank: 29, name: "Michael Osinski", sport: "Cheer", posts: 12, avgLikes: 183, avgComments: 8, totalEmv: 644 },
  { rank: 30, name: "Caleb Fyock", sport: "M. Lacrosse", posts: 3, avgLikes: 954, avgComments: 4, totalEmv: 596 },
  { rank: 31, name: "Bobby Van Buren", sport: "M. Lacrosse", posts: 2, avgLikes: 1085, avgComments: 34, totalEmv: 572 },
  { rank: 32, name: "Ellie Wagner", sport: "Dance", posts: 2, avgLikes: 1261, avgComments: 15, totalEmv: 565 },
  { rank: 33, name: "Ivan Njegovan", sport: "M. Basketball", posts: 3, avgLikes: 761, avgComments: 14, totalEmv: 545 },
  { rank: 34, name: "Devontae Armstrong", sport: "Football", posts: 4, avgLikes: 560, avgComments: 10, totalEmv: 528 },
  { rank: 35, name: "Devin Sanchez", sport: "Football", posts: 3, avgLikes: 705, avgComments: 14, totalEmv: 509 },
  { rank: 36, name: "Olivia Taylor", sport: "Dance", posts: 3, avgLikes: 679, avgComments: 13, totalEmv: 486 },
  { rank: 37, name: "Magdalena Juric", sport: "W. Volleyball", posts: 1, avgLikes: 3, avgComments: 240, totalEmv: 481 },
  { rank: 38, name: "Eddrick Houston", sport: "Football", posts: 1, avgLikes: 1838, avgComments: 56, totalEmv: 480 },
  { rank: 39, name: "Bella Eldredge", sport: "Cheer", posts: 12, avgLikes: 148, avgComments: 4, totalEmv: 453 },
  { rank: 40, name: "Shohaan Singh", sport: "M. Track", posts: 9, avgLikes: 73, avgComments: 17, totalEmv: 439 },
  { rank: 41, name: "Diana Natalicchio", sport: "Dance", posts: 1, avgLikes: 2007, avgComments: 18, totalEmv: 437 },
  { rank: 42, name: "Lexi Leistner", sport: "Dance", posts: 2, avgLikes: 606, avgComments: 47, totalEmv: 433 },
  { rank: 43, name: "Caden Curry", sport: "Football", posts: 3, avgLikes: 616, avgComments: 9, totalEmv: 428 },
  { rank: 44, name: "Mason Maggs", sport: "Football", posts: 1, avgLikes: 1795, avgComments: 31, totalEmv: 421 },
  { rank: 45, name: "Quincy Porter", sport: "Football", posts: 5, avgLikes: 343, avgComments: 6, totalEmv: 408 },
  { rank: 46, name: "Brielle McCoy", sport: "Dance", posts: 3, avgLikes: 460, avgComments: 20, totalEmv: 400 },
  { rank: 47, name: "Eli Lee", sport: "Football", posts: 2, avgLikes: 937, avgComments: 5, totalEmv: 395 },
  { rank: 48, name: "Makenna Webster", sport: "W. Field Hockey", posts: 1, avgLikes: 1694, avgComments: 28, totalEmv: 395 },
  { rank: 49, name: "Cody Haddad", sport: "Football", posts: 1, avgLikes: 1645, avgComments: 32, totalEmv: 393 },
  { rank: 50, name: "Luke Montgomery", sport: "Football", posts: 1, avgLikes: 1639, avgComments: 32, totalEmv: 392 },
];

const topAthletes = allAthletes.slice(0, 10);

// Top 5 Brand Partners (from partnerships data, recalculated with new EMV formula)
// EMV = (avgLikes × $0.20) + (avgComments × $2.00)
const topBrandPartners = [
  { rank: 1, brand: "Red Bull", posts: 1, avgLikes: 171980, avgComments: 631, totalEmv: 35658 },
  { rank: 2, brand: "Dick's Sporting Goods", posts: 2, avgLikes: 20788, avgComments: 174, totalEmv: 9011 },
  { rank: 3, brand: "Epic Partner", posts: 1, avgLikes: 37682, avgComments: 121, totalEmv: 7778 },
  { rank: 4, brand: "Discover", posts: 1, avgLikes: 23610, avgComments: 114, totalEmv: 4950 },
  { rank: 5, brand: "The Henry Legacy", posts: 1, avgLikes: 15460, avgComments: 226, totalEmv: 3544 },
];

function BestCollaboratorsTab() {
  return (
    <div className="space-y-8">
      {/* Data Source Context */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          Rankings based on <span className="font-semibold">591 sponsored posts</span> from Ohio State athletes.
          EMV calculated as (likes × $0.20) + (comments × $2.00).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Athletes Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
            Top 10 Athletes by EMV
          </h3>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.scarlet }}>
                  <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Athlete
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Posts
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    EMV
                  </th>
                </tr>
              </thead>
              <tbody>
                {topAthletes.map((athlete, idx) => (
                  <tr
                    key={athlete.name}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-3 py-3 text-center">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                        style={{
                          backgroundColor: idx < 3 ? colors.scarlet : colors.gray,
                          color: colors.white,
                        }}
                      >
                        {athlete.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{athlete.name}</p>
                      <p className="text-xs text-gray-500">{athlete.sport}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {athlete.posts}
                    </td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: colors.scarlet }}>
                      {formatCurrency(athlete.totalEmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Brand Partners Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
            Top 5 Brand Partners by EMV
          </h3>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.scarlet }}>
                  <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Brand
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Posts
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    EMV
                  </th>
                </tr>
              </thead>
              <tbody>
                {topBrandPartners.map((partner, idx) => (
                  <tr
                    key={partner.brand}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-3 py-3 text-center">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                        style={{
                          backgroundColor: idx < 3 ? colors.scarlet : colors.gray,
                          color: colors.white,
                        }}
                      >
                        {partner.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {partner.brand}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {partner.posts}
                    </td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: colors.scarlet }}>
                      {formatCurrency(partner.totalEmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Athlete Performance Summary Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border border-gray-200 bg-white">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Top Athlete EMV</p>
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>
                {formatCurrency(topAthletes[0].totalEmv)}
              </p>
              <p className="text-sm text-gray-600 mt-1">{topAthletes[0].name}</p>
            </div>
            <div className="rounded-xl p-4 border border-gray-200 bg-white">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Top Avg Likes</p>
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>
                {formatNumber(topAthletes.find(a => a.name === "Bo Jackson")?.avgLikes || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Bo Jackson</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Athlete Stats */}
      <div>
        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
          All Athletes by EMV ({allAthletes.length} total)
        </h3>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden max-h-[600px] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0">
                <tr style={{ backgroundColor: colors.scarlet }}>
                  <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Athlete
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Sport
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Posts
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Avg Likes
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Avg Comments
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                    Total EMV
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAthletes.map((athlete, idx) => (
                  <tr
                    key={athlete.name}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-3 py-3 text-center text-sm text-gray-400 font-medium">
                      {athlete.rank}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {athlete.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {athlete.sport}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {athlete.posts}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatNumber(athlete.avgLikes)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatNumber(athlete.avgComments)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: colors.scarlet }}>
                      {formatCurrency(athlete.totalEmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BENCHMARK TAB
// ═══════════════════════════════════════════════════════════════

// Big 10 Conference benchmark data (5 schools with available IP data)
const big10Schools = [
  { name: 'Nebraska', followers: 3012749, posts: 3049, ipPosts: 1658, adoption: 54.4, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Michigan State', followers: 802304, posts: 2216, ipPosts: 1039, adoption: 46.9, logo: 38.3, mention: 20.1, collab: 2.9 },
  { name: 'Maryland', followers: 858916, posts: 2120, ipPosts: 925, adoption: 43.6, logo: 38.1, mention: 18.5, collab: 0 },
  { name: 'Ohio State', followers: 5543153, posts: 8918, ipPosts: 2401, adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 },
  { name: 'Penn State', followers: 4032162, posts: 7202, ipPosts: 1686, adoption: 23.4, logo: 7.6, mention: 18.8, collab: 0.01 },
];

const conferenceAvg = {
  adoption: 39.0,
  logo: 28.3,
  mention: 19.8,
  collab: 0.63,
};

const ohioStateRank = {
  adoption: 4, // 4th of 5
  logo: 4,
  mention: 1, // Highest mention rate!
  collab: 2,
};

function BenchmarkTab() {
  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');

  // Ohio State metrics
  const ohioState = big10Schools.find(s => s.name === 'Ohio State')!;
  const adoptionDelta = ohioState.adoption - conferenceAvg.adoption;
  const logoDelta = ohioState.logo - conferenceAvg.logo;
  const mentionDelta = ohioState.mention - conferenceAvg.mention;
  const collabDelta = ohioState.collab - conferenceAvg.collab;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Benchmark</span> shows how often Ohio State athletes use IP elements (logos, mentions, collaborations) in social content compared to other schools.
        </p>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.scarlet }}></span> Big 10 Conference: Compare against other Big 10 schools</span>
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
            className="px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            🏆 NCAA D1
          </button>
        </div>
        <span className="text-xs text-gray-400">NCAA D1 data coming soon</span>
      </div>

      {/* Summary Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Rank */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Overall IP Adoption</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.scarlet }}>#{ohioStateRank.adoption}</p>
            <p className="text-sm text-gray-500 mb-1">of {big10Schools.length} schools</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs Big 10 Conference</p>
        </div>

        {/* Your Adoption */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
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
          <p className="text-xs text-gray-400 mt-2">vs {conferenceAvg.adoption}% conference avg</p>
        </div>

        {/* Insight */}
        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.positive, backgroundColor: `${colors.positive}08` }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.positive }}>💡 Key Insight</p>
          <p className="text-sm text-gray-700">
            Ohio State leads the Big 10 in <span className="font-semibold">mention rate</span> ({ohioState.mention}%), outperforming the conference average by {(ohioState.mention - conferenceAvg.mention).toFixed(1)}%.
          </p>
        </div>
      </div>

      {/* IP Signal Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.scarlet}15` }}>
                <Tag className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Logo</h4>
                <p className="text-xs text-gray-500">% of posts with logos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ohioStateRank.logo}</p>
              <p className="text-xs text-gray-400">of {big10Schools.length} schools</p>
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
                <span className="text-gray-500">Big 10 Avg</span>
                <span className="text-gray-500">{conferenceAvg.logo}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(conferenceAvg.logo / 60) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: logoDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: logoDelta >= 0 ? colors.positive : colors.negative }}
            >
              {logoDelta >= 0 ? '↑' : '↓'} {Math.abs(logoDelta).toFixed(1)}% vs conference
            </span>
          </div>
        </div>

        {/* Mention */}
        <div className="rounded-xl border-2 bg-white p-5" style={{ borderColor: colors.positive }}>
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
              <p className="text-2xl font-black" style={{ color: colors.positive }}>#{ohioStateRank.mention}</p>
              <p className="text-xs text-gray-400">of {big10Schools.length} schools</p>
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
                <span className="text-gray-500">Big 10 Avg</span>
                <span className="text-gray-500">{conferenceAvg.mention}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(conferenceAvg.mention / 30) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: `${colors.positive}20`, color: colors.positive }}
            >
              ↑ {mentionDelta.toFixed(1)}% vs conference • #1 in Big 10
            </span>
          </div>
        </div>

        {/* Collaboration */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
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
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ohioStateRank.collab}</p>
              <p className="text-xs text-gray-400">of {big10Schools.length} schools</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ohio State</span>
                <span className="font-semibold">{ohioState.collab}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ohioState.collab / 5) * 100}%`, backgroundColor: colors.scarlet }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Big 10 Avg</span>
                <span className="text-gray-500">{conferenceAvg.collab}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(conferenceAvg.collab / 5) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: collabDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: collabDelta >= 0 ? colors.positive : colors.negative }}
            >
              {collabDelta >= 0 ? '↑' : '↓'} {Math.abs(collabDelta).toFixed(2)}% vs conference
            </span>
          </div>
        </div>

        {/* Adoption Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
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
              <p className="text-2xl font-black" style={{ color: colors.scarlet }}>#{ohioStateRank.adoption}</p>
              <p className="text-xs text-gray-400">of {big10Schools.length} schools</p>
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
                <span className="text-gray-500">Big 10 Avg</span>
                <span className="text-gray-500">{conferenceAvg.adoption}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(conferenceAvg.adoption / 60) * 100}%`, backgroundColor: colors.gray }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: adoptionDelta >= 0 ? `${colors.positive}20` : `${colors.negative}20`, color: adoptionDelta >= 0 ? colors.positive : colors.negative }}
            >
              {adoptionDelta >= 0 ? '↑' : '↓'} {Math.abs(adoptionDelta).toFixed(1)}% vs conference
            </span>
          </div>
        </div>
      </div>

      {/* Conference Leaderboard */}
      <div>
        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">
          Big 10 IP Adoption Rankings
        </h3>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: colors.scarlet }}>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-white w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">School</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Followers</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Posts</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">IP Adoption</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Logo %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">Mention %</th>
              </tr>
            </thead>
            <tbody>
              {big10Schools.map((school, idx) => (
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
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(school.followers)}</td>
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
        <p className="text-xs text-gray-400 mt-2">* Based on 5 Big 10 schools with available IP data</p>
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
                <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: colors.scarlet }}>
                  IP Impact
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'withvswithout' && <WithVsWithoutTab />}
        {activeTab === 'partnerships' && <PartnershipsTab />}
        {activeTab === 'bestcollaborators' && <BestCollaboratorsTab />}
        {activeTab === 'benchmark' && <BenchmarkTab />}
      </main>
    </div>
  );
}
