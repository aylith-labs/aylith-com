<script lang="ts">
	import { onDestroy } from 'svelte';

	let { apiUrl, voiceLabel }: { apiUrl: string; voiceLabel: string } = $props();
	let status = $state('Ready to connect');
	let error = $state('');
	let transcript = $state('');
	let answer = $state('');
	let draft = $state('');
	let connected = $state(false);
	let connecting = $state(false);
	let recording = $state(false);
	let busy = $state(false);

	let socket: WebSocket | undefined;
	let micStream: MediaStream | undefined;
	let inputContext: AudioContext | undefined;
	let outputContext: AudioContext | undefined;
	let capture: AudioWorkletNode | undefined;
	let flushed: (() => void) | undefined;
	let currentTurn = '';
	let nextAudioTime = 0;
	let destroyed = false;
	const playing = new Set<AudioBufferSourceNode>();

	function send(type: string, extra: Record<string, unknown> = {}) {
		if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type, turnId: currentTurn, ...extra }));
	}

	function stopAudio() {
		for (const source of playing) {
			try { source.stop(); } catch { /* already finished */ }
		}
		playing.clear();
		nextAudioTime = 0;
	}

	function playPcm(base64: string) {
		if (!outputContext) return;
		const raw = atob(base64);
		const count = Math.floor(raw.length / 2);
		const buffer = outputContext.createBuffer(1, count, 24000);
		const samples = buffer.getChannelData(0);
		for (let index = 0; index < count; index++) {
			const lo = raw.charCodeAt(index * 2);
			const hi = raw.charCodeAt(index * 2 + 1);
			const signed = (hi << 8) | lo;
			samples[index] = (signed >= 0x8000 ? signed - 0x10000 : signed) / 0x8000;
		}
		const source = outputContext.createBufferSource();
		source.buffer = buffer;
		source.connect(outputContext.destination);
		source.onended = () => playing.delete(source);
		const start = Math.max(outputContext.currentTime + 0.02, nextAudioTime);
		source.start(start);
		nextAudioTime = start + buffer.duration;
		playing.add(source);
	}

	async function stopMic(sendStop = true) {
		if (sendStop && recording && capture) {
			const done = new Promise<void>((resolve) => { flushed = resolve; });
			capture.port.postMessage('flush');
			await Promise.race([done, new Promise<void>((resolve) => window.setTimeout(resolve, 200))]);
		}
		if (sendStop && recording) send('mic.stop');
		recording = false;
		flushed = undefined;
		capture?.disconnect();
		capture = undefined;
		micStream?.getTracks().forEach((track) => track.stop());
		micStream = undefined;
		const context = inputContext;
		inputContext = undefined;
		if (context && context.state !== 'closed') await context.close();
	}

	async function disconnect() {
		await stopMic(false);
		stopAudio();
		socket?.close();
		socket = undefined;
		const context = outputContext;
		outputContext = undefined;
		if (context && context.state !== 'closed') await context.close();
		connected = false;
		busy = false;
		status = 'Disconnected';
	}

	function onServerMessage(event: MessageEvent) {
		let message: Record<string, unknown>;
		try { message = JSON.parse(String(event.data)); } catch { return; }
		if (message.type === 'error') {
			error = String(message.message ?? 'Voice service error');
			status = 'Voice error';
			busy = false;
			void stopMic(false);
			return;
		}
		if (message.turnId !== currentTurn) return;
		if (message.type === 'transcript') transcript = String(message.text ?? '');
		if (message.type === 'assistant.text') {
			answer = message.final ? String(message.text ?? '') : answer + String(message.text ?? '');
			status = 'Ayla is answering';
		}
		if (message.type === 'assistant.audio' && typeof message.data === 'string') {
			playPcm(message.data);
			status = `${voiceLabel} is speaking`;
		}
		if (message.type === 'turn.done') {
			busy = false;
			status = 'Ready for another turn';
		}
	}

	async function connect() {
		if (connected || connecting) return;
		connecting = true;
		error = '';
		status = 'Connecting';
		try {
			outputContext = new AudioContext({ sampleRate: 24000 });
			await outputContext.resume();
			const response = await fetch(`${apiUrl}/api/voice/sessions`, { method: 'POST' });
			if (!response.ok) throw new Error('The voice gateway could not start a session.');
			const session = await response.json() as { url: string };
			if (destroyed) throw new Error('The voice view closed.');
			const endpoint = new URL(session.url);
			const gateway = new URL(apiUrl);
			if (endpoint.host !== gateway.host || endpoint.protocol !== (gateway.protocol === 'https:' ? 'wss:' : 'ws:') || endpoint.pathname !== '/api/voice/ws' || endpoint.username || endpoint.password || endpoint.hash) throw new Error('The voice gateway returned an unexpected connection address.');
			const ws = new WebSocket(endpoint);
			socket = ws;
			ws.onmessage = onServerMessage;
			ws.onclose = () => { connected = false; recording = false; busy = false; status = 'Disconnected'; void stopMic(false); stopAudio(); };
			ws.onerror = () => { error = 'The voice connection was interrupted.'; };
			await new Promise<void>((resolve, reject) => {
				ws.onopen = () => resolve();
				const timer = window.setTimeout(() => reject(new Error('The voice connection timed out.')), 8000);
				ws.addEventListener('open', () => window.clearTimeout(timer), { once: true });
				ws.addEventListener('close', () => { window.clearTimeout(timer); reject(new Error('The voice connection closed.')); }, { once: true });
			});
			connected = true;
			connecting = false;
			status = 'Connected';
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : '';
			error = /failed to fetch|networkerror|load failed/i.test(message)
				? 'The voice gateway is not reachable from this page.'
				: message || 'Voice is unavailable.';
			await disconnect();
			connecting = false;
		}
	}

	async function startMic() {
		if (!connected || recording || !navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) {
			error = 'Microphone capture is unavailable in this browser.';
			return;
		}
		try {
			micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
			if (destroyed) { await stopMic(false); return; }
			inputContext = new AudioContext({ sampleRate: 16000 });
			await inputContext.audioWorklet.addModule('/voice-capture-worklet.js');
			capture = new AudioWorkletNode(inputContext, 'ayla-pcm16-capture');
			capture.port.onmessage = (event: MessageEvent<ArrayBuffer | { flushed: true }>) => {
				if (event.data instanceof ArrayBuffer) {
					if (recording && socket?.readyState === WebSocket.OPEN) socket.send(event.data);
				} else if (event.data?.flushed) flushed?.();
			};
			const source = inputContext.createMediaStreamSource(micStream);
			const silent = inputContext.createGain();
			silent.gain.value = 0;
			source.connect(capture);
			capture.connect(silent).connect(inputContext.destination);
			currentTurn = crypto.randomUUID();
			transcript = '';
			answer = '';
			stopAudio();
			send('mic.start');
			recording = true;
			busy = true;
			status = 'Listening';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Microphone access failed.';
			await stopMic(false);
		}
	}

	async function finishMic() {
		if (!recording) return;
		await stopMic();
		status = 'Waiting for Ayla';
	}

	function sendText() {
		const text = draft.trim();
		if (!text || !connected || busy) return;
		currentTurn = crypto.randomUUID();
		transcript = text;
		answer = '';
		draft = '';
		stopAudio();
		send('text', { text });
		busy = true;
		status = 'Waiting for Ayla';
	}

	async function interrupt() {
		if (!connected || !currentTurn) return;
		await stopMic(false);
		send('interrupt');
		stopAudio();
		busy = false;
		status = 'Interrupted';
	}

	onDestroy(() => { destroyed = true; void disconnect(); });
