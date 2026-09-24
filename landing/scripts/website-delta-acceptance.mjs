// D074: actual production-build paths and public release metadata. No installs,
// login, public deployment or owner browser profile. Retain failures and cleanup.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { preview } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.argv[2]));
const prior = path.resolve(process.argv[3]);
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'website-delta-'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function manifest(root) {
	return Object.fromEntries(fs.readdirSync(root, { recursive: true, withFileTypes: true })
		.filter((item) => item.isFile())
		.map((item) => path.join(item.parentPath, item.name)).sort()
		.map((file) => [path.relative(root, file).replaceAll('\\', '/'), sha(fs.readFileSync(file))]));
}
const sources = [
	'scripts/website-delta-acceptance.mjs', 'scripts/collect.mjs', 'scripts/preview-catalog.mjs', 'scripts/manifest.js',
	'src/lib/catalog/onboarding.js', 'src/lib/types/project.ts', '../.aylith/project.schema.json',
	'src/routes/projects/[slug]/+page.svelte', 'src/routes/projects/[slug]/changelog/+page.svelte',
	'src/content/changelogs/bract/2026-06-16-dashboard-collectors-live-logs.svx',
	'../../bract/.aylith/project.md', '../../inspekt/.aylith/project.md', '../../inspekt/README.md',
	'../../inspekt/site/docs/install.md', '../../aylith-venture/reviews/I17/website-internal-case-study.md',
	'package.json', 'package-lock.json'
];
const identities = () => Object.fromEntries(sources.map((file) => [file, sha(fs.readFileSync(file))]));
const build = manifest(path.resolve('build'));
const receipt = {
	startedAt: new Date().toISOString(), output, checks: [], pageErrors: [], complete: false,
	scope: 'Local built pages and unauthenticated public npm metadata, not deployed pages or package-operation acceptance',
	sources: identities(), build, buildTreeHash: sha(JSON.stringify(build)),
	collectorReceipt: JSON.parse(fs.readFileSync('.generated/preview-receipt.json', 'utf8')),
	generated: manifest(path.resolve('.generated/projects')), responses: [], profiles: []
};
const check = (name, condition) => { assert.ok(condition, name); receipt.checks.push(name); };
const publicUrl = 'https://registry.npmjs.org/@aylith/inspekt-vite';
const label = 'Package versions & publication dates →';
let server;
let browser;
try {
	const before = fs.readdirSync(path.join(prior, 'projects')).filter((name) => name.endsWith('.md')).sort();
	const after = Object.keys(receipt.generated).sort();
	check('all previously included catalog entries preserved', before.every((slug) => after.includes(slug)));
	receipt.inventory = { before, after, added: after.filter((slug) => !before.includes(slug)) };
	server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } });
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	receipt.origin = origin;
	browser = await chromium.launch({ headless: true });
	for (const profile of [
		{ name: 'desktop-light', width: 1440, height: 1000, colorScheme: 'light' },
		{ name: 'narrow-dark', width: 390, height: 844, colorScheme: 'dark' }
	]) {
		const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, colorScheme: profile.colorScheme, reducedMotion: 'reduce', recordVideo: { dir: path.join(output, 'raw-browser'), size: { width: profile.width, height: profile.height } } });
		const page = await context.newPage();
		page.on('pageerror', (error) => receipt.pageErrors.push(error.message));
		page.on('response', (response) => {
			if (response.request().isNavigationRequest()) receipt.responses.push({ profile: profile.name, url: response.url(), status: response.status() });
		});
		await page.goto(`${origin}/projects/bract`);
		await page.getByRole('heading', { name: 'Setup & access' }).waitFor();
		check(`${profile.name}: no stage label`, !/\bPlanning\b/.test(await page.locator('main header').innerText()));
		const mainText = await page.locator('main').innerText();
		for (const copy of [
			'Local deployment-lifecycle prototype; no production compute backend',
			'Prototype persistent memory storage; semantic search not yet connected',
			'Prototype trace ingestion and waterfall visualization',
			'Planned secrets management and environment isolation'
		]) check(`${profile.name}: rendered ${copy}`, mainText.includes(copy));
		check(`${profile.name}: standalone old capability promises absent`, !/One-command deployment|Full observability|Persistent vector memory built in|The Vercel for AI Agents/.test(mainText));
		check(`${profile.name}: unsupported historical marketing image not promoted`, await page.locator('main img[src*="/bract/media/landing-"]').count() === 0);
		await page.getByText('Local deployment-lifecycle prototype; no production compute backend', { exact: true }).scrollIntoViewIfNeeded();
		await page.screenshot({ path: path.join(output, `${profile.name}-bract.png`), fullPage: profile.width > 500 });
		await page.goto(`${origin}/projects/bract/changelog`);
		check(`${profile.name}: historical dates retained, explicit correction replaces visual promise`, (await page.locator('main').innerText()).includes('Editorial clarification, 8 September 2026') && await page.locator('main time[datetime="2026-06-16"]').count() === 1 && await page.locator('main img[src*="/bract/media/landing-"]').count() === 0);
		await page.goto(`${origin}/projects/inspekt/changelog`);
		await page.getByText('No changelog entries yet.', { exact: true }).waitFor();
		check(`${profile.name}: empty studio notes remain honest`, (await page.locator('main').innerText()).includes('not a complete package'));
		check(`${profile.name}: no fabricated release date`, await page.locator('main time').count() === 0);
		const emptyLink = page.getByRole('link', { name: label, exact: true });
		check(`${profile.name}: direct authoritative empty-state reference`, await emptyLink.getAttribute('href') === publicUrl);
		await emptyLink.scrollIntoViewIfNeeded();
		await page.screenshot({ path: path.join(output, `${profile.name}-empty.png`), fullPage: true });
		await page.getByRole('link', { name: 'Check Inspekt setup & availability →', exact: true }).focus();
		await page.keyboard.press('Enter');
		await page.waitForURL(`${origin}/projects/inspekt#setup`);
		await page.getByRole('heading', { name: 'Setup & access', exact: true }).waitFor();
		check(`${profile.name}: keyboard empty-state to real setup`, page.url().endsWith('#setup'));
		const releaseLink = page.getByRole('link', { name: label, exact: true });
		await releaseLink.focus();
		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
		const geometry = await releaseLink.evaluate((node) => {
			const css = getComputedStyle(node); const box = node.getBoundingClientRect();
			return { height: box.height, left: box.left, right: box.right, width: innerWidth, focused: document.activeElement === node, focusVisible: node.matches(':focus-visible'), outlineStyle: css.outlineStyle, outlineWidth: css.outlineWidth, foreground: css.color, theme: document.documentElement.className };
		});
		receipt.profiles.push({ ...profile, geometry });
		check(`${profile.name}: named focus-visible link with 44px target`, geometry.focused && geometry.focusVisible && geometry.outlineStyle !== 'none' && Number.parseFloat(geometry.outlineWidth) > 0 && geometry.height >= 44);
		check(`${profile.name}: link and document fit viewport`, geometry.left >= 0 && geometry.right <= geometry.width && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
		await page.screenshot({ path: path.join(output, `${profile.name}-setup-focus.png`), fullPage: profile.width > 500 });
		if (profile.name === 'desktop-light') {
			const responsePromise = page.waitForResponse((response) => response.url() === publicUrl && response.request().isNavigationRequest());
			await page.keyboard.press('Enter');
			const response = await responsePromise;
			check('actual browser release link returns public JSON 200', response.status() === 200 && /application\/json/.test(response.headers()['content-type'] ?? ''));
			const bytes = await response.body();
			const metadata = JSON.parse(bytes.toString('utf8'));
			const version = metadata['dist-tags']?.latest;
			check('authoritative version has both package record and publication timestamp', metadata.name === '@aylith/inspekt-vite' && metadata.versions[version]?.version === version && !Number.isNaN(Date.parse(metadata.time[version])));
			receipt.publicMetadata = { url: response.url(), checkedAt: new Date().toISOString(), status: response.status(), responseSha256: sha(bytes), name: metadata.name, version, publishedAt: metadata.time[version], integrity: metadata.versions[version].dist?.integrity };
			await page.goBack();
			await page.getByRole('heading', { name: 'Setup & access', exact: true }).waitFor();
			check('browser back from external metadata restores setup', page.url().endsWith('/projects/inspekt#setup'));
		} else {
			check('narrow: same authoritative HTTPS reference', await releaseLink.getAttribute('href') === publicUrl);
		}
		await page.reload();
		check(`${profile.name}: setup reload preserves release reference`, await page.getByRole('link', { name: label, exact: true }).getAttribute('href') === publicUrl);
		await page.goto(`${origin}/projects/videx`);
		check(`${profile.name}: restricted beta access unchanged`, /Access is restricted/.test(await page.locator('main').innerText()) && await page.locator('main a[href*="github.com/aylith-labs/videx"]').count() === 0);
		await context.close();
	}
	check('no browser page errors', receipt.pageErrors.length === 0);
	check('source unchanged throughout proof', JSON.stringify(identities()) === JSON.stringify(receipt.sources));
	check('built files unchanged throughout proof', JSON.stringify(manifest(path.resolve('build'))) === JSON.stringify(build));
	receipt.complete = true;
} catch (error) {
	receipt.error = error.stack;
	for (const context of browser?.contexts() ?? []) for (const page of context.pages()) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
	process.exitCode = 1;
} finally {
	await browser?.close();
	await new Promise((resolve) => server ? server.httpServer.close(resolve) : resolve());
	receipt.cleanup = { browserClosed: !browser?.isConnected(), serverClosed: !server?.httpServer.listening };
	receipt.finishedAt = new Date().toISOString();
	fs.writeFileSync(path.join(output, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
	console.log(JSON.stringify({ output, complete: receipt.complete, checks: receipt.checks.length, error: receipt.error, cleanup: receipt.cleanup, publicMetadata: receipt.publicMetadata }));
}
