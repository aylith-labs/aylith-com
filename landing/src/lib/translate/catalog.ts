// What the language picker offers: a few playful voices first, then the
// languages people mostly read, then every language ISO 639-3 names — about
// eight thousand, which is why the list is virtualized and loaded on first open.

export type LanguageRow = [code: string, name: string, kind: string];

export type LanguageEntry = {
	/** Stored as the reader's choice. ISO codes as they are; playful voices under `x-`. */
	code: string;
	label: string;
	/** A second line: the native name, or what a voice is. */
	detail: string;
	/** What the gateway is asked to translate into. Free text: a model reads it. */
	target: string;
	group: 'Playful' | 'Common' | 'All languages';
};

// Voices and constructed languages ISO does not carry, or carries without the
// hint a model needs. Na'vi has no ISO code; Transcarpathian is a dialect.
export const PLAYFUL: LanguageEntry[] = [
	['x-pirate', 'Pirate', 'Arr, matey', 'English as a pirate speaks it'],
	['x-shakespeare', 'Shakespearean', 'Early Modern English', 'Shakespearean Early Modern English'],
	['x-eli5', 'For a 5-year-old', 'Plain words, short sentences', 'English explained for a five-year-old'],
	['x-eli10', 'For a 10-year-old', 'Simple, still complete', 'English explained for a ten-year-old'],
	['x-navi', "Na'vi", 'Avatar', "Na'vi, the constructed language of the Avatar films"],
	['x-transcarpathian', 'По-закарпатськи', 'Transcarpathian Ukrainian', 'the Transcarpathian dialect of Ukrainian (по-закарпатськи)'],
	['x-surzhyk', 'Суржик', 'Surzhyk', 'Surzhyk, the Ukrainian-Russian mixed vernacular'],
	['x-yoda', 'Yoda', 'Reversed, speak he does', 'English as Yoda speaks it'],
	['x-dothraki', 'Dothraki', 'Game of Thrones', 'Dothraki, the constructed language of Game of Thrones'],
	['x-genz', 'Gen Z', 'no cap', 'English in Gen Z internet slang'],
	['x-legalese', 'Legalese', 'Heretofore and notwithstanding', 'English in the style of a legal contract'],
	['x-haiku', 'Haiku', 'Five, seven, five', 'English rewritten as haiku where it fits'],
	['x-emoji', 'Emoji', '🧪✨', 'emoji only, keeping the meaning']
].map(([code, label, detail, target]) => ({ code, label, detail, target, group: 'Playful' as const }));

export type NativeName = (code: string) => string | undefined;

/** The reader's own name for a two-letter-coded language, when the browser knows it. */
export function browserNativeName(code: string): string | undefined {
	try {
		const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
		return name && name !== code ? name : undefined;
	} catch {
		return undefined;
	}
}

export function buildEntries(rows: LanguageRow[], nativeName: NativeName = browserNativeName): LanguageEntry[] {
	const common: LanguageEntry[] = [];
	const all: LanguageEntry[] = [];
	for (const [code, name, kind] of rows) {
		if (code === 'en') continue; // the page's own language; "Original" restores it
		const native = code.length === 2 ? nativeName(code) : undefined;
		const detail = native && native.toLowerCase() !== name.toLowerCase() ? native : kind === 'living' ? code : `${kind} · ${code}`;
		// The ISO code disambiguates a name shared by several languages.
		const entry = { code, label: name, detail, target: `${name} (ISO 639: ${code})` };
		if (code.length === 2) common.push({ ...entry, group: 'Common' });
		all.push({ ...entry, group: 'All languages' });
	}
	return [...PLAYFUL, ...common, ...all];
}

const fold = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase();

/** Entries whose name, native name or code contains the query; the grouping is kept, duplicates across groups dropped. */
export function filterEntries(entries: LanguageEntry[], query: string): LanguageEntry[] {
	const q = fold(query.trim());
	if (!q) return entries;
	const seen = new Set<string>();
	return entries.filter((e) => {
		if (seen.has(e.code)) return false;
		const hit = fold(e.label).includes(q) || fold(e.detail).includes(q) || e.code.toLowerCase() === q;
		if (hit) seen.add(e.code);
		return hit;
	});
}

/** The rows a virtual list draws for a scroll position: what is in view, plus `overscan` either side. */
export function visibleWindow(
	scrollTop: number,
	viewportHeight: number,
	rowHeight: number,
	count: number,
	overscan = 6
): { start: number; end: number } {
	const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
	const start = Math.min(count, Math.max(0, first - overscan));
	const end = Math.min(count, first + Math.ceil(viewportHeight / rowHeight) + overscan);
	return { start, end: Math.max(start, end) };
}
