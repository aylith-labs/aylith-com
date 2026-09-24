<script lang="ts">
	import type { Project } from '$lib/types/project';
	import Seo from '$lib/components/Seo.svelte';
	import ThemedShot from '$lib/components/changelog/ThemedShot.svelte';
	import { getHero } from '$lib/changelog/entries';
	import { hasPublicOnboarding } from '$lib/catalog/availability';
	let { data } = $props();
	let project: Project = $derived(data.project);
	let hero = $derived(getHero(project.slug));
</script>

<Seo title="{project.name} — Aylith" description={project.description} type="article" />

<article class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
	<a href="/projects" class="font-medium text-accent-700 underline underline-offset-4 dark:text-accent-400">← All Projects</a>
	<header class="mt-8">
		<h1 class="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl dark:text-warm-50">{project.name}</h1>
		<p class="mt-4 text-xl text-surface-700 dark:text-warm-200">{project.tagline}</p>
		<p class="mt-4 max-w-3xl text-surface-600 dark:text-warm-300">{project.description}</p>
		<a class="mt-5 inline-block text-accent-700 underline dark:text-accent-400" href="/projects/{project.slug}/changelog">View the changelog →</a>
	</header>

	<section id="setup" aria-labelledby="setup-heading" class="mt-10 scroll-mt-24 rounded-2xl border border-surface-300 p-6 sm:p-8 dark:border-surface-700">
		<h2 id="setup-heading" class="text-2xl font-bold text-surface-900 dark:text-warm-50">Setup &amp; access</h2>
		{#if hasPublicOnboarding(project)}
			<p class="mt-3 text-surface-600 dark:text-warm-300">Public source setup. This is not a one-click hosted service or a packaged release guarantee.</p>
			<a href={project.onboarding?.url} class="mt-5 inline-block rounded-xl bg-accent-selected px-5 py-3 font-semibold text-on-accent hover:bg-accent-selected-hover active:bg-accent-selected-active">Read {project.name} quick-start →</a>
		{:else if project.onboarding?.access === 'restricted'}
			<p class="mt-3 text-surface-600 dark:text-warm-300">Access is restricted. There is no verified public install path here.</p>
		{:else}
			<p class="mt-3 text-surface-600 dark:text-warm-300">A public quick-start has not been verified for this entry. Do not treat the feature description as installation instructions.</p>
		{/if}
		{#if project.onboarding}
			{#if project.onboarding.releasesUrl}
				<p class="mt-5 text-sm text-surface-600 dark:text-warm-300">
					<a href={project.onboarding.releasesUrl} rel="noreferrer" class="inline-flex min-h-11 items-center text-accent-700 underline underline-offset-4 dark:text-accent-300">Package versions &amp; publication dates →</a>
					<span class="block">Authoritative release metadata, separate from studio notes. Publication does not verify every setup or feature.</span>
				</p>
			{/if}
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				<div><h3 class="font-semibold text-surface-900 dark:text-warm-50">Prerequisites</h3><ul class="mt-3 list-disc space-y-2 pl-5 text-surface-600 dark:text-warm-300">{#each project.onboarding.prerequisites as item}<li>{item}</li>{/each}</ul></div>
				<div><h3 class="font-semibold text-surface-900 dark:text-warm-50">Known limitations</h3><ul class="mt-3 list-disc space-y-2 pl-5 text-surface-600 dark:text-warm-300">{#each project.onboarding.limitations as item}<li>{item}</li>{/each}</ul></div>
			</div>
		{/if}
	</section>

	{#if hero}
		<figure class="mt-10">
			<ThemedShot light={hero.light} dark={hero.dark} alt={hero.alt} width={hero.width} height={hero.height} />
			<figcaption class="mt-3 text-sm text-surface-600 dark:text-warm-300">Recorded product visual. Check the setup requirements above for current access.</figcaption>
		</figure>
	{/if}

	<div class="mt-12 grid gap-10 lg:grid-cols-3">
		<aside class="space-y-8">
			{#if project.features?.length}
				<div><h2 class="text-lg font-bold text-surface-900 dark:text-warm-50">Described capabilities</h2><ul class="mt-4 list-disc space-y-3 pl-5 text-surface-600 dark:text-warm-300">{#each project.features as feature}<li>{feature}</li>{/each}</ul></div>
			{/if}
			{#if project.targetUser}<div><h2 class="text-lg font-bold text-surface-900 dark:text-warm-50">Intended users</h2><p class="mt-3 text-surface-600 dark:text-warm-300">{project.targetUser}</p></div>{/if}
		</aside>
		<div class="lg:col-span-2">
			{#if project.body}
				<div class="prose max-w-none dark:prose-invert prose-a:text-accent-700 dark:prose-a:text-accent-400">{@html project.body}</div>
			{:else}
				<p class="text-surface-600 dark:text-warm-300">A detailed product brief has not been published. No delivery date is promised.</p>
			{/if}
		</div>
	</div>
	<a href="/projects" class="mt-12 inline-block font-medium text-accent-700 underline dark:text-accent-400">← Back to the catalog</a>
</article>
