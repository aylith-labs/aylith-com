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
	import { BrowserSpeech, matchingVoiceLocale, type SpeechSnapshot } from '$lib/ask/browser-speech';
	import { OwnedSpeech, watchOwnedAvailability, type OwnedAvailability } from '$lib/ask/owned-speech';
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
	let voiceSettingsTrigger = $state<HTMLButtonElement>();
	let voiceSettingsPanel = $state<HTMLDivElement>();
	let speech: BrowserSpeech | undefined;
	let owned: OwnedSpeech | undefined;
	let ownedSnapshot = $state<OwnedAvailability>({ ready: false, ttsReady: false, cartesiaTtsReady: false, cartesiaDiscoveryPending: false, readyLanguages: [], readyVoices: [], maxRecordingSeconds: 30 });
	let voicePreference = $state<'auto' | 'browser' | 'owned'>('auto');
	let activeVoice = $state<'browser' | 'owned' | ''>('');
	let ownedVoiceId = $state('');
	let serverLanguage = $state('auto');
	let serverVoiceStatus = $state('');
	let speechSnapshot = $state<SpeechSnapshot>({ locale: '', recognition: 'unavailable', localVoices: [] });
	let matchingLocalVoices = $derived(matchingVoiceLocale(speechSnapshot.localVoices, speechSnapshot.locale));
	let speechState = $state<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
	let speechError = $state('');
	let localeInput = $state('');
	let selectedVoice = $state('');
	let voiceTurn = $state(false);
	let spokenAssistantId = '';
	let speechBaseAssistantId = '';
	let ownedAnswerId = '';
	let ownedAnswerFinal = $state(true);
	let interruptedAnswerId = '';
	let pendingVoiceActionTarget = '';
	let preservedVoiceRoute = '';
	let installing = $state(false);
	let pageVisible = $state(true);
	let speechProbeEpoch = 0;
	let voiceMode = $derived(voicePreference === 'auto' ? (speechSnapshot.recognition === 'available' && matchingLocalVoices.length > 0 ? 'browser' : ownedSnapshot.ready ? 'owned' : speechSnapshot.recognition === 'available' ? 'browser' : 'none') : voicePreference === 'browser' ? (speechSnapshot.recognition === 'available' ? 'browser' : 'none') : ownedSnapshot.ready ? 'owned' : 'none');
	let voiceReady = $derived(ready && voiceMode !== 'none');
	let cloudVoicePossible = $derived(voiceMode === 'owned' && voicePreference === 'auto' && (ownedSnapshot.cartesiaTtsReady || ownedSnapshot.cartesiaDiscoveryPending) && !ownedVoiceId);
	let voiceActionLabel = $derived(activeVoice === 'owned' && speechState === 'listening' ? 'Finish speaking' : speechState === 'speaking' || speechState === 'thinking' ? 'Interrupt and speak again' : activeVoice === 'browser' && speechState === 'listening' ? 'Stop listening' : voiceMode !== 'none' ? 'Speak to Ayla' : 'Speech unavailable');
	let voicePhase = $derived(speechState === 'connecting' || speechState === 'listening' || speechState === 'thinking' || speechState === 'speaking' ? speechState : voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming') ? 'thinking' : 'conversation');
	let shortAnswer = $derived.by(() => {
		if (!isAyla || historyOpen || chat.status === 'streaming' || chat.status === 'submitted' || !ownedAnswerFinal || chat.error) return '';
		const latest = chat.messages.at(-1);
		if (latest?.role !== 'assistant' || latest.id === interruptedAnswerId || latest.parts.some((part) => part.type.startsWith('tool-'))) return '';
		const answer = latest.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('').trim();
		return answer.length > 0 && answer.length <= 170 && !/[\n*_#`]/.test(answer) ? answer : '';
	});
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
			if (!active || !ready || activeVoice !== 'browser' || !text.trim()) return;
			speechBaseAssistantId = [...chat.messages].reverse().find((message) => message.role === 'assistant')?.id ?? '';
			voiceTurn = true;
			speechError = '';
			void chat.sendMessage({ text });
		});
		speech.onState = (state, detail) => { if (activeVoice !== 'browser') return; speechState = state; if (state === 'error' || (state === 'idle' && !voiceTurn)) activeVoice = ''; if (detail) speechError = detail; };
		owned = new OwnedSpeech(apiUrl, {
			context: () => chat.messages,
			onTranscript: (text) => { if (!active || !ready || activeVoice !== 'owned' || !text.trim()) return; chat.messages = [...chat.messages, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text }] }]; },
			onAnswer: (text, final) => {
				if (!active || !ready || activeVoice !== 'owned') return;
				if (final) { ownedAnswerFinal = true; interruptedAnswerId = ''; }
				const id = ownedAnswerId || (ownedAnswerId = crypto.randomUUID());
				const previous = chat.messages.find((message) => message.id === id);
				const prior = previous?.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('') ?? '';
				const body = final ? text : prior + text;
				chat.messages = [...chat.messages.filter((message) => message.id !== id), { id, role: 'assistant', parts: [{ type: 'text', text: body }] }];
			},
			onAction: (action) => { const target = resolveAylaAction(action, projects.map((item) => item.slug)); if (active && activeVoice === 'owned' && target) { pendingVoiceActionTarget = target; window.dispatchEvent(new CustomEvent('ayla:navigate', { detail: action })); } },
			onVoice: (voice) => { if (activeVoice === 'owned') serverVoiceStatus = voice.provider === 'cartesia' ? `Speaking with a Cartesia cloud voice · ${displayLanguage(voice.locale)}` : `Speaking with ${displayVoice(voice.id, voice.locale)}`; },
			onAudioUnavailable: (language) => { if (activeVoice === 'owned') speechError = `No Aylith server voice is ready for ${language || 'this language'}. The text answer remains here.`; },
			onState: (state, detail) => { if (activeVoice !== 'owned') return; speechState = state; if (state === 'idle' || state === 'error') activeVoice = ''; if (detail) speechError = detail; }
		});
		const ownedClient = owned;
		const stopAvailability = watchOwnedAvailability(() => ownedClient.probe(), (snapshot) => { if (active) ownedSnapshot = snapshot; });
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
		return () => { active = false; stopAvailability(); speechProbeEpoch++; document.documentElement.classList.remove('experience-mode'); document.removeEventListener('visibilitychange', visibility); globalThis.speechSynthesis?.removeEventListener('voiceschanged', refreshSpeech); window.removeEventListener('ayla:navigate', navigate); };
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
		stopAllVoice();
		conversationOpen = false; voiceSettings = false;
		void tick().then(() => dockTrigger?.focus());
	}

	function onShellKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (voiceSettings) { voiceSettings = false; voiceSettingsTrigger?.focus(); }
			else if (historyOpen) historyOpen = false;
			else if (conversationOpen) closeConversation();
			return;
		}
		if (event.key !== 'Tab' || !conversationOpen || !conversationPanel) return;
		const items = Array.from(conversationPanel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'))
			.filter((item) => item.tabIndex >= 0 && item.getClientRects().length > 0 && !item.closest('[inert]'));
		if (!items.length) return;
		const first = items[0], last = items.at(-1);
		if (document.activeElement === conversationPanel || !conversationPanel.contains(document.activeElement)) {
			event.preventDefault();
			(event.shiftKey ? last : first)?.focus();
		} else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}

	function onOutsideSettings(event: PointerEvent) {
		if (voiceSettings && !voiceSettingsPanel?.contains(event.target as Node) && !voiceSettingsTrigger?.contains(event.target as Node)) voiceSettings = false;
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
		activeVoice = 'browser';
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
		activeVoice = 'owned'; ownedAnswerId = ''; ownedAnswerFinal = false; serverVoiceStatus = ''; speechError = '';
		owned.voiceId = ownedVoiceId; owned.language = serverLanguage;
		owned.ttsPreference = cloudVoicePossible ? 'cartesia_then_owned' : 'owned';
		try { await owned.start(); }
		catch (cause) { activeVoice = ''; speechError = cause instanceof Error ? cause.message : 'Aylith voice could not start.'; speechState = 'error'; }
	}

	function stopAllVoice() {
		if (!ownedAnswerFinal && ownedAnswerId) interruptedAnswerId = ownedAnswerId;
		speech?.stop(); void owned?.stop(); activeVoice = ''; voiceTurn = false; ownedAnswerFinal = true;
		speechState = 'idle';
		if (chat.status === 'submitted' || chat.status === 'streaming') chat.stop();
	}

	async function applyLocale() {
		if (!speech) return;
		let locale: string;
		try { locale = Intl.getCanonicalLocales(localeInput.trim())[0]; } catch { locale = ''; }
		if (!locale) { speechError = 'Enter a valid language tag, such as en-US or hu-HU.'; return; }
		stopAllVoice(); speech.locale = locale; speech.voiceName = ''; selectedVoice = ''; speechError = ''; serverVoiceStatus = '';
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
		if (activeVoice !== 'browser' || voicePreference === 'owned') { voiceTurn = false; return; }
		spokenAssistantId = last.id; voiceTurn = false;
		if (!speech?.speak(answer)) { activeVoice = ''; speechError = `No on-device voice is ready for ${speech?.locale ?? 'this language'}. The text answer is still here.`; }
	});

	async function newConversation() {
		stopAllVoice();
		loadEpoch++;
		ready = true;
		chat.stop();
		chat.messages = [];
		historyOpen = false;
		await clearConversation();
	}
