#!/usr/bin/env node
// Build-time catalog collector.
//
// Lists every repo in the aylith-labs org, drops archived repos, the site repo
// itself, and any repo carrying the EXCLUDE_TOPIC. For each remaining repo it
// fetches `.aylith/project.md`; when that's absent it synthesizes a "Planning"
// placeholder from the repo name + GitHub description. Results are written as
// frontmatter+body Markdown into landing/.generated/projects/<slug>.md so the
// existing gray-matter + marked pipeline (server/markdown.ts) reads them unchanged.
//
// Auth: CATALOG_GITHUB_TOKEN (preferred) or GITHUB_TOKEN. Unauthenticated runs
// hit the 60 req/hr ceiling, so a token is effectively required in CI.

import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ORG,
	SELF_REPO,
	EXCLUDE_TOPIC,
	DEFAULT_ICON,
	DEFAULT_GRADIENT_FROM,
	DEFAULT_GRADIENT_TO,
	PLACEHOLDER_CATEGORY,
	PLACEHOLDER_STATUS
} from '../src/lib/catalog/defaults.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(scriptDir, '../.generated/projects');
// Written first, swapped into place only on success — a mid-run failure then
// leaves any prior output untouched and the build falls back to the snapshot.
const tmpDir = path.resolve(scriptDir, '../.generated/projects.tmp');
const MANIFEST_PATH = '.aylith/project.md';

const token = process.env.CATALOG_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
	console.error('[collect] No CATALOG_GITHUB_TOKEN / GITHUB_TOKEN set — refusing to run unauthenticated.');
	console.error('[collect] (local dev: server/markdown.ts falls back to the committed snapshot dir, so this is fine to skip.)');
	process.exit(1);
}

const octokit = new Octokit({ auth: token });

/** Title-case a repo slug for placeholder display names: "entity-graph" -> "Entity Graph". */
function titleCase(slug) {
	return slug
		.split(/[-_]/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/** Fetch the raw text of a file at the repo's default branch, or null if missing. */
async function fetchFile(repo, filePath) {
	try {
		const { data } = await octokit.repos.getContent({ owner: ORG, repo, path: filePath });
		if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string') return null;
		return Buffer.from(data.content, data.encoding === 'base64' ? 'base64' : 'utf-8').toString('utf-8');
	} catch (error) {
		if (error.status === 404) return null;
		throw error;
	}
}

/** First non-heading paragraph of a README, used as a placeholder body when present. */
function firstParagraph(readme) {
	if (!readme) return undefined;
	const lines = readme.split('\n');
	const paragraphs = [];
	let current = [];
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('![')) {
			if (current.length) {
				paragraphs.push(current.join(' '));
				current = [];
			}
			continue;
		}
		current.push(trimmed);
	}
	if (current.length) paragraphs.push(current.join(' '));
	return paragraphs.find((paragraph) => paragraph.length > 0);
}

/**
 * Normalize a manifest's frontmatter into a complete Project record, applying
 * defaults for any omitted curation field. Throws on a structurally invalid
 * manifest so the caller can fall back to a placeholder rather than crash.
 */
function projectFromManifest(slug, repoUrl, raw) {
	const { data, content } = matter(raw);
	if (!data || typeof data.name !== 'string' || !data.name.trim()) {
		throw new Error(`manifest for ${slug} is missing a "name"`);
	}
	const body = content.trim();
	return {
		slug,
		name: data.name,
		tagline: typeof data.tagline === 'string' ? data.tagline : '',
		description: typeof data.description === 'string' ? data.description : '',
		category: typeof data.category === 'string' ? data.category : PLACEHOLDER_CATEGORY,
		status: typeof data.status === 'string' ? data.status : PLACEHOLDER_STATUS,
		features: Array.isArray(data.features) ? data.features : [],
		targetUser: typeof data.targetUser === 'string' ? data.targetUser : '',
		featured: data.featured === true,
		order: Number.isFinite(data.order) ? data.order : undefined,
		icon: typeof data.icon === 'string' && data.icon.trim() ? data.icon : DEFAULT_ICON,
		gradientFrom:
			typeof data.gradientFrom === 'string' && data.gradientFrom.trim() ? data.gradientFrom : DEFAULT_GRADIENT_FROM,
		gradientTo: typeof data.gradientTo === 'string' && data.gradientTo.trim() ? data.gradientTo : DEFAULT_GRADIENT_TO,
		repoUrl,
		body: body || undefined
	};
}

/** Last-resort placeholder built from the repo's own GitHub metadata. */
function placeholderProject(repo, readme) {
	const description = (repo.description || '').trim();
	return {
		slug: repo.name,
		name: titleCase(repo.name),
		tagline: description,
		description,
		category: PLACEHOLDER_CATEGORY,
		status: PLACEHOLDER_STATUS,
		features: [],
		targetUser: '',
		featured: false,
		order: undefined,
		icon: DEFAULT_ICON,
		gradientFrom: DEFAULT_GRADIENT_FROM,
		gradientTo: DEFAULT_GRADIENT_TO,
		repoUrl: repo.html_url,
		body: firstParagraph(readme)
	};
}

/** Serialize a Project record back to frontmatter + body for the runtime loader. */
function toMarkdown(project) {
	const fm = {
		name: project.name,
		tagline: project.tagline,
		description: project.description,
		category: project.category,
		status: project.status,
		features: project.features,
		targetUser: project.targetUser,
		featured: project.featured,
		icon: project.icon,
		gradientFrom: project.gradientFrom,
		gradientTo: project.gradientTo,
		repoUrl: project.repoUrl
	};
	if (project.order !== undefined) fm.order = project.order;
	return matter.stringify(project.body ? `\n${project.body}\n` : '', fm);
}

async function main() {
	console.log(`[collect] Listing repos for org "${ORG}"…`);
	const repos = await octokit.paginate(octokit.repos.listForOrg, {
		org: ORG,
		type: 'all',
		per_page: 100
	});

	const included = repos.filter((repo) => {
		if (repo.archived) return false;
		if (repo.name === SELF_REPO) return false;
		if ((repo.topics || []).includes(EXCLUDE_TOPIC)) return false;
		return true;
	});

	console.log(`[collect] ${repos.length} repos total → ${included.length} after exclusions.`);

	fs.rmSync(tmpDir, { recursive: true, force: true });
	fs.mkdirSync(tmpDir, { recursive: true });

	let fromManifest = 0;
	let placeholders = 0;

	for (const repo of included) {
		const manifest = await fetchFile(repo.name, MANIFEST_PATH);
		let project;
		if (manifest) {
			try {
				project = projectFromManifest(repo.name, repo.html_url, manifest);
				fromManifest += 1;
				console.log(`[collect]   ✓ ${repo.name} (manifest)`);
			} catch (error) {
				console.warn(`[collect]   ! ${repo.name} manifest invalid (${error.message}) — using placeholder.`);
			}
		}
		if (!project) {
			const readme = await fetchFile(repo.name, 'README.md');
			project = placeholderProject(repo, readme);
			placeholders += 1;
			console.log(`[collect]   · ${repo.name} (placeholder)`);
		}
		fs.writeFileSync(path.join(tmpDir, `${repo.name}.md`), toMarkdown(project), 'utf-8');
	}

	// Atomic swap: only replace the live dir once every repo has been written.
	fs.rmSync(outDir, { recursive: true, force: true });
	fs.renameSync(tmpDir, outDir);

	console.log(`[collect] Wrote ${included.length} projects → ${outDir} (${fromManifest} manifest, ${placeholders} placeholder).`);
}

main().catch((error) => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
	console.error('[collect] Failed:', error);
	process.exit(1);
});
