// Actual static build, isolated browser preferences, no production/account writes.
// --baseline records the old build without expecting repaired behavior.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { preview } from 'vite';

const { chromium } = createRequire(import.meta.url)(path.resolve(process.argv[2]));
const baseline = process.argv.includes('--baseline');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'website-settings-'));
const receipt = { startedAt: new Date().toISOString(), output, baseline, visualOnly: process.argv.includes('--visual-only'), interactionOnly: process.argv.includes('--interaction-only'), checks: [], colors: [], errors: [], complete: false };
const check = (name, condition) => { assert.ok(condition, name); receipt.checks.push(name); };
let browser;
let server;

// Resolve computed colors through the browser's sRGB canvas, not screenshot text.
// Composite transparent backgrounds over ancestors; non-unit group opacity is
// explicitly rejected rather than silently mismeasured by a flat-color formula.
async function colors(locator) {
  return locator.evaluate((element) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = (color) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); const c = [...ctx.getImageData(0, 0, 1, 1).data]; return [...c.slice(0, 3), c[3] / 255]; };
    const over = (a, b) => a.slice(0, 3).map((v, i) => v * a[3] + b[i] * (1 - a[3]));
    const ancestry = []; for (let e = element; e; e = e.parentElement) { const s = getComputedStyle(e); ancestry.push({ background: s.backgroundColor, opacity: s.opacity, image: s.backgroundImage }); }
    let background = [255, 255, 255];
    for (const layer of ancestry.toReversed()) background = over(rgba(layer.background), background);
    const s = getComputedStyle(element); const foreground = over(rgba(s.color), background);
    const luminance = (c) => c.map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const a = luminance(foreground); const b = luminance(background);
    return { text: element.textContent.trim(), cssForeground: s.color, cssBackground: s.backgroundColor, foreground, background, contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), ancestry, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
  });
}

