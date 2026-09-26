import { getProjects } from '$lib/server/markdown';
export function entries() { return getProjects().map((project) => ({ slug: project.slug })); }
