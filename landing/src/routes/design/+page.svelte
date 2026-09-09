<script lang="ts">
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import MotionControl from '$lib/components/brand/MotionControl.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { wordmarkVariants, getMonthlyVariant } from '$lib/brand/rotation';
	import Seo from '$lib/components/Seo.svelte';

	const currentVariant = getMonthlyVariant();

	let wordmarks = $state<Array<{ replay: (force?: boolean) => void } | undefined>>([]);
	function replay(index: number, force = false) {
		wordmarks[index]?.replay(force);
	}

	let copied = $state('');
	async function copyValue(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = value;
			setTimeout(() => {
				if (copied === value) copied = '';
			}, 1200);
		} catch {
			/* clipboard unavailable */
		}
	}

	const markReadings = [
		{
			label: 'A count',
			body: 'The strokes are a tally, the original mark’s idea: marks made one at a time as work ships. The story is a record kept honest (138 launches analyzed, every tool public from day one), and a tally is how you keep a record honest.'
		},
		{
			label: 'A climb',
			body: 'The strokes rise left to right instead of standing even. That turns the count into a trend: each stroke is taller than the last, the way shipping compounds. Growth without a single arrow, gradient, or upward-and-to-the-right cliche.'
		},
		{
			label: 'A signal',
			body: 'The copper curve is the demand signal Aylith reads, drawn as the growth it compounds into. The bars break past it: the work outpaces the signal, it does not just meet it. Copper is the lone accent, so the curve is one of the only things that gets color.'
		},
		{
			label: 'A spark',
			body: 'The copper sparkles in the top-left mark the work as AI-driven, the modern signifier for intelligence in the loop. They are what make the cadence days, not quarters, and they are held to the same single copper accent.'
		}
	];

	const nameReadings = [
		{
			label: 'AI, in stone',
			body: 'Say it and it splits. Ay is AI. The ending is ·lith, from líthos, the Greek for stone, the root inside monolith and megalith. Aylith turns AI into liths: small, solid tools that last and that you own.'
		},
		{
			label: 'A field',
			body: 'One slab is a trap. Aylith ships many sharp tools instead, each its own standing stone, with the umbrella as the field they stand in.'
		},
		{
			label: 'Six letters',
			body: 'Read down the name and it holds the studio. Agents. Yours. Lasting. Indexed. Tools. Hub.'
		},
		{
			label: 'Roots and branches',
			body: 'There is a tree in it, for those who hear one. The infrastructure is the roots. The products are the branches. Set in stone and still growing.'
		}
	];

	const sections = [
		{ id: 'brand', label: 'Brand' },
		{ id: 'color', label: 'Color' },
		{ id: 'type', label: 'Type' },
		{ id: 'motion', label: 'Motion' },
		{ id: 'components', label: 'Components' },
		{ id: 'principles', label: 'Principles' }
	];

	const surfaceRamp: [string, string][] = [
		['50', '#f8f7f4'],
		['100', '#f0eee9'],
		['200', '#e1ddd3'],
		['300', '#c9c3b3'],
		['400', '#90897a'],
		['500', '#615b50'],
		['600', '#46423a'],
		['700', '#332f29'],
		['800', '#1c1a16'],
		['900', '#131110'],
		['950', '#0a0907']
	];

	const accentRamp: [string, string][] = [
		['50', 'oklch(0.97 0.015 50)'],
		['100', 'oklch(0.94 0.030 50)'],
		['200', 'oklch(0.88 0.060 50)'],
		['300', 'oklch(0.80 0.090 50)'],
		['400', 'oklch(0.73 0.115 50)'],
		['500', 'oklch(0.66 0.13 50)'],
		['600', 'oklch(0.56 0.13 50)'],
		['700', 'oklch(0.46 0.115 50)'],
		['800', 'oklch(0.36 0.090 50)'],
		['900', 'oklch(0.28 0.070 50)']
	];

	const warmRamp: [string, string][] = [
		['50', '#faf8f5'],
		['100', '#f3efe8'],
		['200', '#e8e0d4'],
		['300', '#d4c8b8'],
		['400', '#b0a08a']
	];

	const typeScale = [
		{
			role: 'Display',
			spec: 'Space Grotesk · 700 · clamp(2.5rem, 6vw, 4.5rem) · tracking -0.02em',
			sample: 'Read the signal.',
			class: 'font-display text-5xl font-bold tracking-tight sm:text-6xl'
		},
		{
			role: 'Headline',
			spec: 'Space Grotesk · 700 · 1.5rem',
			sample: 'What shipped',
			class: 'font-display text-2xl font-bold'
		},
		{
			role: 'Title',
			spec: 'Space Grotesk · 700 · 1rem',
			sample: 'Apiflip',
			class: 'font-display text-base font-bold'
		},
		{
			role: 'Body',
			spec: 'DM Sans · 400 · 1rem · line-height 1.6 · cap 65–75ch',
			sample: 'A lab for turning demand signals into shipped AI tools. Days, not quarters.',
			class: 'text-base leading-relaxed'
		},
		{
			role: 'Body small',
			spec: 'DM Sans · 400 · 0.875rem',
			sample: 'Card descriptions, footer copy, secondary annotations.',
			class: 'text-sm leading-relaxed'
		},
		{
			role: 'Label',
			spec: 'DM Sans · 500 · 0.75rem · tracking 0.02em · uppercase',
			sample: 'Developer Tools',
			class: 'text-xs font-medium uppercase tracking-wider'
		}
	];

	const principles = [
		{ title: 'One Accent', body: 'Tally Copper on ≤10% of any screen. No second accent, ever. The rarity is the point.' },
		{ title: 'No Cool Tint', body: 'Every neutral is warm. Workshop Stone and Warm only. No true grays, no pure #000 / #fff surfaces.' },
		{ title: 'Patinated on Hover', body: 'Copper deepens on hover (500 → 600), never lightens. Deeper reads as commitment.' },
		{ title: 'Flat by Default', body: 'No resting shadows. Depth is motion, not elevation. Reach for a stronger border or more space first.' },
		{ title: 'One Face, One Job', body: 'Space Grotesk is the wordmark (spaced caps) and headlines (normal case). DM Sans is body. Lanes never cross.' },
		{ title: 'Sacred Wordmark', body: 'A Y L I T H in spaced caps, animated by exactly one monthly-rotating highlight variant, settling to static ink.' },
		{ title: 'Present Tense', body: 'Built, ships, survived. Never "coming soon" or "get started today". No future-tense tells.' },
		{ title: 'No Em Dashes', body: 'Commas, periods, semicolons, parentheses. Em dashes are out of brand by decree.' }
	];
