<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import { page } from '$app/state';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, type UIMessage } from 'ai';
	import Mark from '$lib/components/brand/Mark.svelte';
	import ViewSwitcher from '$lib/components/layout/ViewSwitcher.svelte';
	import SettingsMenu from '$lib/components/layout/SettingsMenu.svelte';
	import Assistant from '$lib/ask/Assistant.svelte';
	import { resolveAiUrl } from '$lib/ask/config';
	import { clearConversation, loadConversation, saveConversation } from '$lib/ask/history';
	import { resolveAylaAction } from './navigation';
	import { browserStorage, rememberView } from '$lib/view-preference';

	let { children, projects }: { children: Snippet; projects: { slug: string; name: string }[] } = $props();
	const apiUrl = resolveAiUrl();
	const chat = new Chat<UIMessage>({
		transport: new DefaultChatTransport({
			api: `${apiUrl}/api/chat`,
			prepareSendMessagesRequest: ({ messages, body }) => ({
				body: { ...body, messages, pageContext: currentContext(), clientCapabilities: { projectNavigation: true } }
			})
		})
	});
	let ready = $state(false);
	let durable = $state(false);
	let loadEpoch = 0;
	let handledQuery = '';
	let historyOpen = $state(false);
	let conversationOpen = $state(false);
	let voiceSettings = $state(false);
	let isAyla = $derived(page.url.pathname === '/ayla');
	let isWebsite = $derived(/^\/explore\/[a-z0-9-]+\/website\/?$/.test(page.url.pathname));
	let exploreMain: HTMLElement | undefined = $state();
	let conversationPanel: HTMLElement | undefined = $state();
	let dockTrigger: HTMLButtonElement | undefined = $state();
	const scrollPositions = new Map<string, number>();
	const seenActions = new Set<string>();

	beforeNavigate(({ from }) => {
		if (from?.url && exploreMain) scrollPositions.set(from.url.pathname + from.url.search, exploreMain.scrollTop);
	});
	afterNavigate(async ({ to, type }) => {
		await tick();
		if (exploreMain && to?.url) exploreMain.scrollTop = type === 'popstate' ? (scrollPositions.get(to.url.pathname + to.url.search) ?? 0) : 0;
	});

	function currentContext() {
		const slug = page.url.pathname.match(/^\/explore\/([a-z0-9-]+)/)?.[1];
		const project = projects.find((item) => item.slug === slug);
		return { surface: 'aylith.com — Ayla and Explore', route: page.url.pathname,
			...(project ? { projectSlug: project.slug, projectName: project.name } : {}) };
	}

	onMount(() => {
		let active = true;
		const epoch = ++loadEpoch;
		void loadConversation().then((saved) => {
			if (!active || epoch !== loadEpoch) return;
			chat.messages = saved.messages;
			for (const message of saved.messages) message.parts.forEach((_, index) => seenActions.add(`${message.id}:${index}`));
			durable = saved.available;
			ready = true;
		});
		const navigate = (event: Event) => {
			const target = resolveAylaAction((event as CustomEvent).detail, projects.map((item) => item.slug));
			if (target) { conversationOpen = false; void goto(target); }
		};
		window.addEventListener('ayla:navigate', navigate);
		return () => { active = false; window.removeEventListener('ayla:navigate', navigate); };
	});

	onDestroy(() => {
		chat.stop();
		if (ready) void saveConversation(chat.messages);
	});

	$effect(() => {
		if (!ready) return;
		const messages = chat.messages;
		const last = messages.at(-1);
		void chat.status;
		void (last?.parts.find((part) => part.type === 'text') as { text?: string } | undefined)?.text;
		const timer = setTimeout(() => void saveConversation(messages).then((saved) => { if (!saved) durable = false; }), 500);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (!ready) return;
		void chat.status;
		for (const message of chat.messages) {
			if (message.role !== 'assistant') continue;
			message.parts.forEach((part, index) => {
				const key = `${message.id}:${index}`;
				if (seenActions.has(key)) return;
				const tool = part as { type?: string; state?: string; output?: unknown };
				if (tool.type !== 'tool-openProject' || tool.state !== 'output-available') return;
				seenActions.add(key);
				if (resolveAylaAction(tool.output, projects.map((item) => item.slug))) {
					window.dispatchEvent(new CustomEvent('ayla:navigate', { detail: tool.output }));
				}
			});
		}
	});

	$effect(() => {
		const route = page.url.pathname;
		rememberView(route === '/ayla' ? 'ayla' : 'explore', browserStorage());
		conversationOpen = false;
	});

	$effect(() => {
		if (!conversationOpen || isAyla) return;
		void tick().then(() => conversationPanel?.focus());
	});

	function closeConversation() {
		conversationOpen = false;
		void tick().then(() => dockTrigger?.focus());
	}

	function onShellKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (voiceSettings) voiceSettings = false;
			else if (historyOpen) historyOpen = false;
			else if (conversationOpen) closeConversation();
			return;
		}
		if (event.key !== 'Tab' || !conversationOpen || !conversationPanel) return;
		const items = Array.from(conversationPanel.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href], select'));
		if (!items.length) return;
		const first = items[0], last = items.at(-1);
		if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}

	$effect(() => {
		if (!ready || !isAyla) return;
		const query = page.url.searchParams.get('q')?.trim();
		if (!query || handledQuery === query) return;
		handledQuery = query;
		void chat.sendMessage({ text: query });
		void goto('/ayla', { replaceState: true, noScroll: true, keepFocus: true });
	});

	async function newConversation() {
		loadEpoch++;
		ready = true;
		chat.stop();
		chat.messages = [];
		historyOpen = false;
		await clearConversation();
	}
