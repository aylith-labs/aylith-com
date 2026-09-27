/** Browser speech never uses a network recognition or synthesis service implicitly. */
export type RecognitionAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';
export type SpeechSnapshot = {
	locale: string;
	recognition: RecognitionAvailability;
	localVoices: { name: string; lang: string }[];
};
type RecognitionResult = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; [index: number]: { transcript: string } }> };
type LocalRecognition = {
	processLocally: boolean;
	lang: string;
	interimResults: boolean;
	continuous: boolean;
	onresult: ((event: RecognitionResult) => void) | null;
	onerror: ((event: { error?: string }) => void) | null;
	onend: (() => void) | null;
	start(): void;
	abort(): void;
};
type RecognitionConstructor = {
	new (): LocalRecognition;
	available?: (options: { langs: string[]; processLocally: true }) => Promise<RecognitionAvailability>;
	install?: (options: { langs: string[]; processLocally: true }) => Promise<boolean>;
};

function recognitionConstructor(): RecognitionConstructor | undefined {
	const host = globalThis as typeof globalThis & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
	return host.SpeechRecognition ?? host.webkitSpeechRecognition;
}

function canonicalVoiceTag(value: string): string | null {
	try { return Intl.getCanonicalLocales(value.replaceAll('_', '-'))[0]?.toLowerCase() ?? null; }
	catch { return null; }
}

/** Locale matching for a list already proven local by BrowserSpeech.probe(). */
export function matchingVoiceLocale<T extends { lang: string }>(voices: readonly T[], locale: string): T[] {
	const wanted = canonicalVoiceTag(locale);
	if (!wanted) return [];
	const language = wanted.split('-')[0];
	const exact: T[] = [];
	const regional: T[] = [];
	for (const voice of voices) {
		const tag = canonicalVoiceTag(voice.lang);
		if (tag === wanted) exact.push(voice);
		else if (tag?.split('-')[0] === language) regional.push(voice);
	}
	return [...exact, ...regional];
}

export class BrowserSpeech {
	private recognition?: LocalRecognition;
	private recognitionEpoch = 0;
	private utteranceEpoch = 0;
	locale: string;
	voiceName = '';
	onState?: (state: 'idle' | 'listening' | 'speaking' | 'error', detail?: string) => void;

	constructor(private readonly onTranscript: (text: string) => void, locale?: string) {
		this.locale = locale || (typeof navigator !== 'undefined' ? navigator.language : '') || 'en-US';
	}

	localVoices(): SpeechSynthesisVoice[] {
		if (typeof speechSynthesis === 'undefined') return [];
		return speechSynthesis.getVoices().filter((voice) => voice.localService === true);
	}

	matchingLocalVoices(): SpeechSynthesisVoice[] {
		return matchingVoiceLocale(this.localVoices(), this.locale);
	}

	async probe(): Promise<SpeechSnapshot> {
		const locale = this.locale;
		let recognition: RecognitionAvailability = 'unavailable';
		const Recognition = recognitionConstructor();
		if (Recognition?.available) {
			try {
				const instance = new Recognition();
				if ('processLocally' in instance) {
					const result = await Recognition.available({ langs: [locale], processLocally: true });
					if (['available', 'downloadable', 'downloading'].includes(result)) recognition = result;
				}
			} catch { /* Local pack lookup may be blocked by Permissions-Policy. */ }
		}
		return { locale, recognition, localVoices: this.localVoices().map(({ name, lang }) => ({ name, lang })) };
	}

	async install(): Promise<boolean> {
		const Recognition = recognitionConstructor();
		if (!Recognition?.install || (await this.probe()).recognition !== 'downloadable') return false;
		return Recognition.install({ langs: [this.locale], processLocally: true });
	}

	async start(): Promise<void> {
		this.stopRecognition();
		const epoch = this.recognitionEpoch;
		const snapshot = await this.probe();
		if (epoch !== this.recognitionEpoch) return;
		if (snapshot.recognition !== 'available') throw new Error('No installed local recognition pack is available for this language.');
		const Recognition = recognitionConstructor();
		if (!Recognition) throw new Error('No local recognition API is available.');
		const instance = new Recognition();
		if (!('processLocally' in instance)) throw new Error('This browser cannot guarantee local recognition.');
		instance.processLocally = true;
		instance.lang = this.locale;
		instance.interimResults = false;
		instance.continuous = false;
		let finalDelivered = false;
		instance.onresult = (event) => {
			if (epoch !== this.recognitionEpoch || finalDelivered) return;
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (!result?.isFinal) continue;
				const text = result[0]?.transcript?.trim();
				if (text) { finalDelivered = true; this.onTranscript(text); break; }
			}
		};
		instance.onerror = (event) => { if (epoch !== this.recognitionEpoch) return; this.onState?.('error', event.error || 'Recognition failed.'); this.recognition = undefined; };
		instance.onend = () => { if (epoch === this.recognitionEpoch && this.recognition === instance) { this.recognition = undefined; this.onState?.('idle'); } };
		this.recognition = instance;
		try { instance.start(); this.onState?.('listening'); }
		catch (cause) { this.recognition = undefined; this.onState?.('error', cause instanceof Error ? cause.message : 'Microphone could not start.'); throw cause; }
	}

	stopRecognition(): void {
		this.recognitionEpoch++;
		const active = this.recognition;
		this.recognition = undefined;
		if (active) { active.onresult = null; active.onend = null; active.onerror = null; active.abort(); this.onState?.('idle'); }
	}

	speak(text: string): boolean {
		if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return false;
		const voices = this.matchingLocalVoices();
		const voice = voices.find((item) => item.name === this.voiceName) ?? voices[0];
		if (!voice || !text.trim()) return false;
		this.stopSynthesis();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = voice;
		utterance.lang = voice.lang;
		const epoch = ++this.utteranceEpoch;
		utterance.onend = () => { if (epoch === this.utteranceEpoch) { this.onState?.('idle'); } };
		utterance.onerror = () => { if (epoch === this.utteranceEpoch) { this.onState?.('error', 'Speech playback failed.'); } };
		speechSynthesis.speak(utterance);
		this.onState?.('speaking');
		return true;
	}

	stopSynthesis(): void {
		this.utteranceEpoch++;
		if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
	}

	stop(): void {
		this.stopRecognition();
		this.stopSynthesis();
		this.onState?.('idle');
	}
}
