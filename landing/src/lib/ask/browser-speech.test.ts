import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserSpeech } from './browser-speech';

afterEach(() => vi.unstubAllGlobals());

function recognition(local: boolean) {
	const instances: Recognition[] = [];
	class Recognition {
		static available = vi.fn(async (_options: { langs: string[]; processLocally: true }): Promise<'available' | 'downloadable'> => 'available');
		constructor() { if (local) (this as Recognition & { processLocally?: boolean }).processLocally = false; instances.push(this); }
		declare processLocally: boolean;
		lang = '';
		onresult: ((event: unknown) => void) | null = null;
		onerror: ((event: unknown) => void) | null = null;
		onend: (() => void) | null = null;
		start = vi.fn();
		abort = vi.fn();
	}
	return { Recognition, instances };
}

describe('local speech in the shared Ayla conversation', () => {
	it('never starts recognition unless local processing is verified', async () => {
		const { Recognition } = recognition(false);
		vi.stubGlobal('SpeechRecognition', Recognition);
		vi.stubGlobal('navigator', { language: 'hu-HU' });
		const speech = new BrowserSpeech(() => {});
		expect((await speech.probe()).recognition).toBe('unavailable');
		await expect(speech.start()).rejects.toThrow('local recognition');
	});

	it('sends one final local transcript into the shared conversation', async () => {
		const { Recognition, instances } = recognition(true);
		vi.stubGlobal('SpeechRecognition', Recognition);
		vi.stubGlobal('navigator', { language: 'hu-HU' });
		const received = vi.fn();
		const speech = new BrowserSpeech(received);
		expect((await speech.probe()).recognition).toBe('available');
		await speech.start();
		expect(Recognition.available).toHaveBeenCalledWith({ langs: ['hu-HU'], processLocally: true });
		expect(instances.at(-1)?.processLocally).toBe(true);
		expect(instances.at(-1)?.lang).toBe('hu-HU');
		instances.at(-1)?.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'Nyisd meg a projektet.' } }] });
		instances.at(-1)?.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'duplicate' } }] });
		expect(received).toHaveBeenCalledExactlyOnceWith('Nyisd meg a projektet.');
	});

	 it('does not start a microphone after New or navigation cancels a pending pack check', async () => {
		const { Recognition, instances } = recognition(true);
		let resolveAvailability: ((status: 'available') => void) | undefined;
		Recognition.available = vi.fn(() => new Promise<'available'>((resolve) => { resolveAvailability = resolve; }));
		vi.stubGlobal('SpeechRecognition', Recognition);
		vi.stubGlobal('navigator', { language: 'en-US' });
		const speech = new BrowserSpeech(() => {});
		const starting = speech.start();
		speech.stop();
		resolveAvailability?.('available');
		await starting;
		expect(instances.some((instance) => instance.start.mock.calls.length > 0)).toBe(false);
	});

	it('keeps a delayed pack result labeled with the language actually checked', async () => {
		const { Recognition } = recognition(true);
		const pending = new Map<string, (status: 'available' | 'downloadable') => void>();
		Recognition.available = vi.fn(({ langs }: { langs: string[]; processLocally: true }) => new Promise<'available' | 'downloadable'>((resolve) => { pending.set(langs[0], resolve); }));
		vi.stubGlobal('SpeechRecognition', Recognition);
		vi.stubGlobal('navigator', { language: 'en-US' });
		const speech = new BrowserSpeech(() => {});
		const english = speech.probe();
		speech.locale = 'hu-HU';
		const hungarian = speech.probe();
		pending.get('hu-HU')?.('available');
		pending.get('en-US')?.('downloadable');
		expect(await hungarian).toMatchObject({ locale: 'hu-HU', recognition: 'available' });
		expect(await english).toMatchObject({ locale: 'en-US', recognition: 'downloadable' });
	});

	it('speaks only through a localService voice', () => {
		const cancel = vi.fn();
		const speak = vi.fn();
		const remote = { name: 'Remote', lang: 'en-US', localService: false };
		const local = { name: 'Local', lang: 'en-US', localService: true };
		vi.stubGlobal('navigator', { language: 'en-US' });
		vi.stubGlobal('speechSynthesis', { getVoices: () => [remote, local], cancel, speak });
		vi.stubGlobal('SpeechSynthesisUtterance', class { voice: unknown; lang = ''; text: string; constructor(text: string) { this.text = text; } });
		const speech = new BrowserSpeech(() => {});
		expect(speech.speak('Ayla answer')).toBe(true);
		expect(speak).toHaveBeenCalledOnce();
		expect(speak.mock.calls[0][0].voice).toBe(local);
		speech.stop();
		expect(cancel).toHaveBeenCalled();
	});
});
