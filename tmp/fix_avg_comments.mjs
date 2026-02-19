import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/components/OhioStateIPImpact.tsx';
let content = readFileSync(filePath, 'utf8');

// Find the partnerships array region
const partStart = content.indexOf('partnerships: [');
const partEnd = content.indexOf(']', content.indexOf('],', partStart));

if (partStart === -1) { console.log('ERROR: partnerships not found'); process.exit(1); }

const before = content.slice(0, partStart);
let partSection = content.slice(partStart, partEnd + 1);
const after = content.slice(partEnd + 1);

// Replace all avgComments with decimal values with rounded integers
let count = 0;
partSection = partSection.replace(/avgComments:\s*([\d]+\.[\d]+)/g, (match, num) => {
  count++;
  return `avgComments: ${Math.round(parseFloat(num))}`;
});

console.log(`Rounded ${count} avgComments values`);

content = before + partSection + after;
writeFileSync(filePath, content);
console.log('Done');
