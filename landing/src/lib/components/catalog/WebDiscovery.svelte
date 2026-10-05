<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ProductWebsiteFrame from '$lib/components/catalog/ProductWebsiteFrame.svelte';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { categoryChoices } from '$lib/catalog/categories';
	import { rankProjects } from '$lib/search/ranking';
	import { catalogViewHref, readCatalogView, selectedCatalogProject, type CatalogPane, type CatalogView } from '$lib/explore/catalog-view';
	import { verifiedProductEntry, productWebsitePreview } from '$lib/catalog/entry-point';
	import type { Project } from '$lib/types/project';

	let { data } = $props();
	let projects: Project[] = $derived(data.projects);
	// Static prerender has no request query. Hydrate the URL-backed view in the effect below.
	let initial: ReturnType<typeof readCatalogView> = { query: '', category: 'all', view: 'list', selected: '', pane: 'results' };
	let query = $state(initial.query);
	let category = $state(initial.category);
	let view = $state<CatalogView>(initial.view);
	let selected = $state(initial.selected);
	let pane = $state<CatalogPane>(initial.pane);
	let searchInput: HTMLInputElement | undefined = $state();
	let previewHeading: HTMLHeadingElement | undefined = $state();
	let ranked = $derived(rankProjects(projects, query).map((item) => item.project));
	let choices = $derived(categoryChoices(projects, ranked));
	let results = $derived(ranked.filter((item) => category === 'all' || item.category === category));
	let chosen = $derived(selectedCatalogProject(results, selected));

	$effect(() => {
		const state = readCatalogView(page.url);
		query = state.query; category = state.category; view = state.view;
		selected = state.selected; pane = state.pane;
	});
	$effect(() => {
		if (view === 'split' && chosen && chosen.slug !== selected) void navigate({ selected: chosen.slug }, true);
	});

	function visible(nextQuery: string, nextCategory: string) {
		return rankProjects(projects, nextQuery).map((item) => item.project)
			.filter((item) => nextCategory === 'all' || item.category === nextCategory);
	}
	function navigate(change: Partial<ReturnType<typeof readCatalogView>>, replaceState = false) {
		return goto(catalogViewHref(page.url, { query, category, view, selected, pane, ...change }),
			{ replaceState, noScroll: true, keepFocus: true });
	}
	function filter(nextQuery: string, nextCategory: string, replaceState = false) {
		query = nextQuery; category = nextCategory;
		const matches = visible(nextQuery, nextCategory);
		selected = selectedCatalogProject(matches, selected)?.slug ?? '';
		if (!matches.length) pane = 'results';
		void navigate({ query: nextQuery, category: nextCategory,
			selected, pane }, replaceState);
	}
	function switchView(next: CatalogView) {
		view = next;
		selected = next === 'split' ? (chosen?.slug ?? '') : '';
		pane = 'results';
		void navigate({ view: next, selected, pane });
	}
	async function selectProject(project: Project) {
		selected = project.slug; pane = 'preview';
		await navigate({ selected: project.slug, pane: 'preview' });
		await tick(); previewHeading?.focus();
	}
	async function showResults() {
		pane = 'results'; await navigate({ pane: 'results' });
		await tick(); searchInput?.focus();
	}
</script>

