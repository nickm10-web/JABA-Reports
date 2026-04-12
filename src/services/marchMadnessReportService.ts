import type {
  BrandLeaderboardEntry,
  MarchMadnessReportData,
  SchoolCoverageRecord,
  TournamentParticipant,
} from '../types/marchMadness';
import { loadMarchMadnessDealPerformance } from './marchMadnessDealsService';
import { loadMarchMadnessGrowthRecords } from './marchMadnessGrowthService';
import { loadParticipants, resolveLocalSchoolDataset, TOURNAMENT_WINDOWS } from './marchMadnessShared';

function buildCoverage(participants: TournamentParticipant[]): SchoolCoverageRecord[] {
  return participants.map((participant) => {
    const dataset = resolveLocalSchoolDataset(participant);
    const hasLocalData = Boolean(dataset.config);
    return {
      schoolId: participant.schoolId,
      schoolName: participant.schoolName,
      gender: participant.gender,
      seed: participant.seed,
      hasLocalData,
      coverageStatus: hasLocalData ? 'Local roster and content data available' : 'No local athlete/post dataset available',
      contentFile: dataset.contentFile,
      rosterFile: dataset.rosterFile,
    };
  });
}

function buildBrandLeaderboard(
  measuredDeals: MarchMadnessReportData['dealPerformances']
): BrandLeaderboardEntry[] {
  const grouped = new Map<string, BrandLeaderboardEntry & { athletes: Set<string>; schools: Set<string> }>();

  for (const deal of measuredDeals) {
    const existing = grouped.get(deal.brandName);
    if (existing) {
      existing.totalEMV += deal.totalEMV;
      existing.totalEngagement += deal.totalEngagement;
      existing.totalDeals += 1;
      existing.athletes.add(`${deal.schoolName}:${deal.athleteName}`);
      existing.schools.add(deal.schoolName);
      continue;
    }

    grouped.set(deal.brandName, {
      brandName: deal.brandName,
      totalEMV: deal.totalEMV,
      totalEngagement: deal.totalEngagement,
      totalDeals: 1,
      athletesActivated: 0,
      schoolsActivated: 0,
      athletes: new Set([`${deal.schoolName}:${deal.athleteName}`]),
      schools: new Set([deal.schoolName]),
    });
  }

  return Array.from(grouped.values())
    .map((entry) => ({
      brandName: entry.brandName,
      totalEMV: entry.totalEMV,
      totalEngagement: entry.totalEngagement,
      totalDeals: entry.totalDeals,
      athletesActivated: entry.athletes.size,
      schoolsActivated: entry.schools.size,
    }))
    .sort((a, b) => b.totalEMV - a.totalEMV);
}

export async function loadMarchMadnessReportData(): Promise<MarchMadnessReportData> {
  const participants = await loadParticipants();
  const coverage = buildCoverage(participants);
  const participantsWithLocalData = participants.filter((participant) => resolveLocalSchoolDataset(participant).config);
  const [growthRecords, allDeals] = await Promise.all([
    loadMarchMadnessGrowthRecords(participantsWithLocalData),
    loadMarchMadnessDealPerformance(participantsWithLocalData),
  ]);

  const measuredDeals = allDeals.filter((deal) => deal.performanceStatus === 'measured' && deal.verificationStatus !== 'unverified');
  const manualOnlyDeals = allDeals.filter((deal) => deal.performanceStatus === 'manual_only');
  const growthAvailableCount = growthRecords.filter((record) => record.growthStatus === 'available').length;
  const growthUnavailableCount = growthRecords.length - growthAvailableCount;
  const brandLeaderboard = buildBrandLeaderboard(measuredDeals);

  return {
    windows: TOURNAMENT_WINDOWS,
    participants,
    coverage,
    growthRecords,
    growthAvailableCount,
    growthUnavailableCount,
    dealPerformances: measuredDeals,
    manualOnlyDeals,
    brandLeaderboard,
    totals: {
      participatingSchools: participants.length,
      schoolsWithLocalData: coverage.filter((record) => record.hasLocalData).length,
      basketballAthletesEvaluated: growthRecords.length,
      verifiedTournamentDeals: measuredDeals.length + manualOnlyDeals.length,
      totalMeasuredEMV: measuredDeals.reduce((sum, deal) => sum + deal.totalEMV, 0),
    },
  };
}
