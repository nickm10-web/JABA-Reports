import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));

// Find exact school name
const allSchools = [...new Set(data.map(p => p?.athlete?.school?.name).filter(Boolean))].sort();
const ky = allSchools.filter(s => s.toLowerCase().includes('kentucky'));
console.log('Kentucky schools in dataset:', ky);

const all = data.filter(p => p?.athlete?.school?.name === 'Kentucky');
console.log('\nTotal posts:', all.length);

const logo = all.filter(p => p.hasOrganizationLogo);
const mention = all.filter(p => p.hasOrganizationInCaption);
const collab = all.filter(p => p.isOrganizationCollaboration);
const withAny = all.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const withoutAny = all.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

const avg = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length * 100 : 0;
const avgLikes = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.likes||0), 0) / posts.length : 0;
const avgComments = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.comments||0), 0) / posts.length : 0;

console.log('adoption:', (withAny.length/all.length*100).toFixed(1) + '%');
console.log('logo:', logo.length, '| eng:', avg(logo).toFixed(2) + '% | likes:', avgLikes(logo).toFixed(1), '| comments:', avgComments(logo).toFixed(1));
console.log('mention:', mention.length, '| eng:', avg(mention).toFixed(2) + '% | likes:', avgLikes(mention).toFixed(1), '| comments:', avgComments(mention).toFixed(1));
console.log('collab:', collab.length, '| eng:', avg(collab).toFixed(2) + '% | likes:', avgLikes(collab).toFixed(1), '| comments:', avgComments(collab).toFixed(1));
console.log('without IP:', withoutAny.length, '| eng:', avg(withoutAny).toFixed(2) + '% | likes:', avgLikes(withoutAny).toFixed(1), '| comments:', avgComments(withoutAny).toFixed(1));

const logoOnly = all.filter(p => p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);
console.log('\nBaseline for logo (without logo):', all.length - logo.length, '| eng:', avg(all.filter(p => !p.hasOrganizationLogo)).toFixed(2) + '%');
console.log('Baseline for mention (without mention):', all.length - mention.length, '| eng:', avg(all.filter(p => !p.hasOrganizationInCaption)).toFixed(2) + '%');
console.log('Baseline for collab (without collab):', all.length - collab.length, '| eng:', avg(all.filter(p => !p.isOrganizationCollaboration)).toFixed(2) + '%');

const sponsored = all.filter(p => p.isSponsored);
console.log('\nSponsored posts:', sponsored.length);
console.log('Unique athletes:', new Set(all.map(p => p.athlete?.name).filter(Boolean)).size);

// Total likes/comments for EMV
const totalLikes = all.reduce((s,p) => s + (p.metrics?.likes||0), 0);
const totalComments = all.reduce((s,p) => s + (p.metrics?.comments||0), 0);
console.log('\nTotal likes:', totalLikes, '| Total comments:', totalComments);
console.log('Total EMV:', ((totalLikes * 0.5) + (totalComments * 1.5)).toFixed(0));
