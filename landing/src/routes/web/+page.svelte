<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { canonicalWebHref } from '$lib/explore/view-context';
	import { catalogViewHref } from '$lib/explore/catalog-view';
	import WebDiscovery from '$lib/components/catalog/WebDiscovery.svelte';
	import { browserStorage, rememberView } from '$lib/view-preference';
	import { reveal } from '$lib/actions/reveal';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import { getMonthlyVariant } from '$lib/brand/rotation';
	import { motion } from '$lib/stores/motion.svelte';
	import { verifiedProductEntry } from '$lib/catalog/entry-point';
	import { hasPublicOnboarding } from '$lib/catalog/availability';
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';

	const wordmarkVariant = getMonthlyVariant();
	let heroMark = $state<{ replay: (force?: boolean) => void } | undefined>();
	let heroWordmark = $state<{ replay: (force?: boolean) => void } | undefined>();
	let lockupPlaying = false;
	let lockupTimer: ReturnType<typeof setTimeout> | undefined;
	function playLockup() {
		if (motion.isReduced || lockupPlaying) return;
		lockupPlaying = true;
		heroMark?.replay(true);
		heroWordmark?.replay(true);
		clearTimeout(lockupTimer);
		lockupTimer = setTimeout(() => { lockupPlaying = false; }, 2800);
	}
	onMount(() => { rememberView('explore', browserStorage()); const canonical=canonicalWebHref(page.url); if(canonical) void goto(canonical,{replaceState:true,noScroll:true,keepFocus:true}); playLockup(); return () => clearTimeout(lockupTimer); });
	let { data } = $props();
	let projects: Project[] = $derived(data.projects);
	let available = $derived(projects.filter(project => hasPublicOnboarding(project) || verifiedProductEntry(project.slug)));
</script>

<Seo title="Aylith — tools for connected work" description="Explore Aylith tools, find a project by purpose, and follow its work and releases." />

<section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
	<div class="max-w-3xl">
		<div role="group" onmouseenter={playLockup} class="mb-10 flex items-center gap-3 text-surface-900 dark:text-warm-50">
			<Mark bind:this={heroMark} animate hoverReplay={false} autoplay={false} class="h-[clamp(2.5rem,8vw,5rem)] w-auto shrink-0 translate-y-px" />
			<Wordmark bind:this={heroWordmark} variant={wordmarkVariant} size="hero" hoverReplay={false} autoplay={false} />
		</div>
		<h1 class="text-4xl leading-tight font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl dark:text-warm-50">Useful tools.<br />Connected work.</h1>
		<p class="mt-6 max-w-xl text-lg leading-relaxed text-surface-600 dark:text-warm-300">Find software for the work you want to do. Explore by purpose, read each product's story, and follow its releases.</p>
		<div class="mt-8 flex flex-wrap gap-4">
			<a href="#try" class="btn-press rounded-xl bg-accent-selected px-6 py-3.5 font-semibold text-on-accent hover:bg-accent-selected-hover active:bg-accent-selected-active">Explore tools ↓</a>
			<a href="#catalog" class="rounded-xl border border-surface-300 px-6 py-3.5 font-semibold text-surface-700 dark:border-surface-700 dark:text-warm-200">Browse the full catalog →</a>
		</div>
	</div>
</section>

<section id="try" class="scroll-mt-24 border-t border-surface-200/60 py-10 dark:border-surface-800/60">
 <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <h2 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-warm-50">Get started</h2>
  <p class="mt-3 max-w-2xl text-surface-600 dark:text-warm-300">Search by name or purpose below, or choose a starting point to inspect in the same catalog.</p>
  <div class="mt-4 flex flex-wrap gap-3">{#each available.slice(0,3) as project (project.slug)}<button type="button" onclick={() => { const target=new URL(catalogViewHref(page.url,{query:'',category:'all',view:'split',selected:project.slug,pane:'preview'}),page.url.origin); target.hash='catalog'; void goto(target.pathname+target.search+target.hash); }} class="min-h-11 rounded-xl border border-surface-300 px-4 py-2 text-sm font-semibold focus-visible:border-accent-600 focus-visible:outline-none dark:border-surface-600">Show {project.name}</button>{/each}<a href="#catalog" class="inline-flex min-h-11 items-center font-semibold text-accent-700 underline dark:text-accent-300">Browse all {projects.length} products ↓</a></div>
 </div>
</section>

<section id="catalog" class="scroll-mt-24 border-t border-surface-200/60 py-12 dark:border-surface-800/60">
	<WebDiscovery {data} />
</section>

<section id="method" class="border-t border-surface-200/60 py-16 dark:border-surface-800/60">
	<div class="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
		<h2 class="text-3xl font-bold text-surface-900 dark:text-warm-50">How we work</h2>
		<ol class="space-y-8 lg:col-span-2">
			<li use:reveal><h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Understand the task</h3><p class="mt-2 text-surface-600 dark:text-warm-300">Start with the job someone needs to finish and the steps around it.</p></li>
			<li use:reveal><h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Build a useful path</h3><p class="mt-2 text-surface-600 dark:text-warm-300">Make the main action clear, then connect the context a person needs to keep moving.</p></li>
			<li use:reveal><h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Improve from use</h3><p class="mt-2 text-surface-600 dark:text-warm-300">Refine the workflow as people use it and new needs become clear.</p></li>
		</ol>
	</div>
</section>
