export type ProjectCategory =
	| 'ai-infrastructure'
	| 'developer-tools'
	| 'design-tools'
	| 'productivity'
	| 'data-tools'
	| 'wellness'
	| 'testing'
	| 'uncategorized';

export type ProjectStatus = 'research' | 'planning' | 'building' | 'beta' | 'live';

export type Project = {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	category: ProjectCategory;
	status: ProjectStatus;
	iconPath: string;
	gradientFrom: string;
	gradientTo: string;
	featured: boolean;
	features: string[];
	targetUser: string;
	body?: string;
	repoUrl?: string;
	order?: number;
};