try {
  server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`; receipt.origin = origin;
  receipt.buildHashes = Object.fromEntries(['build/index.html', 'build/projects/inspekt/changelog.html'].filter(fs.existsSync).map((file) => [file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  receipt.sourceHashes = Object.fromEntries(['src/app.css', 'src/lib/components/layout/SettingsMenu.svelte', 'src/lib/components/brand/MotionControl.svelte', 'src/lib/stores/theme.svelte.ts', 'src/lib/stores/motion.svelte.ts', 'src/lib/actions/reveal.ts', 'src/lib/actions/tilt.ts', 'src/routes/projects/[slug]/changelog/+page.svelte', 'scripts/settings-acceptance.mjs', '.generated/preview-receipt.json'].map((file) => [file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference', recordVideo: { dir: path.join(output, 'raw-browser') } });
  const page = await context.newPage(); page.on('pageerror', (e) => receipt.errors.push(e.message));
  await page.goto(origin);
  const trigger = page.getByRole('button', { name: 'Settings and links', exact: true });
  await trigger.click();
  await page.getByRole('button', { name: 'Light', exact: true }).focus();
  await page.screenshot({ path: path.join(output, 'light-settings.png') });
  receipt.colors.push({ state: 'initial light selected', ...await colors(page.locator('button[aria-pressed="true"]').first()) });
  await page.keyboard.press('Escape');
  receipt.escapeFocused = await page.evaluate(() => ({ tag: document.activeElement.tagName, label: document.activeElement.getAttribute('aria-label') }));
  if (baseline) {
    check('baseline recorded, not a repair claim', true);
  } else if (receipt.visualOnly) {
    for (const theme of ['Light', 'Dark']) {
      await trigger.click();
      await page.getByRole('group', { name: 'Theme preference' }).getByRole('button', { name: theme, exact: true }).click();
      await page.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Full', exact: true }).click();
      await page.mouse.move(5, 900); await page.waitForTimeout(150);
      receipt.colors.push({ state: theme, ...await colors(page.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Full', exact: true })) });
      receipt[`${theme}Full`] = await page.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Full', exact: true }).evaluate((e) => {
        const range = document.createRange(); range.selectNodeContents(e);
        const s = getComputedStyle(e);
        return { html: e.outerHTML, selection: getSelection().toString(), font: s.font, opacity: s.opacity, rects: [...range.getClientRects()].map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })), animations: e.getAnimations().map((a) => a.effect.getKeyframes()) };
      });
      await page.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Full', exact: true }).screenshot({ path: path.join(output, `${theme}-Full.png`) });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(output, `${theme}-settings.png`) });
      await page.keyboard.press('Escape');
    }
    check('fresh interaction captures, not full acceptance', true);
  } else {
    check('Escape from child returns trigger', await trigger.evaluate((e) => e === document.activeElement));
    const open = async () => { if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click(); };
    const group = (name) => page.getByRole('group', { name: new RegExp(`^${name}`) }).first();
    const select = async (name, value) => { await open(); await group(name).getByRole('button', { name: value, exact: true }).click(); };
    for (const osTheme of process.argv.includes('--interaction-only') ? [] : ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: osTheme });
      for (const theme of ['Light', 'Dark', 'System']) {
        await select('Theme', theme);
        check(`${osTheme}/${theme}: resolved theme`, await page.locator('html').evaluate((e) => e.classList.contains('dark')) === (theme === 'Dark' || theme === 'System' && osTheme === 'dark'));
        for (const motion of ['System', 'Reduced', 'Full']) {
          await select('Motion', motion);
          for (const name of ['Theme', 'Motion']) {
            const selected = group(name).locator('button[aria-pressed="true"]');
            check(`${osTheme}/${theme}/${motion}/${name}: one selection`, await selected.count() === 1);
            for (const state of ['default', 'hover', 'focus', 'pressed']) {
              await selected.evaluate((e) => e.blur());
              await page.mouse.move(5, 900);
              if (state === 'hover' || state === 'pressed') await selected.hover();
              if (state === 'focus') await selected.focus();
              if (state === 'pressed') await page.mouse.down();
              await page.waitForTimeout(40); // allow a painted frame for the state
              const sample = await colors(selected);
              receipt.colors.push({ osTheme, theme, motion, group: name, state, ...sample });
              check(`${osTheme}/${theme}/${motion}/${name}/${state}: known composition`, sample.ancestry.every((x) => Number(x.opacity) === 1 && x.image === 'none'));
              check(`${osTheme}/${theme}/${motion}/${name}/${state}: white >=4.5`, sample.foreground.every((v) => v === 255) && sample.contrast >= 4.5);
              if (state === 'pressed') await page.mouse.up();
            }
          }
          if (motion === 'Full') for (const name of ['Theme', 'Motion']) {
            for (const button of await group(name).locator('button[aria-pressed="false"]').all()) for (const state of ['default', 'hover', 'focus', 'pressed']) {
              await open(); await button.evaluate((e) => e.blur());
              await page.mouse.move(5, 900); if (state === 'hover' || state === 'pressed') await button.hover();
              if (state === 'focus') await button.focus(); if (state === 'pressed') await page.mouse.down();
              const sample = await colors(button); receipt.colors.push({ osTheme, theme, state, group: name, unselected: true, ...sample });
              check(`${osTheme}/${theme}/${name}/${state}: unselected label contrast`, sample.contrast >= 4.5);
              // Do not click: releasing outside preserves the selected preference.
              if (state === 'pressed') { await page.mouse.move(5, 900); await page.mouse.up(); }
            }
          }
        }
        await open();
        await page.screenshot({ path: path.join(output, `${osTheme}-${theme}-settings.png`) });
      }
    }
    await select('Theme', 'System');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
    check('System theme responds live in both directions', true);
    for (const osMotion of ['reduce', 'no-preference']) {
      await page.emulateMedia({ reducedMotion: osMotion });
      for (const preference of ['System', 'Reduced', 'Full']) {
        await select('Motion', preference);
        const expected = preference === 'System' ? (osMotion === 'reduce' ? 'reduced' : 'full') : preference.toLowerCase();
        check(`${osMotion}/${preference}: resolved motion`, await page.locator('html').getAttribute('data-motion') === expected);
        check(`${osMotion}/${preference}: scroll follows resolved preference`, await page.locator('html').evaluate((e) => getComputedStyle(e).scrollBehavior) === (expected === 'reduced' ? 'auto' : 'smooth'));
      }
    }
    await select('Motion', 'System');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'full');
    check('System motion responds live', true);
    // Test Escape from all six buttons and both links, not only the trigger.
    for (const name of ['Theme', 'Motion']) for (const index of [0, 1, 2]) {
      await open(); await group(name).getByRole('button').nth(index).focus(); await page.keyboard.press('Escape');
      check(`Escape ${name}/${index}`, await trigger.evaluate((e) => e === document.activeElement) && await trigger.getAttribute('aria-expanded') === 'false');
    }
    for (const name of ['Design system', 'GitHub']) {
      await open(); await page.getByRole('link', { name, exact: true }).first().focus(); await page.keyboard.press('Escape');
      check(`Escape ${name}`, await trigger.evaluate((e) => e === document.activeElement));
    }
    await trigger.focus(); await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    check('Tab reaches first theme choice', await group('Theme').getByRole('button').first().evaluate((e) => e === document.activeElement));
    await page.keyboard.press('Shift+Tab');
    check('Shift+Tab returns trigger without a trap', await trigger.evaluate((e) => e === document.activeElement));
    for (const name of ['Theme', 'Motion']) {
      const pressed = group(name).locator('button[aria-pressed="true"]');
      check(`${name}: visible checkmark supplements selection`, await pressed.locator('svg').evaluate((e) => getComputedStyle(e).visibility === 'visible'));
      for (const button of await group(name).getByRole('button').all()) {
        await button.focus(); const sample = await colors(button); receipt.colors.push({ state: 'all enabled labels focus', group: name, ...sample });
        check(`${name}: enabled label and keyboard ring`, sample.contrast >= 4.5 && sample.outlineStyle !== 'none' && Number.parseFloat(sample.outlineWidth) >= 2);
      }
    }
    await group('Theme').getByRole('button', { name: 'Light', exact: true }).focus(); await page.keyboard.press('Space');
    check('Space changes the named theme selection', await group('Theme').getByRole('button', { name: 'Light', exact: true }).getAttribute('aria-pressed') === 'true');
    await page.getByRole('link', { name: 'Projects', exact: true }).first().click(); await page.waitForURL(`${origin}/projects`);
    check('outside link dismisses without blocking destination', await trigger.getAttribute('aria-expanded') === 'false');
    await open(); await page.getByLabel('Search catalog').click();
    check('click-away keeps clicked input focus', await trigger.getAttribute('aria-expanded') === 'false' && await page.getByLabel('Search catalog').evaluate((e) => e === document.activeElement));
    await select('Theme', 'Dark'); await select('Motion', 'Reduced'); await page.keyboard.press('Escape');
    await page.reload(); await trigger.waitFor(); await open();
    check('both preferences survive reload', await group('Theme').getByRole('button', { name: 'Dark', exact: true }).getAttribute('aria-pressed') === 'true' && await group('Motion').getByRole('button', { name: 'Reduced', exact: true }).getAttribute('aria-pressed') === 'true');
    await page.keyboard.press('Escape');
    await page.getByLabel('Search catalog').fill('Inspekt');
    await page.locator('main').getByRole('link', { name: /Inspekt/ }).first().click();
    await page.waitForURL(`${origin}/projects/inspekt`);
    check('catalog to setup route', await page.getByRole('link', { name: 'Read Inspekt quick-start →', exact: true }).getAttribute('href') === 'https://github.com/aylith-labs/inspekt#quick-start');
    await page.goto(`${origin}/projects/inspekt/changelog`);
    check('empty notes do not imply unreleased', (await page.locator('main').innerText()).includes('not a complete package release history') && !(await page.locator('main').innerText()).includes('moment something ships'));
    await page.getByRole('link', { name: 'Check Inspekt setup & availability →' }).click(); await page.waitForURL(`${origin}/projects/inspekt#setup`);
    for (const slug of ['bract', 'compokit', 'videx']) {
      await page.goto(`${origin}/projects/${slug}`);
      check(`${slug}: signed-out visitor has no dead source CTA`, await page.locator(`main a[href="https://github.com/aylith-labs/${slug}"]`).count() === 0);
      check(`${slug}: setup boundary visible`, (await page.locator('#setup').innerText()).includes('Access is restricted'));
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/design`); await select('Motion', 'Reduced'); await page.keyboard.press('Escape');
    const tiltDemo = page.getByText('3D parallax on hover', { exact: true });
    await tiltDemo.hover({ position: { x: 5, y: 5 } });
    check('reduced tilt stays still', await tiltDemo.evaluate((e) => getComputedStyle(e).transform === 'none'));
    const hoverDemo = page.getByRole('button', { name: 'Hover me', exact: true });
    await hoverDemo.hover();
    check('reduced button stays still', await hoverDemo.evaluate((e) => getComputedStyle(e).transform === 'none'));
    // Existing design controls are another consumer, separate from the popover.
    for (const selected of await page.locator('main button[aria-pressed="true"]').all()) {
      await selected.scrollIntoViewIfNeeded(); const sample = await colors(selected); receipt.colors.push({ state: 'design control', ...sample });
      check('design control white >=4.5', sample.foreground.every((v) => v === 255) && sample.contrast >= 4.5);
    }
    await select('Motion', 'Full'); await page.keyboard.press('Escape');
    await tiltDemo.hover({ position: { x: 5, y: 5 } }); await page.waitForTimeout(450);
    check('explicit full enables tilt', await tiltDemo.evaluate((e) => getComputedStyle(e).transform !== 'none'));
    await select('Motion', 'Reduced'); await page.keyboard.press('Escape');
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    receipt.tiltAfterReduced = await tiltDemo.evaluate((e) => ({ transform: getComputedStyle(e).transform, inline: e.style.transform, motion: document.documentElement.dataset.motion, transition: getComputedStyle(e).transition }));
    check('changing preference clears tilt immediately', await tiltDemo.evaluate((e) => getComputedStyle(e).transform === 'none'));
    await select('Motion', 'System'); await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await tiltDemo.hover({ position: { x: 5, y: 5 } }); await page.waitForTimeout(450);
    check('tilt active before OS reduction, pointer stays over demo', await tiltDemo.evaluate((e) => getComputedStyle(e).transform !== 'none'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    check('OS reduction cancels tilt without mouseleave', await tiltDemo.evaluate((e) => getComputedStyle(e).transform === 'none'));
    for (const state of ['hover', 'pressed', 'return']) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'full');
      await hoverDemo.hover(); await page.waitForTimeout(180);
      if (state === 'pressed') await page.mouse.down();
      if (state === 'return') await page.mouse.move(5, 900);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      check(`OS reduction cancels button ${state}`, await hoverDemo.evaluate((e) => getComputedStyle(e).transform === 'none' && getComputedStyle(e).transitionProperty === 'none'));
      if (state === 'pressed') await page.mouse.up();
    }
    // Observe the actual catalog reveal action and cancel it through a real second
    // tab's preference control. Mutation/animation reads are passive evidence.
    await select('Motion', 'Full'); await page.keyboard.press('Escape');
    await page.goto(`${origin}/projects`);
    const pendingReveal = page.locator('main div[style*="opacity: 0"]').last();
    check('Full override creates pending reveals under reduced OS', await pendingReveal.count() === 1);
    const settingsTab = await context.newPage(); await settingsTab.goto(origin); await settingsTab.getByRole('button', { name: 'Settings and links' }).click();
    await settingsTab.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Reduced', exact: true }).click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
    await page.waitForFunction(() => !document.querySelector('main div[style*="opacity: 0"]'));
    check('other-tab Reduced reveals pending content', true);
    await settingsTab.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Full', exact: true }).click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'full');
    await page.goto(`${origin}/projects`);
    // Locator scrollIntoViewIfNeeded waits for the reveal to settle and would
    // miss the in-flight interval; scroll the actual element without that wait.
    await page.locator('main h3').first().evaluate((e) => e.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => document.getAnimations().some((a) => a.effect?.getKeyframes().some((f) => String(f.transform).includes('translateY(20px)'))));
    await settingsTab.getByRole('group', { name: 'Motion preference' }).getByRole('button', { name: 'Reduced', exact: true }).click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced' && !document.getAnimations().some((a) => a.effect?.getKeyframes().some((f) => String(f.transform).includes('translateY(20px)'))));
    check('other-tab Reduced cancels in-flight source reveals', true);
    await settingsTab.close();
    for (const route of ['/', '/about', '/projects/tickets', '/design', '/projects']) {
      await page.goto(`${origin}${route}`);
      for (const theme of ['Light', 'Dark']) {
        await select('Theme', theme); await page.keyboard.press('Escape');
        for (const action of await page.locator('main .bg-accent-selected:not(:disabled)').all()) {
          await action.scrollIntoViewIfNeeded(); await action.hover();
          const sample = await colors(action); receipt.colors.push({ route, theme, state: 'shared action hover', ...sample });
          check(`${route}/${theme}: shared action contrast`, sample.contrast >= 4.5);
          for (const badge of await action.locator('span').all()) {
            const badgeSample = await colors(badge); receipt.colors.push({ route, theme, state: 'action child', ...badgeSample });
            check(`${route}/${theme}: action child contrast`, badgeSample.contrast >= 4.5);
          }
        }
      }
    }
    for (const width of [390, 320, 720]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto(origin); await open();
      for (const name of ['Theme', 'Motion']) for (const button of await group(name).getByRole('button').all()) {
        const box = await button.boundingBox();
        check(`${width}: settings targets reachable`, box.x >= 0 && box.x + box.width <= width && box.width >= 44 && box.height >= 44);
      }
      check(`${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(output, `narrow-${width}.png`) });
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(origin);
    const initialZoom = await page.evaluate(() => ({ width: innerWidth, ratio: devicePixelRatio }));
    await page.keyboard.press('Control++'); await page.keyboard.press('Control++');
    const afterZoom = await page.evaluate(() => ({ width: innerWidth, ratio: devicePixelRatio }));
    receipt.nativeZoom = { initialZoom, afterZoom, applied: afterZoom.width !== initialZoom.width || afterZoom.ratio !== initialZoom.ratio };
    await page.keyboard.press('Control+0');
    // Explicit CSS reflow stress, not a claim that native browser zoom was changed.
    await page.evaluate(() => { document.body.style.zoom = '2'; }); await open();
    check('200% CSS zoom settings reflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, 'css-zoom-200.png') });
    check('zero page errors', receipt.errors.length === 0);
  }
  await context.close(); receipt.complete = true;
} catch (error) {
  receipt.error = error.stack; process.exitCode = 1;
  for (const c of browser?.contexts() ?? []) for (const page of c.pages()) await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
} finally {
  await browser?.close(); await new Promise((resolve) => server ? server.httpServer.close(resolve) : resolve());
  receipt.finishedAt = new Date().toISOString(); fs.writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ output, complete: receipt.complete, checks: receipt.checks.length, error: receipt.error }));
}
