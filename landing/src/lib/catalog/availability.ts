import type { Project } from '$lib/types/project';

/** Only source-owned public setup with usable instructions is an install path. */
export function hasPublicOnboarding(project: Project): boolean {
	const setup = project.onboarding;
	return setup?.access === 'public-source' && Boolean(setup.url?.startsWith('https://')) &&
		Boolean(setup.prerequisites.length) && Boolean(setup.limitations.length);
}
