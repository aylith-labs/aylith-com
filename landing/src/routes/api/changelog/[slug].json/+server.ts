import { error, json } from '@sveltejs/kit';
import { getEntries } from '$lib/changelog/entries';
import { getProject, getProjects } from '$lib/server/markdown';

export const prerender = true;

export function entries() {
	return getProjects().map((project) => ({ slug: project.slug }));
}

/** Static, machine-readable changelog metadata (prerendered to a JSON file). */
export function GET({ params }) {
	if (!getProject(params.slug)) {
		error(404, 'Project not found');
	}
	return json({
		project: params.slug,
		page: `https://aylith.com/projects/${params.slug}/changelog`,
		entries: getEntries(params.slug).map(({ component: _component, ...entry }) => entry)
	});
}
