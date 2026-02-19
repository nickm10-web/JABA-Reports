import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/Ohio_contents.json', 'utf8'));
const avg = (arr, f) => arr.length ? arr.reduce((s,p) => s + (p.metrics?.[f]||0), 0) / arr.length : 0;
const sum = (arr, f) => arr.reduce((s,p) => s + (p.metrics?.[f]||0), 0);

const totalLikes = sum(data, 'likes');
const totalComments = sum(data, 'comments');
const engRate = avg(data, 'engagementRate');

const withAnyIP = data.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const noIP = data.filter(p => !(p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration));
const postsWithIP = withAnyIP.length;
const avgLiftIP = ((avg(withAnyIP,'likes') - avg(noIP,'likes')) / avg(noIP,'likes') * 100);

const withLogo = data.filter(p => p.hasOrganizationLogo);
const noLogo = data.filter(p => !p.hasOrganizationLogo);
const withMention = data.filter(p => p.hasOrganizationInCaption);
const noMention = data.filter(p => !p.hasOrganizationInCaption);
const withCollab = data.filter(p => p.isOrganizationCollaboration);
const noCollab = data.filter(p => !p.isOrganizationCollaboration);

console.log(JSON.stringify({
  totalLikes: Math.round(totalLikes),
  totalComments: Math.round(totalComments),
  engagementRate: +engRate.toFixed(4),
  postsWithIP,
  avgLift: +avgLiftIP.toFixed(1),
  baseline: { posts: noIP.length, engagementRate: +avg(noIP,'engagementRate').toFixed(4) },
  logo: {
    posts: withLogo.length,
    likes: +avg(withLogo,'likes').toFixed(2),
    comments: +avg(withLogo,'comments').toFixed(2),
    engagementRate: +avg(withLogo,'engagementRate').toFixed(4),
    delta: +((avg(withLogo,'likes') - avg(noLogo,'likes'))/avg(noLogo,'likes')*100).toFixed(1),
    emv: Math.round(sum(withLogo,'emv')),
    baselineEngRate: +avg(noLogo,'engagementRate').toFixed(4),
    baselinePosts: noLogo.length,
    baselineLikes: +avg(noLogo,'likes').toFixed(2),
    baselineComments: +avg(noLogo,'comments').toFixed(2),
  },
  mention: {
    posts: withMention.length,
    likes: +avg(withMention,'likes').toFixed(2),
    comments: +avg(withMention,'comments').toFixed(2),
    engagementRate: +avg(withMention,'engagementRate').toFixed(4),
    delta: +((avg(withMention,'likes') - avg(noMention,'likes'))/avg(noMention,'likes')*100).toFixed(1),
    emv: Math.round(sum(withMention,'emv')),
    baselineEngRate: +avg(noMention,'engagementRate').toFixed(4),
    baselinePosts: noMention.length,
    baselineLikes: +avg(noMention,'likes').toFixed(2),
    baselineComments: +avg(noMention,'comments').toFixed(2),
  },
  collaboration: {
    posts: withCollab.length,
    likes: +avg(withCollab,'likes').toFixed(2),
    comments: +avg(withCollab,'comments').toFixed(2),
    engagementRate: +avg(withCollab,'engagementRate').toFixed(4),
    delta: +((avg(withCollab,'likes') - avg(noCollab,'likes'))/avg(noCollab,'likes')*100).toFixed(1),
    emv: Math.round(sum(withCollab,'emv')),
    baselineEngRate: +avg(noCollab,'engagementRate').toFixed(4),
    baselinePosts: noCollab.length,
    baselineLikes: +avg(noCollab,'likes').toFixed(2),
    baselineComments: +avg(noCollab,'comments').toFixed(2),
  },
}, null, 2));
