// Which sections to repaint when the gateway answers, and which of those to flash.
// Kept apart from the DOM so the rules are testable: a section is repainted only
// when what it would show changed, and flashed only when it replaces a translation
// the reader could already see — the first paint of a page is not an "update".

export type Tier = 'fast' | 'quality';

export type SectionResult = {
	id: string;
	sourceHash: string;
	html: string | null;
	tier: Tier | null;
	stale: boolean;
	pending: boolean;
};

export type Painted = { sourceHash: string; html: string };

export type Paint = { id: string; html: string | null; flash: boolean };

export function planPaints(results: SectionResult[], painted: Map<string, Painted>): Paint[] {
	const paints: Paint[] = [];
	for (const result of results) {
		const before = painted.get(result.id);
		if (result.html === null) {
			// Nothing to show yet: keep the original, and restore it if an earlier
			// language had painted over it.
			if (before) paints.push({ id: result.id, html: null, flash: false });
			continue;
		}
		if (before && before.html === result.html) continue;
		paints.push({ id: result.id, html: result.html, flash: before !== undefined });
	}
	return paints;
}

/** How many sections are still waiting on something better, and whether any shows an older source. */
export function progress(results: SectionResult[]): { pending: number; stale: number } {
	return {
		pending: results.filter((r) => r.pending).length,
		stale: results.filter((r) => r.stale).length
	};
}
