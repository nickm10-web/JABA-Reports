import { useState } from 'react';
import { ArrowLeft, Award, Lightbulb, TrendingUp, FileText, Shield, User, Building2, Star, Target, Zap, BarChart3 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// OHIO STATE BRAND COLORS
// ═══════════════════════════════════════════════════════════════
const colors = {
  scarlet: '#ba0c2f',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  accent: '#0369a1', // Strategic blue for insights
  lightBg: '#f9fafb',
  warmGray: '#78716c',
};

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURE
// ═══════════════════════════════════════════════════════════════
const ohioStateData = {
  school: "Ohio State",
  followers: 5543153,
  totalPosts: 8918,
  totalLikes: 15258768,
  totalComments: 401948,
  engagementRate: 2.83,

  ipUsage: {
    withIp: 2401,
    withoutIp: 6517,
    ipPercentage: 26.9, // ~27% use IP
    caption: {
      posts: 1929,
      likes: 5106584,
      comments: 91387,
      engagementRate: 0.94,
      variance: 50.3 // Performance variance (not "negative lift")
    },
    logo: {
      posts: 735,
      likes: 3316932,
      comments: 56104,
      engagementRate: 0.61,
      variance: 72.5
    },
    collaboration: {
      posts: 23,
      likes: 347756,
      comments: 4696,
      engagementRate: 0.06,
      variance: 97.7
    }
  },

  nonIp: {
    posts: 6517,
    engagementRate: 2.76
  },

  // All 279 brand partnerships
  allBrandPartnerships: [
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
    { brand: "@nakashima_bryce", posts: 1, avgLikes: 258, avgComments: 17, emv: 6.86, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@thespiritgolf", posts: 1, avgLikes: 257, avgComments: 22, emv: 7.34, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@snapsclothingco", posts: 1, avgLikes: 255, avgComments: 2, emv: 5.3, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@suncruisers", posts: 1, avgLikes: 254, avgComments: 16, emv: 6.68, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@heatedcolumbus", posts: 1, avgLikes: 254, avgComments: 7, emv: 5.78, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@aquahawgs", posts: 1, avgLikes: 252, avgComments: 39, emv: 8.94, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@truff", posts: 1, avgLikes: 252, avgComments: 6, emv: 5.64, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@fireflyrecovery", posts: 2, avgLikes: 250, avgComments: 3, emv: 5.31, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@drkwtr", posts: 1, avgLikes: 250, avgComments: 12, emv: 6.2, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@selectproformance", posts: 4, avgLikes: 247, avgComments: 10, emv: 6.03, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@therandagolf", posts: 1, avgLikes: 241, avgComments: 19, emv: 6.72, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@england.golf", posts: 2, avgLikes: 235, avgComments: 24, emv: 7.1, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@riterugflooring", posts: 3, avgLikes: 233, avgComments: 0, emv: 4.71, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@blue84licensed", posts: 2, avgLikes: 232, avgComments: 4, emv: 5.05, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@thetrackatnewbalance", posts: 1, avgLikes: 228, avgComments: 3, emv: 4.86, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@elementelectronics", posts: 2, avgLikes: 226, avgComments: 21, emv: 6.67, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@titleist_anz", posts: 1, avgLikes: 226, avgComments: 15, emv: 6.02, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@tylenol", posts: 1, avgLikes: 220, avgComments: 22, emv: 6.6, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@monsterenergy", posts: 3, avgLikes: 219, avgComments: 24, emv: 6.81, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@theyeethree", posts: 1, avgLikes: 218, avgComments: 0, emv: 4.36, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@goodr", posts: 4, avgLikes: 216, avgComments: 9, emv: 5.23, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@nike", posts: 3, avgLikes: 215, avgComments: 16, emv: 5.97, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@nilstore", posts: 1, avgLikes: 211, avgComments: 6, emv: 4.82, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@cat.speed.style", posts: 1, avgLikes: 208, avgComments: 3, emv: 4.46, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@thefeed", posts: 1, avgLikes: 206, avgComments: 4, emv: 4.51, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@costco", posts: 1, avgLikes: 201, avgComments: 4, emv: 4.42, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bonvillegolfresort", posts: 1, avgLikes: 197, avgComments: 10, emv: 4.94, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@specialteamsu", posts: 2, avgLikes: 189, avgComments: 3, emv: 4.09, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@sealy", posts: 1, avgLikes: 187, avgComments: 8, emv: 4.54, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@reathlete", posts: 1, avgLikes: 186, avgComments: 5, emv: 4.22, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@jcpenney", posts: 1, avgLikes: 184, avgComments: 4, emv: 4.08, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@pitchcom.softball", posts: 1, avgLikes: 182, avgComments: 1, emv: 3.74, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@dsw", posts: 2, avgLikes: 179, avgComments: 20, emv: 5.58, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bonitabrooklynn", posts: 1, avgLikes: 179, avgComments: 0, emv: 3.58, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@golfnow", posts: 1, avgLikes: 178, avgComments: 5, emv: 4.05, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@g2a_com", posts: 1, avgLikes: 178, avgComments: 0, emv: 3.56, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@the.nil.store", posts: 9, avgLikes: 177, avgComments: 4, emv: 3.98, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bubblr", posts: 1, avgLikes: 177, avgComments: 3, emv: 3.84, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@drinkpurekick", posts: 2, avgLikes: 176, avgComments: 16, emv: 5.12, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@onnit", posts: 2, avgLikes: 176, avgComments: 9, emv: 4.47, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@fanatic_wrestling", posts: 1, avgLikes: 171, avgComments: 6, emv: 4.01, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@connyct_university", posts: 1, avgLikes: 171, avgComments: 4, emv: 3.82, engagementRate: 0.003, liftMultiplier: -1 },
    { brand: "@nil.store___", posts: 2, avgLikes: 170, avgComments: 4, emv: 3.81, engagementRate: 0.003, liftMultiplier: -1 },
    { brand: "@trendmicro", posts: 1, avgLikes: 160, avgComments: 21, emv: 5.3, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@goodyear", posts: 1, avgLikes: 155, avgComments: 5, emv: 3.6, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@myplayersports", posts: 6, avgLikes: 155, avgComments: 2, emv: 3.35, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@playabowls", posts: 1, avgLikes: 154, avgComments: 7, emv: 3.78, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@nocco.usa", posts: 1, avgLikes: 153, avgComments: 9, emv: 3.96, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@theoonlane", posts: 1, avgLikes: 149, avgComments: 4, emv: 3.38, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@maybelline", posts: 1, avgLikes: 147, avgComments: 4, emv: 3.34, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@maaxgum", posts: 1, avgLikes: 136, avgComments: 21, emv: 4.82, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@wearstand", posts: 1, avgLikes: 136, avgComments: 15, emv: 4.22, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@newera", posts: 2, avgLikes: 133, avgComments: 18, emv: 4.47, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@voacountrymusicfest", posts: 1, avgLikes: 131, avgComments: 10, emv: 3.62, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@representthecode", posts: 1, avgLikes: 131, avgComments: 0, emv: 2.62, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@amazon", posts: 2, avgLikes: 128, avgComments: 6, emv: 3.17, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@cvspharmacy", posts: 7, avgLikes: 127, avgComments: 2, emv: 2.8, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@travismathew", posts: 1, avgLikes: 126, avgComments: 21, emv: 4.62, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@checkersrallys", posts: 1, avgLikes: 125, avgComments: 5, emv: 3, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@redbull", posts: 1, avgLikes: 121, avgComments: 32, emv: 5.62, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@laoororganics", posts: 1, avgLikes: 119, avgComments: 21, emv: 4.48, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@themarcpro", posts: 1, avgLikes: 119, avgComments: 3, emv: 2.68, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@ecofit_h2o", posts: 1, avgLikes: 118, avgComments: 5, emv: 2.86, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@postgame.official", posts: 6, avgLikes: 116, avgComments: 5, emv: 2.9, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@buckeye.threads", posts: 29, avgLikes: 109, avgComments: 2, emv: 2.41, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@shopmascella", posts: 3, avgLikes: 109, avgComments: 14, emv: 3.59, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@lootedapparel_", posts: 1, avgLikes: 109, avgComments: 10, emv: 3.18, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@thefishbacks", posts: 3, avgLikes: 108, avgComments: 2, emv: 2.37, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@nush", posts: 1, avgLikes: 105, avgComments: 0, emv: 2.1, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@toro_tour_golf_", posts: 1, avgLikes: 104, avgComments: 5, emv: 2.58, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@athletesthread", posts: 2, avgLikes: 93, avgComments: 0, emv: 1.91, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@drink_phx", posts: 2, avgLikes: 90, avgComments: 9, emv: 2.75, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@myplayerathlete", posts: 9, avgLikes: 84, avgComments: 4, emv: 2.18, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@drinkbiolyte", posts: 1, avgLikes: 84, avgComments: 4, emv: 2.08, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@vuoriclothing", posts: 2, avgLikes: 80, avgComments: 28, emv: 4.41, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@greeniesportscards", posts: 2, avgLikes: 76, avgComments: 0, emv: 1.53, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@blitz_athletics_ohio", posts: 1, avgLikes: 74, avgComments: 5, emv: 1.98, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@nfmlendingohio", posts: 2, avgLikes: 70, avgComments: 13, emv: 2.7, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@fclbestinclass", posts: 3, avgLikes: 69, avgComments: 0, emv: 1.45, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@getjams", posts: 1, avgLikes: 68, avgComments: 1, emv: 1.46, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@southwest.ua.allamerica", posts: 1, avgLikes: 67, avgComments: 6, emv: 1.94, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@campusparc", posts: 5, avgLikes: 67, avgComments: 3, emv: 1.68, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@rootsnk", posts: 6, avgLikes: 66, avgComments: 10, emv: 2.39, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@tecovas", posts: 1, avgLikes: 66, avgComments: 0, emv: 1.32, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@drinkaccelerator", posts: 18, avgLikes: 59, avgComments: 6, emv: 1.8, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@underarmour150", posts: 1, avgLikes: 54, avgComments: 3, emv: 1.38, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@the.bronzing.bar", posts: 1, avgLikes: 53, avgComments: 5, emv: 1.56, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@yesly", posts: 1, avgLikes: 51, avgComments: 7, emv: 1.72, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@bambooboutiqueedinburgh", posts: 2, avgLikes: 50, avgComments: 8, emv: 1.81, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@pockyusa", posts: 1, avgLikes: 48, avgComments: 4, emv: 1.36, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@gopuff", posts: 1, avgLikes: 45, avgComments: 4, emv: 1.3, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@onlyfreshdesigns", posts: 2, avgLikes: 43, avgComments: 0, emv: 0.87, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@murryave", posts: 5, avgLikes: 34, avgComments: 6, emv: 1.3, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@thenoblemethod", posts: 5, avgLikes: 17, avgComments: 7, emv: 1.05, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@bambooboutique", posts: 1, avgLikes: 16, avgComments: 0, emv: 0.32, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@powerade_us", posts: 1, avgLikes: 3, avgComments: 137, emv: 13.76, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@yourstruly_rochele", posts: 1, avgLikes: 3, avgComments: 73, emv: 7.36, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@mcdonalds", posts: 1, avgLikes: 3, avgComments: 54, emv: 5.46, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@goodmolecules", posts: 1, avgLikes: 3, avgComments: 54, emv: 5.46, engagementRate: 0.001, liftMultiplier: -1 },
    { brand: "@b1gvolleyball", posts: 1, avgLikes: 3, avgComments: 23, emv: 2.36, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@lilbaby", posts: 1, avgLikes: 3, avgComments: 19, emv: 1.96, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@breakaway", posts: 1, avgLikes: 3, avgComments: 13, emv: 1.36, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@stickermule", posts: 1, avgLikes: 3, avgComments: 12, emv: 1.26, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@dollarshaveclub", posts: 1, avgLikes: 3, avgComments: 10, emv: 1.06, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@livvydunne", posts: 1, avgLikes: 3, avgComments: 9, emv: 0.96, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@vitacoco", posts: 1, avgLikes: 3, avgComments: 7, emv: 0.76, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@drinkdripdrop", posts: 1, avgLikes: 3, avgComments: 7, emv: 0.76, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@mondayhaircare", posts: 1, avgLikes: 3, avgComments: 6, emv: 0.66, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@gabbydoesmytattts", posts: 1, avgLikes: 3, avgComments: 5, emv: 0.56, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@cvs", posts: 1, avgLikes: 3, avgComments: 4, emv: 0.46, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@carharttxlids", posts: 1, avgLikes: 3, avgComments: 2, emv: 0.26, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@crocs", posts: 4, avgLikes: 1, avgComments: 24, emv: 2.5, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@dietcoke", posts: 1, avgLikes: 0, avgComments: 123, emv: 12.3, engagementRate: 0.002, liftMultiplier: -1 },
    { brand: "@flexworkmgt", posts: 1, avgLikes: 0, avgComments: 41, emv: 4.09, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@homagepartner", posts: 1, avgLikes: 0, avgComments: 27, emv: 2.7, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@donatos", posts: 1, avgLikes: 0, avgComments: 27, emv: 2.7, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@abbottglobal", posts: 2, avgLikes: 0, avgComments: 25, emv: 2.5, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@tflapparel", posts: 1, avgLikes: 0, avgComments: 24, emv: 2.4, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@onlyatarchetype", posts: 1, avgLikes: 0, avgComments: 18, emv: 1.8, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@hairofparadise7", posts: 1, avgLikes: 0, avgComments: 16, emv: 1.6, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@ohiostatemgolf", posts: 1, avgLikes: 0, avgComments: 16, emv: 1.6, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@kwikgoal", posts: 1, avgLikes: 0, avgComments: 15, emv: 1.5, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@topdrawersoccer", posts: 1, avgLikes: 0, avgComments: 14, emv: 1.4, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@tlfapparel", posts: 1, avgLikes: 0, avgComments: 14, emv: 1.4, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@livingtestimony_athletix", posts: 1, avgLikes: 0, avgComments: 12, emv: 1.2, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@wearethewildco", posts: 1, avgLikes: 0, avgComments: 12, emv: 1.2, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@ovrjump", posts: 1, avgLikes: 0, avgComments: 10, emv: 1, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@lgusa", posts: 1, avgLikes: 0, avgComments: 10, emv: 1, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@caahockey", posts: 1, avgLikes: 0, avgComments: 9, emv: 0.9, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@holstrength", posts: 1, avgLikes: 0, avgComments: 7, emv: 0.7, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@brenzpizzaco", posts: 1, avgLikes: 0, avgComments: 6, emv: 0.6, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@brandedbills", posts: 2, avgLikes: 0, avgComments: 5, emv: 0.55, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@trysuji", posts: 1, avgLikes: 0, avgComments: 3, emv: 0.3, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@proactiv", posts: 1, avgLikes: 0, avgComments: 3, emv: 0.3, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@evolvedbodyart", posts: 1, avgLikes: 0, avgComments: 2, emv: 0.2, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@sunriseshack", posts: 1, avgLikes: 0, avgComments: 2, emv: 0.2, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@prozis", posts: 2, avgLikes: 0, avgComments: 1, emv: 0.15, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@mizzouthreads", posts: 1, avgLikes: 0, avgComments: 0, emv: 0, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@drinkpoppi", posts: 1, avgLikes: 0, avgComments: 0, emv: 0, engagementRate: 0, liftMultiplier: -1 },
  ],

  // Top Athletes Data (from JABA social media index) - ranked by total likes
  topAthletes: [
    { name: "Jeremiah Smith", position: "WR", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388500294-Jeremiah_Smith_68fca493b06066e3308741b3.png", totalPosts: 27, totalLikes: 958479, totalComments: 15697, avgEngagementRate: 0.055 },
    { name: "Caleb Downs", position: "SAF", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388493704-Caleb_Downs_68fca493b06066e3308741b0.png", totalPosts: 28, totalLikes: 815728, totalComments: 4429, avgEngagementRate: 0.097 },
    { name: "Julian Sayin", position: "QB", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388494249-Julian_Sayin_68fca493b06066e3308741bf.png", totalPosts: 16, totalLikes: 658160, totalComments: 8907, avgEngagementRate: 0.222 },
    { name: "Brandon Inniss", position: "WR", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388465992-Brandon_Inniss_68fca493b06066e3308741af.png", totalPosts: 18, totalLikes: 343880, totalComments: 3630, avgEngagementRate: 0.169 },
    { name: "Carson Hinzman", position: "OL", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388496739-Carson_Hinzman_68fca493b06066e33087420c.png", totalPosts: 16, totalLikes: 306681, totalComments: 901, avgEngagementRate: 1.174 },
    { name: "Tavien St. Clair", position: "QB", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388480768-Tavien_St. Clair_68fca493b06066e3308741bd.png", totalPosts: 14, totalLikes: 266960, totalComments: 1910, avgEngagementRate: 0.391 },
    { name: "Carnell Tate", position: "WR", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388496831-Carnell_Tate_68fca493b06066e3308741cd.png", totalPosts: 22, totalLikes: 266289, totalComments: 6039, avgEngagementRate: 0.136 },
    { name: "Bo Jackson", position: "RB", sport: "Football", image: "https://storage.googleapis.com/jaba-profile-pictures-bucket-prod/profile-pictures/1761388483230-Bo_Jackson_68fca493b06066e3308741db.png", totalPosts: 14, totalLikes: 265536, totalComments: 3373, avgEngagementRate: 0.314 },
  ],

  athleteStats: {
    totalAthletes: 699,
    totalLikes: 13426353,
    topSports: [
      { sport: "Football", athletes: 111, likes: 8605857 },
      { sport: "Wrestling", athletes: 25, likes: 599218 },
      { sport: "Men's Basketball", athletes: 13, likes: 559120 },
      { sport: "Volleyball", athletes: 17, likes: 374320 },
      { sport: "Women's Basketball", athletes: 11, likes: 369570 },
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'K';
  }
  return '$' + num.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// KPI Card Component
function KPICard({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
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
      <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{label}</p>
    </div>
  );
}

// Strategic Insight Banner Component
function InsightBanner({ icon, title, children, variant = 'strategic' }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: 'strategic' | 'positive' | 'neutral';
}) {
  const bgColor = variant === 'strategic'
    ? 'bg-slate-50 border-slate-200'
    : variant === 'positive'
      ? 'bg-emerald-50 border-emerald-200'
      : 'bg-gray-50 border-gray-200';
  const iconBg = variant === 'strategic'
    ? colors.scarlet
    : variant === 'positive'
      ? colors.positive
      : colors.warmGray;

  return (
    <div className={`rounded-xl border p-6 ${bgColor}`}>
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-2">{title}</h4>
          <div className="text-gray-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Performance Variance Card (Neutral framing)
function VarianceCard({
  title,
  variance,
  insight
}: {
  title: string;
  variance: number;
  insight: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{title}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-gray-800">{variance}%</span>
        <span className="text-sm text-gray-500">variance</span>
      </div>
      <p className="text-sm text-gray-600">{insight}</p>
    </div>
  );
}

// Competitive Advantage Card
function AdvantageCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${colors.scarlet}15` }}
      >
        {icon}
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Strategy Card Component
function StrategyCard({
  icon,
  title,
  points
}: {
  icon: React.ReactNode;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: colors.scarlet }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-white font-bold uppercase tracking-wide">{title}</h4>
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: colors.scarlet }} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface OhioStateDashboardProps {
  onBack?: () => void;
}

// Ranking metric options for brand partnerships
const rankingMetrics = [
  { key: 'avgLikes', label: 'Avg Likes' },
  { key: 'emv', label: 'EMV' },
  { key: 'liftMultiplier', label: 'Engagement Lift' },
  { key: 'avgComments', label: 'Avg Comments' },
  { key: 'engagementRate', label: 'Engagement Rate' },
  { key: 'posts', label: 'Total Posts' },
] as const;

type RankingMetricKey = typeof rankingMetrics[number]['key'];

export function OhioStateDashboard({ onBack }: OhioStateDashboardProps) {
  const data = ohioStateData;

  // State for brand ranking metric
  const [brandRankBy, setBrandRankBy] = useState<RankingMetricKey>('avgLikes');

  // Simulator state
  const [athleteAuthenticityScore, setAthleteAuthenticityScore] = useState(73);
  const [brandPartnershipRate, setBrandPartnershipRate] = useState(5);

  // Get top 8 brands sorted by selected metric
  const top8Brands = [...data.allBrandPartnerships]
    .sort((a, b) => {
      const aVal = a[brandRankBy as keyof typeof a] as number;
      const bVal = b[brandRankBy as keyof typeof b] as number;
      return bVal - aVal; // Always descending
    })
    .slice(0, 8)
    .map((brand, index) => ({ ...brand, rank: index + 1 }));

  // Calculate projected opportunity
  const baseEngagement = data.engagementRate;
  const projectedLift = (athleteAuthenticityScore / 100) * 0.5 + (brandPartnershipRate / 100) * 2;
  const projectedEngagement = baseEngagement * (1 + projectedLift);

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: colors.lightBg }}
    >
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
      {/* ═══════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════ */}
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
                <h1 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: colors.scarlet }}>
                  Ohio State Athletics
                </h1>
                <p className="text-sm text-gray-500">Digital Performance & Brand Intelligence</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p className="font-medium">Big Ten Conference</p>
              <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative z-10">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: EXECUTIVE SNAPSHOT (Positive Framing)
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Ohio State Digital Scale</h2>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KPICard
              value={formatNumber(data.followers)}
              label="Total Followers"
              icon={<Star className="w-8 h-8 text-white" />}
            />
            <KPICard
              value={formatNumber(data.totalPosts)}
              label="Athlete Content Posts"
              icon={<FileText className="w-8 h-8 text-white" />}
            />
            <KPICard
              value={data.engagementRate + "%"}
              label="Engagement Rate"
              icon={<BarChart3 className="w-8 h-8 text-white" />}
            />
            <KPICard
              value={formatNumber(data.totalLikes + data.totalComments)}
              label="Total Engagements"
              icon={<Zap className="w-8 h-8 text-white" />}
            />
          </div>

          {/* Executive Insight Banner */}
          <InsightBanner
            icon={<Award className="w-5 h-5 text-white" />}
            title="Executive Insight"
            variant="strategic"
          >
            <p>
              <strong>Ohio State has one of the largest and most active athlete digital footprints in college sports.</strong>{' '}
              With 5.5M+ followers and nearly 9,000 content posts analyzed, the Buckeyes' NIL ecosystem demonstrates
              significant scale and engagement maturity.
            </p>
          </InsightBanner>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1B: ATHLETE DIGITAL FOOTPRINT
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-2">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Athlete Digital Footprint</h2>
            <p className="text-gray-500 text-sm mt-1">
              {data.athleteStats.totalAthletes} athletes across {data.athleteStats.topSports.length}+ sports generating {formatNumber(data.athleteStats.totalLikes)} engagements
            </p>
          </div>

          {/* Athlete Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {data.topAthletes.slice(0, 8).map((athlete, index) => (
              <div
                key={athlete.name}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all"
              >
                {/* Top Row: Image + Rank */}
                <div className="flex items-start justify-between mb-4">
                  {/* Athlete Image */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={athlete.image}
                      alt={athlete.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png';
                      }}
                    />
                  </div>
                  {/* Rank Badge - Premium/Subtle */}
                  <span className="text-xs font-semibold text-gray-400 tracking-wide">
                    #{index + 1}
                  </span>
                </div>

                {/* Athlete Name + Position */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">{athlete.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{athlete.position} · {athlete.sport}</p>
                </div>

                {/* Stats - Likes Primary, Posts Secondary */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(athlete.totalLikes)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">total likes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">{athlete.totalPosts}</p>
                      <p className="text-xs text-gray-400 mt-0.5">posts</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sports Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Engagement Distribution by Sport</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {data.athleteStats.topSports.map((sportData) => (
                <div key={sportData.sport} className="text-left">
                  <p className="font-semibold text-gray-900 mb-1">{sportData.sport}</p>
                  <p className="text-lg font-bold text-gray-800">{formatNumber(sportData.likes)}</p>
                  <p className="text-xs text-gray-400 mt-1">{sportData.athletes} athletes</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretive Microcopy */}
          <p className="text-sm text-gray-500 leading-relaxed">
            High-performing athletes span multiple positions and sports, reflecting broad digital engagement capacity across Ohio State's athletic program.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: IP USAGE = ADVANCED BRAND GOVERNANCE
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-2">Brand Governance Model</h2>
          <p className="text-gray-500 mb-6">Ohio State's IP ecosystem is highly structured — and strategically selective.</p>

          {/* IP Distribution Visual */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Visual breakdown */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Content Distribution</h3>
                <div className="space-y-4">
                  {/* Athlete-Led Content */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Athlete-Led Content</span>
                      <span className="font-bold" style={{ color: colors.positive }}>73.1%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: '73.1%', backgroundColor: colors.positive }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(data.nonIp.posts)} posts — highest engagement</p>
                  </div>
                  {/* IP-Integrated Content */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">IP-Integrated Content</span>
                      <span className="font-bold" style={{ color: colors.scarlet }}>26.9%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: '26.9%', backgroundColor: colors.scarlet }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(data.ipUsage.withIp)} posts — institutional moments</p>
                  </div>
                </div>
              </div>

              {/* Right: Key insight */}
              <div className="flex flex-col justify-center">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h4 className="font-bold text-gray-900 mb-2">Strategic Selectivity</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Only <strong>~27% of athlete content uses school IP</strong> — indicating disciplined brand management.
                    The majority of high-performing content is athlete-led and story-driven.
                  </p>
                  <p className="text-sm mt-3 font-medium" style={{ color: colors.scarlet }}>
                    Ohio State's brand does not rely on logo saturation to drive engagement — athlete authenticity does the work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* IP appears in institutional moments callout */}
          <InsightBanner
            icon={<Target className="w-5 h-5 text-white" />}
            title="Brand Positioning"
            variant="neutral"
          >
            <p>
              Ohio State IP appears most often in <strong>moments of institutional significance</strong>, not day-to-day content —
              a hallmark of <strong>disciplined brand management</strong>. This preserves brand equity while enabling athlete creativity.
            </p>
          </InsightBanner>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: PERFORMANCE INSIGHTS (Neutral Language)
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Performance Variance by IP Type</h2>
            <p className="text-sm text-gray-500">Understanding engagement tradeoffs across content categories</p>
          </div>

          {/* Performance Variance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <VarianceCard
              title="Caption Mentions"
              variance={data.ipUsage.caption.variance}
              insight="Caption mentions prioritize brand alignment over raw engagement metrics."
            />
            <VarianceCard
              title="Visual IP Visibility"
              variance={data.ipUsage.logo.variance}
              insight="Visual IP reinforces brand consistency across institutional content moments."
            />
            <VarianceCard
              title="Official Collaborations"
              variance={data.ipUsage.collaboration.variance}
              insight="Collaborations reflect institutional moments, not creator-style content."
            />
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.scarlet }}>
                    <th className="text-left px-6 py-4 text-white font-semibold">Content Type</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Posts</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Total Likes</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Engagement</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Signal Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 bg-emerald-50/30">
                    <td className="px-6 py-4 font-medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.positive }} />
                        Athlete-Led (No IP)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.nonIp.posts)}</td>
                    <td className="px-6 py-4 text-right">—</td>
                    <td className="px-6 py-4 text-right font-medium" style={{ color: colors.positive }}>{data.nonIp.engagementRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Personal
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.scarlet }} />
                        Caption Mention
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.caption.posts)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.caption.likes)}</td>
                    <td className="px-6 py-4 text-right">{data.ipUsage.caption.engagementRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Institutional
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                    <td className="px-6 py-4 font-medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.scarlet }} />
                        Logo Visible
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.logo.posts)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.logo.likes)}</td>
                    <td className="px-6 py-4 text-right">{data.ipUsage.logo.engagementRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Institutional
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.scarlet }} />
                        Official Collaboration
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.collaboration.posts)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(data.ipUsage.collaboration.likes)}</td>
                    <td className="px-6 py-4 text-right">{data.ipUsage.collaboration.engagementRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Institutional
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: OHIO STATE AS A PREMIUM PLATFORM
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          {/* Section Header with Ranking Control */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-2">Ohio State Athletes Drive Outsized Brand Lift</h2>
              <p className="text-gray-500 text-sm">279 brand partnerships analyzed. Highlights shown below. Rankings adjustable by metric.</p>
            </div>
            {/* Subtle Ranking Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Rank by:</span>
              <select
                value={brandRankBy}
                onChange={(e) => setBrandRankBy(e.target.value as RankingMetricKey)}
                className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer hover:border-gray-300 transition-colors"
              >
                {rankingMetrics.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.scarlet }}>
                    <th className="text-left px-6 py-4 text-white font-semibold">Rank</th>
                    <th className="text-left px-6 py-4 text-white font-semibold">Brand Partner</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Posts</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Avg Likes</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Avg Comments</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">EMV</th>
                    <th className="text-right px-6 py-4 text-white font-semibold">Eng. Lift</th>
                  </tr>
                </thead>
                <tbody>
                  {top8Brands.map((brand, index) => (
                    <tr key={brand.brand} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white"
                          style={{ backgroundColor: colors.scarlet }}
                        >
                          {brand.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{brand.brand}</td>
                      <td className="px-6 py-4 text-right">{brand.posts}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatNumber(brand.avgLikes)}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatNumber(brand.avgComments)}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(brand.emv)}</td>
                      <td className="px-6 py-4 text-right">
                        {brand.liftMultiplier > 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: colors.positive }}>
                            <TrendingUp className="w-3 h-3" />
                            +{brand.liftMultiplier}x
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">{brand.liftMultiplier}x</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premium Platform Insight */}
          <InsightBanner
            icon={<Lightbulb className="w-5 h-5 text-white" />}
            title="Platform Value"
            variant="positive"
          >
            <p>
              <strong>Ohio State athletes are among the most effective brand amplifiers in college sports</strong> when given creative freedom.
              Red Bull achieved <strong>+97.3x engagement lift</strong> — demonstrating that brand partnerships thrive
              when athletes lead with authenticity.
            </p>
            <p className="mt-2 font-semibold" style={{ color: colors.scarlet }}>
              This reflects well on athletes, NIL infrastructure, and school reputation.
            </p>
          </InsightBanner>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: WHY THIS IS A COMPETITIVE ADVANTAGE
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-6">Why This Is a Competitive Advantage for Ohio State</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <AdvantageCard
              icon={<Shield className="w-6 h-6" style={{ color: colors.scarlet }} />}
              title="Brand Equity Over Exposure"
              description="Ohio State protects long-term brand value by avoiding overuse of IP. Strategic selectivity preserves institutional prestige."
            />
            <AdvantageCard
              icon={<User className="w-6 h-6" style={{ color: colors.scarlet }} />}
              title="Athlete-First Performance Model"
              description="Athletes outperform when content feels personal — Ohio State enables this by not mandating heavy IP integration."
            />
            <AdvantageCard
              icon={<Building2 className="w-6 h-6" style={{ color: colors.scarlet }} />}
              title="Premium Partner Signal"
              description="Brands achieve higher ROI without needing aggressive logo placement. Co-creation beats compliance."
            />
          </div>

          {/* Core positioning statement */}
          <div
            className="rounded-xl p-6 text-white text-center"
            style={{ backgroundColor: colors.scarlet }}
          >
            <p className="text-lg font-semibold leading-relaxed max-w-3xl mx-auto">
              "Ohio State's NIL ecosystem balances institutional strength with athlete individuality —
              a model brands increasingly prefer."
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: OPPORTUNITIES (Soft, Collaborative)
            ═══════════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-6">Optimization Opportunities</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StrategyCard
              icon={<Target className="w-4 h-4 text-white" />}
              title="Next Layer"
              points={[
                "Explore tiered IP usage models for different campaign types",
                "Identify brand categories where IP enhances trust",
                "Quantify when institutional presence matters most"
              ]}
            />
            <StrategyCard
              icon={<BarChart3 className="w-4 h-4 text-white" />}
              title="Measurement"
              points={[
                "Track brand lift by IP intensity level",
                "Benchmark athlete-led vs institutional content ROI",
                "Monitor partner satisfaction with creative freedom"
              ]}
            />
            <StrategyCard
              icon={<Zap className="w-4 h-4 text-white" />}
              title="Activation"
              points={[
                "Test IP-light campaigns for high-engagement moments",
                "Enable athlete voice in institutional partnerships",
                "Scale what's working — authentic storytelling"
              ]}
            />
          </div>

          {/* Scenario Modeling */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Opportunity Modeling</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Adjust these factors to project potential engagement improvements.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="space-y-6">
                {/* Athlete Authenticity Score */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Athlete Authenticity Index</label>
                    <span className="text-sm font-bold" style={{ color: colors.scarlet }}>{athleteAuthenticityScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={athleteAuthenticityScore}
                    onChange={(e) => setAthleteAuthenticityScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: colors.scarlet }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>50%</span>
                    <span>Current: 73%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Brand Partnership Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Brand Partnership Activation Rate</label>
                    <span className="text-sm font-bold" style={{ color: colors.scarlet }}>{brandPartnershipRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={brandPartnershipRate}
                    onChange={(e) => setBrandPartnershipRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: colors.scarlet }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1%</span>
                    <span>Current: ~5%</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>

              {/* Projected Outputs */}
              <div className="space-y-4">
                <div
                  className="rounded-xl p-5 text-white"
                  style={{ backgroundColor: colors.scarlet }}
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-1">Projected Engagement Rate</p>
                  <p className="text-4xl font-black">{projectedEngagement.toFixed(2)}%</p>
                  <p className="text-sm text-white/80 mt-1">vs current {baseEngagement}%</p>
                </div>

                <div
                  className="rounded-xl p-5 text-white"
                  style={{ backgroundColor: colors.positive }}
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-1">Potential Lift</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <p className="text-4xl font-black">+{(projectedLift * 100).toFixed(1)}%</p>
                  </div>
                  <p className="text-sm text-white/80 mt-1">engagement improvement opportunity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER (Mature Ecosystem Positioning)
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 mt-12 bg-white/95 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Closing Statement */}
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <p className="text-gray-600 leading-relaxed">
              Ohio State's data reflects a <strong>mature NIL environment</strong> — one that prioritizes
              brand longevity, athlete performance, and partner outcomes.
              This report helps make those strengths measurable.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"
                alt="Ohio State"
                className="w-8 h-8"
              />
              <div>
                <p className="font-bold" style={{ color: colors.scarlet }}>Ohio State Athletics</p>
                <p className="text-sm text-gray-500">Digital Performance & Brand Intelligence</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">
                Generated using <strong>JABA's IP & Brand Performance Engine</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OhioStateDashboard;
