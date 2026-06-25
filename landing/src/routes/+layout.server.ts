import { getProjects } from '$lib/server/markdown';

// Lightweight project index for the footer (rendered on every page via the layout).
export function load() {
	return {
		navProjects: getProjects().map((project) => ({ slug: project.slug, name: project.name }))
	};
}
