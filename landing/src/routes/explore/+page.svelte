<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import type { Project } from '$lib/types/project';
	import { rankProjects } from '$lib/search/ranking';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { categoryChoices } from '$lib/catalog/categories';
	let { data } = $props();
	let projects: Project[] = $derived(data.projects);
	let query = $state('');
	let activeCategory = $state('all');
	let ranked = $derived(rankProjects(projects, query).map((item) => item.project));
	let choices = $derived(categoryChoices(projects, ranked));
	let results = $derived(ranked.filter((project) => activeCategory === 'all' || project.category === activeCategory));
</script>

<Seo title="Explore — Aylith" description="Find Aylith tools and read their stories." />
<div class="mx-auto max-w-5xl px-5 py-4 pb-28 sm:px-10 sm:py-5">
	<h1 class="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Explore Aylith</h1>
	<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
		<div class="min-w-0 flex-1">
			<label for="explore-search" class="sr-only">Find a project</label>
			<input id="explore-search" type="search" bind:value={query} placeholder="Find a tool by name or purpose…" class="catalog-control h-12 w-full px-4 py-0" />
		</div>
		<div class="w-full shrink-0 sm:w-60">
			<RichCombobox id="explore-category" label="Category" value={activeCategory} options={choices} onSelect={(value) => (activeCategory = value)} searchable={false} showSelectedMeta hideLabel tall popupMode="floating" />
		</div>
	</div>
	<p class="mt-3 text-xs uppercase tracking-[0.18em] text-surface-500">{results.length} projects</p>
	<div class="mt-3 border-t border-surface-200 dark:border-surface-800">
		{#each results as project (project.slug)}
			<a href="/explore/{project.slug}" class="group grid gap-2 border-b border-surface-200 py-2.5 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-900 sm:grid-cols-[minmax(10rem,1fr)_minmax(16rem,2fr)_auto] sm:items-center sm:gap-5 sm:px-3">
				<span class="text-xl font-medium tracking-tight group-hover:text-accent-700 dark:group-hover:text-accent-300">{project.name}</span>
				<span class="text-sm text-surface-600 dark:text-warm-300">{project.tagline || project.description || 'Source overview available'}</span>
				<span class="text-sm font-medium text-accent-700 dark:text-accent-300">Open →</span>
			</a>
		{/each}
	</div>
</div>
