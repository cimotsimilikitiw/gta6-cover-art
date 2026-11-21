# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adrioui/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adrioui/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Procedural GTA VI-inspired cover art generator. Upload a photo, add a caption, pick a format (1080×1080, 1080×1350, 1920×1080), and export a multi-panel Vice City sunset cover as PNG. Everything renders locally on Canvas 2D — no network, no external assets, no uploads.

## Run it

```sh
# Build grader output (app/, screenshots/, dossier.json)
node main.ts /output

# Preview the app locally
node serve.ts
# then open the local address printed by serve.ts
```

## What it does

- **Procedural composition**: multi-panel layout with sunset grading, neon edge glow, and an original geometric VI glyph/title treatment drawn with vector canvas paths.
- **Deterministic**: same photo + caption + size produces the same cover.
- **Offline/static**: all app files are local; user photos are read in-browser and never uploaded.
- **Export**: PNG export in square, portrait, or landscape sizes.

---

<sub>Entered on [make.fun](https://make.fun/?ref=fe0p3md4&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
