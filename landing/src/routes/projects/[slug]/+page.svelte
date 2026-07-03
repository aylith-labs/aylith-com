<script lang="ts">
	import type { Project } from '$lib/types/project';
	import { reveal } from '$lib/actions/reveal';
	import Seo from '$lib/components/Seo.svelte';
	import ThemedShot from '$lib/components/changelog/ThemedShot.svelte';
	import { getHero } from '$lib/changelog/entries';

	let { data } = $props();
	let project: Project = $derived(data.project);
	let hero = $derived(getHero(project.slug));

	const categoryLabels: Record<string, string> = {
		'ai-infrastructure': 'AI Infrastructure',
		'developer-tools': 'Developer Tools',
		'design-tools': 'Design Tools',
		productivity: 'Productivity',
		'data-tools': 'Data & Analytics',
		wellness: 'Wellness',
		testing: 'Testing',
		uncategorized: 'Unsorted'
	};

	const statusLabels: Record<string, string> = {
		research: 'In Research',
		planning: 'Planning',
		building: 'In Development',
		beta: 'Beta',
		live: 'Live'
	};

	// A placeholder tool: in planning with nothing authored yet. The detail page
	// then shows a brief "follow along" state instead of an empty content column.
	let isPlaceholder = $derived(
		project.status === 'planning' && !project.body && !project.features?.length
	);
</script>

<Seo title="{project.name} — Aylith" description={project.description} type="article" />

<!-- Hero -->
<section class="relative overflow-hidden">
	<div
		class="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
		style="background: linear-gradient(135deg, {project.gradientFrom}, {project.gradientTo})"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
		<a
			href="/projects"
			class="mb-8 inline-flex items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:text-warm-400 dark:hover:text-warm-200"
		>
			<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			All Projects
		</a>

		<div class="flex items-start gap-5">
			<svg
				class="mt-1 size-10 shrink-0 sm:size-12"
				style="color: {project.gradientFrom}"
				fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d={project.iconPath} />
			</svg>

			<div>
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl dark:text-warm-50">
						{project.name}
					</h1>
					<span
						class="rounded-full px-3 py-1 text-xs font-semibold text-white"
						style="background: {project.gradientFrom}"
					>
						{statusLabels[project.status] ?? project.status}
					</span>
				</div>

				<p class="mt-2 text-xl font-medium" style="color: {project.gradientFrom}">
					{project.tagline}
				</p>

				<p class="mt-3 max-w-2xl text-surface-500 dark:text-warm-300">
					{project.description}
				</p>

				<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					<span class="text-xs font-medium text-surface-400 dark:text-warm-400">
						{categoryLabels[project.category] ?? project.category}
					</span>
					<a
						href="/projects/{project.slug}/changelog"
						class="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 transition-colors hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
					>
						Changelog
						<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</a>
					{#if project.repoUrl}
						<a
							href={project.repoUrl}
							class="inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 transition-colors hover:text-accent-600 dark:text-warm-400 dark:hover:text-accent-400"
						>
							<svg class="size-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
							</svg>
							Source
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Product screenshot (theme-aware) -->
<section class="pb-4">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" use:reveal>
		{#if hero}
			<ThemedShot
				light={hero.light}
				dark={hero.dark}
				alt={hero.alt}
				width={hero.width}
				height={hero.height}
			/>
		{:else}
			<div
				class="my-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 dark:border-warm-700"
				style="aspect-ratio: 16 / 10"
			>
				<svg
					class="size-12 opacity-40"
					style="color: {project.gradientFrom}"
					fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={project.iconPath} />
				</svg>
				<p class="mt-4 text-sm text-surface-400 dark:text-warm-400">
					Screenshots are on their way — {project.name} doesn't have a capturable public surface yet.
				</p>
			</div>
		{/if}
	</div>
</section>

<!-- Content -->
<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-12 lg:grid-cols-3">
			<!-- Sidebar -->
			<div class="order-2 lg:order-1 lg:col-span-1">
				<div class="sticky top-24 space-y-8">
					{#if project.features?.length}
						<div use:reveal>
							<h2 class="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-warm-400">
								Key Features
							</h2>
							<ul class="mt-4 space-y-3">
								{#each project.features as feature}
									<li class="flex items-start gap-2 text-sm text-surface-600 dark:text-warm-300">
										<svg class="mt-0.5 size-4 shrink-0" style="color: {project.gradientFrom}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path d="M5 13l4 4L19 7" />
										</svg>
										{feature}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if project.targetUser}
						<div use:reveal={{ delay: 100 }}>
							<h2 class="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-warm-400">
								Built For
							</h2>
							<p class="mt-3 text-sm text-surface-600 dark:text-warm-300">
								{project.targetUser}
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Main content -->
			<div class="order-1 lg:order-2 lg:col-span-2" use:reveal>
				{#if project.body}
					<div class="prose prose-surface max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-accent-600 dark:prose-a:text-accent-400 dark:prose-p:text-warm-300 dark:prose-li:text-warm-300 dark:prose-strong:text-warm-100">
						{@html project.body}
					</div>
				{:else if isPlaceholder}
					<div class="rounded-2xl border border-dashed border-surface-300/70 bg-surface-50/50 p-8 dark:border-surface-700/70 dark:bg-surface-900/30">
						<span
							class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
							style="background: {project.gradientFrom}"
						>
							<span class="size-1.5 rounded-full bg-white/80"></span>
							Planning
						</span>
						<h2 class="mt-4 text-lg font-bold text-surface-900 dark:text-warm-50">
							This tool is in planning.
						</h2>
						<p class="mt-2 max-w-prose text-sm text-surface-500 dark:text-warm-300">
							It's part of the studio, but the page is still taking shape. The work happens in the
							open{#if project.repoUrl}{' '}— follow along on
							<a
								href={project.repoUrl}
								class="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
								>GitHub</a
							>{/if}.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
