# The Galen Notebook

Game-by-game notes on USC women's basketball: player game logs, grades,
takes, and the season-long things I'm tracking for each player.

Built with [Astro](https://astro.build). Everything on the site comes from
plain text files in `src/content/`. You edit the files and the pages update
themselves.

## Running it on your laptop

You need Node.js (v26 LTS) installed. In VS Code, open this folder, then open
the terminal (Terminal → New Terminal) and run:

```
npm install      # first time only
npm run dev
```

Open http://localhost:4321. The page reloads every time you save a file.
Press `Ctrl+C` in the terminal to stop it.

Anything marked `draft: true` shows up here on your laptop with a yellow
"Draft" tag but never appears on the live site. Use it for half-finished recaps.

## Where things live

```
src/content/players/   one .yaml per player: number, nickname, role, bio
src/content/threads/   one .yaml per season-long strength or thing to work on
src/content/games/     one .md per game: stat lines, grades, takes, recap
templates/             blank game and thread files to copy
src/site.config.ts     site name, tagline, season
```

The file name is the id. `juju-watkins.yaml` is referenced as `juju-watkins`,
and `juju-shot-selection.yaml` is referenced as `juju-shot-selection`.

## After a game

1. Copy `templates/game.md` to `src/content/games/2026-11-08-utah-state.md`.
2. Fill in the top part: date, opponent, score, how you watched, tags.
3. For each player, paste her line from the official box score, then add a
   grade and a 2–4 sentence take. **Grade against her role**, so an A for a
   backup big means she did her job well, not that she outplayed JuJu.
4. Under `threads:`, check in on any season-long thread you noticed:
   `better`, `same` or `worse`, plus one line.
5. Write the recap under the `---` using the four sections.
6. Save, look at it on localhost, then commit and push (below).

## Starting a thread

Copy `templates/thread.yaml` into `src/content/threads/`, name it
`<player>-<topic>.yaml`, and set `kind` to `strength` or `work-on`. It shows
up on her player page right away. Every game check-in adds a dot to its
track, so by March you can see how it moved.

## Publishing

The live site rebuilds itself every time you push to GitHub. In VS Code,
use the Source Control panel (the branch icon on the left): write a short
message like "Utah State recap", click **Commit**, then **Sync Changes**.
Or from the terminal:

```
git add .
git commit -m "Utah State recap"
git push
```

## Before the first real game

- [ ] Delete the example files: `src/content/games/2026-11-01-example.md`,
      `src/content/threads/example-*.yaml`
- [ ] Fill in jersey numbers, heights and classes for Okeke, Davis, Bennett,
      Forestier, Williams and Shamblin (check the official roster; set
      `active: false` for anyone who isn't on this year's team)
- [ ] Add nicknames, roles and a season-opening `bio` for each player
- [ ] Rename the site in `src/site.config.ts` if you want a different name
