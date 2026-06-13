<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { draw } from '$lib/actions/draw';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import { getMonthlyVariant } from '$lib/brand/rotation';
	import type { Project } from '$lib/types/project';

	const wordmarkVariant = getMonthlyVariant();

	let { data } = $props();
	let projects: Project[] = $derived(data.projects);
	let featured = $derived(projects.filter((p) => p.featured));
	let rest = $derived(projects.filter((p) => !p.featured));

	const categoryLabels: Record<string, string> = {
		'ai-infrastructure': 'AI Infrastructure',
		'developer-tools': 'Developer Tools',
		'design-tools': 'Design Tools',
		productivity: 'Productivity',
		'data-tools': 'Data & Analytics',
		wellness: 'Wellness',
		testing: 'Testing'
	};
</script>

<svelte:head>
	<title>Aylith. A lab that turns demand signals into shipped AI tools.</title>
	<meta name="description" content="A lab that turns demand signals into shipped AI tools. 138+ launches analyzed; ten products built; days, not quarters. The method, the portfolio, the receipts." />
</svelte:head>

<!-- Hero -->
<section class="relative">
	<div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
		<div class="max-w-3xl">
			<div class="animate-fade-in-up mb-10 flex items-center gap-4 text-surface-900 dark:text-warm-50">
				<Mark class="h-11 w-auto shrink-0 sm:h-14" />
				<Wordmark variant={wordmarkVariant} size="hero" />
			</div>

			<h1 class="animate-fade-in-up text-5xl font-bold leading-[1.08] tracking-tight text-surface-900 sm:text-6xl lg:text-7xl dark:text-warm-50" style="animation-delay: 0.05s">
				Read the signal.<br />
				Build the tool.<br />
				Ship in days.
			</h1>

			<p class="animate-fade-in-up mt-8 max-w-xl text-lg leading-relaxed text-surface-500 sm:text-xl dark:text-warm-300" style="animation-delay: 0.1s">
				Aylith is a lab for turning demand signals into shipped AI tools.
				Inputs: 138+ launches analyzed.
				Outputs: the portfolio below.
				Cadence: days, not quarters.
			</p>

			<div class="animate-fade-in-up mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 0.2s">
				<a
					href="#portfolio"
					class="btn-press inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 hover:bg-accent-500 dark:bg-accent-500 dark:shadow-accent-500/10 dark:hover:bg-accent-400"
				>
					See what shipped
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</a>
				<a
					href="#method"
					class="btn-press inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-surface-700 backdrop-blur-sm hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800/60 dark:text-warm-200 dark:hover:border-surface-600"
				>
					Read the method
				</a>
			</div>
		</div>
	</div>
</section>

<!-- The loop — three-step method -->
<section id="method" class="border-t border-surface-200/60 py-20 sm:py-28 dark:border-surface-800/40">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-3">
			<div use:reveal>
				<h2 class="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl dark:text-warm-50">
					The loop
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-surface-500 dark:text-warm-300">
					Three steps, repeated.
					Most signals don't survive step two.
					Most builds don't survive step three.
					The portfolio below is what survived both.
				</p>
			</div>

			<ol class="space-y-10 lg:col-span-2">
				<li use:reveal={{ delay: 100 }}>
					<div class="flex items-baseline gap-4">
						<span class="font-mono text-xs font-medium tracking-[0.16em] text-surface-400 dark:text-warm-400">01</span>
						<h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Listen</h3>
					</div>
					<p class="mt-3 text-base leading-relaxed text-surface-500 dark:text-warm-300">
						Comments under product launches.
						Reviews that name what's missing.
						Threads where the same complaint shows up three times in a row.
						138+ launches monitored to date.
					</p>
				</li>

				<li use:reveal={{ delay: 200 }}>
					<div class="flex items-baseline gap-4">
						<span class="font-mono text-xs font-medium tracking-[0.16em] text-surface-400 dark:text-warm-400">02</span>
						<h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Pattern</h3>
					</div>
					<p class="mt-3 text-base leading-relaxed text-surface-500 dark:text-warm-300">
						A signal that turns up in three independent launches is a candidate.
						A candidate that survives a weekend of building is a product.
						Most candidates don't.
					</p>
				</li>

				<li use:reveal={{ delay: 300 }}>
					<div class="flex items-baseline gap-4">
						<span class="font-mono text-xs font-medium tracking-[0.16em] text-surface-400 dark:text-warm-400">03</span>
						<h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">Ship</h3>
					</div>
					<p class="mt-3 text-base leading-relaxed text-surface-500 dark:text-warm-300">
						Public from day one.
						No private beta, no waitlist, no launch email.
						If it works, the next signal is already queued.
					</p>
				</li>
			</ol>
		</div>
	</div>
