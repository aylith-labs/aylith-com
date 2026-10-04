<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import { dateLabel, filterAssets, journey, kindLabels, statusLabels, validView, views, type Asset, type AssetCatalog, type AssetView } from '$lib/brand/assets';
	let { data }: { data: { catalog: AssetCatalog } } = $props();
	let view = $state<AssetView>('grid');
	let query = $state('');
	let brand = $state('');
	let kind = $state('');
	let status = $state('');
	let circular = $state(false);
	let ready = $state(false);
	const brands = $derived([...new Set(data.catalog.assets.map(asset => asset.brand))]);
	const filtered = $derived(filterAssets(data.catalog.assets, query, brand, kind, status));
	const timeline = $derived(journey(filtered));
	const currentCount = $derived(data.catalog.assets.filter(asset => asset.status === 'in-use').length);
	onMount(() => {
		const params = new URLSearchParams(location.search);
		let saved: string | null = null;
		try { saved = localStorage.getItem('aylith:brand-view'); } catch { /* Optional preference. */ }
		view = validView(params.get('view') ?? saved);
		query = params.get('q') ?? '';
		brand = brands.includes(params.get('brand') ?? '') ? params.get('brand') ?? '' : '';
		kind = kindLabels[params.get('kind') ?? ''] ? params.get('kind') ?? '' : '';
		status = statusLabels[params.get('status') ?? ''] ? params.get('status') ?? '' : '';
		ready = true;
	});
	$effect(() => {
		if (!ready) return;
		const url = new URL(page.url);
		for (const [key, value] of Object.entries({ view, q: query, brand, kind, status })) {
			if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
		}
		if (url.href !== page.url.href) replaceState(url, page.state);
		try { localStorage.setItem('aylith:brand-view', view); } catch { /* Optional preference. */ }
	});
	function clearFilters() { query = ''; brand = ''; kind = ''; status = ''; }
</script>

<Seo title="Brand assets — Aylith" description="Browse Aylith, shefrd, personal X, and Stith brand assets in a grid, list, or dated journey. Logos, avatars, banners, and their history." />