</script>

<div class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700 dark:text-accent-400">Live conversation</p><p class="mt-1 text-sm text-surface-600 dark:text-warm-300" aria-live="polite">{status}</p></div>
		{#if connected}<button onclick={disconnect} class="rounded-lg border border-surface-300 px-3 py-2 text-sm dark:border-surface-700">End session</button>{:else}<button onclick={connect} disabled={connecting} class="rounded-lg bg-accent-selected px-4 py-2 text-sm font-semibold text-on-accent disabled:opacity-50">{connecting ? 'Connecting…' : 'Connect voice'}</button>{/if}
	</div>
	{#if error}<p role="alert" class="rounded-lg border border-accent-300 p-3 text-sm text-accent-800 dark:text-accent-300">{error}</p>{/if}
	{#if connected}
		<div class="flex flex-wrap gap-2">
			{#if recording}<button onclick={finishMic} class="rounded-full bg-accent-selected px-4 py-2 text-sm font-semibold text-on-accent">Finish speaking</button>{:else}<button onclick={startMic} disabled={busy} class="rounded-full border border-surface-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-surface-700">Speak to Ayla</button>{/if}
			<button onclick={interrupt} disabled={!busy && playing.size === 0} class="rounded-full border border-surface-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-surface-700">Interrupt</button>
		</div>
		<div class="flex gap-2"><input aria-label="Type to Ayla in voice session" bind:value={draft} onkeydown={(event) => { if (event.key === 'Enter') sendText(); }} disabled={busy || recording} placeholder="Or type a question…" class="min-w-0 flex-1 rounded-xl border border-surface-300 bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-surface-700" /><button onclick={sendText} disabled={!draft.trim() || busy || recording} class="rounded-xl border border-surface-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-surface-700">Send</button></div>
		<div class="space-y-3 text-sm" aria-live="polite">
			{#if transcript}<p class="rounded-xl bg-surface-100 p-3 text-surface-700 dark:bg-surface-800 dark:text-warm-200"><span class="font-semibold">You:</span> {transcript}</p>{/if}
			{#if answer}<p class="rounded-xl bg-accent-50 p-3 text-surface-900 dark:bg-surface-800 dark:text-warm-50"><span class="font-semibold">Ayla:</span> {answer}</p>{/if}
		</div>
	{/if}
	<p class="mt-auto text-xs text-surface-500 dark:text-surface-400">Microphone audio is sent only while recording is active. End the session to disconnect.</p>
</div>