</section>

<!-- Portfolio: featured spotlight + compact list -->
<section id="portfolio" class="border-t border-surface-200/60 py-20 sm:py-28 dark:border-surface-800/40">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

		<div class="mb-12 flex items-baseline justify-between gap-6" use:reveal>
			<h2 class="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl dark:text-warm-50">
				What shipped
			</h2>
			<p class="font-mono text-xs tracking-[0.14em] text-surface-400 dark:text-warm-400">
				TEN PRODUCTS · SEVEN CATEGORIES · NEWEST FIRST
			</p>
		</div>

		<!-- Featured projects, large cards -->
		<div class="grid gap-6 lg:grid-cols-3">
			{#each featured as project, i}
				<a
					href="/projects/{project.slug}"
					class="group relative overflow-hidden rounded-2xl border border-surface-200/60 bg-white p-8 transition-all duration-300 hover:border-surface-300 dark:border-surface-800/60 dark:bg-surface-900/50 dark:hover:border-surface-700"
					use:tilt={{ max: 3, scale: 1.005 }}
					use:reveal={{ delay: i * 100 }}
				>
					<!-- Ambient color -->
					<div
						class="absolute -right-20 -top-20 size-40 rounded-full opacity-[0.06] blur-3xl transition-opacity group-hover:opacity-[0.12]"
						style="background: {project.gradientFrom}"
					></div>

					<div class="relative">
						<svg class="mb-6 size-8" style="color: {project.gradientFrom}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" use:draw={{ delay: i * 150 + 200 }}>
							<path stroke-linecap="round" stroke-linejoin="round" d={project.iconPath} />
						</svg>

						<h3 class="text-xl font-bold text-surface-900 dark:text-warm-50">{project.name}</h3>
						<p class="mt-1 text-sm font-medium" style="color: {project.gradientFrom}">{project.tagline}</p>
						<p class="mt-4 text-sm leading-relaxed text-surface-500 dark:text-warm-300">
							{project.description}
						</p>

						<div class="mt-6 flex items-center justify-between">
							<span class="text-xs font-medium text-surface-400 dark:text-warm-400">
								{categoryLabels[project.category] ?? project.category}
							</span>
							<span class="text-sm text-surface-400 transition-transform duration-300 group-hover:translate-x-1 dark:text-warm-400">&rarr;</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Remaining projects — compact list -->
		<div class="mt-12" use:reveal={{ delay: 200 }}>
			<div class="divide-y divide-surface-200/60 rounded-2xl border border-surface-200/60 bg-white dark:divide-surface-800/60 dark:border-surface-800/60 dark:bg-surface-900/50">
				{#each rest as project}
					<a
						href="/projects/{project.slug}"
						class="list-row group flex items-center gap-5 px-6 py-5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-50 dark:hover:bg-surface-800/40"
						style="--row-accent: {project.gradientFrom}"
					>
						<svg class="size-5 shrink-0" style="color: {project.gradientFrom}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d={project.iconPath} />
						</svg>

						<div class="min-w-0 flex-1">
							<div class="flex items-baseline gap-3">
								<span class="text-sm font-bold text-surface-900 dark:text-warm-100">{project.name}</span>
								<span class="hidden text-sm sm:inline" style="color: {project.gradientFrom}">{project.tagline}</span>
							</div>
							<p class="mt-0.5 truncate text-sm text-surface-400 sm:hidden dark:text-warm-400">{project.tagline}</p>
						</div>

						<span class="hidden shrink-0 text-xs font-medium text-surface-400 sm:block dark:text-warm-400">
							{categoryLabels[project.category] ?? project.category}
						</span>

						<span class="text-sm text-surface-300 transition-transform duration-300 group-hover:translate-x-1 dark:text-surface-600">&rarr;</span>
					</a>
				{/each}
			</div>
		</div>

		<div class="mt-8 text-center" use:reveal={{ delay: 300 }}>
			<a
				href="/projects"
				class="text-sm font-medium text-accent-600 transition-colors hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300"
			>
				View all projects with filtering &rarr;
			</a>
		</div>
	</div>
</section>

