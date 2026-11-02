import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * The three kinds of things this site is built from.
 * Every page is just a different view of these files.
 *
 *   players  -> src/content/players/<id>.yaml   (one per player)
 *   threads  -> src/content/threads/<id>.yaml   (one per season-long strength / thing to work on)
 *   games    -> src/content/games/<date>-<opponent>.md   (one per game: stats, grades, takes, recap)
 */

// Blank fields in YAML come through as null, so optional text fields accept null too.
const text = () => z.string().nullish();

const players = defineCollection({
  loader: glob({ pattern: '**/[^_]*.yaml', base: './src/content/players' }),
  schema: z.object({
    name: z.string(),
    number: z.number().nullable().default(null),
    position: text(),
    height: text(),
    class: text(),
    hometown: text(),
    previous: text(), // high school, club or previous college
    nickname: text(),
    role: text(), // e.g. "Starting point guard", "Backup 5, energy minutes"
    bio: text(), // your season-opening take on her
    active: z.boolean().default(true), // set false for injured / redshirt / left the team
  }),
});

const threads = defineCollection({
  loader: glob({ pattern: '**/[^_]*.yaml', base: './src/content/threads' }),
  schema: z.object({
    player: z.string(), // player id, e.g. juju-watkins
    title: z.string(),
    kind: z.enum(['strength', 'work-on']),
    opened: z.coerce.date(),
    summary: text(),
    status: z.enum(['open', 'resolved']).default('open'),
    draft: z.boolean().default(false),
  }),
});

export const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'] as const;

const playerLine = z.object({
  player: z.string(), // player id
  starter: z.boolean().default(false),
  dnp: z.boolean().default(false), // did not play
  min: z.number().default(0),
  pts: z.number().default(0),
  fgm: z.number().default(0),
  fga: z.number().default(0),
  tpm: z.number().default(0), // threes made
  tpa: z.number().default(0),
  ftm: z.number().default(0),
  fta: z.number().default(0),
  reb: z.number().default(0),
  ast: z.number().default(0),
  stl: z.number().default(0),
  blk: z.number().default(0),
  to: z.number().default(0),
  pf: z.number().default(0),
  grade: z.enum(GRADES).nullish(), // graded against her role, not against JuJu
  take: text(),
  threads: z
    .array(
      z.object({
        id: z.string(), // thread id
        trend: z.enum(['better', 'same', 'worse']),
        note: text(),
      }),
    )
    .default([]),
});

const games = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/games' }),
  schema: z.object({
    date: z.coerce.date(),
    opponent: z.string(),
    opponentRank: z.number().nullish(),
    uscRank: z.number().nullish(),
    site: z.enum(['home', 'away', 'neutral']),
    venue: text(),
    score: z.object({ usc: z.number(), opp: z.number() }).nullish(),
    watched: z.enum(['in person', 'live on TV', 'replay', 'condensed replay']).nullish(),
    headline: text(), // one-line verdict on the game
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    players: z.array(playerLine).default([]),
  }),
});

export const collections = { players, threads, games };
