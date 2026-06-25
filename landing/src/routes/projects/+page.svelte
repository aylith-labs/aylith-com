<script lang="ts">
	import ProjectCard from '$lib/components/home/ProjectCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { Project, ProjectStatus } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	let projects: Project[] = $derived(data.projects);

	// The seven curated categories. "Unsorted" is appended only when placeholder
	// (uncategorized) projects exist, so it never inflates the real category count.
	const baseCategories = [
		{ key: 'all', label: 'All' },
		{ key: 'ai-infrastructure', label: 'AI Infrastructure' },
		{ key: 'developer-tools', label: 'Developer Tools' },
		{ key: 'design-tools', label: 'Design Tools' },
		{ key: 'productivity', label: 'Productivity' },
		{ key: 'data-tools', label: 'Data & Analytics' },
		{ key: 'wellness', label: 'Wellness' },
		{ key: 'testing', label: 'Testing' }
	];

	let hasUnsorted = $derived(projects.some((p) => p.category === 'uncategorized'));
	let categories = $derived(
		hasUnsorted ? [...baseCategories, { key: 'uncategorized', label: 'Unsorted' }] : baseCategories
	);

	// Count per category so the filter doubles as an index of the whole studio.
	let counts = $derived.by(() => {
		const map: Record<string, number> = { all: projects.length };
		for (const cat of categories) {
			if (cat.key === 'all') continue;
			map[cat.key] = projects.filter((p) => p.category === cat.key).length;
		}
		return map;
	});

	// Status mix, surfaced once so a stranger can read the maturity of the catalog at a glance.
	const statusOrder: ProjectStatus[] = ['live', 'beta', 'building', 'planning', 'research'];
	const statusLabels: Record<ProjectStatus, string> = {
		research: 'In Research',
		planning: 'Planning',
		building: 'In Development',
		beta: 'Beta',
		live: 'Live'
	};
	let statusCounts = $derived.by(() =>
		statusOrder
			.map((key) => ({ key, label: statusLabels[key], count: projects.filter((p) => p.status === key).length }))
			.filter((s) => s.count > 0)
	);

	let activeCategory = $state('all');

	let filtered = $derived(
		activeCategory === 'all'
			? projects
			: projects.filter((p) => p.category === activeCategory)
	);
</script>

<Seo
	title="Projects — Aylith"
	description="Explore the Aylith portfolio across AI infrastructure, developer tools, productivity, and more."
/>

<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="max-w-xl" use:reveal>
			<h1 class="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl dark:text-warm-50">
				All Projects
			</h1>
			<p class="mt-3 text-lg text-surface-500 dark:text-warm-300">
				The complete catalog — {projects.length} tools across {baseCategories.length - 1} categories, each
				built from a signal that repeated.
			</p>
		</div>

		<!-- Status mix — the whole catalog's maturity, readable at a glance -->
		<div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2" use:reveal={{ delay: 50 }}>
			{#each statusCounts as s (s.key)}
				<span class="inline-flex items-center gap-1.5 text-xs text-surface-500 dark:text-warm-400">
					<span
						class="size-1.5 rounded-full"
						class:bg-emerald-500={s.key === 'live'}
						class:bg-sky-500={s.key === 'beta'}
						class:bg-accent-500={s.key === 'building'}
						class:bg-amber-500={s.key === 'planning'}
						class:bg-surface-400={s.key === 'research'}
					></span>
					<span class="font-medium tabular-nums text-surface-700 dark:text-warm-200">{s.count}</span>
					{s.label}
				</span>
			{/each}
		</div>

		<!-- Category filter — each tab carries its count so this reads as an index -->
		<div class="mt-8 flex flex-wrap gap-2" use:reveal={{ delay: 100 }}>
			{#each categories as cat (cat.key)}
				<button
					onclick={() => (activeCategory = cat.key)}
					class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors {activeCategory === cat.key
						? 'bg-accent-600 text-white'
						: 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:bg-surface-800 dark:text-warm-400 dark:hover:bg-surface-700 dark:hover:text-warm-200'}"
				>
					{cat.label}
					<span
						class="rounded-full px-1.5 text-xs tabular-nums {activeCategory === cat.key
							? 'bg-white/20 text-white'
							: 'bg-surface-200/70 text-surface-500 dark:bg-surface-700/70 dark:text-warm-400'}"
					>
						{counts[cat.key] ?? 0}
					</span>
				</button>
			{/each}
		</div>

		<div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as project (project.slug)}
				<div use:reveal={{ delay: 0 }}>
					<ProjectCard {project} />
				</div>
			{/each}
		</div>
	</div>
</section>
