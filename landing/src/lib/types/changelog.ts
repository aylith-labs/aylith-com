import type { Component } from 'svelte';

export type ThemedMedia = {
	light: string;
	dark: string;
	alt: string;
	width: number;
	height: number;
};

export type ChangelogTag = 'added' | 'changed' | 'fixed' | 'removed' | 'infra' | 'docs';

/** Frontmatter of a changelog entry (.svx). */
export type ChangelogEntryMeta = {
	title: string;
	date: string;
	tags: ChangelogTag[];
	summary: string;
	hero?: ThemedMedia;
};

/** A loaded entry: frontmatter + the compiled Svelte component body. */
export type ChangelogEntry = ChangelogEntryMeta & {
	slug: string;
	id: string;
	component: Component;
};
