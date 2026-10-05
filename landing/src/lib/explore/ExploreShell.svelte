<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, type UIMessage } from 'ai';
	import Mark from '$lib/components/brand/Mark.svelte';
	import ViewSwitcher from '$lib/components/layout/ViewSwitcher.svelte';
	import SettingsMenu from '$lib/components/layout/SettingsMenu.svelte';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { languageChoices, voiceChoices, SPEECH_LANGUAGE_CODES } from '$lib/components/controls/choice-options';
	import Assistant from '$lib/ask/Assistant.svelte';
	import AylaSignIn from '$lib/ask/AylaSignIn.svelte';
	import ManagedActionPane from '$lib/ask/ManagedActionPane.svelte';
	import type {ManagedAction} from '$lib/ask/managed-actions';
	import AylaAdministration from '$lib/ask/AylaAdministration.svelte';
	import { asksToSignIn } from '$lib/ask/auth-intent';
	import { resolveAiUrl } from '$lib/ask/config';
	import { deleteConversationSession, adoptGuestConversation, clearConversation, guestConversationScope, listConversationSessions, reopenConversation, loadConversation, saveConversation } from '$lib/ask/history';
	import { BrowserSpeech, matchingVoiceLocale, type SpeechSnapshot } from '$lib/ask/browser-speech';
	import {ManagedSpeech,ownedAdmissionFallback}from '$lib/ask/managed-speech';
	import { conversationalRequest, selectServerVoice } from '$lib/ask/voice-selection';
	import { OwnedSpeech, watchOwnedAvailability, type OwnedAvailability } from '$lib/ask/owned-speech';
	import { resolveAylaAction } from './navigation';
	import AylaScene from './AylaScene.svelte';
	import { publicPageContext, viewHref } from './view-context';
	import { immersivePhase, requestSummary, responsePreview } from './immersive';
	import { browserStorage, rememberView } from '$lib/view-preference';

	let { children, projects }: { children: Snippet; projects: { slug: string; name: string }[] } = $props();
	const apiUrl = resolveAiUrl();
	let inlineLoginTurnId=$state('');let semanticSummary=$state<{requestId:string;summary:string}|null>(null);
	let identityEpoch=0;
	function createChat(epoch:number) {return new Chat<UIMessage>({
		transport: new DefaultChatTransport({
			api: `${apiUrl}/api/chat`,
			prepareSendMessagesRequest: ({ messages, body }) => {if(epoch!==identityEpoch)throw new Error('Conversation identity changed');inlineLoginTurnId=messages.findLast(message=>message.role==='user')?.id??'';return ({
				body: { ...body, messages, pageContext: currentContext(), clientCapabilities: { projectNavigation: true, experienceNavigation: true, inlineLogin: true,requestSummary:true } }
			});}
		})
	});}
	let chat = $state(createChat(identityEpoch));
	let conversationScope=$state('');
	let retainedGuest: UIMessage[]=[];
	let ready = $state(false);
	let durable = $state(false);
	let loadEpoch = 0;
	let handledQuery = '';
	let historyOpen = $state(false);
	let storedSessions=$state<{id:string;title:string;current:boolean}[]>([]);let historyError=$state('');
	let pendingDelete=$state<string|null>(null);let deletingHistory=$state(false);let deletionEpoch=0;
	let historyQuery=$state(''),historyPage=$state(0);
	const historyPageSize=20;
	const foldHistory=(text:string)=>text.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase();
	let filteredSessions=$derived(storedSessions.filter(item=>foldHistory(item.title).includes(foldHistory(historyQuery.trim()))));
	let historyPageCount=$derived(Math.max(1,Math.ceil(filteredSessions.length/historyPageSize)));
	let visibleHistoryPage=$derived(Math.min(historyPage,historyPageCount-1));
	let visibleSessions=$derived(filteredSessions.slice(visibleHistoryPage*historyPageSize,(visibleHistoryPage+1)*historyPageSize));
	function historyHighlight(title:string) {
		const query=foldHistory(historyQuery.trim());if(!query)return {before:title,match:'',after:''};
		let folded='',positions:{start:number;end:number}[]=[];let offset=0;for(const char of title){const part=foldHistory(char);folded+=part;for(let i=0;i<part.length;i++)positions.push({start:offset,end:offset+char.length});offset+=char.length;}
		const index=folded.indexOf(query);if(index<0||!positions[index]||!positions[index+query.length-1])return {before:title,match:'',after:''};const start=positions[index].start,end=positions[index+query.length-1].end;return {before:title.slice(0,start),match:title.slice(start,end),after:title.slice(end)};
	}

	let conversationOpen = $state(false);
	let voiceSettings = $state(false);
	let voiceSettingsTrigger = $state<HTMLButtonElement>();
	let voiceSettingsPanel = $state<HTMLDivElement>();
	let speech: BrowserSpeech | undefined;
	let owned: OwnedSpeech | undefined;
	let managed:ManagedSpeech|undefined;
	let conversationalVoice=$state<{id:string;locale:string;label:string}|null>(null);
	let ownedSnapshot = $state<OwnedAvailability>({ ready: false, ttsReady: false, cartesiaTtsReady: false, cartesiaDiscoveryPending: false, readyLanguages: [], readyVoices: [], maxRecordingSeconds: 30 });
	let speechPolicyReady = $state(false);
	let policyEpoch = 0;
	let disposed = false;
	let voicePreference = $state<'auto' | 'browser' | 'owned'>('auto');
	let activeVoice = $state<'browser' | 'owned' | 'managed' | ''>('');
	let ownedVoiceId = $state('');
	let serverLanguage = $state('auto');
	let managedSelection=$derived(conversationalRequest(conversationalVoice,serverLanguage,ownedVoiceId));
	let managedSelected=$derived(managedSelection!==null);
	let serverVoiceStatus = $state('');
 let voiceNotice = $state('');
	let speechSnapshot = $state<SpeechSnapshot>({ locale: '', recognition: 'unavailable', localVoices: [] });
	let matchingLocalVoices = $derived(matchingVoiceLocale(speechSnapshot.localVoices, speechSnapshot.locale));
	let localLanguageChoices = $derived(languageChoices([...SPEECH_LANGUAGE_CODES, speechSnapshot.locale, ...speechSnapshot.localVoices.map((voice) => voice.lang)].filter(Boolean), typeof navigator === 'undefined' ? 'en' : navigator.language));
	let localVoiceChoices = $derived([{ value: '', label: 'Automatic local voice' }, ...voiceChoices(matchingLocalVoices.map((voice) => ({ value: voice.name, name: voice.name, locale: voice.lang })), typeof navigator === 'undefined' ? 'en' : navigator.language)]);
	let serverLanguageChoices = $derived([{ value: 'auto', label: 'Detect language' }, ...languageChoices([...ownedSnapshot.readyLanguages,...(conversationalVoice?[conversationalVoice.locale]:[])], typeof navigator === 'undefined' ? 'en' : navigator.language)]);
	let serverVoiceChoices = $derived([{ value: '', label: managedSelected ? `Automatic · ${conversationalVoice?.label}` : 'Automatic language match' }, ...(conversationalVoice?voiceChoices([{value:conversationalVoice.id,name:conversationalVoice.label,locale:conversationalVoice.locale}],typeof navigator === 'undefined' ? 'en' : navigator.language):[]), ...voiceChoices(ownedSnapshot.readyVoices.map((voice) => ({ value: voice.id, name: displayVoice(voice.id, voice.locale), locale: voice.locale })), typeof navigator === 'undefined' ? 'en' : navigator.language)]);
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
	let localStarting = false;
	let voiceMode = $derived(voicePreference === 'auto' ? (speechSnapshot.recognition === 'available' && matchingLocalVoices.length > 0 ? 'browser' : ownedSnapshot.ready ? 'owned' : speechSnapshot.recognition === 'available' ? 'browser' : 'none') : voicePreference === 'browser' ? (speechSnapshot.recognition === 'available' ? 'browser' : 'none') : ownedSnapshot.ready ? 'owned' : 'none');
	let serverPreferences=$derived(voiceMode==='owned'||conversationalVoice!==null);
	let voiceReady = $derived(ready && speechPolicyReady && (managedSelected||voiceMode !== 'none'));
	let cloudVoicePossible = $derived(voiceMode === 'owned' && voicePreference === 'auto' && (ownedSnapshot.cartesiaTtsReady || ownedSnapshot.cartesiaDiscoveryPending) && !ownedVoiceId);
	let voiceActionLabel = $derived(activeVoice === 'managed' ? 'End voice conversation' : activeVoice === 'owned' && speechState === 'listening' ? 'Finish speaking' : speechState === 'speaking' || speechState === 'thinking' ? 'Interrupt and speak again' : activeVoice === 'browser' && speechState === 'listening' ? 'Stop listening' : managedSelected || voiceMode !== 'none' ? 'Speak to Ayla' : 'Speech unavailable');
	let voicePhase = $derived(speechState === 'connecting' || speechState === 'listening' || speechState === 'thinking' || speechState === 'speaking' ? speechState : voiceTurn && (chat.status === 'submitted' || chat.status === 'streaming') ? 'thinking' : 'conversation');
	let shortAnswer = $derived.by(() => {
		if (!isAyla || historyOpen || chat.status === 'streaming' || chat.status === 'submitted' || !ownedAnswerFinal || chat.error) return '';
		const latest = chat.messages.at(-1);
		if (latest?.role !== 'assistant' || latest.id === interruptedAnswerId || latest.parts.some((part) => part.type.startsWith('tool-'))) return '';
		const answer = latest.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('').trim();
		return answer.length > 0 && answer.length <= 170 && !/[\n*_#`]/.test(answer) ? answer : '';
	});
	let isImmersive = $derived(page.url.pathname === '/ayla/immersive'||page.url.pathname==='/');
	let isAyla = $derived(page.url.pathname === '/' || page.url.pathname === '/ayla' || isImmersive);
	let immersiveState = $derived(immersivePhase(speechState, chat.status, !!speechError || !!chat.error));
	let chatIslandOpen = $state(false);
	let authCardOpen = $state(false);
	let managedOffer=$state<ManagedAction|null>(null);
	let managedRequestId=$state('');
	let authUserName = $state('');
	let authSubject = $state('');
	let authTrigger = $state<HTMLButtonElement>();
	let chatTrigger = $state<HTMLButtonElement>();
	function openSignIn() {
		stopAllVoice();
		authCardOpen = true;
		voiceSettings = false;
		historyOpen = false;
	}
	function openSignInIntent(request: string): boolean {
		if (!asksToSignIn(request)) return false;
		openSignIn();
		return true;
	}
	function closeSignIn() {
		authCardOpen = false;
		void tick().then(() => (isImmersive ? chatTrigger : authTrigger)?.focus());
	}
	let latestRequest = $derived.by(() => {
		const latest = [...chat.messages].reverse().find((message) => message.role === 'user');
		return latest?.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join(' ').trim() ?? '';
	});
	let latestAnswer = $derived.by(() => {
		const index=chat.messages.findLastIndex(message=>message.role==='user');
		const latest = chat.messages.slice(index+1).reverse().find((message) => message.role === 'assistant');
		return latest?.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('').trim() ?? '';
	});
	let immersiveAnswer = $derived(responsePreview(latestAnswer));
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
		return publicPageContext(page.url, projects);
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
			if (!active || !ready || authCardOpen || activeVoice !== 'browser' || !text.trim()) return;
			speechBaseAssistantId = [...chat.messages].reverse().find((message) => message.role === 'assistant')?.id ?? '';
			voiceTurn = true;
			speechError = '';
			void chat.sendMessage({ text });
		});
		speech.onState = (state, detail) => { if (authCardOpen || (activeVoice !== 'browser' && !(localStarting && state === 'listening'))) return; speechState = state; if (state === 'listening') activeVoice = 'browser'; if (state === 'error' || (state === 'idle' && !voiceTurn)) activeVoice = ''; if (detail) speechError = detail; };
		owned = new OwnedSpeech(apiUrl, {
			context: () => chat.messages,
			onTranscript: (text) => { if (!active || !ready || authCardOpen || activeVoice !== 'owned' || !text.trim()) return; chat.messages = [...chat.messages, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text }] }]; },
			onAnswer: (text, final) => {
				if (!active || !ready || authCardOpen || activeVoice !== 'owned') return;
				if (final) { ownedAnswerFinal = true; interruptedAnswerId = ''; }
				const id = ownedAnswerId || (ownedAnswerId = crypto.randomUUID());
				const previous = chat.messages.find((message) => message.id === id);
				const prior = previous?.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('') ?? '';
				const body = final ? text : prior + text;
				chat.messages = [...chat.messages.filter((message) => message.id !== id), { id, role: 'assistant', parts: [{ type: 'text', text: body }] }];
			},
			onAction: (action) => { const target = resolveAylaAction(action, projects.map((item) => item.slug)); if (active && !authCardOpen && activeVoice === 'owned' && target) { pendingVoiceActionTarget = target; window.dispatchEvent(new CustomEvent('ayla:navigate', { detail: action })); } },
			onVoice: (voice) => { if (activeVoice === 'owned') serverVoiceStatus = `Speaking · ${displayLanguage(voice.locale)}`; },
			onAudioUnavailable: () => { if (activeVoice === 'owned') speechError = 'Spoken reply unavailable. Your text answer is here.'; },
			onState: (state, detail) => { if (activeVoice !== 'owned') return; speechState = state; if (state === 'idle' || state === 'error') { activeVoice = ''; serverVoiceStatus = ''; } if (detail) speechError = detail; }
		});
		managed=new ManagedSpeech(apiUrl,{onRequest:(id)=>{if(!active||!ready||activeVoice!=='managed')return;managedRequestId=id;semanticSummary=null;},onSummary:(summary,id)=>{if(active&&activeVoice==='managed'&&id===managedRequestId)semanticSummary={requestId:chat.messages.findLast(m=>m.role==='user')?.id??'',summary};},onAction:(action,id)=>{if(id===managedRequestId&&active&&!authCardOpen&&activeVoice==='managed'&&(action.type!=='open_project'||projects.some(p=>p.slug===action.slug)))managedOffer=action;},onState:(state,detail)=>{if(!active||activeVoice!=='managed')return;speechState=state;if(detail)speechError=detail;if(state==='idle'||state==='error')activeVoice='';},onTranscript:(role,text,requestId)=>{if(!active||!ready||authCardOpen||activeVoice!=='managed')return;if(role==='user'&&requestId){managedRequestId=requestId;managedOffer=null;semanticSummary=null;}if(active&&ready&&!authCardOpen&&activeVoice==='managed'&&text.trim())chat.messages=[...chat.messages,{id:crypto.randomUUID(),role,parts:[{type:'text',text}]}];}});
		void refreshSpeechPolicy();
		const ownedClient = owned;
		const stopAvailability = watchOwnedAvailability(() => ownedClient.probe(), (snapshot) => { if (active) ownedSnapshot = snapshot; });
		localeInput = speech.locale;
		const refreshSpeech = () => { void updateSpeechSnapshot(); void refreshSpeechPolicy(); };
		refreshSpeech();
		const visibility = () => { pageVisible = document.visibilityState === 'visible'; };
		visibility();
		document.addEventListener('visibilitychange', visibility);
		globalThis.speechSynthesis?.addEventListener('voiceschanged', refreshSpeech);

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
		disposed = true; policyEpoch++;
		speech?.stop(); void owned?.stop();void managed?.stop();
		chat.stop();
		if (ready) void saveConversation(chat.messages,conversationScope);
	});

	$effect(() => {
		if (!ready) return;
		const messages = chat.messages;
		const last = messages.at(-1);
		void chat.status;
		void (last?.parts.find((part) => part.type === 'text') as { text?: string } | undefined)?.text;
		const timer = setTimeout(() => void saveConversation(messages,conversationScope).then((saved) => { if (!saved) durable = false; }), 500);
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
				if(tool.type==='tool-summarizeRequest'&&tool.state==='output-available'){const value=tool.output as {requestId?:unknown;summary?:unknown};if(typeof value.requestId==='string'&&value.requestId===chat.messages.findLast(m=>m.role==='user')?.id&&typeof value.summary==='string'&&value.summary.length<=180){semanticSummary={requestId:value.requestId,summary:value.summary};seenActions.add(key);}return;}
				if(tool.type==='tool-showLogin'&&tool.state==='output-available'){
                  const result=tool.output as {type?:unknown;requestId?:unknown}|undefined;
                  if(result?.type==='show_login'&&typeof result.requestId==='string'&&result.requestId===inlineLoginTurnId&&result.requestId===chat.messages.findLast(item=>item.role==='user')?.id){seenActions.add(key);managedOffer={type:'show_login',requestId:result.requestId};managedRequestId=result.requestId;inlineLoginTurnId='';}
                  return;
                }
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
		rememberView(route === '/' || route === '/ayla' || route === '/ayla/immersive' ? 'ayla' : 'explore', browserStorage());
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
		if (event.defaultPrevented) return;
		if (event.key === 'Escape') {
			if (authCardOpen) closeSignIn();
			else if (voiceSettings) { voiceSettings = false; voiceSettingsTrigger?.focus(); }
			else if (historyOpen) historyOpen = false;
			else if (isImmersive && chatIslandOpen) chatIslandOpen = false;
			else if (isImmersive) void goto('/');
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
		if (!openSignInIntent(query)) void chat.sendMessage({ text: query });
		void goto('/', { replaceState: true, noScroll: true, keepFocus: true });
	});

	async function startLocalSpeech() {
		if (!speech || !ready || authCardOpen) return;
		if (speechState === 'listening') { speech.stop(); voiceTurn = false; return; }
		if (speechState === 'speaking') speech.stop();
		if (chat.status === 'submitted' || chat.status === 'streaming') { chat.stop(); voiceTurn = false; }
		speechError = '';
		activeVoice = 'browser';
		localStarting = true;
		try { await speech.start(); } catch (cause) { speechError = cause instanceof Error ? cause.message : 'Speech could not start.'; speechState = 'error'; }
		finally { localStarting = false; }
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
		if (!ready || authCardOpen) return;
		if (chat.status === 'submitted' || chat.status === 'streaming') chat.stop();
		if(activeVoice==='managed'){await managed?.stop();activeVoice='';return;}
		if (activeVoice === 'owned' && speechState === 'listening') { await owned?.finish(); return; }
		if (activeVoice === 'browser' && speechState === 'listening') { speech?.stop(); activeVoice = ''; voiceTurn = false; return; }
		if (activeVoice) { speech?.stop(); await owned?.stop();await managed?.stop(); activeVoice = ''; voiceTurn = false; chat.stop(); }
		if (!await refreshSpeechPolicy() || disposed || authCardOpen) return;
		if(managedSelection&&conversationalVoice&&managed){const selectedLabel=conversationalVoice.label,initiatingIdentity=identityEpoch;activeVoice='managed';speechError='';try{await managed.start({language:managedSelection.language,voiceId:managedSelection.voiceId,prompt:latestRequest.slice(0,600),context:JSON.stringify(currentContext()).slice(0,600)},()=>initiatingIdentity===identityEpoch&&ready);}catch(cause){if(initiatingIdentity!==identityEpoch||!ready||authCardOpen||disposed)return;activeVoice='';const fallback=ownedAdmissionFallback(cause,voiceMode,ownedSnapshot.ready&&ownedSnapshot.ttsReady,serverLanguage,ownedSnapshot.readyVoices);if(owned&&fallback){voiceNotice=`Using ${displayVoice(fallback.id,fallback.locale)} while ${selectedLabel} is busy or at its session limit.`;ownedVoiceId=fallback.id;owned.voiceId=fallback.id;owned.language=serverLanguage;owned.ttsPreference='owned';activeVoice='owned';ownedAnswerId='';ownedAnswerFinal=false;speechError='';try{await owned.start();}catch(error){if(initiatingIdentity!==identityEpoch||disposed||!ready)return;activeVoice='';voiceNotice='';speechError=error instanceof Error?error.message:'Voice could not start.';speechState='error';}}else{speechError='This voice is temporarily unavailable. Choose another voice or continue with text.';}}return;}
		if (voiceMode === 'browser') { activeVoice = 'browser'; await startLocalSpeech(); if (speechState === 'error') activeVoice = ''; return; }
		if (voiceMode !== 'owned' || !owned) return;
		activeVoice = 'owned'; ownedAnswerId = ''; ownedAnswerFinal = false; serverVoiceStatus = ''; speechError = '';
		if (ownedVoiceId === conversationalVoice?.id) ownedVoiceId = '';
		owned.voiceId = ownedVoiceId; owned.language = serverLanguage;
		owned.ttsPreference = cloudVoicePossible ? 'cartesia_then_owned' : 'owned';
		try { await owned.start(); }
		catch (cause) { activeVoice = ''; speechError = cause instanceof Error ? cause.message : 'Aylith voice could not start.'; speechState = 'error'; }
	}

	function stopAllVoice() {
 voiceNotice='';
		if (!ownedAnswerFinal && ownedAnswerId) interruptedAnswerId = ownedAnswerId;
		localStarting = false;
		speech?.stop(); const stopping=[owned?.stop(),managed?.stop()]; activeVoice = ''; voiceTurn = false; ownedAnswerFinal = true; serverVoiceStatus = '';
		speechState = 'idle';
		if (chat.status === 'submitted' || chat.status === 'streaming') chat.stop();
		return Promise.allSettled(stopping);
	}

	async function applyLocale() {
		if (!speech) return;
		let locale: string;
		try { locale = Intl.getCanonicalLocales(localeInput.trim())[0]; } catch { locale = ''; }
		if (!locale) { speechError = 'Enter a valid language tag, such as en-US or hu-HU.'; return; }
		stopAllVoice(); speech.locale = locale; speech.voiceName = ''; selectedVoice = ''; speechError = ''; serverVoiceStatus = '';
		await updateSpeechSnapshot();
	}

	async function refreshSpeechPolicy(): Promise<boolean> {
		const epoch = ++policyEpoch;
		try {
			const response = await fetch(`${apiUrl}/api/voice/preferences`, {cache: 'no-store', signal: AbortSignal.timeout(5000)});
			if (!response.ok) throw new Error('Speech preferences are unavailable.');
			const data = await response.json();
			if (disposed || epoch !== policyEpoch) return false;
			if (!['auto', 'browser', 'owned'].includes(data.mode)) throw new Error('Invalid speech preferences.');
			conversationalVoice=data.conversationalVoice&&typeof data.conversationalVoice.id==='string'&&typeof data.conversationalVoice.locale==='string'&&typeof data.conversationalVoice.label==='string'?data.conversationalVoice:null;
			voicePreference = data.mode;
			speechPolicyReady = true;
			if (ownedVoiceId && ownedVoiceId!==conversationalVoice?.id && !data.voices?.some((voice: {id: string}) => voice.id === ownedVoiceId)) ownedVoiceId = '';
			return true;
		} catch {
			if (!disposed && epoch === policyEpoch) { speechPolicyReady = false; speechError = 'Speech is temporarily unavailable. Text still works.'; }
			return false;
		}
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
		if (!speech?.speak(answer)) { activeVoice = ''; if (matchingLocalVoices.length > 0) speechError = 'Spoken reply unavailable. Your text answer is here.'; }
	});

	async function onIdentityStatus(name:string,subject?:string,state?:'checking'|'guest'|'authenticated'|'signed-in'|'signed-out',conversationIdentity?:string) {
		const oldScope=conversationScope;const prior=chat.messages;
		if(oldScope.startsWith('guest:')&&prior.length)retainedGuest=prior;
		if(ready&&oldScope)void saveConversation(prior,oldScope);
		const epoch=++identityEpoch;loadEpoch++;ready=false;stopAllVoice();chat.stop();chat=createChat(epoch);
		storedSessions=[];pendingDelete=null;deletingHistory=false;deletionEpoch++;historyError='';historyQuery='';historyPage=0;semanticSummary=null;managedOffer=null;managedRequestId='';inlineLoginTurnId='';authUserName=name;authSubject=subject??'';
		if(!state||state==='checking'){conversationScope='';return;}
		if((state==='authenticated'||state==='signed-in')&&(!subject||!conversationIdentity||!/^[a-f0-9]{64}$/.test(conversationIdentity))){conversationScope='';return;}
		conversationScope=subject?`identity:${new URL(apiUrl).origin}:${conversationIdentity}`:guestConversationScope(new URL(apiUrl).origin);
		if(state==='signed-out'){retainedGuest=[];await clearConversation(conversationScope);}
		const scope=conversationScope;const saved=await loadConversation(scope);
		if(disposed||epoch!==identityEpoch||scope!==conversationScope)return;
		const guest=state==='signed-in'?retainedGuest.slice():[];if(guest.length){await adoptGuestConversation(guest,scope,undefined,()=>!disposed&&epoch===identityEpoch&&scope===conversationScope);if(disposed||epoch!==identityEpoch||scope!==conversationScope)return;}
		chat.messages=guest.length?guest:saved.messages;
		retainedGuest=[];durable=saved.available;ready=true;
		if(historyOpen)await refreshHistory();
	}

	async function refreshHistory() {const scope=conversationScope,epoch=identityEpoch;if(!ready||!scope){storedSessions=[];return;}try{const rows=await listConversationSessions(scope);if(!disposed&&epoch===identityEpoch&&scope===conversationScope){storedSessions=rows;historyError='';}}catch{if(epoch===identityEpoch)historyError='Local history is unavailable.';}}
	function toggleHistory(){historyOpen=!historyOpen;if(historyOpen)void refreshHistory();}
	async function chooseConversation(id:string) {
		if(!ready||!conversationScope)return;const scope=conversationScope;void saveConversation(chat.messages,scope);const epoch=++identityEpoch;loadEpoch++;ready=false;stopAllVoice();chat.stop();chat=createChat(epoch);semanticSummary=null;managedOffer=null;managedRequestId='';storedSessions=[];
		try{const saved=await reopenConversation(scope,id,()=>!disposed&&epoch===identityEpoch&&scope===conversationScope);if(disposed||epoch!==identityEpoch||scope!==conversationScope)return;chat.messages=saved.messages;durable=saved.available;ready=true;await refreshHistory();}catch{if(epoch===identityEpoch){ready=true;historyError='This local conversation could not be opened.';}}
	}

 async function confirmConversationDelete() {
  const id=pendingDelete,scope=conversationScope;if(!id||!scope||deletingHistory)return;
  const active=storedSessions.find(item=>item.id===id)?.current===true;
  const preservedMessages=chat.messages;
  pendingDelete=null;deletingHistory=true;const deletion=++deletionEpoch;let epoch=identityEpoch;
  if(active){epoch=++identityEpoch;loadEpoch++;ready=false;stopAllVoice();chat.stop();chat=createChat(epoch);semanticSummary=null;managedOffer=null;managedRequestId='';inlineLoginTurnId='';}
  const removed=await deleteConversationSession(scope,id);
  if(disposed||epoch!==identityEpoch||scope!==conversationScope){if(deletion===deletionEpoch)deletingHistory=false;return;}
  if(active){if(removed){await adoptGuestConversation([],scope,undefined,()=>!disposed&&epoch===identityEpoch&&scope===conversationScope);}else{chat.messages=preservedMessages;durable=false;void saveConversation(preservedMessages,scope);}if(disposed||epoch!==identityEpoch||scope!==conversationScope){if(deletion===deletionEpoch)deletingHistory=false;return;}ready=true;}
  if(deletion===deletionEpoch)deletingHistory=false;await refreshHistory();if(!removed&&!disposed&&epoch===identityEpoch&&scope===conversationScope)historyError='This device could not remove the saved conversation. Try again.';
 }

	async function newConversation() {
		if(!conversationScope)return;const scope=conversationScope;if(ready)void saveConversation(chat.messages,scope);const epoch=++identityEpoch;loadEpoch++;ready=false;stopAllVoice();chat.stop();chat=createChat(epoch);semanticSummary=null;managedOffer=null;managedRequestId='';storedSessions=[];historyOpen=false;
		await adoptGuestConversation([],scope,undefined,()=>!disposed&&epoch===identityEpoch&&scope===conversationScope);if(disposed||epoch!==identityEpoch||scope!==conversationScope)return;ready=true;
	}