</script>
<svelte:window onkeydown={onShellKeydown} onpointerdown={onOutsideSettings} />

<div class="flex h-svh min-h-0 flex-col overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	<header inert={conversationOpen && !isAyla} class="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-200/70 px-4 dark:border-surface-800 sm:px-7">
		<a href="/ayla" class="inline-flex items-center gap-2 font-semibold tracking-[0.13em]" aria-label="Ayla home"><Mark class="h-7 w-auto" /> AYLITH</a>
		<div class="flex items-center gap-1"><ViewSwitcher /><SettingsMenu /></div>
	</header>
	<div class="relative flex min-h-0 flex-1 {isAyla ? 'justify-center' : ''}">
		{#if !isAyla}
			<main bind:this={exploreMain} inert={conversationOpen} class="min-h-0 min-w-0 flex-1 bg-white dark:bg-surface-950 {isWebsite ? 'overflow-hidden pb-14' : 'overflow-y-auto'}" id="explore-content">
				{@render children()}
			</main>
			<div inert={conversationOpen} class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] {isWebsite ? '' : 'bg-gradient-to-t from-white via-white/95 to-transparent pt-10 dark:from-surface-950 dark:via-surface-950/95'}">
				<div class="pointer-events-auto flex items-center gap-2 rounded-full border border-surface-200 bg-white p-2 shadow-[0_14px_50px_-18px_rgba(83,54,37,.4)] dark:border-surface-700 dark:bg-surface-900 {isWebsite ? 'ml-auto' : 'w-full max-w-xl'}">
					<span class="ayla-dock-light ml-2" aria-hidden="true"></span>
					<button bind:this={dockTrigger} onclick={() => conversationOpen = true} aria-expanded={conversationOpen} aria-controls="ayla-conversation" class="min-w-0 flex-1 px-2 py-1 text-left text-sm text-surface-600 dark:text-warm-300">Ask Ayla</button>
					{#if !isWebsite}<button onclick={() => { conversationOpen = true; void toggleVoice(); }} disabled={!voiceReady && !activeVoice} aria-label={voiceActionLabel} title={voiceActionLabel} class="flex size-9 shrink-0 items-center justify-center rounded-full border border-surface-200 text-surface-600 disabled:text-surface-400 dark:border-surface-700"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg></button>{/if}
					{#if activeVoice}<button onclick={stopAllVoice} aria-label="Interrupt voice" class="shrink-0 rounded-full border border-surface-300 px-3 py-2 text-xs font-medium dark:border-surface-700">Stop voice</button>{/if}
				</div>
			</div>
		{/if}
		{#if isAyla || conversationOpen}
			{#if !isAyla}<button class="absolute inset-0 z-20 bg-surface-950/30 backdrop-blur-[2px]" tabindex="-1" aria-hidden="true" onclick={closeConversation}></button>{/if}
		<section bind:this={conversationPanel} id="ayla-conversation" role={isAyla ? 'main' : 'dialog'} aria-modal={isAyla ? undefined : 'true'} tabindex="-1" aria-label="Ayla conversation" class="z-30 flex min-h-0 min-w-0 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 {isAyla ? 'relative mx-auto w-full max-w-6xl flex-1' : 'absolute inset-y-0 right-0 w-full max-w-[32rem] border-l border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-950'}">
			<div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-100),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_28%_0%,var(--color-accent-900),transparent_68%)]" aria-hidden="true"></div>
			<div class="relative flex shrink-0 flex-wrap items-center justify-between gap-1 py-3 text-xs sm:flex-nowrap">
					<span class="flex min-w-0 items-center gap-1 font-semibold uppercase tracking-[0.12em] text-accent-700 dark:text-accent-300 sm:gap-2 sm:tracking-[0.2em]" aria-live="polite"><svg class="ayla-mini-aperture shrink-0 {pageVisible && voicePhase !== 'conversation' ? 'ayla-dock-active' : ''}" viewBox="0 0 360 150" aria-hidden="true"><path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="currentColor" opacity=".85"/><path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/></svg><span class="sm:hidden">{voicePhase === 'conversation' ? 'Ayla' : voicePhase[0].toUpperCase() + voicePhase.slice(1)}</span><span class="hidden sm:inline">Ayla · {voicePhase}</span></span>
				<div class="flex w-full flex-wrap items-center justify-end gap-0.5 sm:w-auto sm:shrink-0 sm:gap-1">
					{#if !isAyla}<button onclick={closeConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Close</button>{/if}
					<button onclick={() => historyOpen = !historyOpen} aria-pressed={historyOpen} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">{historyOpen ? 'Latest' : 'History'}</button>
					<button onclick={newConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">New</button>
					{#if activeVoice}<button onclick={stopAllVoice} aria-label="Interrupt voice" class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Stop voice</button>{/if}
					<button bind:this={voiceSettingsTrigger} onclick={() => { voiceSettings = !voiceSettings; if (voiceSettings) void tick().then(() => voiceSettingsPanel?.focus()); }} aria-expanded={voiceSettings} aria-controls="ayla-voice-settings" aria-label="Voice settings" class="rounded-lg px-1.5 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 sm:px-2"><span class="sm:hidden">Voice</span><span class="hidden sm:inline">Voice settings</span></button>
				</div>
			</div>
			{#if voiceSettings}
				<div bind:this={voiceSettingsPanel} id="ayla-voice-settings" tabindex="-1" class="absolute inset-x-3 top-14 z-40 grid max-h-[calc(100svh-8rem)] content-start gap-4 overflow-y-auto overscroll-contain rounded-2xl border border-surface-200 bg-white p-5 text-sm shadow-[0_22px_70px_-18px_rgba(36,22,18,.5)] outline-none dark:border-surface-700 dark:bg-surface-900 sm:inset-x-auto sm:right-5 sm:w-[min(27rem,calc(100vw-2rem))]" role="dialog" aria-label="Voice settings">
					<div class="flex items-start justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700 dark:text-accent-300">Ayla preferences</p><h2 class="mt-1 text-xl font-semibold tracking-tight">Voice settings</h2></div><button onclick={() => { voiceSettings = false; voiceSettingsTrigger?.focus(); }} aria-label="Close voice settings" class="rounded-lg border border-surface-200 px-2 py-1 dark:border-surface-700">Close</button></div>
					<div class="grid gap-2 border-t border-surface-200 pt-4 dark:border-surface-700"><label for="ayla-voice-route" class="font-semibold">Speech processing</label><p class="text-xs leading-relaxed text-surface-600 dark:text-warm-300">{voicePreference === 'auto' ? 'Ayla tries speech on this device first, then the Aylith server if a local speech pair is unavailable.' : voicePreference === 'browser' ? 'Recognition stays on this device. A local voice is optional; text replies still work without one.' : 'Aylith processes speech on its server.'}</p><select id="ayla-voice-route" bind:value={voicePreference} onchange={() => { stopAllVoice(); serverVoiceStatus = ''; speechError = ''; }} class="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 dark:border-surface-600 dark:bg-surface-900"><option value="auto">Automatic · on-device first</option><option value="browser">On-device only</option><option value="owned">Aylith server</option></select></div>
					{#if voicePreference !== 'owned'}<div class="grid grid-cols-2 gap-2 text-xs"><div class="rounded-xl bg-surface-50 p-3 dark:bg-surface-800"><p class="font-semibold text-surface-900 dark:text-warm-50">Listening</p><p class="mt-1 text-surface-600 dark:text-warm-300">{speechSnapshot.recognition === 'available' ? 'On-device pack ready' : speechSnapshot.recognition === 'downloadable' ? 'Pack available to install' : speechSnapshot.recognition === 'downloading' ? 'Pack downloading' : 'Not ready here'}</p></div><div class="rounded-xl bg-surface-50 p-3 dark:bg-surface-800"><p class="font-semibold text-surface-900 dark:text-warm-50">Spoken replies</p><p class="mt-1 text-surface-600 dark:text-warm-300">{matchingLocalVoices.length > 0 ? 'On-device voice ready' : 'No local voice · text replies work'}</p></div></div>{/if}
					<div class="grid gap-2 border-t border-surface-200 pt-4 text-xs leading-relaxed text-surface-600 dark:border-surface-700 dark:text-warm-300"><h3 class="text-sm font-semibold text-surface-900 dark:text-warm-50">How your voice works</h3><p><strong class="text-surface-900 dark:text-warm-50">Your conversation</strong> uses the online service. {durable ? 'Text history is saved on this device.' : 'Text history lasts for this visit only.'} No audio is saved in this browser.</p>{#if voicePreference === 'browser'}<p>Recognition and spoken replies stay on this device. If a local language pack or voice is unavailable, text answers remain available.</p>{:else if voicePreference === 'owned'}<p>Microphone audio goes to Aylith for recognition; Aylith generates the spoken reply.</p>{:else}<p>Local speech stays here. If local speech is unavailable, microphone audio goes to Aylith. A matching Cartesia cloud voice may receive answer text for synthesis; otherwise Aylith uses its own voice or returns text.</p>{/if}</div>
					<details class="group border-t border-surface-200 pt-3 dark:border-surface-700"><summary class="cursor-pointer py-1 font-semibold">Advanced voice options</summary><div class="grid gap-4 pt-3 text-xs leading-relaxed text-surface-600 dark:text-warm-300">
						{#if voicePreference !== 'owned'}
						<div class="grid gap-2"><label for="ayla-speech-locale" class="font-medium text-surface-900 dark:text-warm-50">On-device language</label><div class="flex flex-wrap gap-2"><input id="ayla-speech-locale" aria-label="Speech language" bind:value={localeInput} class="w-28 rounded-lg border border-surface-300 bg-transparent px-2 py-2 dark:border-surface-600" /><button onclick={applyLocale} class="rounded-lg border border-surface-300 px-3 py-2 dark:border-surface-600">Use language</button></div><p>Recognition for {speechSnapshot.locale || 'this language'}: {speechSnapshot.recognition === 'available' ? 'ready' : speechSnapshot.recognition === 'downloadable' ? 'pack available to install' : speechSnapshot.recognition === 'downloading' ? 'pack downloading' : 'unavailable in this browser'}.</p>{#if speechSnapshot.recognition === 'downloadable'}<button onclick={installLocalPack} disabled={installing} class="w-fit rounded-lg border border-surface-300 px-3 py-2 dark:border-surface-600">{installing ? 'Installing…' : 'Install on-device language pack'}</button>{/if}</div>
						<div class="grid gap-2"><label for="ayla-local-voice" class="font-medium text-surface-900 dark:text-warm-50">On-device playback</label>{#if matchingLocalVoices.length > 0}<select id="ayla-local-voice" bind:value={selectedVoice} onchange={() => { if (speech) speech.voiceName = selectedVoice; }} class="w-full min-w-0 rounded-lg border border-surface-300 bg-white px-2 py-2 dark:border-surface-600 dark:bg-surface-900"><option value="">Automatic for this language</option>{#each matchingLocalVoices as voice}<option value={voice.name}>{voice.name} ({voice.lang})</option>{/each}</select>{:else}<p>No matching on-device playback voice is currently available. Local recognition can still send a question and show the text answer.</p>{/if}</div>
						{/if}
						{#if voicePreference !== 'browser'}
						<div class="grid gap-2"><p><strong class="text-surface-900 dark:text-warm-50">Aylith server</strong> · recognition {ownedSnapshot.ready ? 'ready' : 'not ready'} · {ownedSnapshot.ttsReady ? `${ownedSnapshot.readyVoices.length} voices ready` : 'no voice ready'}{ownedSnapshot.cartesiaTtsReady ? ' · matching cloud voices available' : ''}</p><button onclick={refreshOwned} class="w-fit underline">Refresh availability</button></div>
						{#if ownedSnapshot.ready}<div class="grid gap-2"><label for="ayla-server-language" class="font-medium text-surface-900 dark:text-warm-50">Server recognition</label><select id="ayla-server-language" bind:value={serverLanguage} class="w-full min-w-0 rounded-lg border border-surface-300 bg-white px-2 py-2 dark:border-surface-600 dark:bg-surface-900"><option value="auto">Detect language</option>{#each ownedSnapshot.readyLanguages as language}<option value={language}>{displayLanguage(language)} ({language})</option>{/each}</select><label for="ayla-server-voice" class="mt-2 font-medium text-surface-900 dark:text-warm-50">Server voice</label><select id="ayla-server-voice" bind:value={ownedVoiceId} class="w-full min-w-0 rounded-lg border border-surface-300 bg-white px-2 py-2 dark:border-surface-600 dark:bg-surface-900"><option value="">Automatic language match</option>{#each ownedSnapshot.readyVoices as voice}<option value={voice.id}>{displayVoice(voice.id, voice.locale)}</option>{/each}</select></div>{/if}
						{/if}
					</div></details>
					{#if serverVoiceStatus && voicePreference !== 'browser'}<p>{serverVoiceStatus}</p>{/if}
				</div>
			{/if}
			{#if speechError}<p class="relative px-2 pb-1 text-xs text-red-700 dark:text-red-300" role="alert">{speechError}</p>{/if}
			<div class="relative min-h-0 flex-1">
				{#if isAyla && !historyOpen && (chat.messages.length === 0 || shortAnswer)}
					<div class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-14 text-center">
						<svg class="ayla-aperture" data-active={pageVisible && voicePhase !== 'conversation'} viewBox="0 0 360 150" aria-hidden="true">
							<defs><linearGradient id="ayla-light" x1="0" x2="1" y1=".7" y2=".2"><stop stop-color="#7a3f30" stop-opacity="0"/><stop offset=".26" stop-color="#ca8060"/><stop offset=".48" stop-color="#fff0d0"/><stop offset=".75" stop-color="#dc9b75"/><stop offset="1" stop-color="#80402f" stop-opacity="0"/></linearGradient><filter id="ayla-spill" x="-35%" y="-100%" width="170%" height="300%"><feGaussianBlur stdDeviation="12"/></filter></defs>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)" opacity=".7" filter="url(#ayla-spill)"/>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)"/>
							<path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/>
							<path d="M49 91 C109 59 152 51 199 68 C248 86 287 51 326 38" fill="none" stroke="#fff2dc" stroke-width="2" opacity=".75"/>
						</svg>
						<p class="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent-700 dark:text-accent-300">Ayla</p>
						{#if shortAnswer}<p class="mt-4 max-w-[20ch] text-balance text-3xl font-medium leading-tight tracking-tight sm:max-w-[26ch] sm:text-5xl" aria-live="polite">{shortAnswer}</p>{:else}<h1 class="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">I’m here.</h1>{/if}
					</div>
				{/if}
				{#if ready}
					<Assistant {apiUrl} pageContext={currentContext} session={chat} immersive showIntro={false} showHistory={historyOpen} spotlight={!!shortAnswer} showSpeak speakAvailable={voiceReady} speechActive={activeVoice !== ''} speakLabel={voiceActionLabel} onSpeak={() => { void toggleVoice(); }} onStopVoice={stopAllVoice} onBeforeSend={stopAllVoice} suggestions={[]} placeholder="Ask Ayla…" />
				{:else}
					<p class="p-4 text-sm text-surface-500">Opening this device’s conversation…</p>
				{/if}
			</div>
		</section>
		{/if}
	</div>
</div>
