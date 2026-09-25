<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Mark from '$lib/components/brand/Mark.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const tabs = [
		{ id: 'home', label: 'Home', url: '/' },
		{ id: 'projects', label: 'Projects', url: '/projects' },
		{ id: 'ask', label: 'Ask Ayla', url: '/ask' }
	] as const;
	type Tab = (typeof tabs)[number];
	let active = $state<Tab>(tabs[0]);

	onMount(() => {
		const requested = new URLSearchParams(window.location.search).get('tab');
		active = tabs.find((tab) => tab.id === requested) ?? tabs[0];
	});

	function select(tab: Tab) {
		active = tab;
		void goto(`/workspace?tab=${tab.id}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function onTabKeydown(event: KeyboardEvent, tab: Tab) {
		const index = tabs.indexOf(tab);
		const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
		if (next < 0) return;
		event.preventDefault();
		select(tabs[next]);
		document.getElementById(`tab-${tabs[next].id}`)?.focus();
	}
</script>

<Seo title="Aylith workspace" description="Browse the Aylith homepage, projects, and studio assistant in one tabbed view." />

<section class="flex h-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	<header class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-800 sm:px-6">
		<div class="flex items-center gap-3">
			<a href="/" aria-label="Aylith classic home" class="inline-flex items-center gap-2 font-semibold tracking-wide"><Mark class="h-6 w-auto" /> Aylith</a>
			<span class="hidden text-xs uppercase tracking-[0.18em] text-surface-500 sm:inline">Workspace</span>
		</div>
		<div class="flex items-center gap-4 text-sm">
			<a href="/ayla" class="font-medium text-accent-700 hover:underline dark:text-accent-400">Immersive Ayla</a>
			<a href="/" class="text-surface-600 hover:underline dark:text-warm-300">Classic site</a>
		</div>
	</header>
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-200 bg-white/70 px-4 py-2 dark:border-surface-800 dark:bg-surface-900/50 sm:px-6">
		<div role="tablist" aria-label="Aylith workspace" class="flex gap-1">
			{#each tabs as tab (tab.id)}
				<button id="tab-{tab.id}" role="tab" aria-selected={active.id === tab.id} aria-controls="workspace-panel" tabindex={active.id === tab.id ? 0 : -1} onclick={() => select(tab)} onkeydown={(event) => onTabKeydown(event, tab)} class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {active.id === tab.id ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300' : 'text-surface-600 hover:bg-surface-100 dark:text-warm-300 dark:hover:bg-surface-800'}">{tab.label}</button>
			{/each}
		</div>
		<a href={active.url} target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-400">Open in new tab ↗</a>
	</div>
	<div id="workspace-panel" role="tabpanel" aria-labelledby="tab-{active.id}" class="min-h-0 flex-1">
		<iframe title="Aylith {active.label}" src={active.url} class="h-full w-full border-0 bg-white dark:bg-surface-950" loading="eager"></iframe>
	</div>
</section>
