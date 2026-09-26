<script lang="ts">
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';
	let { data } = $props();
	let project: Project = $derived(data.project);
	let domain = $derived(project.websiteUrl ? new URL(project.websiteUrl).hostname : '');
</script>
<Seo title="{project.name} Website — Explore Aylith" description="Visit {project.name} on its website." />
<section class="flex min-h-0 flex-1 flex-col px-5 py-2 sm:px-10">
	{#if project.websiteUrl}
		<div class="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm"><span class="font-medium text-surface-600 dark:text-warm-300">{domain}</span><a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" class="font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-300">Open in new tab ↗</a></div>
		<iframe title="{project.name} website" src={project.websiteUrl} loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" class="min-h-0 w-full flex-1 border-0 bg-white"></iframe>
	{:else}
		<div class="m-auto max-w-md py-20 text-center"><h2 class="text-2xl font-semibold">Website not available</h2><p class="mt-3 text-sm text-surface-600 dark:text-warm-300">You can still explore this project’s <a href="/explore/{project.slug}" class="underline">overview</a> and <a href="/explore/{project.slug}/changelog" class="underline">changelog</a>.</p></div>
	{/if}
</section>
