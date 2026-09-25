import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const dir = path.resolve(process.argv[2] ?? '.generated/projects');
const files = readdirSync(dir, { withFileTypes: true });
const allowedFields = new Set([
	'name', 'tagline', 'description', 'category', 'features', 'targetUser',
	'featured', 'icon', 'gradientFrom', 'gradientTo', 'repoUrl', 'order', 'onboarding'
]);
const prohibited = [
	[/\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*[A-Za-z0-9_+/=-]{12,}/i, 'credential-shaped assignment'],
	[/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/i, 'email address'],
	[/(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|\.internal\b)/i, 'private network address'],
	[/\/home\/[A-Za-z0-9_-]+\//, 'local home path']
];

for (const file of files) {
	if (!file.isFile() || !(/^[a-z0-9-]+\.md$/.test(file.name) || file.name === 'catalog-provenance.json')) {
		throw new Error(`Unexpected catalog path: ${file.name}`);
	}
}

const receipts = JSON.parse(readFileSync(path.join(dir, 'catalog-provenance.json'), 'utf8'));
let count = 0;
for (const file of files.filter((entry) => entry.name.endsWith('.md'))) {
	const slug = file.name.slice(0, -3);
	const bytes = readFileSync(path.join(dir, file.name));
	const markdown = bytes.toString('utf8');
	const { data } = matter(markdown);
	for (const field of Object.keys(data)) {
		if (!allowedFields.has(field)) throw new Error(`${slug}: unexpected frontmatter field ${field}`);
	}
	for (const [pattern, label] of prohibited) {
		if (pattern.test(markdown)) throw new Error(`${slug}: ${label} in generated catalog`);
	}
	const receipt = receipts[slug];
	if (receipt) {
		if (!/^[0-9a-f]{40}$/.test(receipt.sourceCommit)) throw new Error(`${slug}: invalid source commit`);
		const age = Date.now() - Date.parse(receipt.collectedAt);
		if (!Number.isFinite(age) || age < 0 || age > 7 * 86400_000) throw new Error(`${slug}: stale receipt`);
		if (createHash('sha256').update(bytes).digest('hex') !== receipt.sha256) {
			throw new Error(`${slug}: receipt does not match exact Markdown bytes`);
		}
	}
	count++;
}
if (count < 1 || !receipts.dashcam) throw new Error('Missing catalog or canonical Dashcam receipt');
for (const slug of Object.keys(receipts)) {
	if (!files.some((file) => file.name === `${slug}.md`)) throw new Error(`${slug}: receipt without Markdown`);
}
console.log(`Public catalog preflight passed: ${count} Markdown files, ${Object.keys(receipts).length} source receipts.`);
