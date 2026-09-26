export type ProjectView = 'overview' | 'website' | 'changelog';
export type AylaAction = { type: 'open_project'; slug: string; view: ProjectView };

/** The `ayla:navigate` CustomEvent carries this object in `detail`. */
export function resolveAylaAction(value: unknown, catalogSlugs: readonly string[]): string | null {
	if (!value || typeof value !== 'object') return null;
	const action = value as Record<string, unknown>;
	if (action.type !== 'open_project' || typeof action.slug !== 'string' || typeof action.view !== 'string') return null;
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(action.slug) || !catalogSlugs.includes(action.slug)) return null;
	if (!['overview', 'website', 'changelog'].includes(action.view)) return null;
	return action.view === 'overview' ? `/explore/${action.slug}` : `/explore/${action.slug}/${action.view}`;
}
