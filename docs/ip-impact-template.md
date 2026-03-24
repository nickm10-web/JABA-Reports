# IP Impact Template Workflow

This repository now supports config-driven generation of school IP Impact report components.

## Generator

Use:

```bash
node scripts/generate-ip-impact-report.mjs \
  --base virginia \
  --name "Notre Dame" \
  --slug "notre-dame" \
  --full "University of Notre Dame" \
  --mascot "Fighting Irish" \
  --logo "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" \
  --component "NotreDameIPImpact" \
  --out "NotreDameIPImpact.tsx" \
  --primary "#0C2340" \
  --primary-dark "#08172d" \
  --primary-light "#1a355f" \
  --accent "#C99700"
```

## Notes

- `--base` controls which current report to clone from (`virginia`, `kentucky`, `clemson`).
- The generated file is written into `src/components/`.
- This keeps report structure consistent and reduces manual copy/paste edits when creating new schools.

## Existing Reports

Current reports built from this template system:
- `VirginiaIPImpact.tsx`
- `KentuckyIPImpact.tsx`
- `ClemsonIPImpact.tsx`
