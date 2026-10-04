<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	let circular = $state(false);
	const media = 'https://media.aylith.com/aylith-com/brand/2026-10-04-constellation-ascent';
	const logos = [
		{
			name: 'Upper-left constellation',
			status: 'Selected · In use on X',
			file: 'aylith-option-1-upper-left-avatar.png',
			alt: 'Copper constellation A above six ascending bronze bars and a sweeping curve on charcoal.',
			description: 'The selected Aylith social avatar. A constellation above accelerating bars and a parabolic curve.',
			selected: true
		},
		{
			name: 'Inner ascent',
			status: 'Option 2 · P1',
			file: 'aylith-option-2-p1-inner-ascent.png',
			alt: 'Three copper stars forming an A around four bronze bars and a rising curve on charcoal.',
			description: 'A retained alternative, with the bars and curve enclosed within the constellation.',
			selected: false
		}
	];
</script>

<Seo title="Brand assets — Aylith" description="Aylith logos, social avatars, and original brand explorations. Preview the selected mark and download source images." />

<section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
	<p class="text-xs font-medium uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">Aylith studio</p>
	<h1 class="mt-4 text-4xl font-bold tracking-tight text-surface-900 sm:text-6xl dark:text-warm-50">Brand assets</h1>
	<p class="mt-6 max-w-2xl text-lg leading-relaxed text-surface-600 dark:text-warm-300">Logos and social avatars for Aylith. Find the selected mark, explore the alternative, and get the original files.</p>

	<div class="mt-14 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h2 class="text-2xl font-semibold text-surface-900 dark:text-warm-50">Aylith logos</h2>
			<p class="mt-2 text-sm text-surface-500 dark:text-warm-400">Constellation &amp; ascent · October 2026</p>
		</div>
		<label class="flex cursor-pointer items-center gap-3 text-sm text-surface-700 dark:text-warm-200">
			<input type="checkbox" bind:checked={circular} class="size-4 accent-accent-600" />
			Preview circular avatars
		</label>
	</div>

	<div class="mt-6 grid gap-6 md:grid-cols-2">
		{#each logos as logo}
			<article class="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-900">
				<div class="rounded-xl bg-surface-100 p-6 dark:bg-surface-800">
					<img src={`${media}/${logo.file}`} alt={logo.alt} width="1254" height="1254" class="aspect-square w-full" class:rounded-full={circular} class:rounded-lg={!circular} />
				</div>
				<p class="mt-6 text-xs font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-400">{logo.status}</p>
				<h3 class="mt-3 text-2xl font-semibold tracking-tight text-surface-900 dark:text-warm-50">{logo.name}</h3>
				<p class="mt-3 min-h-16 text-surface-600 dark:text-warm-300">{logo.description}</p>
				<div class="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
					<a class="rounded-lg bg-accent-selected px-4 py-3 text-on-accent hover:bg-accent-selected-hover" href={`${media}/${logo.file}`}>Get PNG ↗</a>
					{#if logo.selected}<a class="text-accent-700 underline underline-offset-4 dark:text-accent-400" href="https://x.com/aylith_labs">View on X ↗</a>{/if}
				</div>
				<p class="mt-4 text-xs text-surface-500 dark:text-warm-400">1254 × 1254 · PNG · Charcoal background</p>
			</article>
		{/each}
	</div>

	<details class="mt-10 rounded-2xl border border-surface-200 p-6 dark:border-surface-700">
		<summary class="cursor-pointer text-lg font-semibold text-surface-900 dark:text-warm-50">Original brand explorations</summary>
		<p class="mt-4 text-surface-600 dark:text-warm-300">The original presentation and contact sheet preserve how the two options were developed. P1, at the top left of the contact sheet, is the saved second option.</p>
		<div class="mt-6 grid gap-6 md:grid-cols-2">
			<a class="text-sm text-accent-700 underline underline-offset-4 dark:text-accent-400" href={`${media}/option-1-original-presentation.png`}><img class="mb-3 w-full rounded-lg" loading="lazy" src={`${media}/option-1-original-presentation.png`} width="1536" height="1024" alt="Selected constellation logo presentation on ivory and charcoal." />Selected direction · Original presentation ↗</a>
			<a class="text-sm text-accent-700 underline underline-offset-4 dark:text-accent-400" href={`${media}/option-2-original-contact-sheet.png`}><img class="mb-3 w-full rounded-lg" loading="lazy" src={`${media}/option-2-original-contact-sheet.png`} width="1536" height="1024" alt="Six ascent concepts, including P1 Inner ascent at top left." />P1 and alternatives · Original contact sheet ↗</a>
		</div>
	</details>
	<p class="mt-8 text-sm text-surface-500 dark:text-warm-400">Looking for colors, typography, or interface conventions? See the <a class="text-accent-700 underline underline-offset-4 dark:text-accent-400" href="/design">design system</a>.</p>
</section>
