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
	import { BrowserSpeech, type SpeechSnapshot } from '$lib/ask/browser-speech';
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
	let speech: BrowserSpeech | undefined;
	let speechSnapshot = $state<SpeechSnapshot>({ locale: '', recognition: 'unavailable', localVoices: [] });
	let speechState = $state<'idle' | 'listening' | 'speaking' | 'error'>('idle');
	let speechError = $state('');
	let localeInput = $state('');
	let selectedVoice = $state('');
	let voiceTurn = $state(false);
	let spokenAssistantId = '';
	let speechBaseAssistantId = '';
	let installing = $state(false);
	let pageVisible = $state(true);
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
		speech = new BrowserSpeech((text) => {
			if (!active || !text.trim()) return;
			speechBaseAssistantId = [...chat.messages].reverse().find((message) => message.role === 'assistant')?.id ?? '';
			voiceTurn = true;
			speechError = '';
			void chat.sendMessage({ text });
		});
		speech.onState = (state, detail) => { speechState = state; if (detail) speechError = detail; };
		localeInput = speech.locale;
		const refreshSpeech = () => { void speech?.probe().then((snapshot) => { if (active) speechSnapshot = snapshot; }); };
		refreshSpeech();
		const visibility = () => { pageVisible = document.visibilityState === 'visible'; };
		visibility();
		document.addEventListener('visibilitychange', visibility);
		globalThis.speechSynthesis?.addEventListener('voiceschanged', refreshSpeech);
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
			if (target) { speech?.stop(); voiceTurn = false; conversationOpen = false; void goto(target); }
		};
		window.addEventListener('ayla:navigate', navigate);
		return () => { active = false; document.removeEventListener('visibilitychange', visibility); globalThis.speechSynthesis?.removeEventListener('voiceschanged', refreshSpeech); window.removeEventListener('ayla:navigate', navigate); };
	});

	onDestroy(() => {
		speech?.stop();
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

	let lastRoute = '';
	$effect(() => {
		const route = page.url.pathname;
		if (lastRoute && route !== lastRoute) { speech?.stop(); voiceTurn = false; }
		lastRoute = route;
		rememberView(route === '/ayla' ? 'ayla' : 'explore', browserStorage());
		conversationOpen = false;
	});

	$effect(() => {
		if (!conversationOpen || isAyla) return;
		void tick().then(() => conversationPanel?.focus());
	});

	function closeConversation() {
		speech?.stop(); voiceTurn = false;
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

	async function startLocalSpeech() {
		if (!speech) return;
		if (speechState === 'listening') { speech.stop(); voiceTurn = false; return; }
		if (speechState === 'speaking') speech.stop();
		if (chat.status === 'submitted' || chat.status === 'streaming') { chat.stop(); voiceTurn = false; }
		speechError = '';
		try { await speech.start(); } catch (cause) { speechError = cause instanceof Error ? cause.message : 'Speech could not start.'; speechState = 'error'; }
	}

	async function applyLocale() {
		if (!speech) return;
		let locale: string;
		try { locale = Intl.getCanonicalLocales(localeInput.trim())[0]; } catch { locale = ''; }
		if (!locale) { speechError = 'Enter a valid language tag, such as en-US or hu-HU.'; return; }
		speech.stop(); speech.locale = locale; speech.voiceName = ''; selectedVoice = ''; speechError = '';
		speechSnapshot = await speech.probe();
	}

	async function installLocalPack() {
		if (!speech || installing) return;
		installing = true; speechError = '';
		try { if (!await speech.install()) speechError = 'This browser could not install the local speech pack.'; speechSnapshot = await speech.probe(); }
		catch { speechError = 'The local speech pack could not be installed.'; }
		finally { installing = false; }
	}

	$effect(() => {
		if (!voiceTurn || chat.status !== 'ready') return;
		if (chat.error) { voiceTurn = false; return; }
		const last = chat.messages.at(-1);
		if (!last || last.role !== 'assistant' || last.id === spokenAssistantId || last.id === speechBaseAssistantId) return;
		const answer = last.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('').trim();
		if (!answer) return;
		spokenAssistantId = last.id; voiceTurn = false;
		if (!speech?.speak(answer)) speechError = `No on-device voice is ready for ${speech?.locale ?? 'this language'}. The text answer is still here.`;
	});

	async function newConversation() {
		speech?.stop(); voiceTurn = false;
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
					{#if !isWebsite}<button onclick={() => { conversationOpen = true; void startLocalSpeech(); }} disabled={speechSnapshot.recognition !== 'available' && speechState !== 'listening'} aria-label={speechState === 'listening' ? 'Stop speech' : speechSnapshot.recognition === 'available' ? 'Speak to Ayla' : 'Local speech unavailable'} title={speechSnapshot.recognition === 'available' ? 'Speak with on-device recognition' : 'No on-device recognition pack is ready'} class="flex size-9 shrink-0 items-center justify-center rounded-full border border-surface-200 text-surface-600 disabled:text-surface-400 dark:border-surface-700"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg></button>{/if}
				</div>
			</div>
		{/if}
		{#if isAyla || conversationOpen}
			{#if !isAyla}<button class="absolute inset-0 z-20 bg-surface-950/30 backdrop-blur-[2px]" aria-label="Close Ayla conversation" onclick={closeConversation}></button>{/if}
		<section bind:this={conversationPanel} id="ayla-conversation" role={isAyla ? 'main' : 'dialog'} aria-modal={isAyla ? undefined : 'true'} tabindex="-1" aria-label="Ayla conversation" class="relative z-30 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 {isAyla ? 'mx-auto w-full max-w-6xl' : 'absolute inset-y-0 right-0 w-full max-w-[32rem] border-l border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-950'}">
			<div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-100),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-900),transparent_68%)]" aria-hidden="true"></div>
			<div class="relative flex shrink-0 items-center justify-between gap-2 py-3 text-xs">
					<span class="flex items-center gap-2 font-semibold uppercase tracking-[0.2em] text-accent-700 dark:text-accent-300"><svg class="ayla-mini-aperture {pageVisible && (speechState === 'listening' || speechState === 'speaking' || (voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming'))) ? 'ayla-dock-active' : ''}" viewBox="0 0 360 150" aria-hidden="true"><path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="currentColor" opacity=".85"/><path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/></svg> Ayla · {speechState === 'listening' ? 'listening' : speechState === 'speaking' ? 'speaking' : voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming') ? 'thinking' : 'conversation'}</span>
				<div class="flex items-center gap-1">
					{#if !isAyla}<button onclick={closeConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Close</button>{/if}
					<button onclick={() => historyOpen = !historyOpen} aria-pressed={historyOpen} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">{historyOpen ? 'Latest' : 'History'}</button>
					<button onclick={newConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">New</button>
					<button onclick={() => voiceSettings = !voiceSettings} aria-expanded={voiceSettings} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Voice settings</button>
				</div>
			</div>
			{#if voiceSettings}
				<div class="relative mb-2 grid gap-2 rounded-xl border border-surface-200 bg-white p-3 text-xs dark:border-surface-700 dark:bg-surface-900" role="group" aria-label="Voice settings">
					<p>Answers use the online service. Browser speech stays on this device only when a local language pack and local voice are available. No audio is saved.</p>
					<div class="flex flex-wrap items-center gap-2"><label for="ayla-speech-locale">Speech language</label><input id="ayla-speech-locale" aria-label="Speech language" bind:value={localeInput} class="w-28 rounded border border-surface-300 bg-transparent px-2 py-1 dark:border-surface-600" /><button onclick={applyLocale} class="rounded border border-surface-300 px-2 py-1 dark:border-surface-600">Use language</button></div>
					<p>On-device recognition for {speechSnapshot.locale || 'this language'}: {speechSnapshot.recognition === 'available' ? 'ready' : speechSnapshot.recognition === 'downloadable' ? 'pack available to install' : speechSnapshot.recognition === 'downloading' ? 'pack downloading' : 'unavailable in this browser'}.</p>
					{#if speechSnapshot.recognition === 'downloadable'}<button onclick={installLocalPack} disabled={installing} class="w-fit rounded border border-surface-300 px-2 py-1 dark:border-surface-600">{installing ? 'Installing…' : 'Install on-device language pack'}</button>{/if}
					{#if speechSnapshot.localVoices.some((voice) => voice.lang.toLowerCase() === speechSnapshot.locale.toLowerCase())}<div class="flex flex-wrap items-center gap-2"><label for="ayla-local-voice">On-device voice</label><select id="ayla-local-voice" bind:value={selectedVoice} onchange={() => { if (speech) speech.voiceName = selectedVoice; }} class="min-w-0 max-w-64 rounded border border-surface-300 bg-white px-2 py-1 dark:border-surface-600 dark:bg-surface-900"><option value="">Automatic for this language</option>{#each speechSnapshot.localVoices.filter((voice) => voice.lang.toLowerCase() === speechSnapshot.locale.toLowerCase()) as voice}<option value={voice.name}>{voice.name} ({voice.lang})</option>{/each}</select></div>{:else}<p>No on-device voice is installed. Text answers remain available.</p>{/if}
					<p>Own-server and Cartesia voices are not enabled in this preview.</p>
				</div>
			{/if}
			{#if speechError}<p class="relative px-2 pb-1 text-xs text-red-700 dark:text-red-300" role="alert">{speechError}</p>{/if}
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
					<Assistant {apiUrl} pageContext={currentContext} session={chat} immersive showIntro={false} showHistory={historyOpen} showSpeak={isAyla} speakAvailable={speechSnapshot.recognition === 'available'} speechActive={speechState === 'listening' || speechState === 'speaking'} onSpeak={() => { void startLocalSpeech(); }} onStopVoice={() => { speech?.stop(); voiceTurn = false; }} onBeforeSend={() => { speech?.stop(); voiceTurn = false; }} suggestions={[]} placeholder="Ask Ayla…" />
				{:else}
					<p class="p-4 text-sm text-surface-500">Opening this device’s conversation…</p>
				{/if}
			</div>
			<p class="relative px-2 pb-1 text-center text-[0.7rem] text-surface-500 dark:text-warm-400">{durable ? 'History saved on this device' : 'History for this visit only'} · Answers use the online service</p>
		</section>
		{/if}
	</div>
</div>
