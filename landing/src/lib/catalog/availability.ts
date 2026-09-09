import type { Project, ProjectStatus } from '$lib/types/project';

export const statusLabels: Record<ProjectStatus, string> = {
	research: 'In Research',
	planning: 'Planning',
	building: 'In Development',
	beta: 'Beta',
	live: 'Live'
};

export const statusDescriptions: Record<ProjectStatus, string> = {
	research: 'Exploring the problem. No usable release is established here.',
	planning: 'A proposed product, not a released tool. Features below describe the intended direction.',
	building: 'Under development. Described capabilities are work in progress, not a release guarantee.',
	beta: 'Early software. Check the quick-start, prerequisites and known limitations before trying it.',
	live: 'Released software. Check the supported setup and access requirements below.'
};

/** A stage or a featured flag alone is not an install path. */
export function hasPublicOnboarding(project: Project): boolean {
	const setup = project.onboarding;
	return (project.status === 'beta' || project.status === 'live') &&
		setup?.access === 'public-source' && Boolean(setup.url?.startsWith('https://')) &&
		Boolean(setup.prerequisites.length) && Boolean(setup.limitations.length);
}
