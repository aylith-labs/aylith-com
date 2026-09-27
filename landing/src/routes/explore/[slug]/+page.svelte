<script lang="ts">
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';
	import ThemedShot from '$lib/components/changelog/ThemedShot.svelte';
	import { getHero } from '$lib/changelog/entries';
	import { hasPublicOnboarding, hasSetupDetails } from '$lib/catalog/availability';
	let { data } = $props();
	let project: Project = $derived(data.project);
	let hero = $derived(getHero(project.slug));
	let hasSetup = $derived(hasSetupDetails(project));
	let hasAside = $derived(hasSetup || !!project.features?.length);
</script>

<Seo title="{project.name} — Explore Aylith" description={project.description} type="article" />
<article class="mx-auto max-w-6xl px-5 py-9 pb-32 sm:px-10 sm:py-14">
	<div class="grid gap-10 {hasAside ? 'lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]' : ''}">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent-700 dark:text-accent-300">At a glance</p>
			<h2 class="mt-3 max-w-3xl text-3xl font-medium leading-tight tracking-tight sm:text-5xl">{project.description}</h2>
			{#if hero}
				<figure class="mt-9"><ThemedShot light={hero.light} dark={hero.dark} alt={hero.alt} width={hero.width} height={hero.height} /></figure>
			{/if}
			{#if project.body}<div class="prose mt-10 max-w-none dark:prose-invert prose-a:text-accent-700 dark:prose-a:text-accent-300">{@html project.body}</div>{/if}
		</div>
		{#if hasAside}<aside class="self-start rounded-2xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900">
			<h2 class="text-lg font-semibold">{hasSetup ? 'Getting started' : 'Capabilities'}</h2>
			{#if hasPublicOnboarding(project)}
				<a href={project.onboarding?.url} class="mt-4 inline-flex text-sm font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-300">Read the quick-start →</a>
			{/if}
			{#if project.onboarding?.releasesUrl}<p class="mt-3"><a href={project.onboarding.releasesUrl} rel="noreferrer" class="inline-flex min-h-11 items-center text-sm font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-300">Package versions &amp; publication dates →</a></p>{/if}
			{#if project.onboarding?.prerequisites?.length}<h3 class="mt-6 text-sm font-semibold">Requirements</h3><ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-surface-600 dark:text-warm-300">{#each project.onboarding.prerequisites as item}<li>{item}</li>{/each}</ul>{/if}
			{#if project.onboarding?.limitations?.length}<h3 class="mt-6 text-sm font-semibold">Things to know</h3><ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-surface-600 dark:text-warm-300">{#each project.onboarding.limitations as item}<li>{item}</li>{/each}</ul>{/if}
			{#if project.features?.length}{#if hasSetup}<h3 class="mt-6 text-sm font-semibold">Capabilities</h3>{/if}<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-surface-600 dark:text-warm-300">{#each project.features as item}<li>{item}</li>{/each}</ul>{/if}
		</aside>{/if}
	</div>
</article>
