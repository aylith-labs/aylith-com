import { describe, expect, it } from 'vitest';
import { buildEntries, filterEntries, type LanguageRow, PLAYFUL, visibleWindow } from './catalog';
import languages from './languages.json';

const rows: LanguageRow[] = [
	['uk', 'Ukrainian', 'living'],
	['en', 'English', 'living'],
	['tlh', 'Klingon', 'constructed'],
	['rue', 'Rusyn', 'living'],
	['ang', 'Old English (ca. 450-1100)', 'historical']
];
const native = (code: string) => ({ uk: 'українська' })[code];

describe('buildEntries', () => {
	it('puts the playful voices first, then two-letter languages, then everything', () => {
		const entries = buildEntries(rows, native);
		expect(entries.slice(0, PLAYFUL.length).every((e) => e.group === 'Playful')).toBe(true);
		const rest = entries.slice(PLAYFUL.length).map((e) => [e.group, e.code]);
		expect(rest).toEqual([
			['Common', 'uk'],
			['All languages', 'uk'],
			['All languages', 'tlh'],
			['All languages', 'rue'],
			['All languages', 'ang']
		]);
	});

	it('leaves English out: the original is how you get it back', () => {
		expect(buildEntries(rows, native).some((e) => e.code === 'en')).toBe(false);
	});

	it('names a language in its own words where the browser knows them, and says what kind an old one is', () => {
		const entries = buildEntries(rows, native);
		expect(entries.find((e) => e.code === 'uk')?.detail).toBe('українська');
		expect(entries.find((e) => e.code === 'ang')?.detail).toBe('historical · ang');
	});

	it('asks the gateway with the ISO code, so two languages sharing a name are not confused', () => {
		expect(buildEntries(rows, native).find((e) => e.code === 'rue')?.target).toBe('Rusyn (ISO 639: rue)');
	});

	it('the shipped list is every language, not a sample', () => {
		const entries = buildEntries(languages as LanguageRow[], () => undefined);
		expect(entries.filter((e) => e.group === 'All languages').length).toBeGreaterThan(7800);
		expect(entries.some((e) => e.code === 'x-navi')).toBe(true);
		expect(entries.some((e) => e.code === 'x-transcarpathian')).toBe(true);
	});
});

describe('filterEntries', () => {
	const entries = buildEntries(rows, native);

	it('matches the native name, ignoring case and accents', () => {
		expect(filterEntries(entries, 'УКРАЇН').map((e) => e.code)).toEqual(['uk']);
	});

	it('matches a playful voice by what it is', () => {
		expect(filterEntries(entries, 'avatar').map((e) => e.code)).toEqual(['x-navi']);
	});

	it('an exact code finds its language once, not once per group', () => {
		expect(filterEntries(entries, 'tlh').map((e) => e.code)).toEqual(['tlh']);
		expect(filterEntries(entries, 'uk').filter((e) => e.code === 'uk')).toHaveLength(1);
	});

	it('an empty query is the whole list', () => {
		expect(filterEntries(entries, '  ')).toBe(entries);
	});
});

describe('visibleWindow', () => {
	it('draws what is in view plus the overscan', () => {
		expect(visibleWindow(360, 320, 36, 8000, 4)).toEqual({ start: 6, end: 23 });
	});

	it('clamps at both ends of the list', () => {
		expect(visibleWindow(0, 320, 36, 8000, 4)).toEqual({ start: 0, end: 13 });
		expect(visibleWindow(999_999, 320, 36, 20, 4)).toEqual({ start: 20, end: 20 });
	});
});
