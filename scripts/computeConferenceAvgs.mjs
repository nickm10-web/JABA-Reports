// Compute new conference averages using updated mentionEng values
// Big 10 mentionEng values (updated where changed)
const big10 = [
  { name: 'Minnesota',     mentionEng: 47.57 },
  { name: 'Nebraska',      mentionEng: 50.63 },
  { name: 'Michigan',      mentionEng: 50.18 }, // updated
  { name: 'Maryland',      mentionEng: 27.67 },
  { name: 'Ohio State',    mentionEng: 87.83 },
  { name: 'Oregon',        mentionEng: 43.36 },
  { name: 'Michigan State',mentionEng: 38.02 },
  { name: 'Indiana',       mentionEng: 27.66 },
  { name: 'Penn State',    mentionEng: 48.49 },
  { name: 'Iowa',          mentionEng: 40.37 },
  { name: 'Rutgers',       mentionEng: 30.15 },
  { name: 'Purdue',        mentionEng: 38.19 },
  { name: 'Washington',    mentionEng: 37.75 },
  { name: 'Illinois',      mentionEng: 40.17 },
  { name: 'Wisconsin',     mentionEng: 19.67 }, // updated
  { name: 'UCLA',          mentionEng: 21.37 }, // updated
  { name: 'USC',           mentionEng: 54.59 }, // updated
];

const b10Avg = big10.reduce((s, x) => s + x.mentionEng, 0) / big10.length;
console.log(`Big 10 mentionEng avg: ${b10Avg.toFixed(1)} (was 37.3)`);
