import { describe, expect, it } from 'vitest';
import { type Asset, filterAssets, journey, parseCatalog, validView } from './assets';

const asset: Asset = {
	id: 'constellation', title: 'Copper constellation', brand: 'Aylith', kind: 'logo', status: 'in-use',
	url: 'https://media.aylith.com/logo.png', width: 1254, height: 1254, bytes: 1234, sha256: 'a'.repeat(64),
	addedOn: '2026-10-04', createdOn: null,
	history: [{ date: '2026-10-04', event: 'Archived', source: 'Git' }, { date: '2026-09-30', event: 'First recorded', source: 'Notes' }, { date: null, event: 'Selected', source: 'Undated review' }]
};
const other = { ...asset, id: 'banner', title: 'Copper valleys', brand: 'shefrd', kind: 'banner', status: 'exploration' };
const catalog = (assets: Asset[]) => ({ schemaVersion: 1, updatedOn: '2026-10-04', datePolicy: 'Dates are records', assets });

describe('brand asset archive', () => {
	it('combines search and all filters instead of widening the result', () => {
		expect(filterAssets([asset, other], ' COPPER ', 'Aylith', 'logo', 'in-use')).toEqual([asset]);
		expect(filterAssets([asset, other], 'copper', 'shefrd', 'logo', '')).toEqual([]);
	});
	it('retains earlier history and groups undated events separately', () => {
		const groups = journey([asset]);
		expect(groups.map(([date]) => date)).toEqual(['2026-10-04', '2026-09-30', 'unknown']);
		expect(groups[2][1][0].event.date).toBeNull();
	});
	it('does not include another asset in a filtered journey', () => {
		const groups = journey(filterAssets([asset, other], '', 'Aylith', '', ''));
		expect(groups.flatMap(([, events]) => events).every(event => event.asset.id === asset.id)).toBe(true);
	});
	it('rejects duplicate IDs and off-host URLs before publishing', () => {
		expect(() => parseCatalog(catalog([asset, asset]))).toThrow();
		expect(() => parseCatalog(catalog([{ ...asset, url: 'https://example.com/asset.png' }]))).toThrow();
		expect(() => parseCatalog(catalog([{ ...asset, addedOn: 'unknown' }]))).toThrow();
	});
	it('accepts a known addition date without inventing a creation date', () => {
		expect(parseCatalog(catalog([asset])).assets[0].createdOn).toBeNull();
	});
	it('uses a safe view when the stored or linked value is invalid', () => {
		expect(validView('journey')).toBe('journey');
		expect(validView('old-view')).toBe('grid');
	});
});
