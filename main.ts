// Builds /output (the app/, the screenshots/ and the dossier.json this repo asks a host to score): a Node 22 script,
// the standard library only, run as `node main.ts /output`. make.fun runs it at the repo root, in a
// sandbox that only /output outlives; dossier.json is the one verifiable record (the sha256 and size of every file,
// the text the grader reads, and a headless-browser peek at the rendered page).
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const out = process.argv[2] ?? '/output';
mkdirSync(out, { recursive: true });
cpSync('app', join(out, 'app'), { recursive: true });
cpSync('screenshots', join(out, 'screenshots'), { recursive: true });

// Build a dossier.json manifest over the files the host copies (app/ and screenshots/, the whole of either; nothing
// of either is read over the network).
//
// The dossier's text is a "## App" block (the source, vendored and asset counts and the totals) and then the
// sources: index.html first, then the source scripts in importOrder's order (the page's classic scripts in document
// order, then the module graph each enters in static-import, then dynamic-import, order, de-duplicated,
// cycle-tolerant), then the rest of the app/ source files in byte order of path. Each is under "## <path>" in full,
// or an omission line when it is over the per-source cap; a tail "… (N more app/ source files)" stands in when the
// block reaches the whole-app text cap. That is the order a reader opens a front-end. An empty entry or a block over
// the size bound is not scored.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
