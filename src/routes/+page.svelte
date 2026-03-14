<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { draw } from '$lib/actions/draw';
	import type { Project } from '$lib/types/project';

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
	<title>Aylith — AI Product Studio</title>
	<meta name="description" content="Aylith is an AI product studio building tools that solve real problems for developers, knowledge workers, and teams." />
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-b from-accent-50/60 via-white to-white dark:from-surface-900 dark:via-surface-950 dark:to-surface-950"></div>
	<div class="absolute -left-40 -top-40 size-[500px] rounded-full bg-accent-400/6 blur-[100px] animate-float dark:bg-accent-500/3"></div>
	<div class="absolute -right-20 top-20 size-[400px] rounded-full bg-warm-300/10 blur-[80px] animate-float-delayed dark:bg-warm-400/3"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
		<div class="max-w-3xl">
			<div class="animate-fade-in-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-accent-200/60 bg-accent-50/80 px-4 py-1.5 text-sm font-medium text-accent-700 dark:border-surface-700 dark:bg-surface-800/80 dark:text-accent-300">
				<span class="relative flex size-2">
					<span class="absolute inline-flex size-full animate-ping rounded-full bg-accent-500 opacity-75"></span>
					<span class="relative inline-flex size-2 rounded-full bg-accent-500"></span>
				</span>
				AI Product Studio
			</div>

			<h1 class="animate-fade-in-up text-5xl font-bold leading-[1.08] tracking-tight text-surface-900 sm:text-6xl lg:text-7xl dark:text-warm-50" style="animation-delay: 0.1s">
				We build AI tools<br />
				<span class="text-accent-600 dark:text-accent-400">that actually work.</span>
			</h1>

			<p class="animate-fade-in-up mt-6 max-w-lg text-lg leading-relaxed text-surface-500 sm:text-xl dark:text-warm-300" style="animation-delay: 0.2s">
				Ten products across seven categories — each backed by analysis
				of 138+ launches and real community demand signals.
			</p>

			<div class="animate-fade-in-up mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 0.3s">
				<a
					href="#portfolio"
					class="btn-press inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 hover:bg-accent-500 dark:bg-accent-500 dark:shadow-accent-500/10 dark:hover:bg-accent-400"
				>
					See the portfolio
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</a>
				<a
					href="https://github.com/aylith-apps"
					class="btn-press inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-surface-700 backdrop-blur-sm hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800/60 dark:text-warm-200 dark:hover:border-surface-600"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					GitHub
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Portfolio: Featured spotlight + compact list -->
<section id="portfolio" class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

		<!-- Featured projects — large cards -->
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

<!-- Approach — editorial, not cards -->
<section class="border-t border-surface-200/60 py-20 sm:py-28 dark:border-surface-800/40">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-2">
			<div use:reveal>
				<h2 class="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl dark:text-warm-50">
					Our Approach
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-surface-500 dark:text-warm-300">
					We don't build solutions looking for problems. Every product starts with
					evidence — real frustration from real communities, validated demand,
					and a clear gap no existing tool fills well.
				</p>
			</div>

			<div class="space-y-10">
				<div use:reveal={{ delay: 100 }}>
					<div class="flex items-baseline gap-4">
						<span class="text-3xl font-bold tabular-nums text-accent-600 dark:text-accent-400">138+</span>
						<span class="text-sm font-medium text-surface-400 dark:text-warm-400">products analyzed</span>
					</div>
					<p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-warm-300">
						Product Hunt launches, Reddit threads, competitor landscapes — deep research before writing a single line of code.
					</p>
				</div>

				<div use:reveal={{ delay: 200 }}>
					<div class="flex items-baseline gap-4">
						<span class="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">5</span>
						<span class="text-sm font-medium text-surface-400 dark:text-warm-400">markets validated</span>
					</div>
					<p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-warm-300">
						Demand signals from communities with hundreds of thousands of members. Not guesses — proof.
					</p>
				</div>

				<div use:reveal={{ delay: 300 }}>
					<div class="flex items-baseline gap-4">
						<span class="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400">Solo</span>
						<span class="text-sm font-medium text-surface-400 dark:text-warm-400">buildable scope</span>
					</div>
					<p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-warm-300">
						Each product is scoped for a solo developer or small team. No enterprise infrastructure required to reach MVP.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
