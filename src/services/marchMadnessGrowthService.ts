import type { AthleteGrowthRecord, FollowerSnapshot, TournamentParticipant } from '../types/marchMadness';
import {
  getWindowForGender,
  loadFollowerSnapshots,
  loadLocalRoster,
  resolveLocalSchoolDataset,
} from './marchMadnessShared';

function snapshotTime(snapshot: FollowerSnapshot): number {
  return new Date(snapshot.capturedAt).getTime();
}

export async function loadMarchMadnessGrowthRecords(
  participants: TournamentParticipant[]
): Promise<AthleteGrowthRecord[]> {
  const snapshots = await loadFollowerSnapshots();
  const records = await Promise.all(
    participants.map(async (participant) => {
      const dataset = resolveLocalSchoolDataset(participant);
      const roster = await loadLocalRoster(dataset);
      const window = getWindowForGender(participant.gender);
      const beforeCutoff = new Date(`${window.selectionSunday}T23:59:59Z`).getTime();
      const afterStart = new Date(`${window.titleGame}T00:00:00Z`).getTime();
      const afterEnd = new Date(afterStart + 14 * 24 * 60 * 60 * 1000).getTime();

      return roster.map((athlete) => {
        const athleteSnapshots = snapshots.filter((snapshot) => {
          return (
            snapshot.athleteName === athlete.athleteName &&
            snapshot.schoolName === participant.schoolName &&
            snapshot.sport === athlete.sport
          );
        });

        const before = athleteSnapshots
          .filter((snapshot) => snapshotTime(snapshot) <= beforeCutoff)
          .sort((a, b) => snapshotTime(b) - snapshotTime(a))[0];

        const after = athleteSnapshots
          .filter((snapshot) => snapshotTime(snapshot) >= afterStart && snapshotTime(snapshot) <= afterEnd)
          .sort((a, b) => snapshotTime(a) - snapshotTime(b))[0];

        if (!before || !after) {
          return {
            athleteId: athlete.athleteId,
            athleteName: athlete.athleteName,
            schoolName: participant.schoolName,
            gender: participant.gender,
            sport: athlete.sport,
            followersBefore: before?.followers ?? null,
            followersAfter: after?.followers ?? null,
            absoluteGrowth: null,
            percentGrowth: null,
            growthStatus: 'unavailable',
          } satisfies AthleteGrowthRecord;
        }

        const absoluteGrowth = after.followers - before.followers;
        const percentGrowth = before.followers > 0 ? (absoluteGrowth / before.followers) * 100 : null;

        return {
          athleteId: athlete.athleteId,
          athleteName: athlete.athleteName,
          schoolName: participant.schoolName,
          gender: participant.gender,
          sport: athlete.sport,
          followersBefore: before.followers,
          followersAfter: after.followers,
          absoluteGrowth,
          percentGrowth,
          growthStatus: 'available',
        } satisfies AthleteGrowthRecord;
      });
    })
  );

  return records
    .flat()
    .sort((a, b) => {
      const aGrowth = a.absoluteGrowth ?? -Infinity;
      const bGrowth = b.absoluteGrowth ?? -Infinity;
      if (bGrowth !== aGrowth) {
        return bGrowth - aGrowth;
      }

      const aPercent = a.percentGrowth ?? -Infinity;
      const bPercent = b.percentGrowth ?? -Infinity;
      if (bPercent !== aPercent) {
        return bPercent - aPercent;
      }

      return (b.followersAfter ?? -Infinity) - (a.followersAfter ?? -Infinity);
    });
}