<div class={view === 'split' ? 'mx-auto max-w-[100rem] px-5 py-4 pb-28 sm:px-10' : 'mx-auto max-w-5xl px-5 py-4 pb-28 sm:px-10'}>
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div><h1 class="text-3xl font-medium tracking-tight sm:text-4xl">Search and discover</h1><p class="mt-1 text-sm text-surface-600 dark:text-warm-300">Search by purpose, filter the catalog, and preview a product website.</p></div>
		<div role="group" aria-label="Catalog view" class="inline-flex rounded-xl border border-surface-300 p-1 dark:border-surface-700">
			<button type="button" aria-pressed={view === 'list'} onclick={() => switchView('list')} class={view === 'list' ? 'min-h-11 rounded-lg bg-surface-100 px-4 text-sm font-medium border border-transparent focus-visible:border-accent-500 focus-visible:outline-none dark:bg-surface-800' : 'min-h-11 rounded-lg px-4 text-sm font-medium border border-transparent focus-visible:border-accent-500 focus-visible:outline-none'}>List</button>
			<button type="button" aria-pressed={view === 'split'} onclick={() => switchView('split')} class={view === 'split' ? 'min-h-11 rounded-lg bg-surface-100 px-4 text-sm font-medium border border-transparent focus-visible:border-accent-500 focus-visible:outline-none dark:bg-surface-800' : 'min-h-11 rounded-lg px-4 text-sm font-medium border border-transparent focus-visible:border-accent-500 focus-visible:outline-none'}>Side by side</button>
		</div>
	</div>
	<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
		<div class="min-w-0 flex-1"><label for="explore-search" class="sr-only">Find a project</label><input bind:this={searchInput} id="explore-search" type="search" value={query} oninput={(event) => filter(event.currentTarget.value, category, true)} placeholder="Find a tool by name or purpose…" class="catalog-control h-12 w-full px-4 py-0" /></div>
		<div class="w-full shrink-0 sm:w-60"><RichCombobox id="explore-category" label="Category" value={category} options={choices} onSelect={(value) => filter(query, value)} searchable={false} showSelectedMeta hideLabel tall popupMode="floating" /></div>
	</div>
	<p class="mt-3 text-xs uppercase tracking-[0.18em] text-surface-500" aria-live="polite">{results.length} {results.length === 1 ? 'project' : 'projects'}</p>
	{#if view === 'split'}
		<div class="mt-3 grid min-h-[32rem] overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]">
			<div class={pane === 'preview' ? 'hidden min-h-0 border-r border-surface-200 dark:border-surface-800 lg:block' : 'min-h-0 border-r border-surface-200 dark:border-surface-800'} aria-label="Products">
				<div class="max-h-[75svh] overflow-y-auto">
					{#each results as project (project.slug)}
						<button type="button" aria-current={chosen?.slug === project.slug ? 'true' : undefined} onclick={() => selectProject(project)} class={chosen?.slug === project.slug ? 'block min-h-16 w-full border-b border-surface-200 bg-surface-100 px-4 py-3 text-left focus-visible:border-accent-500 focus-visible:outline-none dark:border-surface-800 dark:bg-surface-900' : 'block min-h-16 w-full border-b border-surface-200 px-4 py-3 text-left hover:bg-surface-50 focus-visible:border-accent-500 focus-visible:outline-none dark:border-surface-800 dark:hover:bg-surface-900'}><span class="block font-semibold">{project.name}</span><span class="mt-1 block text-sm leading-snug text-surface-600 dark:text-warm-300">{project.tagline || project.description}</span></button>
					{/each}
					{#if results.length === 0}<p class="p-5 text-sm text-surface-600 dark:text-warm-300">No products match these filters. Try another search or category.</p>{/if}
				</div>
			</div>
			<div class={pane === 'preview' ? 'flex min-h-[32rem] min-w-0 flex-col' : 'hidden min-h-[32rem] min-w-0 flex-col lg:flex'}>
				{#if chosen}
					<div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-800 sm:px-6"><div class="flex min-w-0 items-center gap-3"><button type="button" onclick={showResults} class="min-h-11 rounded-lg px-2 text-sm font-medium text-accent-700 border border-transparent focus-visible:border-accent-500 focus-visible:outline-none dark:text-accent-300 lg:hidden">← Results</button><h2 bind:this={previewHeading} tabindex="-1" class="truncate text-lg font-semibold outline-none">{chosen.name}</h2></div><div class="flex items-center gap-4 text-sm font-semibold text-accent-700 dark:text-accent-300"><a href="/explore/{chosen.slug}" class="min-h-11 content-center underline underline-offset-4 border border-transparent focus-visible:border-accent-500 focus-visible:outline-none">Product story</a>{#if productWebsitePreview(chosen)}<a href={productWebsitePreview(chosen)} target="_blank" rel="noopener noreferrer" class="min-h-11 content-center underline underline-offset-4 border border-transparent focus-visible:border-accent-500 focus-visible:outline-none">Open website ↗</a>{/if}</div></div>
					{#if productWebsitePreview(chosen)}<ProductWebsiteFrame project={chosen} className="min-h-[31rem] w-full flex-1 border-0 bg-white" />
					{:else}<div class="flex flex-1 items-center bg-surface-50 p-6 dark:bg-surface-900 sm:p-10"><div class="max-w-2xl"><span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent-700 dark:text-accent-300">{chosen.category.replaceAll('-', ' ')}</span><h3 class="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">{chosen.name}</h3><p class="mt-4 max-w-xl text-lg leading-relaxed text-surface-700 dark:text-warm-200">{chosen.description || chosen.tagline}</p><a href={verifiedProductEntry(chosen.slug) ?? `/explore/${chosen.slug}`} class="mt-7 inline-flex min-h-11 items-center rounded-xl bg-surface-900 px-5 font-semibold text-white border border-transparent focus-visible:border-accent-500 focus-visible:outline-none dark:bg-warm-100 dark:text-surface-950">{verifiedProductEntry(chosen.slug)?'Visit':'Explore'} {chosen.name} →</a>{#if verifiedProductEntry(chosen.slug)}<a href="/explore/{chosen.slug}" class="mt-4 block underline">Product details</a>{/if}</div></div>{/if}
				{:else}<p class="m-auto p-5 text-sm text-surface-600 dark:text-warm-300">Choose another search or category to continue.</p>{/if}
			</div>
		</div>
	{:else}
		<div class="mt-3 border-t border-surface-200 dark:border-surface-800">
			{#each results as project (project.slug)}<article class="border-b border-surface-200 dark:border-surface-800"><a href={verifiedProductEntry(project.slug) ?? `/explore/${project.slug}`} aria-label={verifiedProductEntry(project.slug)?`Visit ${project.name}`:`Product details: ${project.name}`} class="group grid gap-2 py-2.5 hover:bg-surface-50 border border-transparent focus-visible:border-accent-500 focus-visible:outline-none dark:hover:bg-surface-900 sm:grid-cols-[minmax(10rem,1fr)_minmax(16rem,2fr)_auto] sm:items-center sm:gap-5 sm:px-3"><span class="text-xl font-medium tracking-tight group-hover:text-accent-700 dark:group-hover:text-accent-300">{project.name}</span><span class="text-sm text-surface-600 dark:text-warm-300">{project.tagline || project.description || 'Open product details'}</span><span class="text-sm font-medium text-accent-700 dark:text-accent-300">{verifiedProductEntry(project.slug)?'Visit':'Open'} →</span></a>{#if verifiedProductEntry(project.slug)}<a href="/explore/{project.slug}" class="mb-3 inline-block text-sm underline sm:ml-3">Product details</a>{/if}</article>{/each}
			{#if results.length === 0}<p class="py-8 text-sm text-surface-600 dark:text-warm-300">No products match these filters. Try another search or category.</p>{/if}
		</div>
	{/if}
</div>
