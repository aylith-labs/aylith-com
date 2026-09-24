// Task-scoped production-build browser proof. Supply an existing Playwright package
// path; no install, account, production request, worker service or release mutation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { preview } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.argv[2]));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'website-adversarial-'));
const receipt = { startedAt: new Date().toISOString(), output, checks: [], pageErrors: [], complete: false };
const check = (name, condition) => { assert.ok(condition, name); receipt.checks.push(name); };
let server;
let browser;
try {
	server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } });
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	receipt.origin = origin;
	browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
	for (const profile of [{ name: 'desktop', width: 1440, height: 1000, colorScheme: 'light' }, { name: 'mobile', width: 390, height: 844, colorScheme: 'dark' }]) {
		const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, colorScheme: profile.colorScheme, reducedMotion: 'reduce', ...(process.env.PLAYWRIGHT_NO_VIDEO ? {} : { recordVideo: { dir: path.join(output, 'raw-browser'), size: { width: profile.width, height: profile.height } } }) });
		const page = await context.newPage();
		page.on('pageerror', (error) => receipt.pageErrors.push(error.message));
		await page.goto(origin);
		await page.getByRole('heading', { name: /Useful tools.*An evolving suite/ }).waitFor();
		check(`${profile.name}: no shipped/launch-count promises`, !/what shipped|138\+|ship in days/i.test(await page.locator('main').innerText()));
		const cards = page.getByTestId('public-showcase').locator('article');
		check(`${profile.name}: three publicly documented setup paths`, await cards.count() === 3);
		check(`${profile.name}: restricted Videx not showcased`, !(await page.getByTestId('public-showcase').innerText()).includes('Videx'));
		await page.getByRole('link', { name: 'Set up Tickets →' }).focus();
		await page.keyboard.press('Enter');
		await page.getByRole('heading', { name: 'Setup & access' }).waitFor();
		check(`${profile.name}: keyboard quick-start navigation`, page.url().endsWith('/projects/tickets#setup'));
		check(`${profile.name}: binary/AI/media limits visible`, /0.1.3/.test(await page.locator('main').innerText()) && /publishing access/.test(await page.locator('main').innerText()));
		await page.reload();
		check(`${profile.name}: detail reload keeps setup`, await page.getByRole('link', { name: 'Read Tickets quick-start →' }).getAttribute('href') === 'https://github.com/aylith-labs/tickets#quick-start');
		for (const img of await page.locator('main img').all()) {
			if (!(await img.isVisible())) continue;
			await img.scrollIntoViewIfNeeded();
			await img.evaluate((image) => image.decode());
			check(`${profile.name}: product image loaded`, await img.evaluate((image) => image.naturalWidth > 0));
		}
		await page.screenshot({ path: path.join(output, `${profile.name}-tickets.png`), fullPage: true });
		await page.goBack();
		await page.goForward();
		check(`${profile.name}: back/forward returns exact detail`, page.url().includes('/projects/tickets'));
		await page.goto(`${origin}/projects/videx`);
		check(`${profile.name}: restricted access, no broken public CTA`, /Access is restricted/.test(await page.locator('main').innerText()) && await page.locator('main a[href*="github.com/aylith-labs/videx"]').count() === 0);
		for (const slug of ['bract', 'compokit']) {
			await page.goto(`${origin}/projects/${slug}`);
			check(`${profile.name}: ${slug} has no stage badge`, !/\b(?:Planning|In Development|Beta|Live)\b/.test(await page.locator('main header').innerText()));
			check(`${profile.name}: ${slug} numerical promises removed`, !/\$20|\$200|10x cheaper|60.75%|25.40%|passes PR review on the first try/.test(await page.locator('main').innerText()));
		}
		await page.goto(`${origin}/projects`);
		check(`${profile.name}: no stage filter or stage overview`, await page.getByLabel('Stage', { exact: true }).count() === 0 && !/All stages|In Development/.test(await page.locator('main').innerText()));
		await page.getByLabel('Search catalog').fill('Videx');
		check(`${profile.name}: catalog search`, await page.locator('main h3').count() === 1);
		await page.getByLabel('Search catalog').fill('not-a-matching-project-xyz');
		await page.getByRole('button', { name: 'Clear filter', exact: true }).click();
		check(`${profile.name}: empty-state reset clears search and category`, await page.locator('main h3').count() === 12);
		const names = new Set();
		for (;;) {
			for (const name of await page.locator('main h3').allTextContents()) names.add(name.trim());
			check(`${profile.name}: bounded page ${names.size}`, await page.locator('main h3').count() <= 12);
			if (await page.getByRole('button', { name: 'Next page', exact: true }).isDisabled()) break;
			await page.getByRole('button', { name: 'Next page', exact: true }).click();
		}
		const expected = fs.readdirSync('.generated/projects').filter((file) => file.endsWith('.md')).length;
		check(`${profile.name}: every catalog item remains reachable`, names.size === expected);
		await page.getByRole('button', { name: 'Previous page', exact: true }).focus();
		await page.keyboard.press('Enter');
		check(`${profile.name}: keyboard pagination`, !(await page.getByRole('button', { name: 'Next page', exact: true }).isDisabled()));
		await page.screenshot({ path: path.join(output, `${profile.name}-catalog.png`), fullPage: true });
		check(`${profile.name}: no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
		await page.goto(origin);
		await page.getByRole('heading', { name: 'Start with public source setup' }).scrollIntoViewIfNeeded();
		await page.screenshot({ path: path.join(output, `${profile.name}-home.png`), fullPage: true });
		if (profile.name === 'mobile') {
			await page.getByRole('button', { name: 'Toggle menu' }).click();
			await page.getByRole('link', { name: 'Projects', exact: true }).last().focus();
			await page.keyboard.press('Enter');
			await page.waitForURL(`${origin}/projects`);
			check('mobile: menu keyboard destination', page.url().endsWith('/projects'));
		} else {
			const opened = context.waitForEvent('page');
			await page.getByRole('link', { name: 'Set up Inspekt →' }).click({ modifiers: ['ControlOrMeta'] });
			const tab = await opened;
			await tab.waitForLoadState();
			check('desktop: modified click preserves destination', tab.url().endsWith('/projects/inspekt#setup'));
			await tab.close();
		}
		await context.close();
	}
	check('zero browser page errors', receipt.pageErrors.length === 0);
	receipt.complete = true;
} catch (error) {
	receipt.error = error.stack;
	for (const context of browser?.contexts() ?? []) {
		for (const page of context.pages()) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
	}
	process.exitCode = 1;
} finally {
	await browser?.close();
	await new Promise((resolve) => server ? server.httpServer.close(resolve) : resolve());
	receipt.finishedAt = new Date().toISOString();
	fs.writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2));
	console.log(JSON.stringify(receipt));
}
