/**
 * DOUBLE-CHECK AUDIT: Manually verify specific values by direct computation
 * This is independent of the generation scripts — computes everything from scratch
 */

import { readFileSync } from 'fs';

const RAW = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));
let errors = 0;

function assertEqual(label, expected, actual, tolerance = 0) {
  const diff = Math.abs(expected - actual);
  const relDiff = expected !== 0 ? diff / Math.abs(expected) : diff;
  if (tolerance === 0 ? expected !== actual : relDiff > tolerance) {
    console.log(`  ❌ ${label}: source=${expected}, file=${actual}`);
    errors++;
  } else {
    console.log(`  ✅ ${label}: ${actual}`);
  }
}

// ═══════════════════════════════════════════
// DOUBLE-CHECK OHIO STATE
// ═══════════════════════════════════════════
console.log('\n═══ DOUBLE-CHECK: Ohio State ═══');
const ohioPosts = RAW.filter(p => p.athlete?.school?.name === 'Ohio State');
const ohioSrc = readFileSync('src/components/OhioStateIPImpact.tsx', 'utf8');

// Manual counts
const ohioLogo = ohioPosts.filter(p => p.hasOrganizationLogo);
const ohioMention = ohioPosts.filter(p => p.hasOrganizationInCaption);
const ohioCollab = ohioPosts.filter(p => p.isOrganizationCollaboration);
const ohioAnyIP = ohioPosts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const ohioNoIP = ohioPosts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

assertEqual('Ohio total posts', ohioPosts.length, 12384);
assertEqual('Ohio logo posts', ohioLogo.length, 5245);
assertEqual('Ohio mention posts', ohioMention.length, 2506);
assertEqual('Ohio collab posts', ohioCollab.length, 195);
assertEqual('Ohio IP posts', ohioAnyIP.length, 5923);
assertEqual('Ohio baseline posts', ohioNoIP.length, 6461);

// Verify engagement rates
const ohioLogoEng = ohioLogo.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioLogo.length;
const ohioLogoBaseEng = ohioPosts.filter(p => !p.hasOrganizationLogo).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioPosts.filter(p => !p.hasOrganizationLogo).length;
const ohioLogoDelta = ((ohioLogoEng - ohioLogoBaseEng) / ohioLogoBaseEng) * 100;
assertEqual('Ohio logo delta', Math.round(ohioLogoDelta * 10) / 10, 190, 0.02);

const ohioMentionEng = ohioMention.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioMention.length;
const ohioMentionBaseEng = ohioPosts.filter(p => !p.hasOrganizationInCaption).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioPosts.filter(p => !p.hasOrganizationInCaption).length;
const ohioMentionDelta = ((ohioMentionEng - ohioMentionBaseEng) / ohioMentionBaseEng) * 100;
assertEqual('Ohio mention delta', Math.round(ohioMentionDelta * 10) / 10, 297.8, 0.02);

const ohioCollabEng = ohioCollab.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioCollab.length;
const ohioCollabBaseEng = ohioPosts.filter(p => !p.isOrganizationCollaboration).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / ohioPosts.filter(p => !p.isOrganizationCollaboration).length;
const ohioCollabDelta = ((ohioCollabEng - ohioCollabBaseEng) / ohioCollabBaseEng) * 100;
assertEqual('Ohio collab delta', Math.round(ohioCollabDelta * 10) / 10, 84.9, 0.02);

// Verify these match what's in the TSX
const ohioTsxCollabDelta = ohioSrc.match(/collaboration:.*?delta:\s*([\d.-]+)/s);
const ohioTsxLogoDelta = ohioSrc.match(/logo:.*?delta:\s*([\d.-]+)/s);
const ohioTsxMentionDelta = ohioSrc.match(/mention:.*?delta:\s*([\d.-]+)/s);

if (ohioTsxCollabDelta) assertEqual('Ohio TSX collab delta matches', Math.round(ohioCollabDelta * 10) / 10, parseFloat(ohioTsxCollabDelta[1]), 0.02);
if (ohioTsxLogoDelta) assertEqual('Ohio TSX logo delta matches', Math.round(ohioLogoDelta * 10) / 10, parseFloat(ohioTsxLogoDelta[1]), 0.02);
if (ohioTsxMentionDelta) assertEqual('Ohio TSX mention delta matches', Math.round(ohioMentionDelta * 10) / 10, parseFloat(ohioTsxMentionDelta[1]), 0.02);

// Verify EMV
const ohioEmv = ohioPosts.reduce((s, p) => {
  const e = p.metrics?.emv || 0;
  return s + (e > 0 ? e : (p.metrics?.likes || 0) * 0.5 + (p.metrics?.comments || 0) * 1.5);
}, 0);
assertEqual('Ohio total EMV', Math.round(ohioEmv), 12886314, 0.001);

// ═══════════════════════════════════════════
// DOUBLE-CHECK GEORGIA
// ═══════════════════════════════════════════
console.log('\n═══ DOUBLE-CHECK: Georgia ═══');
const gaPosts = RAW.filter(p => p.athlete?.school?.name === 'University Of Georgia');
const gaSrc = readFileSync('src/components/GeorgiaIPImpact.tsx', 'utf8');

