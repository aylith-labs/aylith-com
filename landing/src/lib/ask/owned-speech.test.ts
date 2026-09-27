import type { UIMessage } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type OwnedAvailability, OwnedSpeech, visibleVoiceContext, watchOwnedAvailability } from './owned-speech';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

function turn(role: 'user' | 'assistant', content: string): UIMessage {
	return { id: crypto.randomUUID(), role, parts: [{ type: 'text', text: content }] };
}

describe('owned voice fallback', () => {
	it('observes a provider catalog that becomes ready after the first short refresh, then stops polling on cleanup', async () => {
		vi.useFakeTimers();
		const base: OwnedAvailability = { ready: true, ttsReady: true, cartesiaTtsReady: false, cartesiaDiscoveryPending: true, readyLanguages: ['en'], readyVoices: [{ id: 'piper', locale: 'en_US' }], maxRecordingSeconds: 30 };
		let calls = 0;
		const probe = vi.fn(async () => { calls++; return calls === 4 ? { ...base, cartesiaTtsReady: true, cartesiaDiscoveryPending: false } : base; });
		const snapshots: OwnedAvailability[] = [];
		const stop = watchOwnedAvailability(probe, (snapshot) => snapshots.push(snapshot));
		await vi.advanceTimersByTimeAsync(5000);
		expect(snapshots).toHaveLength(3);
		expect(snapshots.at(-1)?.cartesiaDiscoveryPending).toBe(true);
		await vi.advanceTimersByTimeAsync(12000);
		expect(snapshots.at(-1)?.cartesiaTtsReady).toBe(true);
		stop();
		await vi.advanceTimersByTimeAsync(20000);
		expect(probe).toHaveBeenCalledTimes(4);
	});

	it('does not treat a coarse Cartesia availability flag as a ready multilingual voice', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
			stt: { serverAvailable: true, readyLanguages: ['en', 'hu'] },
			tts: { serverAvailable: true, readyVoices: [{ id: 'piper', locale: 'en_US' }] },
			providers: { owned: { stt: true, tts: true }, cartesia: { serverAvailable: true, tts: { discoveryPending: true, readyLanguages: [], readyVoices: [] } } }
		}))));
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer: () => {}, onAction: () => {}, context: () => [] });
		const availability = await speech.probe();
		expect(availability.ready).toBe(true);
		expect(availability.cartesiaTtsReady).toBe(false);
		expect(availability.cartesiaDiscoveryPending).toBe(true);
	});

	it('opts into cloud narration only when native-language Cartesia TTS is ready', async () => {
		let microphoneRequested: (() => void) | undefined;
		let grantMicrophone: ((stream: MediaStream) => void) | undefined;
		const requested = new Promise<void>((resolve) => { microphoneRequested = resolve; });
		const getUserMedia = vi.fn(() => { microphoneRequested?.(); return new Promise<MediaStream>((resolve) => { grantMicrophone = resolve; }); });
		vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
		vi.stubGlobal('AudioWorkletNode', class {});
		class Socket {
			static OPEN = 1;
			readyState = 1;
			onopen: (() => void) | null = null;
			onmessage: (() => void) | null = null;
			onclose: (() => void) | null = null;
			onerror: (() => void) | null = null;
			send = vi.fn();
			close = vi.fn();
			constructor() { queueMicrotask(() => this.onopen?.()); }
		}
		vi.stubGlobal('WebSocket', Socket);
		const fetcher = vi.fn(async (input: string, _init?: RequestInit) => input.endsWith('/capabilities')
			? new Response(JSON.stringify({ providers: { cartesia: { serverAvailable: true, tts: { serverAvailable: true, readyLanguages: ['en', 'hu'], readyVoices: [{ id: 'native-en', locale: 'en-US', language: 'en' }, { id: 'native-hu', locale: 'hu-HU', language: 'hu' }] } }, owned: { stt: true, tts: true } }, stt: { serverAvailable: true, readyLanguages: ['en', 'hu'] }, tts: { serverAvailable: true, readyVoices: [{ id: 'piper', locale: 'en_US' }] } }))
			: new Response(JSON.stringify({ url: 'wss://ai.example.test/api/voice/ws' })));
		vi.stubGlobal('fetch', fetcher);
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer: () => {}, onAction: () => {}, context: () => [] });
		const availability = await speech.probe();
		expect(availability.ready).toBe(true);
		expect(availability.cartesiaTtsReady).toBe(true);
		speech.ttsPreference = 'cartesia_then_owned';
		const starting = speech.start();
		await requested;
		expect(JSON.parse(String(fetcher.mock.calls.find((call) => call[0].endsWith('/sessions'))?.[1]?.body))).toEqual({ provider: 'owned', ttsPreference: 'cartesia_then_owned' });
		await speech.stop();
		grantMicrophone?.({ getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream);
		await starting;
	});

	it('ignores delayed action, text, and audio after interrupting an active turn and starting another', async () => {
		vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop: vi.fn() }] }) } });
		const audioStarts = vi.fn();
		class Context {
			state = 'running';
			destination = {};
			audioWorklet = { addModule: async () => {} };
			resume = async () => {};
			close = async () => { this.state = 'closed'; };
			createMediaStreamSource = () => ({ connect: () => {} });
			createGain = () => ({ gain: { value: 0 }, connect: () => ({}) });
			createBuffer = () => ({ getChannelData: () => new Float32Array(2), duration: 0.1 });
			createBufferSource = () => ({ connect: () => {}, start: audioStarts, stop: vi.fn(), onended: null });
		}
		class Capture {
			port = { onmessage: null, postMessage: vi.fn() };
			disconnect = vi.fn();
			connect = () => ({ connect: () => {} });
		}
		vi.stubGlobal('AudioContext', Context);
		vi.stubGlobal('AudioWorkletNode', Capture);
		class Socket {
			static OPEN = 1;
			static instances: Socket[] = [];
			readyState = 1;
			onopen: (() => void) | null = null;
			onmessage: ((event: { data: string }) => void) | null = null;
			onclose: (() => void) | null = null;
			onerror: (() => void) | null = null;
			send = vi.fn();
			close = vi.fn();
			constructor() { Socket.instances.push(this); queueMicrotask(() => this.onopen?.()); }
		}
		vi.stubGlobal('WebSocket', Socket);
		vi.stubGlobal('fetch', vi.fn(async (input: string) => input.endsWith('/capabilities')
			? new Response(JSON.stringify({ stt: { serverAvailable: true, readyLanguages: ['en'], maxRecordingSeconds: 30 }, tts: { serverAvailable: true, readyVoices: [{ id: 'voice', locale: 'en_US' }] }, providers: { owned: { stt: true, tts: true } } }))
			: new Response(JSON.stringify({ url: 'wss://ai.example.test/api/voice/ws' }))));
		const onAction = vi.fn(), onAnswer = vi.fn(), onVoice = vi.fn();
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer, onAction, onVoice, context: () => [] });
		await speech.start();
		const firstTurnId = JSON.parse(String(Socket.instances[0].send.mock.calls.find((call) => JSON.parse(String(call[0])).type === 'mic.start')?.[0])).turnId;
		expect(typeof firstTurnId).toBe('string');
		await speech.stop();
		await speech.start();
		const secondTurnId = JSON.parse(String(Socket.instances[1].send.mock.calls.find((call) => JSON.parse(String(call[0])).type === 'mic.start')?.[0])).turnId;
		expect(secondTurnId).not.toBe(firstTurnId);
		Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'assistant.action', turnId: firstTurnId, action: { type: 'open_project', slug: 'torbie', view: 'website' } }) });
		Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'assistant.audio', turnId: firstTurnId, data: 'AAAA', format: 'pcm_s16le', sampleRate: 24000 }) });
		Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'assistant.text', turnId: firstTurnId, text: 'late', final: true }) });
		Socket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'assistant.voice', turnId: firstTurnId, voiceId: 'old', locale: 'hu-HU', provider: 'cartesia' }) });
		expect(onAction).not.toHaveBeenCalled();
		expect(onAnswer).not.toHaveBeenCalled();
		expect(onVoice).not.toHaveBeenCalled();
		expect(audioStarts).not.toHaveBeenCalled();
		Socket.instances[1].onmessage?.({ data: JSON.stringify({ type: 'assistant.voice', turnId: secondTurnId, voiceId: 'native-hu', locale: 'hu-HU', provider: 'cartesia' }) });
		expect(onVoice).toHaveBeenCalledWith({ id: 'native-hu', locale: 'hu-HU', provider: 'cartesia' });
		expect(Socket.instances[1].send.mock.calls.map((call) => JSON.parse(String(call[0])).type)).toEqual(['mic.start']);
		await speech.stop();
	});
	it('sends a bounded, visible text history to the owned voice turn', () => {
		const messages = [turn('user', 'First'), turn('assistant', 'Answer'), ...Array.from({ length: 12 }, (_, index) => turn('user', `Question ${index}`))];
		expect(visibleVoiceContext(messages)).toEqual(Array.from({ length: 8 }, (_, index) => ({ role: 'user', content: `Question ${index + 4}` })));
	});

	it('will not open a microphone or owned session when the server has no ready speech models', async () => {
		const fetcher = vi.fn(async (_input: string) => new Response(JSON.stringify({ stt: { serverAvailable: false, readyLanguages: [] }, tts: { serverAvailable: false, readyVoices: [] }, providers: { owned: { stt: false, tts: false } } }), { status: 200 }));
		vi.stubGlobal('fetch', fetcher);
		vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn() } });
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer: () => {}, onAction: () => {}, context: () => [] });
		expect((await speech.probe()).ready).toBe(false);
		await expect(speech.start()).rejects.toThrow('not ready');
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(fetcher.mock.calls.every((call) => String(call[0]).endsWith('/api/voice/capabilities'))).toBe(true);
		expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
	});

	it('releases a late microphone grant after interruption without starting a stale turn', async () => {
		let grantMicrophone: ((stream: MediaStream) => void) | undefined;
		let microphoneRequested: (() => void) | undefined;
		const requested = new Promise<void>((resolve) => { microphoneRequested = resolve; });
		const track = { stop: vi.fn() };
		const getUserMedia = vi.fn(() => { microphoneRequested?.(); return new Promise<MediaStream>((resolve) => { grantMicrophone = resolve; }); });
		vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
		vi.stubGlobal('AudioWorkletNode', class {});
		class Socket {
			static OPEN = 1;
			readyState = 1;
			onopen: (() => void) | null = null;
			onmessage: (() => void) | null = null;
			onclose: (() => void) | null = null;
			onerror: (() => void) | null = null;
			send = vi.fn();
			close = vi.fn();
			constructor() { queueMicrotask(() => this.onopen?.()); }
		}
		vi.stubGlobal('WebSocket', Socket);
		vi.stubGlobal('fetch', vi.fn(async (input: string) => input.endsWith('/capabilities')
			? new Response(JSON.stringify({ stt: { serverAvailable: true, readyLanguages: ['en'], maxRecordingSeconds: 30 }, tts: { serverAvailable: false, readyVoices: [] }, providers: { owned: { stt: true, tts: false } } }))
			: new Response(JSON.stringify({ url: 'wss://ai.example.test/api/voice/ws' }))));
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer: () => {}, onAction: () => {}, context: () => [] });
		const start = speech.start();
		await requested;
		await speech.stop();
		grantMicrophone?.({ getTracks: () => [track] } as unknown as MediaStream);
		await start;
		expect(track.stop).toHaveBeenCalledOnce();
		expect(getUserMedia).toHaveBeenCalledOnce();
	});

	it('does not send mic.stop from an old flush after the turn was interrupted', async () => {
		const track = { stop: vi.fn() };
		vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [track] }) } });
		class Context {
			state = 'running';
			destination = {};
			audioWorklet = { addModule: async () => {} };
			resume = async () => {};
			close = async () => { this.state = 'closed'; };
			createMediaStreamSource = () => ({ connect: () => {} });
			createGain = () => ({ gain: { value: 0 }, connect: () => ({}) });
		}
		class Capture {
			static instances: Capture[] = [];
			port = { postMessage: vi.fn(), onmessage: null as ((event: { data: { flushed: true } }) => void) | null };
			disconnect = vi.fn();
			connect = () => ({ connect: () => {} });
			constructor() { Capture.instances.push(this); }
		}
		class Socket {
			static OPEN = 1;
			static instances: Socket[] = [];
			readyState = 1;
			onopen: (() => void) | null = null;
			onmessage: (() => void) | null = null;
			onclose: (() => void) | null = null;
			onerror: (() => void) | null = null;
			send = vi.fn();
			close = vi.fn();
			constructor() { Socket.instances.push(this); queueMicrotask(() => this.onopen?.()); }
		}
		vi.stubGlobal('AudioContext', Context);
		vi.stubGlobal('AudioWorkletNode', Capture);
		vi.stubGlobal('WebSocket', Socket);
		vi.stubGlobal('fetch', vi.fn(async (input: string) => input.endsWith('/capabilities')
			? new Response(JSON.stringify({ stt: { serverAvailable: true, readyLanguages: ['en'], maxRecordingSeconds: 30 }, tts: { serverAvailable: false, readyVoices: [] }, providers: { owned: { stt: true, tts: false } } }))
			: new Response(JSON.stringify({ url: 'wss://ai.example.test/api/voice/ws' }))));
		const speech = new OwnedSpeech('https://ai.example.test', { onTranscript: () => {}, onAnswer: () => {}, onAction: () => {}, context: () => [] });
		await speech.start();
		const finishing = speech.finish();
		await speech.stop();
		Capture.instances[0].port.onmessage?.({ data: { flushed: true } });
		await finishing;
		const sentTypes = Socket.instances[0].send.mock.calls.filter((call) => typeof call[0] === 'string').map((call) => JSON.parse(call[0]).type);
		expect(sentTypes).toContain('mic.start');
		expect(sentTypes).toContain('interrupt');
		expect(sentTypes).not.toContain('mic.stop');
		expect(track.stop).toHaveBeenCalled();
	});
});
