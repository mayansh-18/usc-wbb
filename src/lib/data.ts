import { getCollection, type CollectionEntry } from 'astro:content';

export type Player = CollectionEntry<'players'>;
export type Game = CollectionEntry<'games'>;
export type Thread = CollectionEntry<'threads'>;
export type Line = Game['data']['players'][number];

// Drafts show while you run the site on your laptop (npm run dev) and are
// left out of the live site.
const visible = (d: { draft?: boolean }) => import.meta.env.DEV || !d.draft;

export async function getGames(): Promise<Game[]> {
  const games = await getCollection('games', (g) => visible(g.data));
  return games.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getPlayers(): Promise<Player[]> {
  const players = await getCollection('players');
  return players.sort((a, b) => {
    const an = a.data.number ?? 999;
    const bn = b.data.number ?? 999;
    return an - bn || a.data.name.localeCompare(b.data.name);
  });
}

export async function getThreads(): Promise<Thread[]> {
  const threads = await getCollection('threads', (t) => visible(t.data));
  return threads.sort((a, b) => a.data.opened.getTime() - b.data.opened.getTime());
}

export function result(g: Game) {
  const s = g.data.score;
  if (!s) return null;
  return { win: s.usc > s.opp, text: `${s.usc > s.opp ? 'W' : 'L'} ${s.usc}–${s.opp}` };
}

export function record(games: Game[]) {
  let w = 0;
  let l = 0;
  for (const g of games) {
    const r = result(g);
    if (!r) continue;
    r.win ? w++ : l++;
  }
  return { w, l };
}

export function vsLabel(g: Game) {
  const rank = g.data.opponentRank ? `No. ${g.data.opponentRank} ` : '';
  const prefix = g.data.site === 'away' ? 'at' : 'vs.';
  return `${prefix} ${rank}${g.data.opponent}`;
}

const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtLong = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
export const shortDate = (d: Date) => fmtDate.format(d);
export const longDate = (d: Date) => fmtLong.format(d);

// --- stats -----------------------------------------------------------------

export const pct = (m: number, a: number) => (a ? ((m / a) * 100).toFixed(1) : '–');

export type Averages = {
  gp: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  fg: string;
  tp: string;
  ft: string;
};

export function averages(lines: Line[]): Averages {
  const played = lines.filter((l) => !l.dnp);
  const n = played.length;
  const sum = (k: keyof Line) => played.reduce((acc, l) => acc + (l[k] as number), 0);
  const avg = (k: keyof Line) => (n ? sum(k) / n : 0);
  return {
    gp: n,
    min: avg('min'),
    pts: avg('pts'),
    reb: avg('reb'),
    ast: avg('ast'),
    stl: avg('stl'),
    blk: avg('blk'),
    to: avg('to'),
    fg: pct(sum('fgm'), sum('fga')),
    tp: pct(sum('tpm'), sum('tpa')),
    ft: pct(sum('ftm'), sum('fta')),
  };
}

// Grades → points so you can see a season grade average.
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.3, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0,
};
export function gradeAverage(lines: Line[]) {
  const graded = lines.filter((l) => l.grade);
  if (!graded.length) return null;
  const gpa = graded.reduce((a, l) => a + GRADE_POINTS[l.grade!], 0) / graded.length;
  // closest letter
  const letter = Object.entries(GRADE_POINTS).reduce((best, cur) =>
    Math.abs(cur[1] - gpa) < Math.abs(best[1] - gpa) ? cur : best,
  )[0];
  return { gpa, letter, count: graded.length };
}

export const gradeTier = (g?: string | null) => (g ? g[0].toLowerCase() : 'none');

/** Every game line for one player, oldest first. */
export function linesFor(playerId: string, games: Game[]) {
  const out: { game: Game; line: Line }[] = [];
  for (const game of games) {
    const line = game.data.players.find((p) => p.player === playerId);
    if (line) out.push({ game, line });
  }
  return out;
}

/** Every check-in on one thread, oldest first. */
export function checkinsFor(threadId: string, games: Game[]) {
  const out: { game: Game; trend: 'better' | 'same' | 'worse'; note?: string | null }[] = [];
  for (const game of games) {
    for (const line of game.data.players) {
      for (const t of line.threads) {
        if (t.id === threadId) out.push({ game, trend: t.trend, note: t.note });
      }
    }
  }
  return out;
}

export const one = (n: number) => n.toFixed(1);
