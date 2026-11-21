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
mkdirSync(outDir, { recursive: true });

const copyTargets = [
  { src: join(here, 'app'), dst: join(outDir, 'app'), required: true },
  { src: join(here, 'screenshots'), dst: join(outDir, 'screenshots'), required: false },
];

for (const { src, dst, required } of copyTargets) {
  rmSync(dst, { recursive: true, force: true });
  if (!required && !existsSync(src)) {
    mkdirSync(dst, { recursive: true });
    continue;
  }
  cpSync(src, dst, { recursive: true });
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