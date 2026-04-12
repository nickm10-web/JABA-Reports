import { calculatePostEMV } from '../utils/emvCalculator';
import type {
  DealVerificationStatus,
  ManualDealRecord,
  TournamentDealPerformance,
  TournamentParticipant,
  TournamentPost,
} from '../types/marchMadness';
import {
  formatBrandName,
  loadLocalPosts,
  loadManualDeals,
  normalizeBrandName,
  resolveLocalSchoolDataset,
} from './marchMadnessShared';

function isDealCandidate(post: TournamentPost): boolean {
  return (
    post.isSponsored ||
    Boolean(post.sponsorPartner) ||
    post.isCollaboration ||
    post.isOrganizationCollaboration
  );
}

function matchManualDeal(post: TournamentPost, deals: ManualDealRecord[]): ManualDealRecord[] {
  const publishedAt = new Date(post.publishedAt).getTime();

  return deals.filter((deal) => {
    const start = new Date(`${deal.dealStartDate}T00:00:00Z`).getTime();
    const end = new Date(`${deal.dealEndDate || deal.dealStartDate}T23:59:59Z`).getTime();
    return (
      deal.gender === post.gender &&
      deal.athleteName === post.athleteName &&
      deal.schoolName === post.schoolName &&
      normalizeBrandName(deal.brandName) === normalizeBrandName(post.brandName || '') &&
      publishedAt >= start &&
      publishedAt <= end
    );
  });
}

function buildDealId(
  athleteName: string,
  schoolName: string,
  gender: string,
  brandName: string
): string {
  return [athleteName, schoolName, gender, brandName]
    .map((part) => normalizeBrandName(part))
    .join('__');
}

export async function loadMarchMadnessDealPerformance(
  participants: TournamentParticipant[]
): Promise<TournamentDealPerformance[]> {
  const manualDeals = await loadManualDeals();
  const localRows = await Promise.all(
    participants.map(async (participant) => {
      const dataset = resolveLocalSchoolDataset(participant);
      const posts = await loadLocalPosts(dataset);
      return posts
        .filter(isDealCandidate)
        .filter((post) => Boolean(post.brandName))
        .map((post) => ({ participant, post }));
    })
  );

  const grouped = new Map<string, TournamentDealPerformance>();

  for (const { participant, post } of localRows.flat()) {
    if (!post.brandName) {
      continue;
    }

    const brandName = formatBrandName(post.brandName);
    const dealId = buildDealId(post.athleteName, participant.schoolName, participant.gender, brandName);
    const matchedManualDeals = matchManualDeal(post, manualDeals);
    const verificationStatus: DealVerificationStatus = matchedManualDeals.length > 0 ? 'verified_both' : 'verified_local';
    const existing = grouped.get(dealId);
    const postEMV = calculatePostEMV({ likes: post.likes, comments: post.comments });
    const evidenceUrls = [
      ...matchedManualDeals.map((deal) => deal.evidenceUrl).filter(Boolean),
      post.permalink || '',
    ].filter(Boolean);

    if (existing) {
      existing.postCount += 1;
      existing.totalLikes += post.likes;
      existing.totalComments += post.comments;
      existing.totalEngagement += post.likes + post.comments;
      existing.totalEMV += postEMV;
      existing.avgEMVPerPost = existing.totalEMV / existing.postCount;
      existing.verificationStatus = existing.verificationStatus === 'verified_local' && matchedManualDeals.length > 0
        ? 'verified_both'
        : existing.verificationStatus;
      existing.evidenceUrls = Array.from(new Set([...existing.evidenceUrls, ...evidenceUrls]));
      continue;
    }

    grouped.set(dealId, {
      dealId,
      athleteName: post.athleteName,
      schoolName: participant.schoolName,
      gender: participant.gender,
      brandName,
      postCount: 1,
      totalLikes: post.likes,
      totalComments: post.comments,
      totalEngagement: post.likes + post.comments,
      totalEMV: postEMV,
      avgEMVPerPost: postEMV,
      verificationStatus,
      performanceStatus: 'measured',
      evidenceUrls,
    });
  }

  for (const deal of manualDeals) {
    const brandName = formatBrandName(deal.brandName);
    const dealId = buildDealId(deal.athleteName, deal.schoolName, deal.gender, brandName);
    if (grouped.has(dealId)) {
      const current = grouped.get(dealId)!;
      current.verificationStatus = 'verified_both';
      current.evidenceUrls = Array.from(new Set([...current.evidenceUrls, deal.evidenceUrl]));
      continue;
    }

    grouped.set(dealId, {
      dealId,
      athleteName: deal.athleteName,
      schoolName: deal.schoolName,
      gender: deal.gender,
      brandName,
      postCount: 0,
      totalLikes: 0,
      totalComments: 0,
      totalEngagement: 0,
      totalEMV: 0,
      avgEMVPerPost: 0,
      verificationStatus: 'verified_manual',
      performanceStatus: 'manual_only',
      evidenceUrls: deal.evidenceUrl ? [deal.evidenceUrl] : [],
    });
  }

  return Array.from(grouped.values()).sort((a, b) => {
    if (b.totalEMV !== a.totalEMV) {
      return b.totalEMV - a.totalEMV;
    }
    if (b.avgEMVPerPost !== a.avgEMVPerPost) {
      return b.avgEMVPerPost - a.avgEMVPerPost;
    }
    return b.totalEngagement - a.totalEngagement;
  });
}
