<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Assistant from '$lib/ask/Assistant.svelte';
	import VoiceConsole from '$lib/ask/VoiceConsole.svelte';
	import { resolveAiUrl } from '$lib/ask/config';
	import { browserStorage, rememberView } from '$lib/view-preference';

	const apiUrl = resolveAiUrl();
	let initialQuery = $state('');
	let showPaths = $state(false);
	let voiceEnabled = $state(false);
	let voiceLabel = $state('Ayla');
	let voiceMode = $state(false);

	onMount(() => {
		if (window.self === window.top) rememberView('ayla', browserStorage());
		initialQuery = new URLSearchParams(window.location.search).get('q') ?? '';
		const controller = new AbortController();
		fetch(`${apiUrl}/api/voice/capabilities`, { signal: controller.signal })
			.then((response) => response.ok ? response.json() : null)
			.then((capabilities) => {
				if (capabilities?.enabled === true && capabilities.input?.encoding === 'pcm_s16le' && capabilities.input?.sampleRate === 16000 && capabilities.output?.encoding === 'pcm_s16le' && capabilities.output?.sampleRate === 24000) {
					voiceEnabled = true;
					voiceLabel = capabilities.voiceLabel || 'Ayla';
				}
			})
			.catch(() => {});
		return () => controller.abort();
	});

	function pageContext() {
		return { surface: 'aylith.com — Ayla', route: '/ayla', note: 'Immersive studio assistant; no specific product page is open.' };
	}
</script>

<Seo title="Ayla — explore Aylith" description="Ask Ayla about the Aylith suite. Open related pages when you choose to explore." />

<section class="relative flex h-full flex-col overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	<h1 class="sr-only">Ayla, the studio assistant</h1>
	<div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_30%,var(--color-accent-100),transparent_60%)] opacity-60 dark:bg-[radial-gradient(ellipse_at_50%_30%,var(--color-accent-900),transparent_60%)] dark:opacity-25"></div>
	<header class="relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
		<a href="/?view=classic" aria-label="Aylith classic home" class="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em]"><Mark class="h-7 w-auto" /> AYLITH</a>
		<div class="flex items-center gap-4 text-sm">
			<button onclick={() => (showPaths = !showPaths)} aria-expanded={showPaths} aria-controls="ayla-paths" class="rounded-full border border-surface-300 px-4 py-2 font-medium text-surface-700 hover:bg-surface-100 dark:border-surface-700 dark:text-warm-200 dark:hover:bg-surface-800">{showPaths ? 'Close menu' : 'Explore Aylith'}</button>
		</div>
	</header>
	{#if showPaths}
		<nav id="ayla-paths" aria-label="Explore Aylith" class="relative z-10 mx-5 flex flex-wrap gap-4 rounded-2xl border border-surface-200 bg-white/90 p-4 text-sm shadow-sm dark:border-surface-800 dark:bg-surface-900/90 sm:mx-8">
			<a href="/workspace" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Tabbed workspace</a>
			<a href="/?view=classic" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Classic homepage</a>
			<a href="/projects" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Projects</a>
			<a href="/about" class="font-medium text-accent-700 hover:underline dark:text-accent-400">About</a>
		</nav>
	{/if}
	<div class="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-5 pb-5 sm:px-8 sm:pb-8">
		<div class="flex items-center justify-end gap-3 pb-1 text-xs">
				{#if voiceEnabled}
					<p class="text-surface-500 dark:text-surface-400">{voiceLabel} is available</p>
					<div class="flex rounded-full border border-surface-300 p-1 dark:border-surface-700" aria-label="Ayla conversation mode">
						<button onclick={() => (voiceMode = false)} aria-pressed={!voiceMode} class="rounded-full px-3 py-1.5 {voiceMode ? 'text-surface-600 dark:text-warm-300' : 'bg-surface-200 font-semibold dark:bg-surface-700'}">Text</button>
						<button onclick={() => (voiceMode = true)} aria-pressed={voiceMode} class="rounded-full px-3 py-1.5 {voiceMode ? 'bg-surface-200 font-semibold dark:bg-surface-700' : 'text-surface-600 dark:text-warm-300'}">Voice</button>
					</div>
				{:else}
					<p class="text-surface-500 dark:text-surface-400">Text conversation is available · Voice is being prepared</p>
				{/if}
		</div>
		<div class="min-h-0 flex-1 overflow-hidden">
			{#if voiceMode && voiceEnabled}
				<VoiceConsole {apiUrl} {voiceLabel} />
			{:else if initialQuery}
				<Assistant {apiUrl} {pageContext} {initialQuery} showIntro={false} immersive suggestions={[]} placeholder="Ask Ayla anything about Aylith…" />
			{:else}
				<Assistant {apiUrl} {pageContext} showIntro={false} immersive suggestions={[]} placeholder="Ask Ayla anything about Aylith…" />
			{/if}
		</div>
	</div>
</section>
