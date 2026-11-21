# GTA VI Cover Art Generator

[![rank](https://make.fun/badge/gta6-cover-art-01/cimotsimilikitiw/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/cimotsimilikitiw/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A deterministic, offline cover-art generator that composes a GTA VI-inspired multi-panel poster from a user photo. The app runs as plain static files in a desktop browser: load a photo, edit the caption, choose a format, and export a PNG.

## Features

- **Procedural multi-panel composition** – Canvas 2D renderer builds a three-panel layout with sunset grading, scanlines, horizon silhouettes, and an original geometric VI wordmark.
- **Three formats** – Square (1080×1080), portrait (1080×1350), and landscape (1920×1080).
- **Local and private** – Photos are loaded from disk in-browser; no uploads, no external URLs, no runtime dependencies.
- **Deterministic rendering** – Same inputs produce the same cover output.
- **Screenshot mode** – `?shot=` query params render fixed states for automated capture.

## Run locally

Serve the static app:

```sh
node serve.ts
```

Then open the printed local URL.

## Build output

Generate the grader output directory with the app, screenshots, and `dossier.json`:

```sh
node main.ts ./out
```

With the default container contract, `node main.ts` writes to `/output` (or `MAKEFUN_OUTPUT_DIR` when set).

## Project layout

```
app/
  index.html      # UI shell
  style.css       # styling
  src/cover.js    # procedural multi-panel renderer
  src/main.js     # UI wiring + ?shot= screenshot mode
  samples/        # bundled sample photos
main.ts           # copies app/screenshots and writes dossier.json
serve.ts          # tiny local static server
screenshots/      # captured cover states
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=fe0p3md4&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
