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
	import { OwnedSpeech, type OwnedAvailability } from '$lib/ask/owned-speech';
	import { resolveAylaAction } from './navigation';
	import { browserStorage, rememberView } from '$lib/view-preference';

	let { children, projects }: { children: Snippet; projects: { slug: string; name: string }[] } = $props();
	const apiUrl = resolveAiUrl();
	const chat = new Chat<UIMessage>({
		transport: new DefaultChatTransport({
			api: `${apiUrl}/api/chat`,
			prepareSendMessagesRequest: ({ messages, body }) => ({
				body: { ...body, messages, pageContext: currentContext(), clientCapabilities: { projectNavigation: true, experienceNavigation: true } }
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
	let owned: OwnedSpeech | undefined;
	let ownedSnapshot = $state<OwnedAvailability>({ ready: false, ttsReady: false, readyLanguages: [], readyVoices: [], maxRecordingSeconds: 30 });
	let voicePreference = $state<'auto' | 'browser' | 'owned'>('auto');
	let activeVoice = $state<'browser' | 'owned' | ''>('');
	let ownedVoiceId = $state('');
	let serverLanguage = $state('auto');
	let serverVoiceStatus = $state('');
	let speechSnapshot = $state<SpeechSnapshot>({ locale: '', recognition: 'unavailable', localVoices: [] });
	let speechState = $state<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
	let speechError = $state('');
	let localeInput = $state('');
	let selectedVoice = $state('');
	let voiceTurn = $state(false);
	let spokenAssistantId = '';
	let speechBaseAssistantId = '';
	let ownedAnswerId = '';
	let pendingVoiceActionTarget = '';
	let preservedVoiceRoute = '';
	let installing = $state(false);
	let pageVisible = $state(true);
	let speechProbeEpoch = 0;
	let voiceMode = $derived(voicePreference === 'auto' ? (speechSnapshot.recognition === 'available' && speechSnapshot.localVoices.some((voice) => voice.lang.toLowerCase() === speechSnapshot.locale.toLowerCase()) ? 'browser' : ownedSnapshot.ready ? 'owned' : speechSnapshot.recognition === 'available' ? 'browser' : 'none') : voicePreference === 'browser' ? (speechSnapshot.recognition === 'available' ? 'browser' : 'none') : ownedSnapshot.ready ? 'owned' : 'none');
	let voiceReady = $derived(ready && voiceMode !== 'none');
	let voiceActionLabel = $derived(activeVoice === 'owned' && speechState === 'listening' ? 'Finish speaking' : speechState === 'speaking' || speechState === 'thinking' ? 'Interrupt and speak again' : activeVoice === 'browser' && speechState === 'listening' ? 'Stop listening' : voiceMode === 'owned' ? 'Speak via Aylith server' : voiceMode === 'browser' ? 'Speak on this device' : 'Speech unavailable');
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

	async function updateSpeechSnapshot() {
		const current = speech;
		if (!current) return;
		const epoch = ++speechProbeEpoch;
		const result = await current.probe();
		if (epoch === speechProbeEpoch && current === speech) speechSnapshot = result;
	}

	onMount(() => {
		let active = true;
		document.documentElement.classList.add('experience-mode');
		speech = new BrowserSpeech((text) => {
			if (!active || !ready || !text.trim()) return;
			speechBaseAssistantId = [...chat.messages].reverse().find((message) => message.role === 'assistant')?.id ?? '';
			voiceTurn = true;
			speechError = '';
			void chat.sendMessage({ text });
		});
		speech.onState = (state, detail) => { speechState = state; if (state === 'listening' || state === 'speaking') activeVoice = 'browser'; if (state === 'idle' || state === 'error') activeVoice = ''; if (detail) speechError = detail; };
		owned = new OwnedSpeech(apiUrl, {
			context: () => chat.messages,
			onTranscript: (text) => { if (!active || !ready || !text.trim()) return; chat.messages = [...chat.messages, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text }] }]; },
			onAnswer: (text, final) => {
				if (!active || !ready) return;
				const id = ownedAnswerId || (ownedAnswerId = crypto.randomUUID());
				const previous = chat.messages.find((message) => message.id === id);
				const prior = previous?.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('') ?? '';
				const body = final ? text : prior + text;
				chat.messages = [...chat.messages.filter((message) => message.id !== id), { id, role: 'assistant', parts: [{ type: 'text', text: body }] }];
			},
			onAction: (action) => { const target = resolveAylaAction(action, projects.map((item) => item.slug)); if (active && target) { pendingVoiceActionTarget = target; window.dispatchEvent(new CustomEvent('ayla:navigate', { detail: action })); } },
			onVoice: (voice) => { serverVoiceStatus = `Speaking with ${voice.id} (${voice.locale})`; },
			onAudioUnavailable: (language) => { speechError = `No Aylith server voice is ready for ${language || 'this language'}. The text answer remains here.`; },
			onState: (state, detail) => { speechState = state; if (state === 'connecting' || state === 'listening' || state === 'thinking' || state === 'speaking') activeVoice = 'owned'; if (state === 'idle' || state === 'error') activeVoice = ''; if (detail) speechError = detail; }
		});
		void owned.probe().then((snapshot) => { if (active) ownedSnapshot = snapshot; });
		localeInput = speech.locale;
		const refreshSpeech = () => { void updateSpeechSnapshot(); };
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
			if (!target) return;
			const preserveVoice = pendingVoiceActionTarget === target;
			pendingVoiceActionTarget = '';
			if (!preserveVoice) stopAllVoice();
			preservedVoiceRoute = preserveVoice && target !== page.url.pathname ? target : '';
			conversationOpen = false;
			void goto(target).catch(() => { preservedVoiceRoute = ''; });
		};
		window.addEventListener('ayla:navigate', navigate);
		return () => { active = false; speechProbeEpoch++; document.documentElement.classList.remove('experience-mode'); document.removeEventListener('visibilitychange', visibility); globalThis.speechSynthesis?.removeEventListener('voiceschanged', refreshSpeech); window.removeEventListener('ayla:navigate', navigate); };
	});

	onDestroy(() => {
		speech?.stop(); void owned?.stop();
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
				if (!['tool-openProject', 'tool-openExperience'].includes(tool.type ?? '') || tool.state !== 'output-available') return;
				seenActions.add(key);
				const target = resolveAylaAction(tool.output, projects.map((item) => item.slug));
				if (target) {
					if (voiceTurn || activeVoice !== '') pendingVoiceActionTarget = target;
					window.dispatchEvent(new CustomEvent('ayla:navigate', { detail: tool.output }));
				}
			});
		}
	});

	let lastRoute = '';
	$effect(() => {
		const route = page.url.pathname;
		if (lastRoute && route !== lastRoute) { if (preservedVoiceRoute === route) preservedVoiceRoute = ''; else stopAllVoice(); }
		lastRoute = route;
		rememberView(route === '/ayla' ? 'ayla' : 'explore', browserStorage());
		conversationOpen = false;
	});

	$effect(() => {
		if (!conversationOpen || isAyla) return;
		void tick().then(() => conversationPanel?.focus());
	});

	function closeConversation() {
		speech?.stop(); void owned?.stop(); voiceTurn = false;
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
		if (!speech || !ready) return;
		if (speechState === 'listening') { speech.stop(); voiceTurn = false; return; }
		if (speechState === 'speaking') speech.stop();
		if (chat.status === 'submitted' || chat.status === 'streaming') { chat.stop(); voiceTurn = false; }
		speechError = '';
		try { await speech.start(); } catch (cause) { speechError = cause instanceof Error ? cause.message : 'Speech could not start.'; speechState = 'error'; }
	}

	function displayLanguage(tag: string): string {
		try { return new Intl.DisplayNames([navigator.language], { type: 'language' }).of(tag.split('-')[0].split('_')[0]) || tag; }
		catch { return tag; }
	}

	function displayVoice(id: string, locale: string): string {
		const parts = id.split(/[-_]/).filter(Boolean);
		const name = parts.find((part) => !/^[a-z]{2}$/i.test(part) && !/^(low|medium|high)$/i.test(part)) || id;
		return `${name.slice(0, 1).toUpperCase()}${name.slice(1)} · ${displayLanguage(locale)}`;
	}

	async function toggleVoice() {
		if (!ready) return;
		if (chat.status === 'submitted' || chat.status === 'streaming') chat.stop();
		if (activeVoice === 'owned' && speechState === 'listening') { await owned?.finish(); return; }
		if (activeVoice === 'browser' && speechState === 'listening') { speech?.stop(); activeVoice = ''; voiceTurn = false; return; }
		if (activeVoice) { speech?.stop(); await owned?.stop(); activeVoice = ''; voiceTurn = false; chat.stop(); }
		if (voiceMode === 'browser') { activeVoice = 'browser'; await startLocalSpeech(); if (speechState === 'error') activeVoice = ''; return; }
		if (voiceMode !== 'owned' || !owned) return;
		activeVoice = 'owned'; ownedAnswerId = ''; serverVoiceStatus = ''; speechError = '';
		owned.voiceId = ownedVoiceId; owned.language = serverLanguage;
		try { await owned.start(); }
		catch (cause) { activeVoice = ''; speechError = cause instanceof Error ? cause.message : 'Aylith voice could not start.'; speechState = 'error'; }
	}

	function stopAllVoice() {
		speech?.stop(); void owned?.stop(); activeVoice = ''; voiceTurn = false;
		if (chat.status === 'submitted' || chat.status === 'streaming') chat.stop();
	}

	async function applyLocale() {
		if (!speech) return;
		let locale: string;
		try { locale = Intl.getCanonicalLocales(localeInput.trim())[0]; } catch { locale = ''; }
		if (!locale) { speechError = 'Enter a valid language tag, such as en-US or hu-HU.'; return; }
		speech.stop(); speech.locale = locale; speech.voiceName = ''; selectedVoice = ''; speechError = '';
		await updateSpeechSnapshot();
	}

	async function refreshOwned() {
		if (!owned) return;
		ownedSnapshot = await owned.probe();
	}

	async function installLocalPack() {
		if (!speech || installing) return;
		installing = true; speechError = '';
		try { if (!await speech.install()) speechError = 'This browser could not install the local speech pack.'; await updateSpeechSnapshot(); }
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
		speech?.stop(); void owned?.stop(); voiceTurn = false;
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
					{#if !isWebsite}<button onclick={() => { conversationOpen = true; void toggleVoice(); }} disabled={!voiceReady && !activeVoice} aria-label={voiceActionLabel} title={voiceMode === 'owned' ? 'Speech goes to the Aylith voice server' : voiceMode === 'browser' ? 'Speech stays in this browser' : 'Speech is not ready'} class="flex size-9 shrink-0 items-center justify-center rounded-full border border-surface-200 text-surface-600 disabled:text-surface-400 dark:border-surface-700"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg></button>{/if}
					{#if activeVoice}<button onclick={stopAllVoice} aria-label="Interrupt voice" class="shrink-0 rounded-full border border-surface-300 px-3 py-2 text-xs font-medium dark:border-surface-700">Stop voice</button>{/if}
				</div>
			</div>
		{/if}
		{#if isAyla || conversationOpen}
			{#if !isAyla}<button class="absolute inset-0 z-20 bg-surface-950/30 backdrop-blur-[2px]" aria-label="Close Ayla conversation" onclick={closeConversation}></button>{/if}
		<section bind:this={conversationPanel} id="ayla-conversation" role={isAyla ? 'main' : 'dialog'} aria-modal={isAyla ? undefined : 'true'} tabindex="-1" aria-label="Ayla conversation" class="z-30 flex min-h-0 min-w-0 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 {isAyla ? 'relative mx-auto w-full max-w-6xl flex-1' : 'absolute inset-y-0 right-0 w-full max-w-[32rem] border-l border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-950'}">
			<div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-100),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-900),transparent_68%)]" aria-hidden="true"></div>
			<div class="relative flex shrink-0 flex-wrap items-center justify-between gap-1 py-3 text-xs sm:flex-nowrap">
					<span class="flex min-w-0 items-center gap-1 font-semibold uppercase tracking-[0.12em] text-accent-700 dark:text-accent-300 sm:gap-2 sm:tracking-[0.2em]"><svg class="ayla-mini-aperture shrink-0 {pageVisible && (speechState === 'listening' || speechState === 'speaking' || (voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming'))) ? 'ayla-dock-active' : ''}" viewBox="0 0 360 150" aria-hidden="true"><path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="currentColor" opacity=".85"/><path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/></svg><span class="sm:hidden">{speechState === 'listening' ? 'Listening' : speechState === 'speaking' ? 'Speaking' : voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming') ? 'Thinking' : 'Ayla'}</span><span class="hidden sm:inline">Ayla · {speechState === 'listening' ? 'listening' : speechState === 'speaking' ? 'speaking' : voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming') ? 'thinking' : 'conversation'}</span></span>
				<div class="flex w-full flex-wrap items-center justify-end gap-0.5 sm:w-auto sm:shrink-0 sm:gap-1">
					{#if !isAyla}<button onclick={closeConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Close</button>{/if}
					<button onclick={() => historyOpen = !historyOpen} aria-pressed={historyOpen} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">{historyOpen ? 'Latest' : 'History'}</button>
					<button onclick={newConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">New</button>
					{#if activeVoice}<button onclick={stopAllVoice} aria-label="Interrupt voice" class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Stop voice</button>{/if}
					<button onclick={() => voiceSettings = !voiceSettings} aria-expanded={voiceSettings} aria-label="Voice settings" class="rounded-lg px-1.5 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 sm:px-2"><span class="sm:hidden">Voice</span><span class="hidden sm:inline">Voice settings</span></button>
				</div>
			</div>
			{#if voiceSettings}
				<div class="relative mb-2 grid max-h-[min(40svh,18rem)] gap-2 overflow-y-auto rounded-xl border border-surface-200 bg-white p-3 text-xs dark:border-surface-700 dark:bg-surface-900" role="group" aria-label="Voice settings">
					<p>Answers use the online service. On-device speech stays in this browser; Aylith server speech sends microphone audio to our voice server. No audio is saved in this browser.</p>
					<div class="flex flex-wrap items-center gap-2"><label for="ayla-voice-route">Speech processing</label><select id="ayla-voice-route" bind:value={voicePreference} class="rounded border border-surface-300 bg-white px-2 py-1 dark:border-surface-600 dark:bg-surface-900"><option value="auto">Automatic · on-device first</option><option value="browser">On-device only</option><option value="owned">Aylith server</option></select></div>
					<div class="flex flex-wrap items-center gap-2"><label for="ayla-speech-locale">Speech language</label><input id="ayla-speech-locale" aria-label="Speech language" bind:value={localeInput} class="w-28 rounded border border-surface-300 bg-transparent px-2 py-1 dark:border-surface-600" /><button onclick={applyLocale} class="rounded border border-surface-300 px-2 py-1 dark:border-surface-600">Use language</button></div>
					<p>On-device recognition for {speechSnapshot.locale || 'this language'}: {speechSnapshot.recognition === 'available' ? 'ready' : speechSnapshot.recognition === 'downloadable' ? 'pack available to install' : speechSnapshot.recognition === 'downloading' ? 'pack downloading' : 'unavailable in this browser'}.</p>
					{#if speechSnapshot.recognition === 'downloadable'}<button onclick={installLocalPack} disabled={installing} class="w-fit rounded border border-surface-300 px-2 py-1 dark:border-surface-600">{installing ? 'Installing…' : 'Install on-device language pack'}</button>{/if}
					{#if speechSnapshot.localVoices.some((voice) => voice.lang.toLowerCase() === speechSnapshot.locale.toLowerCase())}<div class="flex flex-wrap items-center gap-2"><label for="ayla-local-voice">On-device voice</label><select id="ayla-local-voice" bind:value={selectedVoice} onchange={() => { if (speech) speech.voiceName = selectedVoice; }} class="min-w-0 max-w-64 rounded border border-surface-300 bg-white px-2 py-1 dark:border-surface-600 dark:bg-surface-900"><option value="">Automatic for this language</option>{#each speechSnapshot.localVoices.filter((voice) => voice.lang.toLowerCase() === speechSnapshot.locale.toLowerCase()) as voice}<option value={voice.name}>{voice.name} ({voice.lang})</option>{/each}</select></div>{:else}<p>No on-device voice is ready for this language. Text answers remain available.</p>{/if}
					<p>Aylith server speech: {ownedSnapshot.ready ? 'recognition ready' : 'not ready'}; {ownedSnapshot.ttsReady ? `${ownedSnapshot.readyVoices.length} voice${ownedSnapshot.readyVoices.length === 1 ? '' : 's'} ready` : 'text answers only until a voice is ready'}. <button onclick={refreshOwned} class="underline">Refresh availability</button></p>
					{#if ownedSnapshot.ready}<div class="flex flex-wrap gap-2"><label class="flex items-center gap-1">Server recognition <select bind:value={serverLanguage} class="rounded border border-surface-300 bg-white px-2 py-1 dark:border-surface-600 dark:bg-surface-900"><option value="auto">Detect language</option>{#each ownedSnapshot.readyLanguages as language}<option value={language}>{displayLanguage(language)} ({language})</option>{/each}</select></label><label class="flex items-center gap-1">Server voice <select bind:value={ownedVoiceId} class="min-w-0 max-w-64 rounded border border-surface-300 bg-white px-2 py-1 dark:border-surface-600 dark:bg-surface-900"><option value="">Automatic language match</option>{#each ownedSnapshot.readyVoices as voice}<option value={voice.id}>{displayVoice(voice.id, voice.locale)}</option>{/each}</select></label></div>{/if}
				{#if serverVoiceStatus}<p>{serverVoiceStatus}</p>{/if}
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
					<Assistant {apiUrl} pageContext={currentContext} session={chat} immersive showIntro={false} showHistory={historyOpen} showSpeak={isAyla || activeVoice !== ''} speakAvailable={voiceReady} speechActive={activeVoice !== ''} speakLabel={voiceActionLabel} onSpeak={() => { void toggleVoice(); }} onStopVoice={stopAllVoice} onBeforeSend={stopAllVoice} suggestions={[]} placeholder="Ask Ayla…" />
				{:else}
					<p class="p-4 text-sm text-surface-500">Opening this device’s conversation…</p>
				{/if}
			</div>
			<p class="relative px-2 pb-1 text-center text-[0.7rem] text-surface-500 dark:text-warm-400">{durable ? 'History saved on this device' : 'History for this visit only'} · Answers use the online service</p>
		</section>
		{/if}
	</div>
</div>
