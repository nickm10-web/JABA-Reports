/**
 * Fix partnership engagement rate lift values
 *
 * Issue: Lift values are inflated by 100x
 * - engagementRateLift: 2273.97 should be 22.74 (to display as 22.7%)
 *
 * Run with: npx tsx scripts/fixPartnershipLifts.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PartnerData {
  totalContents: number;
  avgLikes: number;
  avgComments: number;
  sponsorPartner: string;
  engagementRate: number;
  emv: number;
  engagementRateLift: number;
}

interface SchoolPartnershipData {
  school: {
    _id: string;
    name: string;
  };
  followers: number;
  overall: {
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    emv: number;
  };
  sponsorPartners: PartnerData[];
}

async function fixPartnershipLifts() {
  const dataDir = path.join(__dirname, '../public/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-partnerships.json'));

  console.log(`Found ${files.length} partnership files to fix`);

  let totalPartnersFixed = 0;
  let filesFixed = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const data: SchoolPartnershipData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let partnersFixed = 0;
    let changesMade = false;

    // Fix each partner's lift value
    data.sponsorPartners = data.sponsorPartners.map(partner => {
      // Divide lift by 100 (UI displays directly with % sign)
      const newLift = partner.engagementRateLift / 100;

      if (newLift !== partner.engagementRateLift) {
        partnersFixed++;
        changesMade = true;
      }

      return {
        ...partner,
        engagementRateLift: newLift
      };
    });

    if (changesMade) {
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      filesFixed++;
      console.log(`  ✓ ${file}: Fixed ${partnersFixed} partners`);
    }

    totalPartnersFixed += partnersFixed;
  }

  console.log(`\n✓ Fix complete!`);
  console.log(`  Fixed ${filesFixed} files`);
  console.log(`  Corrected lift values for ${totalPartnersFixed} brand partnerships`);
}

fixPartnershipLifts().catch(console.error);
