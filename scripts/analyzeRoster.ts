/**
 * Analyze NCAA roster data to calculate average follower counts
 *
 * Run with: npx tsx scripts/analyzeRoster.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AthleteMetrics {
  ninetyDays: {
    followers: number;
    sponsoredContentCount: number;
    logoContentCount: number;
    contentCount: number;
  };
}

interface Athlete {
  firstName: string;
  lastName: string;
  schoolName: string;
  sport: string;
  metrics: AthleteMetrics;
}

async function analyzeRoster() {
  console.log('Loading NCAA roster data...');

  const rosterPath = path.join(__dirname, '../public/data/ncaa_roster.json');
  const rosterData: Athlete[] = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));

  console.log(`\nTotal athletes in roster: ${rosterData.length.toLocaleString()}`);

  // Filter athletes with sponsored content (check if metrics exist)
  const athletesWithSponsored = rosterData.filter(
    athlete =>
      athlete.metrics?.ninetyDays?.sponsoredContentCount &&
      athlete.metrics.ninetyDays.sponsoredContentCount > 0
  );

  console.log(`Athletes with sponsored content: ${athletesWithSponsored.length.toLocaleString()}`);

  // Calculate average follower count
  const totalFollowers = athletesWithSponsored.reduce(
    (sum, athlete) => sum + (athlete.metrics?.ninetyDays?.followers || 0),
    0
  );

  const averageFollowers = totalFollowers / athletesWithSponsored.length;

  console.log(`\nAverage follower count (athletes with sponsored content): ${Math.round(averageFollowers).toLocaleString()}`);

  // Calculate by follower tier
  const tiers = {
    '500K+': athletesWithSponsored.filter(a => (a.metrics?.ninetyDays?.followers || 0) >= 500000),
    '100K-500K': athletesWithSponsored.filter(a => {
      const f = a.metrics?.ninetyDays?.followers || 0;
      return f >= 100000 && f < 500000;
    }),
    '50K-100K': athletesWithSponsored.filter(a => {
      const f = a.metrics?.ninetyDays?.followers || 0;
      return f >= 50000 && f < 100000;
    }),
    '10K-50K': athletesWithSponsored.filter(a => {
      const f = a.metrics?.ninetyDays?.followers || 0;
      return f >= 10000 && f < 50000;
    }),
    '<10K': athletesWithSponsored.filter(a => (a.metrics?.ninetyDays?.followers || 0) < 10000)
  };

  console.log('\nDistribution by follower tier:');
  Object.entries(tiers).forEach(([tier, athletes]) => {
    const pct = (athletes.length / athletesWithSponsored.length * 100).toFixed(1);
    console.log(`  ${tier}: ${athletes.length.toLocaleString()} (${pct}%)`);
  });

  // Top 10 athletes by followers with sponsored content
  const topAthletes = [...athletesWithSponsored]
    .sort((a, b) => (b.metrics?.ninetyDays?.followers || 0) - (a.metrics?.ninetyDays?.followers || 0))
    .slice(0, 10);

  console.log('\nTop 10 athletes with sponsored content:');
  topAthletes.forEach((athlete, i) => {
    const followers = athlete.metrics?.ninetyDays?.followers || 0;
    const sponsored = athlete.metrics?.ninetyDays?.sponsoredContentCount || 0;
    console.log(`  ${i + 1}. ${athlete.firstName} ${athlete.lastName} (${athlete.schoolName}): ${followers.toLocaleString()} followers, ${sponsored} sponsored posts`);
  });

  // Calculate average by school (for schools with partnerships)
  const schoolAverages = new Map<string, { total: number; count: number }>();

  athletesWithSponsored.forEach(athlete => {
    const existing = schoolAverages.get(athlete.schoolName) || { total: 0, count: 0 };
    existing.total += (athlete.metrics?.ninetyDays?.followers || 0);
    existing.count += 1;
    schoolAverages.set(athlete.schoolName, existing);
  });

  console.log(`\nSchools with sponsored athletes: ${schoolAverages.size}`);

  // Show top 10 schools by average follower count
  const topSchools = Array.from(schoolAverages.entries())
    .map(([school, data]) => ({
      school,
      avgFollowers: data.total / data.count,
      athleteCount: data.count
    }))
    .sort((a, b) => b.avgFollowers - a.avgFollowers)
    .slice(0, 10);

  console.log('\nTop 10 schools by average athlete followers (sponsored athletes only):');
  topSchools.forEach((school, i) => {
    console.log(`  ${i + 1}. ${school.school}: ${Math.round(school.avgFollowers).toLocaleString()} avg followers (${school.athleteCount} athletes)`);
  });

  // Save the average to a config file for use in the app
  const config = {
    averageSponsoredAthleteFollowers: Math.round(averageFollowers),
    calculatedAt: new Date().toISOString(),
    totalAthletesWithSponsored: athletesWithSponsored.length,
    totalAthletes: rosterData.length
  };

  const configPath = path.join(__dirname, '../src/config/emvConfig.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\nSaved config to: ${configPath}`);
  console.log(`Average follower count to use: ${config.averageSponsoredAthleteFollowers.toLocaleString()}`);
}

analyzeRoster().catch(console.error);
