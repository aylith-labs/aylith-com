import type { UIMessage } from 'ai';

type ContextTurn = { role: 'user' | 'assistant'; content: string };
export type VoiceSessionProvider = 'owned' | 'cartesia';
export type OwnedAvailability = { ready: boolean; ttsReady: boolean; readyLanguages: string[]; readyVoices: { id: string; locale: string }[]; maxRecordingSeconds: number };
type OwnedCallbacks = {
	context: () => UIMessage[];
	onTranscript: (text: string, language?: string) => void;
	onAnswer: (text: string, final: boolean) => void;
	onAction: (action: unknown) => void;
	onVoice?: (voice: { id: string; locale: string }) => void;
	onAudioUnavailable?: (language?: string) => void;
	onState?: (state: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error', detail?: string) => void;
};

/** The server sees the same recent plain-text turns that are visible in Ayla. */
export function visibleVoiceContext(messages: UIMessage[]): ContextTurn[] {
	let remaining = 3000;
	const result: ContextTurn[] = [];
	for (const message of messages.slice().reverse()) {
		if (result.length >= 8 || remaining <= 0) break;
		if (message.role !== 'user' && message.role !== 'assistant') continue;
		const content = message.parts.filter((part) => part.type === 'text').map((part) => 'text' in part ? part.text : '').join('').trim().slice(0, Math.min(500, remaining));
		if (!content) continue;
		result.push({ role: message.role, content });
		remaining -= content.length;
	}
	return result.reverse();
}

type Turn = {
	epoch: number;
	id: string;
	socket?: WebSocket;
	stream?: MediaStream;
	input?: AudioContext;
	output?: AudioContext;
	capture?: AudioWorkletNode;
	recording: boolean;
	finishing: boolean;
	sentBytes: number;
	maxBytes: number;
	flush?: () => void;
	timer?: ReturnType<typeof setTimeout>;
	playing: Set<AudioBufferSourceNode>;
	nextAudioTime: number;
	done: boolean;
};

export class OwnedSpeech {
	private epoch = 0;
	private current?: Turn;
	voiceId = '';
	language = 'auto';

	constructor(private readonly apiUrl: string, private readonly callbacks: OwnedCallbacks, private readonly provider: VoiceSessionProvider = 'owned') {}

	async probe(): Promise<OwnedAvailability> {
		try {
			const response = await fetch(`${this.apiUrl}/api/voice/capabilities`, { cache: 'no-store' });
			if (!response.ok) throw new Error('The voice gateway is unavailable.');
			const data = await response.json() as Record<string, unknown>;
			const stt = data.stt as { serverAvailable?: unknown; readyLanguages?: unknown; maxRecordingSeconds?: unknown } | undefined;
			const tts = data.tts as { serverAvailable?: unknown; readyVoices?: unknown } | undefined;
			const providers = data.providers as { owned?: { stt?: unknown; tts?: unknown }; cartesia?: { serverAvailable?: unknown } } | undefined;
			if (this.provider === 'cartesia') {
				const ready = providers?.cartesia?.serverAvailable === true;
				return { ready, ttsReady: ready, readyLanguages: [], readyVoices: [], maxRecordingSeconds: 30 };
			}
			const provider = providers?.owned;
			const readyLanguages = Array.isArray(stt?.readyLanguages) ? stt.readyLanguages.filter((item): item is string => typeof item === 'string') : [];
			const readyVoices = Array.isArray(tts?.readyVoices) ? tts.readyVoices.filter((item): item is { id: string; locale: string } => typeof item?.id === 'string' && typeof item?.locale === 'string') : [];
			return { ready: provider?.stt === true && stt?.serverAvailable === true && readyLanguages.length > 0,
				ttsReady: provider?.tts === true && tts?.serverAvailable === true && readyVoices.length > 0, readyLanguages, readyVoices,
				maxRecordingSeconds: typeof stt?.maxRecordingSeconds === 'number' ? Math.min(30, stt.maxRecordingSeconds) : 30 };
		} catch { return { ready: false, ttsReady: false, readyLanguages: [], readyVoices: [], maxRecordingSeconds: 30 }; }
	}

	private isCurrent(turn: Turn): boolean { return this.current === turn && turn.epoch === this.epoch; }

	private send(turn: Turn, type: string, extra: Record<string, unknown> = {}) {
		if (turn.socket?.readyState === WebSocket.OPEN) turn.socket.send(JSON.stringify({ type, turnId: turn.id, ...extra }));
	}

	private async openSession(turn: Turn): Promise<void> {
		const response = await fetch(`${this.apiUrl}/api/voice/sessions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ provider: this.provider, ...(this.voiceId ? { voiceId: this.voiceId } : {}) }) });
		if (!response.ok) throw new Error('The Aylith voice server could not start a session.');
		const session = await response.json() as { url?: unknown };
		if (!this.isCurrent(turn)) return;
		if (typeof session.url !== 'string') throw new Error('The voice server returned no connection address.');
		const target = new URL(session.url);
		const gateway = new URL(this.apiUrl);
		if (target.host !== gateway.host || target.protocol !== (gateway.protocol === 'https:' ? 'wss:' : 'ws:') || target.pathname !== '/api/voice/ws' || target.username || target.password || target.hash) throw new Error('The voice server returned an unexpected connection address.');
		const socket = new WebSocket(target);
		turn.socket = socket;
		socket.onmessage = (event) => this.receive(turn, event);
		socket.onclose = () => { if (this.isCurrent(turn)) { void this.stop().then(() => { if (this.epoch === turn.epoch + 1) this.callbacks.onState?.('error', 'The voice connection closed.'); }); } };
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error('Voice connection timed out.')), 8000);
			socket.onopen = () => { clearTimeout(timeout); resolve(); };
			socket.onerror = () => { clearTimeout(timeout); reject(new Error('Voice connection failed.')); };
		});
	}

	async start(): Promise<void> {
		const cleanup = this.stop();
		const epoch = this.epoch;
		await cleanup;
		if (epoch !== this.epoch) return;
		const available = await this.probe();
		if (epoch !== this.epoch) return;
		if (!available.ready) throw new Error('The Aylith voice server is not ready for speech.');
		if (this.provider === 'owned' && this.voiceId && !available.readyVoices.some((voice) => voice.id === this.voiceId)) throw new Error('The selected server voice is not ready.');
		if (this.provider === 'owned' && this.language !== 'auto' && !available.readyLanguages.some((lang) => lang.toLowerCase() === this.language.toLowerCase().split('-')[0])) throw new Error('The selected server speech language is not ready.');
		if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === 'undefined') throw new Error('Microphone capture is unavailable in this browser.');
		const turn: Turn = { epoch, id: crypto.randomUUID(), recording: false, finishing: false, sentBytes: 0, maxBytes: Math.floor(Math.max(1, available.maxRecordingSeconds) * 16000 * 2), playing: new Set(), nextAudioTime: 0, done: false };
		this.current = turn;
		this.callbacks.onState?.('connecting');
		try {
			await this.openSession(turn);
			if (!this.isCurrent(turn)) return;
			const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
			if (!this.isCurrent(turn)) { stream.getTracks().forEach((track) => { track.stop(); }); return; }
			turn.stream = stream;
			turn.input = new AudioContext({ sampleRate: 16000 });
			turn.output = new AudioContext({ sampleRate: 24000 });
			await Promise.all([turn.input.resume(), turn.output.resume()]);
			if (!this.isCurrent(turn)) return;
			await turn.input.audioWorklet.addModule('/voice-capture-worklet.js');
			if (!this.isCurrent(turn)) return;
			const capture = new AudioWorkletNode(turn.input, 'ayla-pcm16-capture');
			turn.capture = capture;
			capture.port.onmessage = (event: MessageEvent<ArrayBuffer | { flushed: true }>) => {
				if (!this.isCurrent(turn)) return;
				if (event.data instanceof ArrayBuffer && turn.recording && turn.socket?.readyState === WebSocket.OPEN) {
					const remaining = turn.maxBytes - turn.sentBytes;
					if (remaining > 0) { const chunk = event.data.byteLength <= remaining ? event.data : event.data.slice(0, remaining); turn.socket.send(chunk); turn.sentBytes += chunk.byteLength; }
					if (turn.sentBytes >= turn.maxBytes && !turn.finishing) void this.finish();
				}
				else if (!(event.data instanceof ArrayBuffer) && event.data?.flushed) turn.flush?.();
			};
			const source = turn.input.createMediaStreamSource(stream);
			const silent = turn.input.createGain(); silent.gain.value = 0;
			source.connect(capture); capture.connect(silent).connect(turn.input.destination);
			turn.recording = true;
			this.send(turn, 'mic.start', { language: this.language, context: visibleVoiceContext(this.callbacks.context()), clientCapabilities: { projectNavigation: true, experienceNavigation: true } });
			turn.timer = setTimeout(() => { void this.finish(); }, Math.max(1, available.maxRecordingSeconds) * 1000);
			this.callbacks.onState?.('listening');
		} catch (cause) {
			if (this.isCurrent(turn)) { await this.stop(); if (this.epoch === turn.epoch + 1) this.callbacks.onState?.('error', cause instanceof Error ? cause.message : 'Voice could not start.'); throw cause; }
		}
	}

	async finish(): Promise<void> {
		const turn = this.current;
		if (!turn?.recording || turn.finishing) return;
		turn.finishing = true;
		if (turn.timer) clearTimeout(turn.timer);
		if (turn.capture) {
			await Promise.race([new Promise<void>((resolve) => { turn.flush = resolve; turn.capture?.port.postMessage('flush'); }), new Promise<void>((resolve) => setTimeout(resolve, 200))]);
		}
		if (!this.isCurrent(turn)) return;
		turn.recording = false;
		this.send(turn, 'mic.stop');
		await this.closeInput(turn);
		if (this.isCurrent(turn)) this.callbacks.onState?.('thinking');
	}

	private async closeInput(turn: Turn): Promise<void> {
		turn.capture?.disconnect(); turn.capture = undefined; turn.flush = undefined;
		turn.stream?.getTracks().forEach((track) => { track.stop(); }); turn.stream = undefined;
		const context = turn.input; turn.input = undefined;
		if (context && context.state !== 'closed') await context.close();
	}

	private play(turn: Turn, data: string) {
		const output = turn.output;
		if (!output || !this.isCurrent(turn)) return;
		const raw = atob(data);
		const count = Math.floor(raw.length / 2);
		const buffer = output.createBuffer(1, count, 24000);
		const samples = buffer.getChannelData(0);
		for (let index = 0; index < count; index++) {
			const value = (raw.charCodeAt(index * 2 + 1) << 8) | raw.charCodeAt(index * 2);
			samples[index] = (value >= 0x8000 ? value - 0x10000 : value) / 0x8000;
		}
		const source = output.createBufferSource(); source.buffer = buffer; source.connect(output.destination);
		source.onended = () => { turn.playing.delete(source); if (turn.done && turn.playing.size === 0 && this.isCurrent(turn)) void this.stop(false); };
		const start = Math.max(output.currentTime + .02, turn.nextAudioTime);
		source.start(start); turn.nextAudioTime = start + buffer.duration; turn.playing.add(source);
		this.callbacks.onState?.('speaking');
	}

	private receive(turn: Turn, event: MessageEvent) {
		if (!this.isCurrent(turn)) return;
		let message: Record<string, unknown>;
		try { message = JSON.parse(String(event.data)) as Record<string, unknown>; } catch { return; }
		if (message.turnId !== turn.id) return;
		if (message.type === 'transcript' && message.final === true && typeof message.text === 'string') this.callbacks.onTranscript(message.text, typeof message.language === 'string' ? message.language : undefined);
		if (message.type === 'assistant.text' && typeof message.text === 'string') this.callbacks.onAnswer(message.text, message.final === true);
		if (message.type === 'assistant.action') this.callbacks.onAction(message.action);
		if (message.type === 'assistant.audio.unavailable') this.callbacks.onAudioUnavailable?.(typeof message.language === 'string' ? message.language : undefined);
		if (message.type === 'assistant.voice' && typeof message.voiceId === 'string' && typeof message.locale === 'string') this.callbacks.onVoice?.({ id: message.voiceId, locale: message.locale });
		if (message.type === 'assistant.audio' && typeof message.data === 'string' && message.format === 'pcm_s16le' && message.sampleRate === 24000) this.play(turn, message.data);
		if (message.type === 'error') { const detail = typeof message.message === 'string' ? message.message : 'Voice turn failed.'; void this.stop(false).then(() => { if (this.epoch === turn.epoch + 1) this.callbacks.onState?.('error', detail); }); }
		if (message.type === 'turn.done') {
			turn.done = true;
			if (turn.playing.size === 0) void this.stop(false);
			else if (turn.socket) { turn.socket.onclose = null; turn.socket.close(); turn.socket = undefined; }
		}
	}

	async stop(interrupt = true): Promise<void> {
		this.epoch++;
		const turn = this.current;
		this.current = undefined;
		if (!turn) return;
		if (turn.timer) clearTimeout(turn.timer);
		turn.recording = false;
		if (interrupt) this.send(turn, 'interrupt');
		const socket = turn.socket; turn.socket = undefined;
		if (socket) { socket.onclose = null; socket.close(); }
		const closingInput = this.closeInput(turn);
		for (const source of turn.playing) { try { source.stop(); } catch { /* Already complete. */ } }
		turn.playing.clear();
		const output = turn.output; turn.output = undefined;
		const closingOutput = output && output.state !== 'closed' ? output.close() : Promise.resolve();
		await Promise.allSettled([closingInput, closingOutput]);
		if (this.epoch === turn.epoch + 1) this.callbacks.onState?.('idle');
	}
}
