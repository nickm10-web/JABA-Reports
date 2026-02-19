import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));

const school = 'Michigan';
const posts = data.filter(p => p?.athlete?.school?.name === school);
const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const adoption = (withAnyIP.length / posts.length * 100).toFixed(1);
const logo = posts.filter(p => p.hasOrganizationLogo).length;
const mention = posts.filter(p => p.hasOrganizationInCaption).length;
const collab = posts.filter(p => p.isOrganizationCollaboration).length;
console.log(`Michigan: ${posts.length} total posts`);
console.log(`  logo: ${logo} (${(logo/posts.length*100).toFixed(1)}%)`);
console.log(`  mention: ${mention} (${(mention/posts.length*100).toFixed(1)}%)`);
console.log(`  collab: ${collab} (${(collab/posts.length*100).toFixed(1)}%)`);
console.log(`  withAnyIP: ${withAnyIP.length} (${adoption}%)`);
