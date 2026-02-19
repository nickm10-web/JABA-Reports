import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));
const all = data.filter(p => p?.athlete?.school?.name === 'Florida');
console.log('Total posts:', all.length);
const logo = all.filter(p => p.hasOrganizationLogo);
const mention = all.filter(p => p.hasOrganizationInCaption);
const collab = all.filter(p => p.isOrganizationCollaboration);
const withAny = all.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const withoutAny = all.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);
const avg = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length * 100 : 0;
const avgLikes = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.likes||0), 0) / posts.length : 0;
const avgComments = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.comments||0), 0) / posts.length : 0;
console.log('adoption:', (withAny.length/all.length*100).toFixed(1) + '%');
console.log('logo:', logo.length, 'eng:', avg(logo).toFixed(2) + '%,', 'likes:', avgLikes(logo).toFixed(0), 'comments:', avgComments(logo).toFixed(0));
console.log('mention:', mention.length, 'eng:', avg(mention).toFixed(2) + '%,', 'likes:', avgLikes(mention).toFixed(0), 'comments:', avgComments(mention).toFixed(0));
console.log('collab:', collab.length, 'eng:', avg(collab).toFixed(2) + '%,', 'likes:', avgLikes(collab).toFixed(0), 'comments:', avgComments(collab).toFixed(0));
console.log('without IP:', withoutAny.length, 'eng:', avg(withoutAny).toFixed(2) + '%,', 'likes:', avgLikes(withoutAny).toFixed(0), 'comments:', avgComments(withoutAny).toFixed(0));
const sponsored = all.filter(p => p.isSponsored);
console.log('sponsored posts:', sponsored.length);
// Total followers (pick a consistent one)
const withFollowers = all.filter(p => p.metrics?.followers > 0);
console.log('posts with follower count:', withFollowers.length);
const topByFollowers = [...withFollowers].sort((a,b) => b.metrics.followers - a.metrics.followers).slice(0,3);
console.log('top followers:', topByFollowers.map(p => ({name: p.athlete?.name, followers: p.metrics.followers})));
// Unique athletes
const athletes = new Set(all.map(p => p.athlete?.name).filter(Boolean));
console.log('unique athletes:', athletes.size);
