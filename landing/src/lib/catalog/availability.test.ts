import { describe, expect, it } from 'vitest';
import { projectFromFrontmatter } from '$lib/server/markdown';
import { hasPublicOnboarding } from './availability';
import { normalizeOnboarding } from './onboarding.js';

const setup = { access: 'public-source' as const, url: 'https://example.org/setup', prerequisites: ['A local dev environment'], limitations: ['No production support'] };
const project = (onboarding?: unknown) => projectFromFrontmatter({ onboarding, featured: true }, 'probe');
describe('public showcase availability', () => {
	it('preserves an authoritative release reference without making it an install claim', () => {
		const releasesUrl = 'https://registry.npmjs.org/@aylith/inspekt-vite';
		expect(project({ ...setup, releasesUrl }).onboarding?.releasesUrl).toBe(releasesUrl);
		expect(hasPublicOnboarding(project({ ...setup, releasesUrl }))).toBe(true);
		expect(hasPublicOnboarding(project({ ...setup, url: undefined, releasesUrl }))).toBe(false);
		expect(normalizeOnboarding(setup)).not.toHaveProperty('releasesUrl');
	});
	it.each(['javascript:alert(1)', 'https://', 'https://user:secret@example.org', '//example.org', 'http://example.org', null, 42])('rejects unsafe or malformed release reference %s', (releasesUrl) => {
		expect(normalizeOnboarding({ ...setup, releasesUrl })).toBeUndefined();
	});
	it('requires usable public setup regardless of former stage', () => {
		expect(hasPublicOnboarding(project(setup))).toBe(true);
		expect(hasPublicOnboarding(project())).toBe(false);
		expect(hasPublicOnboarding(project({ ...setup, access: 'restricted' }))).toBe(false);
		expect(hasPublicOnboarding(project({ ...setup, url: undefined }))).toBe(false);
		expect(hasPublicOnboarding(project({ ...setup, prerequisites: [] }))).toBe(false);
		expect(hasPublicOnboarding(project({ ...setup, limitations: [] }))).toBe(true);
	});
	it.each(['javascript:alert(1)', 'https://', 'https://user:secret@example.org', '//example.org', 'http://example.org'])('rejects unsafe or invalid setup URL %s', (url) => {
		expect(normalizeOnboarding({ ...setup, url })).toBeUndefined();
		expect(hasPublicOnboarding(project({ ...setup, url }))).toBe(false);
	});
	it('fails closed for malformed frontmatter without crashing the page', () => {
		for (const bad of [true, [], { ...setup, prerequisites: 'Bun' }, { ...setup, limitations: [null] }, { ...setup, limitations: [' '] }]) {
			expect(project(bad).onboarding).toBeUndefined();
		}
	});
});

it('keeps verified app entries at the root and their public website previews at home', async () => {
 const {verifiedProductEntry,productWebsitePreview}=await import('./entry-point');
 for(const slug of ['linkstash','proomptal','brainstash']) {
  expect(verifiedProductEntry(slug)).toBe(`https://${slug}.aylith.com/`);
  expect(productWebsitePreview({slug})).toBe(`https://${slug}.aylith.com/home`);
 }
});

it('keeps the seven newly verified product roots distinct from public home previews', async () => {
 const {verifiedProductEntry,productWebsitePreview}=await import('./entry-point');
 for(const slug of ['tuilith','githerald','specwatch','inspekt','dictaro','agent-quota','daylog']) {
  expect(verifiedProductEntry(slug)).toBe(`https://${slug}.aylith.com/`);
  expect(productWebsitePreview({slug})).toBe(`https://${slug}.aylith.com/home/`);
 }
 expect(verifiedProductEntry('pintle')).toBe('https://pintle.aylith.com/');
 expect(productWebsitePreview({slug:'pintle'})).toBe('https://pintle.aylith.com/home/');
 expect(verifiedProductEntry('clipwell')).toBeUndefined();
 expect(verifiedProductEntry('cohesa')).toBeUndefined();
});