</script>
<svelte:window onkeydown={onShellKeydown} />

<div class="flex h-svh min-h-0 flex-col overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	<header class="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-200/70 px-4 dark:border-surface-800 sm:px-7">
		<a href="/ayla" class="inline-flex items-center gap-2 font-semibold tracking-[0.13em]" aria-label="Ayla home"><Mark class="h-7 w-auto" /> AYLITH</a>
		<div class="flex items-center gap-1"><ViewSwitcher /><SettingsMenu /></div>
	</header>
	<div class="relative flex min-h-0 flex-1 {isAyla ? 'justify-center' : ''}">
		{#if !isAyla}
			<main bind:this={exploreMain} inert={conversationOpen} class="min-h-0 min-w-0 flex-1 bg-white dark:bg-surface-950 {isWebsite ? 'overflow-hidden pb-14' : 'overflow-y-auto'}" id="explore-content">
				{@render children()}
			</main>
			<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] {isWebsite ? '' : 'bg-gradient-to-t from-white via-white/95 to-transparent pt-10 dark:from-surface-950 dark:via-surface-950/95'}">
				<div class="pointer-events-auto flex items-center gap-2 rounded-full border border-surface-200 bg-white p-2 shadow-[0_14px_50px_-18px_rgba(83,54,37,.4)] dark:border-surface-700 dark:bg-surface-900 {isWebsite ? 'ml-auto' : 'w-full max-w-xl'}">
					<span class="ayla-dock-light ml-2" aria-hidden="true"></span>
					<button bind:this={dockTrigger} onclick={() => conversationOpen = true} aria-expanded={conversationOpen} aria-controls="ayla-conversation" class="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm text-surface-600 dark:text-warm-300">Ask Ayla</button>
					{#if !isWebsite}<button disabled aria-label="Speak to Ayla unavailable in this preview" title="Microphone unavailable in this preview" class="flex size-9 shrink-0 items-center justify-center rounded-full border border-surface-200 text-surface-400 dark:border-surface-700"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg></button>{/if}
				</div>
			</div>
		{/if}
		{#if isAyla || conversationOpen}
			{#if !isAyla}<button class="absolute inset-0 z-20 bg-surface-950/30 backdrop-blur-[2px]" aria-label="Close Ayla conversation" onclick={closeConversation}></button>{/if}
		<section bind:this={conversationPanel} id="ayla-conversation" role={isAyla ? 'main' : 'dialog'} aria-modal={isAyla ? undefined : 'true'} tabindex="-1" aria-label="Ayla conversation" class="relative z-30 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 {isAyla ? 'mx-auto w-full max-w-6xl' : 'absolute inset-y-0 right-0 w-full max-w-[32rem] border-l border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-950'}">
			<div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-100),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-900),transparent_68%)]" aria-hidden="true"></div>
			<div class="relative flex shrink-0 items-center justify-between gap-2 py-3 text-xs">
				<span class="font-semibold uppercase tracking-[0.2em] text-accent-700 dark:text-accent-300">Ayla · conversation</span>
				<div class="flex items-center gap-1">
					{#if !isAyla}<button onclick={closeConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Close</button>{/if}
					<button onclick={() => historyOpen = !historyOpen} aria-pressed={historyOpen} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">{historyOpen ? 'Latest' : 'History'}</button>
					<button onclick={newConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">New</button>
					<button onclick={() => voiceSettings = !voiceSettings} aria-expanded={voiceSettings} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Voice settings</button>
				</div>
			</div>
			{#if voiceSettings}
				<div class="relative mb-2 rounded-xl border border-surface-200 bg-white p-3 text-xs dark:border-surface-700 dark:bg-surface-900" role="status">
					Speech is unavailable in this preview. Your text questions go to the online Aylith answer service. {durable ? 'Conversation history is saved on this device' : 'Conversation history lasts for this visit only'}; no audio is stored.
				</div>
			{/if}
			<div class="relative min-h-0 flex-1">
				{#if isAyla && chat.messages.length === 0}
					<div class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-14 text-center">
						<svg class="ayla-aperture" viewBox="0 0 360 150" aria-hidden="true">
							<defs><linearGradient id="ayla-light" x1="0" x2="1" y1=".7" y2=".2"><stop stop-color="#7a3f30" stop-opacity="0"/><stop offset=".26" stop-color="#ca8060"/><stop offset=".48" stop-color="#fff0d0"/><stop offset=".75" stop-color="#dc9b75"/><stop offset="1" stop-color="#80402f" stop-opacity="0"/></linearGradient><filter id="ayla-spill"><feGaussianBlur stdDeviation="12"/></filter></defs>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)" opacity=".7" filter="url(#ayla-spill)"/>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)"/>
							<path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/>
							<path d="M49 91 C109 59 152 51 199 68 C248 86 287 51 326 38" fill="none" stroke="#fff2dc" stroke-width="2" opacity=".75"/>
						</svg>
						<p class="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent-700 dark:text-accent-300">Ayla</p>
						<h1 class="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">I’m here.</h1>
					</div>
				{/if}
				{#if ready}
					<Assistant {apiUrl} pageContext={currentContext} session={chat} immersive showIntro={false} showHistory={historyOpen} showSpeak={isAyla} suggestions={[]} placeholder="Ask Ayla…" />
				{:else}
					<p class="p-4 text-sm text-surface-500">Opening this device’s conversation…</p>
				{/if}
			</div>
			<p class="relative px-2 pb-1 text-center text-[0.7rem] text-surface-500 dark:text-warm-400">{durable ? 'History saved on this device' : 'History for this visit only'} · Answers use the online service</p>
		</section>
		{/if}
	</div>
</div>