{#snippet badge(asset: Asset)}
	<span class="rounded-full border border-surface-200 px-2.5 py-1 text-xs font-medium text-surface-700 dark:border-surface-700 dark:text-warm-200">{statusLabels[asset.status]}</span>
{/snippet}
{#snippet links(asset: Asset)}
	<div class="flex flex-wrap gap-4 text-sm font-semibold text-accent-700 dark:text-accent-400">
		<a href={asset.url} class="underline underline-offset-4">Open {asset.url.split('.').pop()?.toUpperCase()} ↗</a>
		{#if asset.vectorUrl}<a href={asset.vectorUrl} class="underline underline-offset-4">SVG source ↗</a>{/if}
	</div>
{/snippet}
{#snippet history(asset: Asset)}
	<details class="mt-4 border-t border-surface-200 pt-3 text-sm dark:border-surface-700">
		<summary class="cursor-pointer font-medium text-surface-700 dark:text-warm-200">Asset history &amp; file details</summary>
		<p class="mt-3 text-xs text-surface-500 dark:text-warm-400">{asset.width} × {asset.height} · {(asset.bytes / 1024 / 1024).toFixed(2)} MB · Created: {dateLabel(asset.createdOn)}</p>
		<ol class="mt-3 space-y-3">
			{#each asset.history as event}
				<li><p class="text-xs text-accent-700 dark:text-accent-400">{dateLabel(event.date)}</p><p class="text-surface-800 dark:text-warm-100">{event.event}</p><p class="text-xs text-surface-500 dark:text-warm-400">{event.source}</p></li>
			{/each}
		</ol>
	</details>
{/snippet}
{#snippet preview(asset: Asset, small = false)}
	<a href={asset.url} class="asset-preview" class:small aria-label={`Open ${asset.title}`}><img src={asset.url} alt={asset.title} loading="lazy" width={asset.width} height={asset.height} class="max-h-full max-w-full object-contain" class:rounded-full={circular && (asset.kind === 'logo' || asset.kind === 'avatar')} /></a>
{/snippet}

<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
	<p class="text-xs font-medium uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">Studio library</p>
	<h1 class="mt-4 text-4xl font-bold tracking-tight text-surface-900 sm:text-6xl dark:text-warm-50">Brand assets</h1>
	<p class="mt-5 max-w-2xl text-lg text-surface-600 dark:text-warm-300">The marks, portraits, and worlds behind our X profiles. Browse the work in use, the alternatives, and the journey that brought them here.</p>
	<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-surface-500 dark:text-warm-400"><span>{data.catalog.assets.length} assets</span><span>{brands.length} collections</span><span>{currentCount} verified X assets</span><span>Updated {dateLabel(data.catalog.updatedOn)}</span></div>

	<div class="mt-10 rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900">
		<div class="flex flex-wrap items-end gap-4">
			<label class="min-w-40 flex-1 text-xs font-medium text-surface-600 dark:text-warm-300">Search assets<input type="search" bind:value={query} placeholder="Constellation, copper, shepherd…" class="mt-2 block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 dark:border-surface-600 dark:bg-surface-800 dark:text-warm-50" /></label>
			<label class="text-xs font-medium text-surface-600 dark:text-warm-300">Collection<select bind:value={brand} class="filter"><option value="">All collections</option>{#each brands as label}<option value={label}>{label}</option>{/each}</select></label>
			<label class="text-xs font-medium text-surface-600 dark:text-warm-300">Type<select bind:value={kind} class="filter"><option value="">All types</option>{#each Object.entries(kindLabels) as [value, label]}<option {value}>{label}</option>{/each}</select></label>
			<label class="text-xs font-medium text-surface-600 dark:text-warm-300">Status<select bind:value={status} class="filter"><option value="">All statuses</option>{#each Object.entries(statusLabels) as [value, label]}<option {value}>{label}</option>{/each}</select></label>
		</div>
		<div class="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-surface-200 pt-4 dark:border-surface-700">
			<div class="flex flex-wrap gap-2" role="group" aria-label="Asset view">
				{#each views as mode}<button type="button" aria-pressed={view === mode} onclick={() => view = mode} class="view-button">{mode === 'journey' ? 'Journey timeline' : mode === 'grid' ? 'Grid' : 'List'}</button>{/each}
			</div>
			<label class="flex items-center gap-2 text-sm text-surface-600 dark:text-warm-300"><input type="checkbox" bind:checked={circular} />Circular avatar previews</label>
		</div>
	</div>
	<div class="my-5 flex items-center justify-between gap-4 text-sm text-surface-500 dark:text-warm-400"><p aria-live="polite">{filtered.length} of {data.catalog.assets.length} assets</p>{#if query || brand || kind || status}<button type="button" onclick={clearFilters} class="text-accent-700 underline dark:text-accent-400">Clear filters</button>{/if}</div>
	{#if !filtered.length}
		<div class="rounded-2xl border border-dashed border-surface-300 p-12 text-center dark:border-surface-600"><h2 class="text-xl font-semibold">No matching assets</h2><p class="mt-2 text-surface-500 dark:text-warm-400">Try a different collection, type, or search.</p><button type="button" onclick={clearFilters} class="mt-5 text-accent-700 underline dark:text-accent-400">Show all assets</button></div>
	{:else if view === 'grid'}
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as asset (asset.id)}
				<article class="min-w-0 rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
					{@render preview(asset)}
					<div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-warm-400"><span>{asset.brand} · {kindLabels[asset.kind]}</span>{@render badge(asset)}</div>
					<h2 class="mt-3 text-lg font-semibold text-surface-900 dark:text-warm-50">{asset.title}</h2>
					<p class="mb-4 mt-1 text-xs text-surface-500 dark:text-warm-400">Added {dateLabel(asset.addedOn)}</p>
					{@render links(asset)}{@render history(asset)}
				</article>
			{/each}
		</div>
	{:else if view === 'list'}
		<ul class="divide-y divide-surface-200 rounded-2xl border border-surface-200 dark:divide-surface-700 dark:border-surface-700">
			{#each filtered as asset (asset.id)}
				<li class="flex flex-wrap gap-4 p-4 sm:flex-nowrap">
					{@render preview(asset, true)}
					<div class="min-w-0 flex-1"><div class="flex flex-wrap justify-between gap-2"><h2 class="font-semibold text-surface-900 dark:text-warm-50">{asset.title}</h2>{@render badge(asset)}</div><p class="my-2 text-xs text-surface-500 dark:text-warm-400">{asset.brand} · {kindLabels[asset.kind]} · Added {dateLabel(asset.addedOn)}</p>{@render links(asset)}{@render history(asset)}</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mb-6 max-w-3xl text-sm text-surface-500 dark:text-warm-400">Newest records first. These dates document additions and decisions, not assumed creation dates. Multiple events can refer to the same asset.</p>
		{#each timeline as [date, events]}
			<section class="mb-10 border-l-2 border-surface-200 pl-5 dark:border-surface-700" aria-label={dateLabel(date === 'unknown' ? null : date)}>
				<h2 class="mb-5 text-xl font-semibold text-surface-900 dark:text-warm-50">{dateLabel(date === 'unknown' ? null : date)} <span class="text-sm font-normal text-surface-500">· {events.length} {events.length === 1 ? 'event' : 'events'}</span></h2>
				<ol class="space-y-4">{#each events as { asset, event }}<li class="flex flex-wrap gap-4 rounded-xl border border-surface-200 p-4 sm:flex-nowrap dark:border-surface-700">{@render preview(asset, true)}<div class="min-w-0"><p class="text-xs text-accent-700 dark:text-accent-400">{asset.brand} · {kindLabels[asset.kind]}</p><h3 class="mt-1 font-semibold text-surface-900 dark:text-warm-50">{asset.title}</h3><p class="mt-1 text-sm text-surface-700 dark:text-warm-200">{event.event}</p><p class="mt-1 text-xs text-surface-500 dark:text-warm-400">{event.source}</p></div></li>{/each}</ol>
			</section>
		{/each}
	{/if}
	<aside class="mt-12 border-t border-surface-200 pt-6 text-sm text-surface-500 dark:border-surface-700 dark:text-warm-400"><h2 class="font-semibold text-surface-700 dark:text-warm-200">About the archive</h2><p class="mt-2 max-w-3xl">{data.catalog.datePolicy} “In use on X” reflects the profile verification recorded in each asset’s history. Personal banner selection was not recorded; those variants remain explorations. Stith assets are candidates, with no X selection recorded.</p><div class="mt-4 flex flex-wrap gap-5"><a href="https://media.aylith.com/aylith-com/brand/2026-10-04-social-library/catalog.json" class="underline">Download asset catalog ↗</a><a href="/design" class="underline">Design system ↗</a></div></aside>
</section>

<style>
	.filter { display:block; margin-top:.5rem; max-width:100%; border:1px solid var(--color-surface-300); border-radius:.5rem; padding:.625rem .75rem; background:var(--color-surface-50); color:var(--color-surface-900); font-size:.875rem; }
	:global(.dark) .filter { background:var(--color-surface-800); color:var(--color-warm-50); border-color:var(--color-surface-600); }
	.view-button { border:1px solid var(--color-surface-300); border-radius:.5rem; padding:.5rem 1rem; font-size:.875rem; color:var(--color-surface-700); }
	:global(.dark) .view-button { color:var(--color-warm-200); border-color:var(--color-surface-600); }
	.view-button[aria-pressed='true'] { background:var(--color-accent-selected); color:var(--color-on-accent); border-color:transparent; }
	.asset-preview { display:flex; height:13rem; align-items:center; justify-content:center; border-radius:.75rem; padding:.75rem; background:var(--color-surface-100); }
	.asset-preview.small { height:6rem; width:8rem; flex-shrink:0; padding:.5rem; }
	:global(.dark) .asset-preview { background:var(--color-surface-800); }
	button, a, input, select, summary { outline-offset:4px; }
</style>

