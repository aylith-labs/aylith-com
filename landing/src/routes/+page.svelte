<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { reveal } from '$lib/actions/reveal';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import ProjectCard from '$lib/components/home/ProjectCard.svelte';
	import { getMonthlyVariant } from '$lib/brand/rotation';
	import { motion } from '$lib/stores/motion.svelte';
	import { hasPublicOnboarding } from '$lib/catalog/availability';
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';
	import { browserStorage, rootEntry } from '$lib/view-preference';

	afterNavigate(({ type }) => {
		const destination = rootEntry(type, window.location.search, window.self !== window.top, browserStorage());
		if (destination) void goto(destination, { replaceState: true, noScroll: true });
	});

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
	onMount(() => { playLockup(); return () => clearTimeout(lockupTimer); });
	let { data } = $props();
	let projects: Project[] = $derived(data.projects);
	let available = $derived(projects.filter(hasPublicOnboarding));
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
			<a href="/projects" class="rounded-xl border border-surface-300 px-6 py-3.5 font-semibold text-surface-700 dark:border-surface-700 dark:text-warm-200">Browse the full catalog →</a>
		</div>
	</div>
</section>

<section id="try" class="scroll-mt-24 border-t border-surface-200/60 py-16 dark:border-surface-800/60">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-warm-50">Get started</h2>
		<p class="mt-4 max-w-2xl text-surface-600 dark:text-warm-300">Choose a tool and follow its setup guide.</p>
		{#if available.length}
			<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="public-showcase">
				{#each available as project (project.slug)}
					<article class="flex flex-col gap-4" use:reveal>
						<ProjectCard {project} />
						<a href="/projects/{project.slug}#setup" class="font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-400">Set up {project.name} →</a>
					</article>
				{/each}
			</div>
		{:else}
			<p class="mt-8 rounded-xl border border-surface-300 p-6 text-surface-700 dark:border-surface-700 dark:text-warm-200">Browse the <a class="underline" href="/projects">project catalog</a> to find a tool by name or purpose.</p>
		{/if}
		<div class="mt-12 rounded-2xl bg-surface-100 p-6 dark:bg-surface-900">
			<h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Explore the full catalog</h3>
			<p class="mt-3 text-surface-600 dark:text-warm-300">Search by name or purpose, browse categories, and open a product for its details and release story.</p>
			<a href="/projects" class="mt-4 inline-block font-semibold text-accent-700 underline dark:text-accent-400">Explore all {projects.length} catalog entries →</a>
		</div>
	</div>
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
