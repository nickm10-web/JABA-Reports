#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const posts = JSON.parse(readFileSync('public/data/notre-dame-content-posts.json', 'utf8'));

const athleteMap = new Map();

for (const post of posts) {
  const aid = post.athlete?._id;
  if (!aid) continue;

  if (!athleteMap.has(aid)) {
    athleteMap.set(aid, {
      _id: aid,
      name: post.athlete.name,
      sport: post.athlete.sport,
      position: post.athlete.position || '-',
      image: post.athlete.image || '',
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      avgEngagementRate: 0,
      instagramPosts: 0,
      tiktokPosts: 0,
      followers: 0,
      engSum: 0,
      engCount: 0,
    });
  }

  const a = athleteMap.get(aid);
  a.totalPosts++;
  a.totalLikes += post.metrics?.likes || 0;
  a.totalComments += post.metrics?.comments || 0;

  // Get max followers from either location
  const followerCount = post.athlete?.followers || post.metrics?.followers || 0;
  if (followerCount > 0) a.followers = Math.max(a.followers, followerCount);

  if (post.mediaType === 'PHOTO' || post.mediaType === 'CAROUSEL_ALBUM' || post.mediaType === 'VIDEO') {
    a.instagramPosts++;
  } else if (post.mediaType === 'TIKTOK') {
    a.tiktokPosts++;
  }

  const er = post.metrics?.engagementRate || 0;
  if (er > 0) {
    a.engSum += er;
    a.engCount++;
  }
}

const athletes = [];
athleteMap.forEach(a => {
  a.avgEngagementRate = a.engCount > 0 ? a.engSum / a.engCount / 100 : 0;
  delete a.engSum;
  delete a.engCount;
  athletes.push(a);
});

athletes.sort((a, b) => b.totalLikes - a.totalLikes);

const roster = { athletes };

writeFileSync('public/data/notre-dame-roster.json', JSON.stringify(roster, null, 2));
console.log(`Generated Notre Dame roster: ${athletes.length} athletes`);
console.log(`Athletes with followers > 0: ${athletes.filter(a => a.followers > 0).length}`);
