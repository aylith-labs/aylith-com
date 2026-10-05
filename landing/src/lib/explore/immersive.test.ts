import { describe, expect, it } from 'vitest';
import { immersivePhase, requestSummary, responsePreview } from './immersive';

describe('immersive Ayla presentation', () => {
	it('keeps a recognizable request visible without changing its meaning', () => {
		expect(requestSummary('  How do I connect Bract to Daylog?  ')).toBe('How do I connect Bract to Daylog?');
		expect(requestSummary('A'.repeat(150))).toBe(`${'A'.repeat(117)}…`);
	});

	it('marks a long reply as an excerpt so the full conversation remains authoritative', () => {
		expect(responsePreview('A short answer.')).toEqual({ text: 'A short answer.', shortened: false });
		expect(responsePreview('A'.repeat(300))).toEqual({ text: `${'A'.repeat(237)}…`, shortened: true });
	});

	it('distinguishes live voice, pending text, and recoverable error states', () => {
		expect(immersivePhase('listening', 'ready', false)).toBe('listening');
		expect(immersivePhase('idle', 'submitted', false)).toBe('thinking');
		expect(immersivePhase('speaking', 'ready', false)).toBe('speaking');
		expect(immersivePhase('idle', 'ready', true)).toBe('error');
		expect(immersivePhase('idle', 'ready', false)).toBe('idle');
	});
});
