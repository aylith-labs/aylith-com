<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import type { Project } from '$lib/types/project';
	let { data, children }: { data: { project: Project }; children: Snippet } = $props();
	let project = $derived(data.project);
	let base = $derived(`/explore/${project.slug}`);
	let current = $derived(page.url.pathname.endsWith('/website') ? 'website' : page.url.pathname.endsWith('/changelog') ? 'changelog' : 'overview');
</script>

<div class="{current === 'website' ? 'flex h-full min-h-0 flex-col' : 'min-h-full'}">
	<header class="sticky top-0 z-10 shrink-0 border-b border-surface-200 bg-white/95 px-5 py-2 backdrop-blur-sm dark:border-surface-800 dark:bg-surface-950/95 sm:px-10">
		<div class="flex flex-wrap items-center justify-between gap-2 sm:gap-5">
			<div class="flex min-w-0 items-center gap-3"><a href="/explore" aria-label="All projects" class="text-sm font-medium text-surface-500 hover:text-accent-700 dark:text-warm-400">←</a><h1 class="truncate text-xl font-semibold tracking-tight sm:text-2xl">{project.name}</h1></div>
		<nav aria-label="{project.name} content" class="order-3 flex w-full gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
			<a href={base} aria-current={current === 'overview' ? 'page' : undefined} class="whitespace-nowrap rounded-lg px-4 py-2 {current === 'overview' ? 'bg-surface-900 text-white dark:bg-warm-100 dark:text-surface-900' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}">Overview</a>
			<a href="{base}/website" aria-current={current === 'website' ? 'page' : undefined} class="whitespace-nowrap rounded-lg px-4 py-2 {current === 'website' ? 'bg-surface-900 text-white dark:bg-warm-100 dark:text-surface-900' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}">Website</a>
			<a href="{base}/changelog" aria-current={current === 'changelog' ? 'page' : undefined} class="whitespace-nowrap rounded-lg px-4 py-2 {current === 'changelog' ? 'bg-surface-900 text-white dark:bg-warm-100 dark:text-surface-900' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}">Changelog</a>
		</nav>
			{#if project.repoUrl}<a class="hidden text-sm text-accent-700 underline underline-offset-4 dark:text-accent-300 lg:inline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>{/if}
		</div>
	</header>
	{@render children()}
</div>
