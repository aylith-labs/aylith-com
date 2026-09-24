import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { publicCatalogBody } from '$lib/catalog/body.js';
import {
	DEFAULT_GRADIENT_FROM,
	DEFAULT_GRADIENT_TO, 
	DEFAULT_ICON
} from '$lib/catalog/defaults.js';
import { normalizeOnboarding } from '$lib/catalog/onboarding.js';
import type { Project } from '$lib/types/project';

// Source of truth is the collector's output (.generated/projects, fetched from
// each repo's .aylith/project.md at build time). When that's absent — local dev
// or a build without a GitHub token — fall back to the committed snapshot dir.
const generatedDir = path.resolve('.generated/projects');
const snapshotDir = path.resolve('src/content/projects');
const contentDir = fs.existsSync(generatedDir) ? generatedDir : snapshotDir;

// Every manifest field the catalog UI needs but a manifest may omit gets its value
// here. Exported as its own unit because the committed snapshot fills all of these,
// so nothing in the content dir exercises the fallbacks.
export function projectFromFrontmatter(
	data: Record<string, unknown>,
	slug: string,
	body?: string
): Project {
	const fields = { ...data };
	delete fields.status;
	delete fields.stage;
	return {
		...fields,
		slug,
		iconPath: data.icon ?? data.iconPath ?? DEFAULT_ICON,
		gradientFrom: data.gradientFrom ?? DEFAULT_GRADIENT_FROM,
		gradientTo: data.gradientTo ?? DEFAULT_GRADIENT_TO,
		featured: data.featured ?? false,
		onboarding: normalizeOnboarding(data.onboarding),
		body
	} as Project;
}

export function renderProjectBody(content: string): string {
	return marked.parse(content) as string;
}

export function getProjects(): Project[] {
	if (!fs.existsSync(contentDir)) return [];

	return fs
		.readdirSync(contentDir)
		.filter((filename: string) => filename.endsWith('.md'))
		.map((filename: string) => {
			const raw = fs.readFileSync(path.join(contentDir, filename), 'utf-8');
			const { data, content } = matter(raw);
			const slug = filename.replace('.md', '');
			const html = content.trim() ? renderProjectBody(publicCatalogBody(content)) : undefined;

			return projectFromFrontmatter(data, slug, html);
		})
		.sort((first, second) => {
			const firstOrder = first.order ?? Number.MAX_SAFE_INTEGER;
			const secondOrder = second.order ?? Number.MAX_SAFE_INTEGER;
			if (firstOrder !== secondOrder) return firstOrder - secondOrder;
			return first.name.localeCompare(second.name);
		});
}

export function getProject(slug: string): Project | undefined {
	return getProjects().find((project) => project.slug === slug);
}
