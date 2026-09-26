export type ProjectCategory =
	| 'ai-infrastructure'
	| 'developer-tools'
	| 'design-tools'
	| 'productivity'
	| 'data-tools'
	| 'wellness'
	| 'testing'
	| 'uncategorized';

export type Project = {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	category: ProjectCategory;
	iconPath: string;
	gradientFrom: string;
	gradientTo: string;
	featured: boolean;
	features: string[];
	targetUser: string;
	body?: string;
	repoUrl?: string;
	websiteUrl?: string;
	order?: number;
	onboarding?: {
		access: 'public-source' | 'restricted';
		url?: string;
		releasesUrl?: string;
		prerequisites: string[];
		limitations: string[];
	};
};
