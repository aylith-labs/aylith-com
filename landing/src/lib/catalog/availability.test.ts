import { describe, expect, it } from 'vitest';
import { projectFromFrontmatter } from '$lib/server/markdown';
import { hasPublicOnboarding } from './availability';
import { normalizeOnboarding } from './onboarding.js';

const setup = { access: 'public-source' as const, url: 'https://example.org/setup', prerequisites: ['A local dev environment'], limitations: ['No production support'] };
const project = (status: string, onboarding?: unknown) => projectFromFrontmatter({ status, onboarding, featured: true }, 'probe');
describe('public showcase availability', () => {
	it('preserves an authoritative release reference without making it an install claim', () => {
		const releasesUrl = 'https://registry.npmjs.org/@aylith/inspekt-vite';
		expect(project('beta', { ...setup, releasesUrl }).onboarding?.releasesUrl).toBe(releasesUrl);
		expect(hasPublicOnboarding(project('planning', { ...setup, releasesUrl }))).toBe(false);
		expect(hasPublicOnboarding(project('beta', { ...setup, url: undefined, releasesUrl }))).toBe(false);
		expect(normalizeOnboarding(setup)).not.toHaveProperty('releasesUrl');
	});
	it.each(['javascript:alert(1)', 'https://', 'https://user:secret@example.org', '//example.org', 'http://example.org', null, 42])('rejects unsafe or malformed release reference %s', (releasesUrl) => {
		expect(normalizeOnboarding({ ...setup, releasesUrl })).toBeUndefined();
	});
	it.each(['planning', 'building', 'research', 'unknown'])('does not promote %s from a featured flag or setup data', (status) => {
		expect(hasPublicOnboarding(project(status, setup))).toBe(false);
	});
	it.each(['beta', 'live'])('requires usable public setup for %s', (status) => {
		expect(hasPublicOnboarding(project(status, setup))).toBe(true);
		expect(hasPublicOnboarding(project(status))).toBe(false);
		expect(hasPublicOnboarding(project(status, { ...setup, access: 'restricted' }))).toBe(false);
		expect(hasPublicOnboarding(project(status, { ...setup, url: undefined }))).toBe(false);
		expect(hasPublicOnboarding(project(status, { ...setup, prerequisites: [] }))).toBe(false);
		expect(hasPublicOnboarding(project(status, { ...setup, limitations: [] }))).toBe(false);
	});
	it.each(['javascript:alert(1)', 'https://', 'https://user:secret@example.org', '//example.org', 'http://example.org'])('rejects unsafe or invalid setup URL %s', (url) => {
		expect(normalizeOnboarding({ ...setup, url })).toBeUndefined();
		expect(hasPublicOnboarding(project('beta', { ...setup, url }))).toBe(false);
	});
	it('fails closed for malformed frontmatter without crashing the page', () => {
		for (const bad of [true, [], { ...setup, prerequisites: 'Bun' }, { ...setup, limitations: [null] }, { ...setup, limitations: [' '] }]) {
			expect(project('beta', bad).onboarding).toBeUndefined();
		}
	});
});
