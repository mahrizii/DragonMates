export type LivingStyleForMatch = {
  noise_level: number;
  cleanliness: number;
  comfortable_temp: number;
  time_sleep: string;
  time_wake: string;
  music_genre: string[] | null;
};

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Weighted compatibility percentage (0–100) between two living-style profiles. */
export function computeCompatibilityScore(
  u: LivingStyleForMatch,
  t: LivingStyleForMatch,
  uInterests: string[],
  tInterests: string[],
): number {
  const noiseScore = 1 - Math.abs(u.noise_level - t.noise_level) / 4;
  const cleanScore = 1 - Math.abs(u.cleanliness - t.cleanliness) / 4;
  const tempScore = 1 - Math.abs(u.comfortable_temp - t.comfortable_temp) / 25;
  const sleepDiff = Math.abs(toMinutes(u.time_sleep) - toMinutes(t.time_sleep));
  const wakeDiff = Math.abs(toMinutes(u.time_wake) - toMinutes(t.time_wake));
  const sleepScore = 1 - Math.min(sleepDiff, 720) / 720;
  const wakeScore = 1 - Math.min(wakeDiff, 720) / 720;

  const uGenres = new Set<string>(u.music_genre ?? []);
  const tGenres = new Set<string>(t.music_genre ?? []);
  const genreUnion = new Set([...uGenres, ...tGenres]);
  const genreIntersect = [...uGenres].filter((g) => tGenres.has(g)).length;
  const genreScore = genreUnion.size === 0 ? 1 : genreIntersect / genreUnion.size;

  const uNames = new Set(uInterests);
  const tNames = new Set(tInterests);
  const interestUnion = new Set([...uNames, ...tNames]);
  const interestIntersect = [...uNames].filter((n) => tNames.has(n)).length;
  const interestScore = interestUnion.size === 0 ? 1 : interestIntersect / interestUnion.size;

  return Math.round(
    (noiseScore * 0.2 +
      cleanScore * 0.2 +
      tempScore * 0.1 +
      sleepScore * 0.15 +
      wakeScore * 0.1 +
      genreScore * 0.1 +
      interestScore * 0.15) *
      100,
  );
}

export function matchScoreBadgeClasses(score: number): string {
  if (score >= 75) return "border-green-400 bg-green-50 text-green-700";
  if (score >= 50) return "border-amber-400 bg-amber-50 text-amber-700";
  return "border-red-400 bg-red-50 text-red-700";
}
