<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="About — Aylith"
	description="Aylith is an evolving software lab. Explore its products and each one's setup and access limits."
/>

<section class="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
	<p class="animate-fade-in-up text-xs font-medium uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">
		About
	</p>

	<h1
		class="animate-fade-in-up mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-surface-900 sm:text-5xl dark:text-warm-50"
		style="animation-delay: 0.05s"
	>
		We listen first,<br />
		then we move fast.
	</h1>

	<div
		class="animate-fade-in-up mt-8 space-y-5 text-lg leading-relaxed text-surface-600 dark:text-warm-300"
		style="animation-delay: 0.1s"
	>
		<p>
			Aylith is patient about the right things. We watch what people reach for, where they
			improvise, what they keep asking for and not getting. The signal is rarely loud. It just
			repeats.
		</p>
		<p>
			We use those patterns to choose what to build and verify a useful workflow. Our catalog
			includes products with different access and setup requirements, not a finished suite.
		</p>
		<p>Product research and internal use guide the work; neither establishes customer adoption. Each product page explains access and setup separately from its described capabilities.</p>
	</div>

	<p
		class="animate-fade-in-up mt-12 text-xs font-medium uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400"
		style="animation-delay: 0.15s"
	>
		About the name
	</p>
	<div
		class="animate-fade-in-up mt-3 space-y-5 text-lg leading-relaxed text-surface-600 dark:text-warm-300"
		style="animation-delay: 0.18s"
	>
		<p>
			Aylith reads as AI, set in stone. Ay is the AI. The ending is ·lith, from líthos, the Greek
			for stone, the root inside monolith and megalith. The studio turns AI into liths: small,
			solid tools that last and that you own.
		</p>
		<p>
			It is a field of liths, not a monolith. Many sharp tools, each its own standing stone, under
			one umbrella. Read the letters and they hold the studio in order. Agents. Yours. Lasting.
			Indexed. Tools. Hub.
		</p>
		<p>There is a tree in it too. The infrastructure is the roots, the products the branches.</p>
	</div>

	<div class="animate-fade-in-up mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 0.22s">
		<a
			href="/projects"
			class="btn-press inline-flex items-center gap-2 rounded-xl bg-accent-selected px-6 py-3.5 text-sm font-semibold text-on-accent shadow-lg shadow-accent-600/20 hover:bg-accent-selected-hover active:bg-accent-selected-active dark:shadow-accent-500/10 "
		>
			Explore the catalog
			<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
			</svg>
		</a>
		<a
			href="/#method"
			class="btn-press inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-surface-700 backdrop-blur-sm hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800/60 dark:text-warm-200 dark:hover:border-surface-600"
		>
			Read the method
		</a>
	</div>
</section>
