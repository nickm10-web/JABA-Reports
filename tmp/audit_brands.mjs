import fs from 'fs';

const dir = "./public/data/";
const files = fs.readdirSync(dir).filter(f => f.endsWith("-partnerships.json") && f.indexOf("(") === -1);
const allBrands = new Map();

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(dir + f, "utf8"));
  if (!d.sponsorPartners) return;
  d.sponsorPartners.forEach(p => {
    const existing = allBrands.get(p.sponsorPartner) || { posts: 0, schools: new Set(), totalLikes: 0 };
    existing.posts += p.totalContents;
    existing.schools.add(d.school ? d.school.name : f);
    existing.totalLikes += p.avgLikes * p.totalContents;
    allBrands.set(p.sponsorPartner, existing);
  });
});

const sorted = [...allBrands.entries()].sort((a,b) => b[1].posts - a[1].posts);
console.log("Total unique sponsor partners:", sorted.length);
sorted.forEach(([name, data]) => {
  const schoolList = [...data.schools].join(", ");
  console.log(name + " | " + data.posts + " posts | " + data.schools.size + " schools | " + Math.round(data.totalLikes) + " total likes | Schools: " + schoolList);
});
