import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const rosterPath = path.join(cwd, 'public/data/mizzou-roster.json');
const ncaaRosterPath = path.join(cwd, 'public/data/ncaa_roster.json');

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  out.push(current);
  return out.map((value) => value.trim());
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map((value) => normalize(value).replace(/ /g, '_'));
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = { _row: index + 2 };
    header.forEach((key, columnIndex) => {
      row[key] = values[columnIndex] || '';
    });
    return row;
  });
}

function fullName(row) {
  return `${row.firstName || ''} ${row.lastName || ''}`.trim();
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function cloneForMizzou(sourceRow, templateRow) {
  return {
    ...sourceRow,
    organizationId: templateRow.organizationId,
    conferenceId: templateRow.conferenceId,
    conferenceName: templateRow.conferenceName,
    schoolName: templateRow.schoolName,
    leagueId: templateRow.leagueId,
    sport: 'FOOTBALL',
  };
}

function findSingleMatch(rows, name, schoolName) {
  const targetName = normalize(name);
  const targetSchool = normalize(schoolName);
  const matches = rows.filter((row) => {
    const rowName = normalize(fullName(row));
    const rowSchool = normalize(row.schoolName);
    return rowName === targetName && (!targetSchool || rowSchool === targetSchool);
  });
  return matches;
}

function parseArgs(argv) {
  const args = { input: '', write: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') {
      args.input = argv[i + 1] || '';
      i += 1;
    } else if (arg === '--write') {
      args.write = true;
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    throw new Error('Usage: node scripts/auditMizzouFootballTransfers.mjs --input <csv> [--write]');
  }

  ensureFile(rosterPath, 'Mizzou roster');
  ensureFile(ncaaRosterPath, 'NCAA roster');

  const inputPath = path.isAbsolute(args.input) ? args.input : path.join(cwd, args.input);
  ensureFile(inputPath, 'Transfer CSV');

  const transferRows = readCsv(inputPath);
  const currentRoster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
  const ncaaRoster = JSON.parse(fs.readFileSync(ncaaRosterPath, 'utf8'));
  const mizzouTemplate = currentRoster.find((row) => String(row.sport) === 'FOOTBALL' && row.schoolName === 'University of Missouri');
  if (!mizzouTemplate) {
    throw new Error('Could not find a Missouri football template row in public/data/mizzou-roster.json');
  }

  const footballRoster = currentRoster.filter((row) => String(row.sport) === 'FOOTBALL');
  const footballNcaa = ncaaRoster.filter((row) => String(row.sport) === 'FOOTBALL');
  const workingRoster = [...currentRoster];

  const report = {
    input: inputPath,
    startingFootballCount: footballRoster.length,
    removals: [],
    additions: [],
    warnings: [],
    endingFootballCount: footballRoster.length,
  };

  for (const transfer of transferRows) {
    const action = normalize(transfer.action);
    const playerName = transfer.player_name || transfer.name || '';
    const fromSchool = transfer.from_school || '';
    const toSchool = transfer.to_school || '';

    if (!playerName || !action) {
      report.warnings.push({ row: transfer._row, message: 'Missing action or player_name' });
      continue;
    }

    if (action === 'remove') {
      const matches = findSingleMatch(
        workingRoster.filter((row) => String(row.sport) === 'FOOTBALL' && row.schoolName === 'University of Missouri'),
        playerName,
        'University of Missouri'
      );
      if (matches.length !== 1) {
        report.warnings.push({
          row: transfer._row,
          playerName,
          action,
          message: matches.length ? `Expected 1 Mizzou football match, found ${matches.length}` : 'Player not found on Mizzou football roster',
        });
        continue;
      }

      const match = matches[0];
      const index = workingRoster.findIndex((row) => row === match);
      if (index >= 0) {
        workingRoster.splice(index, 1);
      }
      report.removals.push({
        row: transfer._row,
        playerName,
        fromSchool: 'University of Missouri',
        toSchool,
        matchedSchool: match.schoolName,
        position: match.position,
        year: match.year,
      });
      continue;
    }

    if (action === 'add') {
      const existingMizzou = findSingleMatch(
        workingRoster.filter((row) => String(row.sport) === 'FOOTBALL' && row.schoolName === 'University of Missouri'),
        playerName,
        'University of Missouri'
      );
      if (existingMizzou.length > 0) {
        report.warnings.push({
          row: transfer._row,
          playerName,
          action,
          message: 'Player already exists on Mizzou football roster',
        });
        continue;
      }

      const sourceMatches = findSingleMatch(footballNcaa, playerName, fromSchool);
      if (sourceMatches.length !== 1) {
        report.warnings.push({
          row: transfer._row,
          playerName,
          fromSchool,
          action,
          message: sourceMatches.length ? `Expected 1 source roster match, found ${sourceMatches.length}` : 'Source player not found in NCAA football roster',
        });
        continue;
      }

      const source = sourceMatches[0];
      const cloned = cloneForMizzou(source, mizzouTemplate);
      workingRoster.push(cloned);
      report.additions.push({
        row: transfer._row,
        playerName,
        fromSchool: source.schoolName,
        toSchool: toSchool || 'University of Missouri',
        position: source.position,
        year: source.year,
      });
      continue;
    }

    report.warnings.push({
      row: transfer._row,
      playerName,
      action,
      message: 'Unknown action. Use add or remove.',
    });
  }

  report.endingFootballCount = workingRoster.filter((row) => String(row.sport) === 'FOOTBALL' && row.schoolName === 'University of Missouri').length;

  const reportPath = path.join(cwd, 'tmp/mizzou-football-transfer-audit.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

  if (args.write) {
    fs.writeFileSync(rosterPath, JSON.stringify(workingRoster, null, 2) + '\n');
  }

  console.log(JSON.stringify({
    input: inputPath,
    report: reportPath,
    wroteRoster: args.write,
    removals: report.removals.length,
    additions: report.additions.length,
    warnings: report.warnings.length,
    startingFootballCount: report.startingFootballCount,
    endingFootballCount: report.endingFootballCount,
  }, null, 2));
}

main();
