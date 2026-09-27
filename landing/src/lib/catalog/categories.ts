import type { RichChoice } from '$lib/components/controls/choice-options';
import type { Project } from '$lib/types/project';

const categories = [
	{ key: 'all', label: 'All' },
	{ key: 'ai-infrastructure', label: 'AI Infrastructure' },
	{ key: 'developer-tools', label: 'Developer Tools' },
	{ key: 'design-tools', label: 'Design Tools' },
	{ key: 'productivity', label: 'Productivity' },
	{ key: 'data-tools', label: 'Data & Analytics' },
	{ key: 'wellness', label: 'Wellness' },
	{ key: 'testing', label: 'Testing' }
] as const;

export function categoryChoices(catalog: readonly Project[], matches: readonly Project[] = catalog): RichChoice[] {
	const counts = new Map<string, number>();
	for (const project of matches) counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
	const available = catalog.some((project) => project.category === 'uncategorized')
		? [...categories, { key: 'uncategorized', label: 'Unsorted' }]
		: categories;
	return available.map((category) => ({
		value: category.key,
		label: category.label,
		meta: String(category.key === 'all' ? matches.length : (counts.get(category.key) ?? 0))
	}));
}
