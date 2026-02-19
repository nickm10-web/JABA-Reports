import { readFileSync, writeFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));

// Find exact school name
const allSchools = [...new Set(data.map(p => p?.athlete?.school?.name).filter(Boolean))].sort();
const georgiaNames = allSchools.filter(s => s.toLowerCase().includes('georgia') && !s.toLowerCase().includes('tech') && !s.toLowerCase().includes('state'));
console.log('Georgia name candidates:', georgiaNames);

const posts = data.filter(p => georgiaNames.includes(p?.athlete?.school?.name));
console.log('Extracted posts:', posts.length);

writeFileSync('./public/data/georgia-content-posts.json', JSON.stringify(posts));
console.log('Written to public/data/georgia-content-posts.json');
