import type { UIMessage } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnedSpeech, visibleVoiceContext } from './owned-speech';

afterEach(() => vi.unstubAllGlobals());

function turn(role: 'user' | 'assistant', content: string): UIMessage {
	return { id: crypto.randomUUID(), role, parts: [{ type: 'text', text: content }] };
}

describe('owned voice fallback', () => {
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
