// Regenerates src/lib/translate/languages.json from SIL's ISO 639-3 code table:
// every individual language the standard names — living, extinct, ancient,
// historical and constructed — as [code, name, kind] rows. The picker loads it
// lazily, only when opened.
//
//   node scripts/build-languages.mjs [path-to-iso-639-3.tab]
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab';
const OUT = new URL('../src/lib/translate/languages.json', import.meta.url);
const KINDS = { L: 'living', E: 'extinct', A: 'ancient', H: 'historical', C: 'constructed' };

const text = process.argv[2] ? await readFile(process.argv[2], 'utf8') : await (await fetch(SOURCE)).text();
const [header, ...lines] = text.trim().split(/\r?\n/);
const col = Object.fromEntries(header.split('\t').map((name, i) => [name, i]));
const rows = [];
for (const line of lines) {
	const f = line.split('\t');
	// Individual languages only; macrolanguages and special codes (mis, und, zxx) are not something to read a page in.
	if (f[col.Scope] !== 'I' || !KINDS[f[col.Language_Type]]) continue;
	// The two-letter code where one exists: it is what Intl.DisplayNames knows a native name for.
	rows.push([f[col.Part1] || f[col.Id], f[col.Ref_Name], KINDS[f[col.Language_Type]]]);
}
// An empty table is a broken download, never a list of zero languages.
if (rows.length < 7000) throw new Error(`only ${rows.length} languages parsed; refusing to write`);
rows.sort((a, b) => a[1].localeCompare(b[1]));
await writeFile(OUT, `${JSON.stringify(rows)}\n`);
console.log(`${rows.length} languages -> ${OUT.pathname}`);
