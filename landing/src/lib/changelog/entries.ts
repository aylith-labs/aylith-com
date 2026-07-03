import type { Component } from 'svelte';
import type { ChangelogEntry, ChangelogEntryMeta, ThemedMedia } from '$lib/types/changelog';

type SvxModule = { default: Component; metadata: ChangelogEntryMeta };

const modules = import.meta.glob<SvxModule>('/src/content/changelogs/*/*.svx', { eager: true });

const entries: ChangelogEntry[] = Object.entries(modules)
	.map(([path, module]) => {
		const match = path.match(/\/changelogs\/([^/]+)\/([^/]+)\.svx$/);
		if (!match) throw new Error(`Unexpected changelog entry path: ${path}`);
		return {
			...module.metadata,
			slug: match[1],
			id: match[2],
			component: module.default
		};
	})
	.sort((a, b) => (a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date)));

export function getEntries(slug: string): ChangelogEntry[] {
	return entries.filter((entry) => entry.slug === slug);
}

/** Latest entry hero for a project, used as the detail-page screenshot. */
export function getHero(slug: string): ThemedMedia | undefined {
	return getEntries(slug).find((entry) => entry.hero)?.hero;
}
