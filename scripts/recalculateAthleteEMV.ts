/**
 * Recalculate athlete EMV values using actual follower counts from NCAA roster
 *
 * Run with: npx tsx scripts/recalculateAthleteEMV.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculatePostEMV } from '../src/utils/emvCalculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AthleteData {
  athlete: {
    name: string;
    sport: string;
  };
  posts: number;
  emv: number;
  engagementRate: number;
  lift: number;
}

interface IPTypeData {
  avgEmv: number;
  avgLift: number;
  top5Athletes: AthleteData[];
}

interface SchoolAthleteData {
  school: {
    _id: string;
    name: string;
  };
  collaboration: IPTypeData;
  logo: IPTypeData;
  'mention (in caption)': IPTypeData;
  partnership: IPTypeData;
}

interface RosterAthlete {
  firstName: string;
  lastName: string;
  schoolName: string;
  sport: string;
  metrics: {
    ninetyDays: {
      followers: number;
      likes: number;
      comments: number;
      contentCount: number;
    };
  };
}

// Map sport formats between datasets
function normalizeSport(sport: string): string {
  const sportMap: Record<string, string> = {
    'MENS_BASKETBALL': 'MENS_BASKETBALL',
    'WOMENS_BASKETBALL': 'WOMENS_BASKETBALL',
    'FOOTBALL': 'FOOTBALL',
    'BASEBALL': 'BASEBALL',
    'SOFTBALL': 'SOFTBALL'
  };
  return sportMap[sport] || sport;
}

// Parse athlete name from "First Last" format
function parseAthleteName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  // Handle multi-part names (take first as firstName, rest as lastName)
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

async function recalculateAthleteEMV() {
  console.log('Loading NCAA roster...');
  const rosterPath = path.join(__dirname, '../public/data/ncaa_roster.json');
  const roster: RosterAthlete[] = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));

  // Create lookup map: "firstname_lastname_sport_school" -> follower count
  const athleteFollowerMap = new Map<string, number>();
  roster.forEach(athlete => {
    if (athlete.metrics?.ninetyDays?.followers) {
      const key = `${athlete.firstName.toLowerCase()}_${athlete.lastName.toLowerCase()}_${normalizeSport(athlete.sport)}_${athlete.schoolName}`;
      athleteFollowerMap.set(key, athlete.metrics.ninetyDays.followers);
    }
  });

  console.log(`Built lookup map with ${athleteFollowerMap.size} athletes`);

  const dataDir = path.join(__dirname, '../public/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-top-athletes.json'));

  console.log(`\nProcessing ${files.length} athlete data files...`);

  let totalAthletesUpdated = 0;
  let totalAthletesNotFound = 0;
  let filesUpdated = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const data: SchoolAthleteData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const schoolName = data.school.name;

    let athletesUpdated = 0;
    let athletesNotFound = 0;
    let changesMade = false;

    // Process each IP type
    const ipTypes: (keyof Omit<SchoolAthleteData, 'school'>)[] = [
      'collaboration',
      'logo',
      'mention (in caption)',
      'partnership'
    ];

    ipTypes.forEach(ipType => {
      const ipData = data[ipType];
      let totalEMV = 0;
      let athleteCount = 0;

      ipData.top5Athletes.forEach(athlete => {
        const { firstName, lastName } = parseAthleteName(athlete.athlete.name);
        const sport = normalizeSport(athlete.athlete.sport);
        const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${sport}_${schoolName}`;

        const athleteFollowers = athleteFollowerMap.get(key);

        if (athleteFollowers) {
          // Calculate average likes and comments per post
          // We'll estimate from engagement rate and follower count
          // engagement = (likes + comments) / followers
          // Since we have engagementRate, we can reverse engineer
          const avgInteractionsPerPost = athleteFollowers * athlete.engagementRate;

          // Use a typical ratio of likes:comments (roughly 90:10)
          const avgLikes = avgInteractionsPerPost * 0.9;
          const avgComments = avgInteractionsPerPost * 0.1;

          // Calculate EMV per post using proper formula
          const emvPerPost = calculatePostEMV({
            athleteFollowers,
            likes: avgLikes,
            comments: avgComments
          });

          // Total EMV for all posts
          const newEMV = emvPerPost * athlete.posts;

          athlete.emv = Math.round(newEMV * 100) / 100; // Round to 2 decimals
          totalEMV += athlete.emv;
          athleteCount++;
          athletesUpdated++;
          changesMade = true;
        } else {
          athletesNotFound++;
          console.warn(`  ⚠️  Could not find follower data for: ${athlete.athlete.name} (${sport}) at ${schoolName}`);
        }
      });

      // Recalculate avgEmv for this IP type
      if (athleteCount > 0) {
        ipData.avgEmv = Math.round((totalEMV / ipData.top5Athletes.length) * 100) / 100;
      }
    });

    if (changesMade) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      filesUpdated++;
      console.log(`  ✓ ${file}: Updated ${athletesUpdated} athletes${athletesNotFound > 0 ? ` (${athletesNotFound} not found)` : ''}`);
    }

    totalAthletesUpdated += athletesUpdated;
    totalAthletesNotFound += athletesNotFound;
  }

  console.log(`\n✓ EMV recalculation complete!`);
  console.log(`  Updated ${totalAthletesUpdated} athletes across ${filesUpdated} files`);
  if (totalAthletesNotFound > 0) {
    console.log(`  ⚠️  ${totalAthletesNotFound} athletes not found in roster`);
  }
}

recalculateAthleteEMV().catch(console.error);