const gaLogo = gaPosts.filter(p => p.hasOrganizationLogo);
const gaMention = gaPosts.filter(p => p.hasOrganizationInCaption);
const gaCollab = gaPosts.filter(p => p.isOrganizationCollaboration);
const gaAnyIP = gaPosts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const gaNoIP = gaPosts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

assertEqual('Georgia total posts', gaPosts.length, 6868);
assertEqual('Georgia logo posts', gaLogo.length, 729);
assertEqual('Georgia mention posts', gaMention.length, 336);
assertEqual('Georgia collab posts', gaCollab.length, 80);
assertEqual('Georgia IP posts', gaAnyIP.length, 1116);
assertEqual('Georgia baseline posts', gaNoIP.length, 5752);

const gaLogoEng = gaLogo.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaLogo.length;
const gaLogoBaseEng = gaPosts.filter(p => !p.hasOrganizationLogo).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaPosts.filter(p => !p.hasOrganizationLogo).length;
const gaLogoDelta = ((gaLogoEng - gaLogoBaseEng) / gaLogoBaseEng) * 100;
assertEqual('Georgia logo delta', Math.round(gaLogoDelta * 10) / 10, 3.5, 0.05);

const gaMentionEng = gaMention.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaMention.length;
const gaMentionBaseEng = gaPosts.filter(p => !p.hasOrganizationInCaption).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaPosts.filter(p => !p.hasOrganizationInCaption).length;
const gaMentionDelta = ((gaMentionEng - gaMentionBaseEng) / gaMentionBaseEng) * 100;
assertEqual('Georgia mention delta', Math.round(gaMentionDelta * 10) / 10, 46.9, 0.02);

const gaCollabEng = gaCollab.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaCollab.length;
const gaCollabBaseEng = gaPosts.filter(p => !p.isOrganizationCollaboration).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / gaPosts.filter(p => !p.isOrganizationCollaboration).length;
const gaCollabDelta = ((gaCollabEng - gaCollabBaseEng) / gaCollabBaseEng) * 100;
assertEqual('Georgia collab delta', Math.round(gaCollabDelta * 10) / 10, 248.1, 0.02);

const gaEmv = gaPosts.reduce((s, p) => {
  const e = p.metrics?.emv || 0;
  return s + (e > 0 ? e : (p.metrics?.likes || 0) * 0.5 + (p.metrics?.comments || 0) * 1.5);
}, 0);
assertEqual('Georgia total EMV', Math.round(gaEmv), 6220397, 0.001);

// ═══════════════════════════════════════════
// DOUBLE-CHECK PLAYFLY (spot check 3 schools)
// ═══════════════════════════════════════════
console.log('\n═══ DOUBLE-CHECK: Playfly (spot checks) ═══');

function spotCheckSchool(schoolName, fileSlug) {
  const posts = RAW.filter(p => p.athlete?.school?.name === schoolName);
  const json = JSON.parse(readFileSync(`public/data/${fileSlug}-ip-impact.json`, 'utf8'));

  assertEqual(`${schoolName} totalContents`, posts.length, json.overall.totalContents);

  const logo = posts.filter(p => p.hasOrganizationLogo).length;
  const mention = posts.filter(p => p.hasOrganizationInCaption).length;
  const collab = posts.filter(p => p.isOrganizationCollaboration).length;
  const anyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;

  assertEqual(`${schoolName} logo`, logo, json.counts.hasOrganizationLogo);
  assertEqual(`${schoolName} mention`, mention, json.counts.hasOrganizationInCaption);
  assertEqual(`${schoolName} collab`, collab, json.counts.isOrganizationCollaboration);
  assertEqual(`${schoolName} withIp`, anyIP, json.counts.withIp);

  // Check lift direction
  const logoEng = posts.filter(p => p.hasOrganizationLogo).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / logo;
  const noLogoEng = posts.filter(p => !p.hasOrganizationLogo).reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / (posts.length - logo);
  const computedLogoLift = ((logoEng - noLogoEng) / noLogoEng) * 100;
  assertEqual(`${schoolName} logo lift`, Math.round(computedLogoLift * 100) / 100, Math.round(json.logo.avgLift * 100) / 100, 0.02);
}

spotCheckSchool('Baylor', 'baylor');
spotCheckSchool('Auburn University', 'auburn-university');
spotCheckSchool('University of Virginia', 'university-of-virginia');
spotCheckSchool('Penn State University', 'penn-state-university');
spotCheckSchool('University of Texas at San Antonio (UTSA)', 'university-of-texas-at-san-antonio-utsa');

// ═══════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════
console.log('\n═══════════════════════════════════════════');
if (errors === 0) {
  console.log('✅ DOUBLE-CHECK PASSED: All values verified independently from source data');
} else {
  console.log(`❌ DOUBLE-CHECK FAILED: ${errors} errors found`);
}
