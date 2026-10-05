import type { Project } from '$lib/types/project';
import { publicWebContext } from './view-context';

export type CatalogView = 'list' | 'split';
export type CatalogPane = 'results' | 'preview';

export function readCatalogView(url: URL) {
	return {
		query: url.searchParams.get('q') ?? '',
		category: url.searchParams.get('category') ?? 'all',
		view: url.searchParams.get('view') === 'split' ? 'split' as const : 'list' as const,
		selected: url.searchParams.get('selected') ?? '',
		pane: url.searchParams.get('pane') === 'preview' ? 'preview' as const : 'results' as const
	};
}

export function catalogViewHref(url: URL, state: ReturnType<typeof readCatalogView>) {
	const next = new URL(publicWebContext(url) ?? '/classic', url.origin);
	if (['#try','#catalog','#method'].includes(url.hash)) next.hash=url.hash;
	for (const key of ['q', 'category', 'view', 'selected', 'pane']) next.searchParams.delete(key);
	if (state.query.trim()) next.searchParams.set('q', state.query.trim());
	if (state.category !== 'all') next.searchParams.set('category', state.category);
	if (state.view === 'split') next.searchParams.set('view', 'split');
	if (state.view === 'split' && state.selected) next.searchParams.set('selected', state.selected);
	if (state.view === 'split' && state.pane === 'preview') next.searchParams.set('pane', 'preview');
	return `${next.pathname}${next.search}${next.hash}`;
}

export function selectedCatalogProject(projects: Project[], slug: string) {
	return projects.find((project) => project.slug === slug) ?? projects[0];
}
