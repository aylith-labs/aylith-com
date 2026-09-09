// Local-only projection: preserve the snapshot, overlay explicitly selected source
// manifests, and write generated output. Never rewrites a canonical manifest.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectFromManifest, toMarkdown } from './manifest.js';

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(landing, '.generated/projects');
const snapshot = path.join(landing, 'src/content/projects');
const collected = process.argv.includes('--collected');
const baseline = collected ? output : snapshot;
const manifests = new Map(fs.readdirSync(baseline).filter((name) => name.endsWith('.md'))
	.map((name) => [name, fs.readFileSync(path.join(baseline, name), 'utf8')]));
const sources = [];
for (const argument of process.argv.slice(2)) {
	if (argument === '--collected') continue;
	const separator = argument.indexOf('=');
	const slug = argument.slice(0, separator);
	if (separator < 1 || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error('Use slug=path/to/.aylith/project.md');
	const sourcePath = path.resolve(argument.slice(separator + 1));
	const raw = fs.readFileSync(sourcePath, 'utf8');
	const project = projectFromManifest(slug, `https://github.com/aylith-labs/${slug}`, raw);
	manifests.set(`${slug}.md`, toMarkdown(project));
	sources.push({ slug, sha256: createHash('sha256').update(raw).digest('hex') });
}
if (!sources.length) throw new Error('Pass at least one explicit source manifest. No output changed.');
// Reject a stale projection rather than retaining an accidental removed entry.
fs.mkdirSync(output, { recursive: true });
const stale = fs.readdirSync(output).filter((name) => !manifests.has(name));
if (stale.length) throw new Error(`Unexpected generated entries; inspect before replacing: ${stale.join(', ')}`);
for (const [name, raw] of manifests) fs.writeFileSync(path.join(output, name), raw.replaceAll('\r\n', '\n'));
fs.writeFileSync(path.join(landing, '.generated/preview-receipt.json'), `${JSON.stringify({
	kind: 'local-source-overlay', generatedAt: new Date().toISOString(), count: manifests.size,
	baseline: collected ? 'fresh collected catalog; five explicit local source overlays' : 'committed website snapshot; unchanged entries are not fresh source audits', sources
}, null, 2)}\n`);
console.log(JSON.stringify({ count: manifests.size, sources }));
