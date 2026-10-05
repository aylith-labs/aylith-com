import { describe, expect, it } from 'vitest';
import type { Project } from '$lib/types/project';
import { catalogViewHref, readCatalogView, selectedCatalogProject } from './catalog-view';

const item = (slug: string) => ({ slug, name: slug }) as Project;

describe('catalog split navigation', () => {
	it('round-trips selected preview, search and category for a direct link or browser history', () => {
		const url = new URL('https://aylith.com/explore?campaign=studio');
		const href = catalogViewHref(url, { query: 'video notes', category: 'productivity', view: 'split', selected: 'videx', pane: 'preview' });
		expect(href).toBe('/classic?q=video+notes&category=productivity&view=split&selected=videx&pane=preview');
		expect(readCatalogView(new URL(href, url))).toEqual({ query: 'video notes', category: 'productivity', view: 'split', selected: 'videx', pane: 'preview' });
	});

	it('keeps the selected result when filtering permits it and otherwise moves to the first visible result', () => {
		expect(selectedCatalogProject([item('bract'), item('videx')], 'videx')?.slug).toBe('videx');
		expect(selectedCatalogProject([item('bract')], 'videx')?.slug).toBe('bract');
		expect(selectedCatalogProject([], 'videx')).toBeUndefined();
	});

	it('does not carry a hidden preview into ordinary list links', () => {
		const url = new URL('https://aylith.com/explore?view=split&selected=bract&pane=preview');
		expect(catalogViewHref(url, { query: '', category: 'all', view: 'list', selected: 'bract', pane: 'preview' })).toBe('/classic');
	});
});