</script>

<svelte:head>
	<title>Design System — Aylith</title>
	<meta
		name="description"
		content="The Aylith design system: the mark, the A Y L I T H wordmark and its twelve animations, color, type, motion, and components, in warm stone and tally copper."
	/>
</svelte:head>

<!-- Sub-nav -->
<div class="sticky top-16 z-40 border-b border-surface-200/60 bg-white/80 backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-950/80">
	<nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
		{#each sections as section (section.id)}
			<a
				href="#{section.id}"
				class="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-warm-300 dark:hover:bg-surface-800 dark:hover:text-warm-50"
			>
				{section.label}
			</a>
		{/each}
	</nav>
</div>

<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
	<!-- Intro -->
	<header class="mb-14">
		<p class="text-xs font-medium uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">
			The Editorial Atelier
		</p>
		<h1 class="mt-3 font-display text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl dark:text-warm-50">
			Aylith design system
		</h1>
		<p class="mt-5 max-w-2xl text-lg leading-relaxed text-surface-500 dark:text-warm-300">
			A warm-stone canvas, a single copper accent, and a wordmark set like a masthead. The system
			commits to restraint. Everything below is live and themed to your system light or dark setting.
		</p>
		<div class="mt-8 max-w-xl">
			<MotionControl />
		</div>
	</header>

	<!-- BRAND -->
	<section id="brand" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Brand</h2>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			The mark is six vertical strokes, one per letter of AYLITH, climbing past the copper signal
			diagonal, with an AI spark in the top-left. The wordmark spaces those same six letters into a
			wide-tracked uppercase masthead.
		</p>

		<!-- The mark, explained -->
		<div class="mt-8 overflow-hidden rounded-2xl border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/40">
			<div class="grid lg:grid-cols-2">
				<div class="flex flex-col justify-between gap-8 border-b border-surface-200 p-8 lg:border-b-0 lg:border-r dark:border-surface-800">
					<div>
						<p class="text-xs font-medium uppercase tracking-wider text-surface-400">The mark</p>
						<div class="mt-6 grid h-44 place-items-center rounded-xl border border-surface-200/70 bg-white dark:border-surface-800/70 dark:bg-surface-950/40">
							<Mark class="h-24 w-auto text-surface-900 dark:text-warm-50" />
						</div>
						<div class="mt-6 flex items-end gap-8 text-surface-900 dark:text-warm-50">
							<Mark class="h-10 w-auto" />
							<Mark class="h-7 w-auto" />
							<Mark class="h-5 w-auto" />
						</div>
					</div>
					<a
						href="/avatar.svg"
						class="inline-flex items-center gap-2 text-sm font-medium text-accent-600 hover:text-accent-500 dark:text-accent-400"
					>
						Avatar asset (SVG)
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
					</a>
				</div>

				<div class="p-8">
					<p class="font-display text-lg font-bold text-surface-900 dark:text-warm-50">
						Six strokes that climb past the signal
					</p>
					<p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-warm-400">
						The work, counted and climbing past its own signal, with an AI sparkle cluster in the
						corner. Six bars, one for each letter of AYLITH, climbing from the floor and crossed by a
						single copper curve. It carries four readings at once, and they reinforce each other.
					</p>

					<dl class="mt-6 space-y-4">
						{#each markReadings as reading (reading.label)}
							<div class="grid grid-cols-[88px_1fr] gap-3">
								<dt class="text-sm font-semibold text-accent-600 dark:text-accent-400">{reading.label}</dt>
								<dd class="text-sm leading-relaxed text-surface-500 dark:text-warm-400">{reading.body}</dd>
							</div>
						{/each}
					</dl>

					<p class="mt-6 border-t border-surface-200/70 pt-4 text-sm leading-relaxed text-surface-600 dark:border-surface-800/60 dark:text-warm-300">
						It keeps the equity of the old tally mark while fixing its one weakness: a level tally
						says “we counted”, not “we are going somewhere”. Ascending says both, and the bars
						breaking past the curve turn the signal into something the work outruns.
					</p>
				</div>
			</div>
		</div>

		<!-- The wordmark -->
		<div class="mt-6 rounded-2xl border border-surface-200 bg-surface-50 p-8 dark:border-surface-800 dark:bg-surface-900/40">
			<p class="text-xs font-medium uppercase tracking-wider text-surface-400">The wordmark</p>
			<div class="mt-8 text-surface-900 dark:text-warm-50">
				<Wordmark variant={currentVariant} size="gallery" />
			</div>
			<p class="mt-8 text-xs text-surface-500 dark:text-warm-400">
				Space Grotesk · uppercase · ~0.34em tracking · <code class="rounded bg-surface-100 px-1 dark:bg-surface-800">aria-label="Aylith"</code>
			</p>

			<p class="mt-8 border-t border-surface-200/70 pt-6 text-sm leading-relaxed text-surface-600 dark:border-surface-800/60 dark:text-warm-300">
				The name carries four readings at once, the same way the mark does.
			</p>
			<dl class="mt-5 space-y-4">
				{#each nameReadings as reading (reading.label)}
					<div class="grid grid-cols-[132px_1fr] gap-3">
						<dt class="text-sm font-semibold text-accent-600 dark:text-accent-400">{reading.label}</dt>
						<dd class="text-sm leading-relaxed text-surface-500 dark:text-warm-400">{reading.body}</dd>
					</div>
				{/each}
			</dl>
		</div>

		<!-- Wordmark animation gallery -->
		<h3 class="mt-12 font-display text-lg font-bold text-surface-900 dark:text-warm-50">
			Twelve highlight animations
		</h3>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			One per calendar month; the live site shows variant {currentVariant} right now. Each ignites
			copper over ink and settles to static ink. Press play to replay; hover the wordmark to replay
			in place. With motion set to Reduced they hold still.
		</p>

		<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each wordmarkVariants as variant, index (variant.id)}
				<div
					role="group"
					onmouseenter={() => replay(index)}
					class="relative rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-900/40 {variant.id ===
					currentVariant
						? 'ring-1 ring-accent-500'
						: ''}"
				>
					{#if variant.id === currentVariant}
						<span class="absolute right-3 top-3 rounded-full bg-accent-500/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
							This month
						</span>
					{/if}
					<div class="flex min-h-[56px] items-center text-surface-900 dark:text-warm-50">
						<Wordmark bind:this={wordmarks[index]} variant={variant.id} size="gallery" />
					</div>
					<div class="mt-4 flex items-center justify-between">
						<span class="text-sm font-medium text-surface-700 dark:text-warm-200">
							<span class="text-surface-400">{String(variant.id).padStart(2, '0')}</span>
							{variant.name}
						</span>
						<button
							type="button"
							onclick={() => replay(index, true)}
							class="btn-press rounded-md px-2.5 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/10 dark:text-accent-400"
						>
							Play
						</button>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- COLOR -->
	<section id="color" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Color</h2>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			Two anchors: one warm-neutral surface ramp and one copper accent, plus a thin warm ramp for
			dark-mode text. No secondary color. Click a swatch to copy its value.
		</p>

		{#snippet ramp(title: string, prefix: string, steps: [string, string][])}
			<div class="mt-8">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">{title}</p>
				<div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
					{#each steps as [step, value] (step)}
						<button
							type="button"
							onclick={() => copyValue(value)}
							class="group text-left"
							title="Copy {value}"
						>
							<span class="block h-14 rounded-lg border border-surface-200/70 dark:border-surface-800/70" style="background: {value}"></span>
							<span class="mt-1.5 block text-[0.7rem] font-medium text-surface-700 dark:text-warm-300">{prefix}-{step}</span>
							<span class="block truncate text-[0.65rem] text-surface-400">
								{copied === value ? 'copied' : value}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/snippet}

		{@render ramp('Workshop Stone — surfaces', 'surface', surfaceRamp)}
		{@render ramp('Tally Copper — accent', 'accent', accentRamp)}
		{@render ramp('Warm — dark-mode text', 'warm', warmRamp)}
	</section>

	<!-- TYPE -->
	<section id="type" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Typography</h2>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			Space Grotesk for the wordmark and every headline, DM Sans for body. Two families, each with a
			defined job.
		</p>

		<div class="mt-8 divide-y divide-surface-200/70 dark:divide-surface-800/50">
			{#each typeScale as type (type.role)}
				<div class="grid gap-2 py-6 sm:grid-cols-[160px_1fr] sm:gap-8">
					<div>
						<p class="text-sm font-semibold text-surface-900 dark:text-warm-50">{type.role}</p>
						<p class="mt-1 text-xs text-surface-400">{type.spec}</p>
					</div>
					<p class="{type.class} text-surface-900 dark:text-warm-50">{type.sample}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- MOTION -->
	<section id="motion" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Motion</h2>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			Depth is motion, not shadow. One easing curve, short durations, and a small named vocabulary.
			Every demo here obeys the Motion control at the top of the page, which detects your system
			reduced-motion setting and lets you override it for preview.
		</p>

		<div class="mt-8 max-w-xl">
			<MotionControl />
		</div>

		<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">Easing</p>
				<p class="mt-3 font-mono text-sm text-surface-900 dark:text-warm-100">cubic-bezier(0.16, 1, 0.3, 1)</p>
				<p class="mt-2 text-xs text-surface-500 dark:text-warm-400">ease-out-quint. 150–250ms for state, up to 700ms for reveals.</p>
			</div>

			<div class="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">btn-press</p>
				<button class="btn-press mt-3 rounded-md bg-accent-selected px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-selected-hover active:bg-accent-selected-active">
					Hover me
				</button>
				<p class="mt-3 text-xs text-surface-500 dark:text-warm-400">Lifts 2px on hover, drops 1px on active.</p>
			</div>

			<div class="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">tilt</p>
				<div use:tilt class="mt-3 grid h-16 place-items-center rounded-lg bg-surface-200/60 text-xs text-surface-600 dark:bg-surface-800 dark:text-warm-300">
					3D parallax on hover
				</div>
			</div>

			<div class="list-row rounded-xl border border-surface-200 bg-surface-50 p-6 pl-7 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">list-row stripe</p>
				<p class="mt-3 text-sm text-surface-700 dark:text-warm-200">Hover for the 3px copper bar.</p>
			</div>

			<div use:reveal class="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">reveal</p>
				<p class="mt-3 text-sm text-surface-700 dark:text-warm-200">Fades and slides up on scroll into view.</p>
			</div>
		</div>
	</section>

	<!-- COMPONENTS -->
	<section id="components" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Components</h2>

		<div class="mt-8 grid gap-6 lg:grid-cols-2">
			<!-- Buttons -->
			<div class="rounded-2xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">Buttons</p>
				<div class="mt-4 flex flex-wrap items-center gap-3">
					<button class="btn-press rounded-md bg-accent-selected px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-selected-hover active:bg-accent-selected-active">Primary</button>
					<button class="btn-press rounded-md px-3.5 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-100 hover:text-surface-900 dark:text-warm-200 dark:hover:bg-surface-800 dark:hover:text-warm-50">Ghost</button>
					<button class="rounded-md bg-accent-selected px-5 py-2.5 text-sm font-semibold text-on-accent opacity-50" disabled>Disabled</button>
				</div>
			</div>

			<!-- Badges / labels -->
			<div class="rounded-2xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">Labels & nav</p>
				<div class="mt-4 flex flex-wrap items-center gap-3">
					<span class="rounded-full bg-accent-500/15 px-2.5 py-0.5 text-xs font-medium text-accent-600 dark:text-accent-400">Shipped</span>
					<span class="text-xs font-medium uppercase tracking-wider text-surface-400">Productivity</span>
					<span class="rounded-lg bg-accent-100 px-3 py-1.5 text-sm font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">Active nav</span>
				</div>
			</div>

			<!-- Card -->
			<div class="rounded-2xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">Card</p>
				<div use:tilt class="mt-4 rounded-2xl border border-surface-200/70 bg-white p-5 dark:border-surface-800/70 dark:bg-surface-900/60">
					<p class="font-display text-base font-bold text-surface-900 dark:text-warm-50">Apiflip</p>
					<p class="mt-1 text-sm text-surface-500 dark:text-warm-400">Describe any web page in plain English, get typed JSON back.</p>
				</div>
			</div>

			<!-- Input -->
			<div class="rounded-2xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900/40">
				<p class="text-xs font-medium uppercase tracking-wider text-surface-400">Input</p>
				<input
					type="text"
					placeholder="you@example.com"
					class="mt-4 w-full rounded-md border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 outline-none placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/40 dark:border-surface-700 dark:bg-surface-800 dark:text-warm-100"
				/>
			</div>
		</div>
	</section>

	<!-- PRINCIPLES -->
	<section id="principles" class="scroll-mt-32 border-t border-surface-200/70 py-14 dark:border-surface-800/50">
		<h2 class="font-display text-2xl font-bold text-surface-900 dark:text-warm-50">Principles</h2>
		<p class="mt-2 max-w-2xl text-sm text-surface-500 dark:text-warm-400">
			The named rules the system is built on. Load-bearing, not decorative.
		</p>

		<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each principles as principle (principle.title)}
				<div class="rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-900/40">
					<p class="font-display text-sm font-bold text-surface-900 dark:text-warm-50">{principle.title}</p>
					<p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-warm-400">{principle.body}</p>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	:global(.font-display) {
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}
</style>
