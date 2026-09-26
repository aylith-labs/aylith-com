import { describe, expect, it } from 'vitest';
import { resolveAylaAction } from './navigation';

const catalog = ['bract', 'daylog'];

describe('Ayla navigation action', () => {
	it('opens only a catalog project and a named content view', () => {
		expect(resolveAylaAction({ type: 'open_project', slug: 'bract', view: 'changelog' }, catalog))
			.toBe('/explore/bract/changelog');
		expect(resolveAylaAction({ type: 'open_project', slug: 'daylog', view: 'website' }, catalog))
			.toBe('/explore/daylog/website');
	});

	it('rejects unknown projects, paths, and arbitrary URLs', () => {
		expect(resolveAylaAction({ type: 'open_project', slug: '../ask', view: 'overview' }, catalog)).toBeNull();
		expect(resolveAylaAction({ type: 'open_project', slug: 'bract', view: 'https://example.org' }, catalog)).toBeNull();
		expect(resolveAylaAction({ type: 'open_project', slug: 'unknown', view: 'overview' }, catalog)).toBeNull();
	});
});