</script>
<svelte:window onkeydown={onShellKeydown} onpointerdown={onOutsideSettings} />

<div class="flex h-svh min-h-0 flex-col overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-warm-50">
	{#if isAyla}{@render children()}{/if}
	{#if !isImmersive}<header inert={authCardOpen || (conversationOpen && !isAyla)} class="relative {conversationOpen && !isAyla ? 'z-0' : 'z-40'} flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-200/70 px-4 dark:border-surface-800 sm:px-7">
		<a href="/" class="inline-flex items-center gap-2 font-semibold tracking-[0.13em]" aria-label="Ayla home"><Mark class="h-7 w-auto" /> AYLITH</a>
		<div class="flex items-center gap-1">{#if isAyla}<button bind:this={authTrigger} onclick={openSignIn} class="min-h-11 rounded-full px-3 py-2 text-xs font-semibold text-accent-700 hover:bg-accent-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 dark:text-accent-300 dark:hover:bg-surface-800">{authUserName || 'Sign in'}</button><a href="/ayla/immersive" class="min-h-11 rounded-full px-3 py-2 text-xs font-semibold text-accent-700 hover:bg-accent-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 dark:text-accent-300 dark:hover:bg-surface-800">Immersive</a>{/if}<ViewSwitcher /><SettingsMenu /></div>
	</header>{/if}
	<div class="relative z-10 flex min-h-0 flex-1 {isAyla ? 'justify-center' : ''}">
		{#if !isAyla}
			<main bind:this={exploreMain} inert={conversationOpen} class="relative z-0 min-h-0 min-w-0 flex-1 bg-white dark:bg-surface-950 {isWebsite ? 'overflow-hidden pb-14' : 'overflow-y-auto'}" id="explore-content">
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
			{#if isImmersive}
                <details inert={authCardOpen} class="absolute right-4 top-4 z-40 text-xs" data-ayla-options>
                  <summary aria-label="Ayla options" class="cursor-pointer list-none rounded-full px-3 py-2 text-surface-500 dark:text-warm-400"><span aria-hidden="true">•••</span></summary>
                  <div class="mt-2 grid gap-2 rounded-2xl border border-surface-200 bg-white p-3 dark:border-surface-700 dark:bg-surface-900">
                    <ViewSwitcher/><a href={browser ? viewHref(page.url,'conversation') : '/ayla'} class="rounded-full px-3 py-2">Full conversation</a>
                    <button onclick={()=>{voiceSettings=!voiceSettings;void refreshSpeechPolicy();}} class="rounded-full px-3 py-2">Preferences</button>
                    <button onclick={openSignIn} class="rounded-full px-3 py-2">{authUserName||'Sign in'}</button>
                  </div>
                </details>
			{:else}<div inert={authCardOpen} class="relative flex shrink-0 flex-wrap items-center justify-between gap-1 py-3 text-xs sm:flex-nowrap">
					<span class="flex min-w-0 items-center gap-1 font-semibold uppercase tracking-[0.12em] text-accent-700 dark:text-accent-300 sm:gap-2 sm:tracking-[0.2em]" aria-live="polite"><svg class="ayla-mini-aperture shrink-0 {pageVisible && voicePhase !== 'conversation' ? 'ayla-dock-active' : ''}" viewBox="0 0 360 150" aria-hidden="true"><path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="currentColor" opacity=".85"/><path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/></svg><span class="sm:hidden">{voicePhase === 'conversation' ? 'Ayla' : voicePhase[0].toUpperCase() + voicePhase.slice(1)}</span><span class="hidden sm:inline">Ayla · {voicePhase}</span></span>
				<div class="flex w-full flex-wrap items-center justify-end gap-0.5 sm:w-auto sm:shrink-0 sm:gap-1">
					{#if !isAyla}<button onclick={closeConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Close</button>{/if}
					<button onclick={toggleHistory} aria-pressed={historyOpen} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">{historyOpen ? 'Latest' : 'History'}</button>
					<button onclick={newConversation} class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">New</button>
					{#if activeVoice}<button onclick={stopAllVoice} aria-label="Interrupt voice" class="rounded-lg px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800">Stop voice</button>{/if}
					<button bind:this={voiceSettingsTrigger} onclick={() => { voiceSettings = !voiceSettings; if (voiceSettings) {void refreshSpeechPolicy();} if (voiceSettings) void tick().then(() => voiceSettingsPanel?.focus()); }} aria-expanded={voiceSettings} aria-controls="ayla-voice-settings" aria-label="Voice settings" class="rounded-lg px-1.5 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 sm:px-2"><span class="sm:hidden">Voice</span><span class="hidden sm:inline">Voice settings</span></button>
				</div>
			</div>{/if}
			{#if voiceSettings}
				<div bind:this={voiceSettingsPanel} id="ayla-voice-settings" tabindex="-1" class="absolute inset-x-3 top-14 z-40 grid max-h-[calc(100svh-8rem)] content-start gap-4 overflow-y-auto overscroll-contain rounded-2xl border border-surface-200 bg-white p-5 text-sm shadow-[0_22px_70px_-18px_rgba(36,22,18,.5)] outline-none dark:border-surface-700 dark:bg-surface-900 sm:inset-x-auto sm:right-5 sm:w-[min(27rem,calc(100vw-2rem))]" role="dialog" aria-label="Voice settings">
					<div class="flex items-start justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700 dark:text-accent-300">Ayla preferences</p><h2 class="mt-1 text-xl font-semibold tracking-tight">Voice settings</h2></div><button onclick={() => { voiceSettings = false; voiceSettingsTrigger?.focus(); }} aria-label="Close voice settings" class="rounded-lg border border-surface-200 px-2 py-1 dark:border-surface-700">Close</button></div>
					<RichCombobox id="ayla-language" label="Language" value={serverPreferences ? serverLanguage : (speechSnapshot.locale || localeInput)} options={serverPreferences ? serverLanguageChoices : localLanguageChoices} onSelect={(value) => { stopAllVoice(); serverLanguage = value.split('-')[0]; ownedVoiceId = ''; localeInput = value; if (value !== 'auto') void applyLocale(); }} />
					<RichCombobox id="ayla-voice" label="Voice" value={serverPreferences ? ownedVoiceId : selectedVoice} options={serverPreferences ? serverVoiceChoices : [{value: '', label: 'Automatic voice'}, ...localVoiceChoices.slice(1)]} onSelect={(value) => { stopAllVoice(); if (serverPreferences) { const selection = selectServerVoice(conversationalVoice, serverLanguage, value); ownedVoiceId = selection.voice; if (selection.language !== serverLanguage) { serverLanguage = selection.language; localeInput = selection.language; void applyLocale(); } } else { selectedVoice = value; if (speech) speech.voiceName = value; } }} />
					{#if voiceMode !== 'owned' && speechSnapshot.recognition === 'downloadable'}<button onclick={installLocalPack} disabled={installing} class="w-fit rounded-lg border border-surface-300 px-3 py-2 dark:border-surface-600">{installing ? 'Installing language…' : 'Install language'}</button>{/if}
					{#key authSubject}<AylaAdministration {apiUrl} onPolicyChange={() => { stopAllVoice(); void refreshSpeechPolicy(); }} />{/key}
				</div>
			{/if}
			{#if voiceNotice && !isImmersive}<p role="status" class="relative px-2 pb-1 text-xs">{voiceNotice}</p>{/if}
 {#if speechError && !isImmersive}<p class="relative px-2 pb-1 text-xs text-red-700 dark:text-red-300" role="alert">{speechError}</p>{/if}
			<div class="relative min-h-0 flex-1">
				{#if historyOpen && conversationScope}<nav aria-label="Local conversations" class="relative z-10 flex max-h-[45svh] flex-wrap gap-2 overflow-y-auto py-2" inert={authCardOpen}><button onclick={newConversation} class="rounded-lg border border-surface-300 px-3 py-2 text-sm dark:border-surface-600">New conversation</button><label class="w-full text-sm">Search conversation titles<input aria-label="Search conversations" type="search" maxlength="200" value={historyQuery} oninput={(event)=>{historyQuery=event.currentTarget.value;historyPage=0;}} class="mt-1 min-h-11 w-full rounded-lg border border-surface-300 bg-transparent px-3 dark:border-surface-600" /></label><p class="w-full text-xs" aria-live="polite">{filteredSessions.length} conversations · Page {visibleHistoryPage+1} of {historyPageCount}</p>{#each visibleSessions as item}{@const text=historyHighlight(item.title)}<button data-conversation-session={item.id} aria-current={item.current?'true':undefined} disabled={item.current} onclick={()=>{void chooseConversation(item.id);}} class="rounded-lg border border-surface-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-surface-600">{text.before}{#if text.match}<mark>{text.match}</mark>{/if}{text.after}{item.current?' · Current':''}</button><button data-delete-session={item.id} disabled={deletingHistory} aria-label={'Delete '+item.title} onclick={()=>pendingDelete=item.id} class="rounded-lg px-3 py-2 text-sm">Delete</button>{/each}{#if pendingDelete}<div role="group" aria-label="Confirm local conversation deletion" class="w-full"><p>Delete this conversation from this device? Provider records are unaffected.</p><button onclick={()=>{void confirmConversationDelete();}} class="min-h-11 px-3">Delete from this device</button><button onclick={()=>pendingDelete=null} class="min-h-11 px-3">Cancel deletion</button></div>{/if}{#if !filteredSessions.length}<p>No matching conversations.</p>{/if}<div class="flex w-full gap-2"><button disabled={visibleHistoryPage===0} onclick={()=>historyPage=visibleHistoryPage-1} class="min-h-11 rounded-lg border border-surface-300 px-3 text-sm disabled:opacity-50 dark:border-surface-600">Previous conversations</button><button disabled={visibleHistoryPage+1>=historyPageCount} onclick={()=>historyPage=visibleHistoryPage+1} class="min-h-11 rounded-lg border border-surface-300 px-3 text-sm disabled:opacity-50 dark:border-surface-600">Next conversations</button></div>{#if historyError}<p role="alert">{historyError}</p>{/if}</nav>{/if}
				<AylaSignIn {apiUrl} open={authCardOpen} onClose={closeSignIn} onStatus={onIdentityStatus} />
				{#if isImmersive}
					{#if !historyOpen}<div inert={authCardOpen} class="absolute inset-0"><AylaScene phase={immersiveState} request={latestRequest} requestId={chat.messages.findLast(m=>m.role==='user')?.id??''} summary={semanticSummary??undefined} response={latestAnswer} error={speechError||(chat.error?'That answer did not arrive. Your request is still here; try again in chat.':'')} active={pageVisible}/></div>{/if}
				{/if}
				{#if isAyla && !isImmersive && !historyOpen && chat.messages.length === 0}
					<div class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-14 text-center">
						<svg class="ayla-aperture {shortAnswer.length > 100 ? 'ayla-aperture--compact' : ''}" data-active={pageVisible && voicePhase !== 'conversation'} viewBox="0 0 360 150" aria-hidden="true">
							<defs><linearGradient id="ayla-light" x1="0" x2="1" y1=".7" y2=".2"><stop stop-color="#7a3f30" stop-opacity="0"/><stop offset=".26" stop-color="#ca8060"/><stop offset=".48" stop-color="#fff0d0"/><stop offset=".75" stop-color="#dc9b75"/><stop offset="1" stop-color="#80402f" stop-opacity="0"/></linearGradient><filter id="ayla-spill" x="-35%" y="-100%" width="170%" height="300%"><feGaussianBlur stdDeviation="12"/></filter></defs>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)" opacity=".7" filter="url(#ayla-spill)"/>
							<path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="url(#ayla-light)"/>
							<path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/>
							<path d="M49 91 C109 59 152 51 199 68 C248 86 287 51 326 38" fill="none" stroke="#fff2dc" stroke-width="2" opacity=".75"/>
						</svg>
						<p class="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent-700 dark:text-accent-300">Ayla</p>
						{#if shortAnswer}<p class="mt-4 text-balance font-medium tracking-tight {shortAnswer.length > 100 ? 'max-w-[30ch] text-[1.375rem] leading-snug sm:max-w-[32ch] sm:text-3xl' : 'max-w-[20ch] text-3xl leading-tight sm:max-w-[26ch] sm:text-5xl'}" aria-live="polite">{shortAnswer}</p>{:else}<h1 class="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">I’m here.</h1>{/if}
					</div>
				{/if}
				{#if ready}
					<div class="relative h-full" inert={authCardOpen}><Assistant {apiUrl} pageContext={currentContext} session={chat} immersive showIntro={false} showHistory={historyOpen || (isAyla&&!isImmersive)} spotlight={isImmersive&&!historyOpen} showComposer={!isImmersive || chatIslandOpen} preservePending={isImmersive} showSpeak={!isImmersive} speakAvailable={voiceReady} speechActive={activeVoice !== ''} speakLabel={voiceActionLabel} onSpeak={() => { void toggleVoice(); }} onStopVoice={stopAllVoice} onBeforeSend={stopAllVoice} onAuthIntent={openSignInIntent} suggestions={[]} placeholder="Ask Ayla…" /></div>
				{:else}
					<p class="p-4 text-sm text-surface-500">Opening this device’s conversation…</p>
				{/if}
			</div>
			{#if managedOffer&&!authCardOpen}<ManagedActionPane action={managedOffer} catalogSlugs={projects.map(p=>p.slug)} requestedSignIn={managedOffer.type==='show_login'&&managedOffer.requestId===managedRequestId} stopVoice={stopAllVoice} onSignIn={openSignIn} onNavigate={(action)=>window.dispatchEvent(new CustomEvent('ayla:navigate',{detail:action}))} onDismiss={()=>managedOffer=null}/>{/if}
			{#if isImmersive}{#if voiceNotice}<p role="status" class="relative z-10 px-4 pb-2 text-center text-xs text-surface-600 dark:text-warm-300">{voiceNotice}</p>{/if}<div inert={authCardOpen} class="relative flex justify-center gap-4 pb-4"><button onclick={() => { void toggleVoice(); }} disabled={!voiceReady && !activeVoice} aria-label={voiceActionLabel} class="ayla-immersive-control" title={voiceActionLabel}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg><span>Mic</span></button><button bind:this={chatTrigger} onclick={() => chatIslandOpen = !chatIslandOpen} aria-expanded={chatIslandOpen} aria-controls="ayla-immersive-composer" class="ayla-immersive-control"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H8l-4 3V5Z"/></svg><span>Chat</span></button></div>{/if}
		</section>
		{/if}
	</div>
</div>
