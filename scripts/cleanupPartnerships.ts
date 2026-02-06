/**
 * Clean up partnership data:
 * 1. Remove on3recruits brand
 * 2. Add @ prefix to all brand names
 *
 * Run with: npx tsx scripts/cleanupPartnerships.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PartnershipData {
  sponsorPartner: string;
  totalContents: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  engagementRateLift: number;
  emv: number;
}

interface SchoolPartnershipData {
  school: {
    _id: string;
    name: string;
  };
  followers: number;
  overall: {
    totalContents: number;
  };
  sponsorPartners: PartnershipData[];
}

async function cleanupPartnerships() {
  const dataDir = path.join(__dirname, '../public/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-partnerships.json'));

  console.log(`Found ${files.length} partnership files to process`);

  let totalRemoved = 0;
  let totalBrands = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const data: SchoolPartnershipData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const originalCount = data.sponsorPartners.length;

    // Remove on3recruits
    data.sponsorPartners = data.sponsorPartners.filter(
      partner => partner.sponsorPartner.toLowerCase() !== 'on3recruits'
    );

    const removed = originalCount - data.sponsorPartners.length;
    if (removed > 0) {
      console.log(`  ${file}: Removed ${removed} on3recruits entry`);
      totalRemoved += removed;
    }

    // Add @ prefix to brand names that don't already have it
    data.sponsorPartners = data.sponsorPartners.map(partner => ({
      ...partner,
      sponsorPartner: partner.sponsorPartner.startsWith('@')
        ? partner.sponsorPartner
        : `@${partner.sponsorPartner}`
    }));

    totalBrands += data.sponsorPartners.length;

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  console.log(`\n✓ Cleanup complete!`);
  console.log(`  Removed ${totalRemoved} on3recruits entries`);
  console.log(`  Updated ${totalBrands} brand names with @ prefix`);
  console.log(`  Processed ${files.length} files`);
}

cleanupPartnerships().catch(console.error);
