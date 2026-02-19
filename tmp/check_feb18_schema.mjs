import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));
// Print first record structure
const r = data[0];
console.log(JSON.stringify(r, null, 2).slice(0, 2000));

// Also find where "Michigan" shows up
const keys = JSON.stringify(r);
console.log('\n--- Keys search ---');
const allKeys = new Set();
const extractKeys = (obj, prefix = '') => {
  if (typeof obj !== 'object' || obj === null) return;
  for (const [k, v] of Object.entries(obj)) {
    allKeys.add(prefix + k);
    if (typeof v === 'object') extractKeys(v, prefix + k + '.');
  }
};
extractKeys(r);
console.log([...allKeys].join('\n'));
