import { describe, expect, it } from 'vitest';
import { type Painted, planPaints, progress, type SectionResult } from './plan';

const result = (id: string, html: string | null, extra: Partial<SectionResult> = {}): SectionResult => ({
	id,
	sourceHash: `h-${id}`,
	html,
	tier: html ? 'fast' : null,
	stale: false,
	pending: true,
	...extra
});

describe('planPaints', () => {
	it('paints a page the first time without flashing it', () => {
		expect(planPaints([result('a', 'Ahoy'), result('b', 'Arr')], new Map())).toEqual([
			{ id: 'a', html: 'Ahoy', flash: false },
			{ id: 'b', html: 'Arr', flash: false }
		]);
	});

	it('flashes a section whose better translation replaces the one on screen', () => {
		const painted = new Map<string, Painted>([['a', { sourceHash: 'h-a', html: 'Ahoy' }]]);
		expect(planPaints([result('a', 'Ahoy there', { tier: 'quality', pending: false })], painted)).toEqual([
			{ id: 'a', html: 'Ahoy there', flash: true }
		]);
	});

	it('leaves a section alone when the poll brings back what it already shows', () => {
		const painted = new Map<string, Painted>([['a', { sourceHash: 'h-a', html: 'Ahoy' }]]);
		expect(planPaints([result('a', 'Ahoy')], painted)).toEqual([]);
	});

	it('restores the original when a section has nothing in the new language yet', () => {
		const painted = new Map<string, Painted>([['a', { sourceHash: 'h-a', html: 'Ahoy' }]]);
		expect(planPaints([result('a', null)], painted)).toEqual([{ id: 'a', html: null, flash: false }]);
		expect(planPaints([result('b', null)], new Map())).toEqual([]);
	});
});

describe('progress', () => {
	it('counts what is still coming and what shows an older source', () => {
		expect(
			progress([result('a', 'x'), result('b', 'y', { pending: false }), result('c', 'z', { stale: true })])
		).toEqual({ pending: 2, stale: 1 });
	});
});
