import benchmarkData from '../data/performsLikeBenchmarks.json';

type Benchmark = { label: string; followers: number; signal: number };

const benchmarks: Benchmark[] = [...benchmarkData.benchmarks].sort(
  (a, b) => a.signal - b.signal,
);

export type PerformsLike = {
  signal: number;
  performsLikeFollowers: number;
  followerLift: number;
  liftMultiple: number;
  tierLabel: string;
};

export function computeSignal(avgComments: number, avgLikes: number): number {
  const c = Math.max(avgComments, 0);
  const l = Math.max(avgLikes, 0);
  return 0.6 * Math.log1p(c) + 0.4 * Math.log1p(l);
}

export function computePerformsLike(
  currentFollowers: number,
  avgComments: number,
  avgLikes: number,
): PerformsLike | null {
  if (!Number.isFinite(currentFollowers) || currentFollowers <= 0) return null;
  if (!Number.isFinite(avgComments) || !Number.isFinite(avgLikes)) return null;

  const signal = computeSignal(avgComments, avgLikes);
  const { followers, label } = interpolate(signal);
  const lift = followers - currentFollowers;
  const multiple = followers / currentFollowers;

  return {
    signal,
    performsLikeFollowers: Math.round(followers),
    followerLift: Math.round(lift),
    liftMultiple: multiple,
    tierLabel: label,
  };
}

// Log-linear interpolation / extrapolation — benchmarks are calibrated in
// signal space (log-scaled engagement) and follower space is exponential, so
// we do the projection in log(followers) then exp back. Extrapolating at
// both ends prevents everyone above "Celebrity" (2M followers) from clamping
// to the same "Performs like 2M" label, which was the bug that made Messi
// (511M real) and Kelce (7.8M real) look identical.
function interpolate(signal: number): { followers: number; label: string } {
  const project = (left: Benchmark, right: Benchmark) => {
    const span = right.signal - left.signal;
    const pct = span <= 0 ? 0 : (signal - left.signal) / span;
    const logLeft  = Math.log(Math.max(left.followers, 1));
    const logRight = Math.log(Math.max(right.followers, 1));
    const logProjected = logLeft + pct * (logRight - logLeft);
    return Math.exp(logProjected);
  };

  // Above the top benchmark — extrapolate using the last two.
  if (signal >= benchmarks[benchmarks.length - 1].signal) {
    const [a, b] = benchmarks.slice(-2);
    return { followers: project(a, b), label: benchmarks[benchmarks.length - 1].label };
  }
  // Below the bottom benchmark — extrapolate using the first two.
  if (signal <= benchmarks[0].signal) {
    const [a, b] = benchmarks.slice(0, 2);
    return { followers: project(a, b), label: benchmarks[0].label };
  }
  for (let i = 0; i < benchmarks.length - 1; i++) {
    const left = benchmarks[i];
    const right = benchmarks[i + 1];
    if (signal >= left.signal && signal <= right.signal) {
      const followers = project(left, right);
      const pct = (signal - left.signal) / (right.signal - left.signal);
      return { followers, label: pct > 0.5 ? right.label : left.label };
    }
  }
  return { followers: benchmarks[benchmarks.length - 1].followers, label: benchmarks[benchmarks.length - 1].label };
}
