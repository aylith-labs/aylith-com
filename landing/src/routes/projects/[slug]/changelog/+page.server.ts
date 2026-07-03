import { error } from '@sveltejs/kit';
import { getProject, getProjects } from '$lib/server/markdown';

export function entries() {
	return getProjects().map((project) => ({ slug: project.slug }));
}

export function load({ params }) {
	const project = getProject(params.slug);
	if (!project) {
		error(404, 'Project not found');
	}
	return { project };
}
