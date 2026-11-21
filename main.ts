/**
 * Build script: copies the static app and screenshots into the output directory,
 * then writes dossier.json using the kit starter buildDossier contract.
 *
 * Usage:
 *   node main.ts [outDir]
 *   MAKEFUN_OUTPUT_DIR=out node main.ts
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from '/home/adrioui/Projects/bounty/probes/kit-gta6-cover-art-01/gta6-cover-art-01-kit/starter/vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = resolve(process.argv[2] || process.env.MAKEFUN_OUTPUT_DIR || '/output');
const appSrc = join(here, 'app');
const shotsSrc = join(here, 'screenshots');
const appDst = join(outDir, 'app');
const shotsDst = join(outDir, 'screenshots');

mkdirSync(outDir, { recursive: true });

rmSync(appDst, { recursive: true, force: true });
cpSync(appSrc, appDst, { recursive: true });

rmSync(shotsDst, { recursive: true, force: true });
mkdirSync(shotsDst, { recursive: true });
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, shotsDst, { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote ${join(outDir, 'dossier.json')} (${dossier.byteLength} bytes)`);
