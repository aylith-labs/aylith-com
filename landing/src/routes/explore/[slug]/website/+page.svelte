<script lang="ts">
	import { productWebsitePreview } from '$lib/catalog/entry-point';
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';
	import ProductWebsiteFrame from '$lib/components/catalog/ProductWebsiteFrame.svelte';
	let { data } = $props();
	let project: Project = $derived(data.project);
	let homepage=$derived(productWebsitePreview(project));
	let domain = $derived(homepage ? new URL(homepage).hostname : '');
</script>
<Seo title="{project.name} — Explore Aylith" description={project.description || project.tagline} />
<section class="flex min-h-0 flex-1 flex-col px-5 py-2 sm:px-10">
	{#if homepage}
		<div class="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm"><span class="font-medium text-surface-600 dark:text-warm-300">{domain}</span><a href={homepage} target="_blank" rel="noopener noreferrer" class="font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-300">Open in new tab ↗</a></div>
		<ProductWebsiteFrame {project} className="min-h-0 w-full flex-1 border-0 bg-white" />
	{:else}
		<div class="m-auto max-w-xl py-20"><h2 class="text-3xl font-semibold">{project.name}</h2><p class="mt-4 text-lg leading-relaxed text-surface-600 dark:text-warm-300">{project.description || project.tagline}</p><div class="mt-6 flex flex-wrap gap-5"><a href="/explore/{project.slug}" class="font-semibold underline underline-offset-4">Product details →</a><a href="/explore/{project.slug}/changelog" class="underline underline-offset-4">Latest updates</a></div></div>
	{/if}
</section>
