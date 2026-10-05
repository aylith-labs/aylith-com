import type { Project } from '$lib/types/project';

/** Only source-owned public setup with usable instructions is an install path. */
export function hasPublicOnboarding(project: Project): boolean {
	const setup = project.onboarding;
	return Boolean(setup && ['public-source', 'public-download', 'public-app'].includes(setup.access)) && Boolean(setup?.url?.startsWith('https://')) &&
		Boolean(setup?.prerequisites.length);
}

/** A setup anchor exists only when there is an actionable link or source-owned guidance. */
export function hasSetupDetails(project: Project): boolean {
	return hasPublicOnboarding(project) || Boolean(project.onboarding?.releasesUrl) ||
		Boolean(project.onboarding?.prerequisites?.length) || Boolean(project.onboarding?.limitations?.length);
}
