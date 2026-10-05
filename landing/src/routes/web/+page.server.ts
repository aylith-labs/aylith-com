import { getProjects } from '$lib/server/markdown';

export function load() {
	return {
		projects: getProjects()
	};
}
