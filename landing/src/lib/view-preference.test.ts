import { describe, expect, it } from 'vitest';
import { readView, rememberView, rootEntry } from './view-preference';

function memoryStorage(initial?: string): Storage {
	const values = new Map<string, string>();
	if (initial) values.set('aylith:site-view', initial);
	return {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => { values.set(key, value); },
		removeItem: (key) => { values.delete(key); },
		clear: () => { values.clear(); },
		key: (index) => [...values.keys()][index] ?? null,
		get length() { return values.size; }
	};
}

describe('site view preference', () => {
	it('defaults to classic and tolerates unavailable storage', () => {
		expect(readView(memoryStorage())).toBe('classic');
		expect(readView(memoryStorage('invalid'))).toBe('classic');
		const denied = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } } as unknown as Storage;
		expect(readView(denied)).toBe('classic');
		expect(() => rememberView('ayla', denied)).not.toThrow();
	});

	it('opens the saved view only for an initial top-level root entry', () => {
		const storage = memoryStorage('ayla');
		expect(rootEntry('enter', '', false, storage)).toBe('/ayla');
		expect(rootEntry('enter', '', true, storage)).toBeNull();
		expect(readView(storage)).toBe('ayla');
	});

	it('uses an explicit classic link and browser history without redirect loops', () => {
		const storage = memoryStorage('workspace');
		expect(rootEntry('enter', '?view=classic', false, storage)).toBeNull();
		expect(readView(storage)).toBe('classic');
		rememberView('workspace', storage);
		expect(rootEntry('popstate', '', false, storage)).toBeNull();
		expect(readView(storage)).toBe('classic');
	});
});
