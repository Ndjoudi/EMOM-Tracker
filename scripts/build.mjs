// Compile source/ → src/ (le code réellement servi par index.html).
//
// - .jsx : précompilé avec Babel, puis enveloppé dans une IIFE. Plusieurs fichiers
//   déclarent `const S` au niveau racine ; sans IIFE, les <script> classiques
//   planteraient ("S has already been declared").
// - .js : copié tel quel (utilitaires globaux).
//
// Ajouter un nouveau fichier ? Penser à sa balise <script> dans index.html.
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

// Babel est installé HORS du dépôt (cache du Mac), pour que le dossier
// ne contienne que les fichiers publiés. Installation : npm run setup
const TOOLS = join(homedir(), 'Library', 'Caches', 'emom-webapp-build');
let transformAsync, presetReact;
try {
  const req = createRequire(join(TOOLS, 'package.json'));
  ({ transformAsync } = req('@babel/core'));
  const pr = req('@babel/preset-react'); presetReact = pr.default || pr;
} catch (e) {
  console.error('Outils de build absents. Lance d\'abord :  npm run setup');
  process.exit(1);
}

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SRC  = join(ROOT, 'source');
const OUT  = join(ROOT, 'src');

const listFiles = async dir => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await listFiles(p));
    else if (!e.name.startsWith('.')) out.push(p);
  }
  return out;
};

await rm(OUT, { recursive: true, force: true });

let nJsx = 0, nJs = 0;
for (const file of await listFiles(SRC)) {
  const dest = join(OUT, relative(SRC, file));
  await mkdir(dirname(dest), { recursive: true });
  if (file.endsWith('.jsx')) {
    const { code } = await transformAsync(await readFile(file, 'utf8'), {
      presets: [[presetReact, { runtime: 'classic' }]],
      filename: file, babelrc: false, configFile: false,
    });
    await writeFile(dest.replace(/\.jsx$/, '.js'), `(function(){\n${code}\n})();\n`);
    nJsx++;
  } else {
    await cp(file, dest);
    nJs++;
  }
}
console.log(`src/ construit — ${nJsx} JSX compilés, ${nJs} JS copiés`);
