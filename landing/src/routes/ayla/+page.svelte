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

<Seo title="Ayla — explore Aylith" description="Ask Ayla about the Aylith suite, then open the site or catalog when you need it." />

<section class="relative flex h-full flex-col overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	<div aria-hidden="true" class="pointer-events-none absolute right-[-10rem] top-[-12rem] size-[34rem] rounded-full bg-accent-100/50 blur-3xl dark:bg-accent-900/20"></div>
	<header class="relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
		<a href="/?view=classic" aria-label="Aylith classic home" class="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em]"><Mark class="h-7 w-auto" /> AYLITH</a>
		<div class="flex items-center gap-4 text-sm">
			<button onclick={() => (showPaths = !showPaths)} aria-expanded={showPaths} aria-controls="ayla-paths" class="text-surface-600 hover:text-surface-900 dark:text-warm-300 dark:hover:text-warm-50">{showPaths ? 'Hide paths' : 'Explore'}</button>
			<a href="/workspace" class="rounded-full border border-surface-300 px-4 py-2 font-medium hover:bg-surface-100 dark:border-surface-700 dark:hover:bg-surface-800">Open workspace ↗</a>
		</div>
	</header>
	{#if showPaths}
		<nav id="ayla-paths" aria-label="Explore Aylith" class="relative z-10 mx-5 flex flex-wrap gap-3 rounded-2xl border border-surface-200 bg-white/90 p-4 text-sm shadow-sm dark:border-surface-800 dark:bg-surface-900/90 sm:mx-8">
			<a href="/?view=classic" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Classic homepage</a>
			<a href="/projects" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Projects</a>
			<a href="/about" class="font-medium text-accent-700 hover:underline dark:text-accent-400">About</a>
		</nav>
	{/if}
	<div class="relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-5 pb-5 sm:px-8 sm:pb-8">
		<div class="pb-3 pt-2 sm:pb-5 sm:pt-4">
			<p class="text-xs font-semibold uppercase tracking-[0.22em] text-accent-700 dark:text-accent-400">The studio assistant</p>
			<h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Meet Ayla.</h1>
			<p class="mt-3 max-w-xl text-sm leading-relaxed text-surface-600 dark:text-warm-300 sm:text-base">Ask what a tool does, where to start, or how the suite fits together. Open the rest of Aylith when you need it.</p>
			<div class="mt-2 flex items-center justify-between gap-3">
				{#if voiceEnabled}
					<p class="text-xs text-surface-500 dark:text-surface-400">Talk with {voiceLabel}, or use text.</p>
					<div class="flex rounded-full border border-surface-300 p-1 text-xs dark:border-surface-700" aria-label="Ayla conversation mode">
						<button onclick={() => (voiceMode = false)} aria-pressed={!voiceMode} class="rounded-full px-3 py-1.5 {voiceMode ? 'text-surface-600 dark:text-warm-300' : 'bg-surface-200 font-semibold dark:bg-surface-700'}">Text</button>
						<button onclick={() => (voiceMode = true)} aria-pressed={voiceMode} class="rounded-full px-3 py-1.5 {voiceMode ? 'bg-surface-200 font-semibold dark:bg-surface-700' : 'text-surface-600 dark:text-warm-300'}">Voice</button>
					</div>
				{:else}
					<p class="text-xs text-surface-500 dark:text-surface-400">Text is available now. Live voice is being prepared.</p>
				{/if}
			</div>
		</div>
		<div class="min-h-0 flex-1 overflow-hidden rounded-3xl border border-surface-200 bg-white/70 p-2 shadow-xl shadow-surface-900/5 backdrop-blur-sm dark:border-surface-800 dark:bg-surface-900/70 sm:p-4">
			{#if voiceMode && voiceEnabled}
				<VoiceConsole {apiUrl} {voiceLabel} />
			{:else if initialQuery}
				<Assistant {apiUrl} {pageContext} {initialQuery} showIntro={false} />
			{:else}
				<Assistant {apiUrl} {pageContext} showIntro={false} />
			{/if}
		</div>
	</div>
</section>
