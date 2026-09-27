<script lang="ts">
	import { goto } from '$app/navigation';
	import ProjectCard from '$lib/components/home/ProjectCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { Project } from '$lib/types/project';
	import { rankProjects } from '$lib/search/ranking';
	import Seo from '$lib/components/Seo.svelte';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { categoryChoices } from '$lib/catalog/categories';

	let { data } = $props();
	let projects: Project[] = $derived(data.projects);

	let searchQuery = $state('');
	let activeCategory = $state('all');
	let page = $state(1);
	const pageSize = 12;

	// Natural language ranked results
	let rankedResults = $derived(rankProjects(projects, searchQuery));

	// Category filter applied over ranked results
	let filtered = $derived.by(() => {
		const base = rankedResults.map((r) => r.project);
		return base.filter((p) => activeCategory === 'all' || p.category === activeCategory);
	});
	let visible = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));
	let pageCount = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	$effect(() => { searchQuery; activeCategory; page = 1; });

	let choices = $derived(categoryChoices(projects, rankedResults.map((result) => result.project)));

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && searchQuery.trim()) {
			event.preventDefault();
			const prompt = encodeURIComponent(searchQuery.trim());
			goto(`/ask?q=${prompt}`);
		}
	}

	function clearSearch() {
		searchQuery = '';
	}
	function resetFilters() { searchQuery = ''; activeCategory = 'all'; page = 1; }
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
				Explore Aylith by category, or search for the work you want to do.
			</p>
		</div>

		<!-- Search and category filter -->
		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start" use:reveal={{ delay: 30 }}>
		<div class="min-w-0 flex-1">
			<div class="relative flex items-center">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-surface-400 dark:text-surface-500">
					<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round" />
						<path d="m21 21-4.35-4.35" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					aria-label="Search catalog"
					onkeydown={handleKeyDown}
					placeholder="Search tools by keyword or prompt (press Enter to ask assistant)…"
					class="catalog-control h-12 w-full py-0 pr-28 pl-11 text-[0.95rem] placeholder:text-surface-400 dark:placeholder:text-warm-500"
				/>
				<div class="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-3">
					{#if searchQuery.trim()}
						<button
							onclick={clearSearch}
							class="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-warm-300"
							aria-label="Clear search"
						>
							<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
						<button
							onclick={() => goto(`/ask?q=${encodeURIComponent(searchQuery.trim())}`)}
							class="inline-flex items-center gap-1 rounded-xl bg-accent-selected px-2.5 py-1.5 text-xs font-medium text-on-accent shadow-sm transition-colors hover:bg-accent-selected-hover active:bg-accent-selected-active "
						>
							Ask AI &crarr;
						</button>
					{:else}
						<kbd class="hidden items-center gap-0.5 rounded border border-surface-200 bg-surface-100 px-2 py-1 font-mono text-[10px] text-surface-400 sm:inline-flex dark:border-surface-800 dark:bg-surface-800 dark:text-warm-500">
							&crarr; to ask
						</kbd>
					{/if}
				</div>
			</div>
			{#if searchQuery.trim()}
				<div class="mt-2 flex items-center justify-between px-1 text-xs text-surface-500 dark:text-warm-400">
					<span>
						Showing {filtered.length} of {projects.length} {filtered.length === 1 ? 'project' : 'projects'}
					</span>
					<span class="text-surface-400 dark:text-warm-500">
						Ranked by relevance · Press <strong class="text-accent-600 dark:text-accent-400">Enter</strong> to send as prompt
					</span>
				</div>
			{/if}
		</div>
		<div class="w-full shrink-0 sm:w-60">
			<RichCombobox id="catalog-category" label="Category" value={activeCategory} options={choices} onSelect={(value) => (activeCategory = value)} searchable={false} showSelectedMeta hideLabel tall popupMode="floating" />
		</div>
		</div>

		<!-- Project Grid -->
		{#if filtered.length > 0}
			<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each visible as project (project.slug)}
					<div use:reveal={{ delay: 0 }}>
						<ProjectCard {project} {searchQuery} />
					</div>
				{/each}
			</div>
			<nav aria-label="Catalog pages" class="mt-8 flex flex-wrap items-center gap-4 text-surface-700 dark:text-warm-200">
				<button disabled={page === 1} onclick={() => page--} class="rounded-xl border border-surface-300 px-4 py-3 disabled:opacity-40 dark:border-surface-700">Previous page</button>
				<span aria-live="polite">Page {page} of {pageCount} · {filtered.length} entries</span>
				<button disabled={page === pageCount} onclick={() => page++} class="rounded-xl border border-surface-300 px-4 py-3 disabled:opacity-40 dark:border-surface-700">Next page</button>
			</nav>
		{:else}
			<div class="mt-12 rounded-2xl border border-dashed border-surface-200 p-12 text-center dark:border-surface-800" use:reveal={{ delay: 0 }}>
				<p class="text-base font-medium text-surface-700 dark:text-warm-200">
					No tools matched "{searchQuery}" in {choices.find((c) => c.value === activeCategory)?.label || 'selected category'}.
				</p>
				<p class="mt-2 text-sm text-surface-400 dark:text-warm-400">
					Try a broader query or ask the AI assistant directly.
				</p>
				<div class="mt-6 flex justify-center gap-3">
					<button
						onclick={resetFilters}
						class="rounded-xl border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:text-warm-200 dark:hover:bg-surface-800"
					>
						Clear filter
					</button>
					<button
						onclick={() => goto(`/ask?q=${encodeURIComponent(searchQuery.trim())}`)}
						class="rounded-xl bg-accent-selected px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-selected-hover active:bg-accent-selected-active "
					>
						Ask assistant about "{searchQuery.slice(0, 30)}" &crarr;
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>
