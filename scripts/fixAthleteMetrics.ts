/**
 * Fix athlete engagement rates and IP lift values
 *
 * Issue: Engagement rates and lifts are inflated by 100x
 * - engagementRate: 3.946 should be 0.03946 (to display as 3.946%)
 * - lift: 1732.72 should be 17.3272 (to display as 1732.7%)
 *
 * Run with: npx tsx scripts/fixAthleteMetrics.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function fixAthleteMetrics() {
  const dataDir = path.join(__dirname, '../public/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-top-athletes.json'));

  console.log(`Found ${files.length} athlete data files to fix`);

  let totalAthletesFix = 0;
  let filesFixed = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const data: SchoolAthleteData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let athletesFixed = 0;
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

      // Always divide avgLift by 100 (UI multiplies by 100 for display)
      ipData.avgLift = ipData.avgLift / 100;
      changesMade = true;

      // Fix each athlete's metrics
      ipData.top5Athletes.forEach(athlete => {
        // Always divide engagement rate by 100 (UI multiplies by 100 for display)
        athlete.engagementRate = athlete.engagementRate / 100;

        // Always divide lift by 100 (UI multiplies by 100 for display)
        athlete.lift = athlete.lift / 100;

        athletesFixed++;
        changesMade = true;
      });
    });

    if (changesMade) {
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      filesFixed++;
      console.log(`  ${file}: Fixed ${athletesFixed} athletes`);
    }

    totalAthletesFix += athletesFixed;
  }

  console.log(`\n✓ Fix complete!`);
  console.log(`  Fixed ${filesFixed} files`);
  console.log(`  Corrected metrics for ${totalAthletesFix} athlete entries`);
}

fixAthleteMetrics().catch(console.error);
