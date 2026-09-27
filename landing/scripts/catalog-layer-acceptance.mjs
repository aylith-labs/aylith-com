import fs from 'node:fs';
// Run against a built local preview or the published site:
// node scripts/catalog-layer-acceptance.mjs <playwright-core path> <origin> <output dir>
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(process.argv[2]));
const base = process.argv[3] ?? 'http://127.0.0.1:4232';
const output = path.resolve(process.argv[4] ?? '/var/tmp/aylith-catalog-layer-qa');
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const style = (node) => {
  const s = getComputedStyle(node), r = node.getBoundingClientRect();
  return { borderColor: s.borderColor, borderWidth: s.borderWidth, radius: s.borderRadius, height: r.height, width: r.width, outlineStyle: s.outlineStyle, shadow: s.boxShadow };
};

try {
  for (const [name, width, height, scheme] of [
    ['dark-desktop', 1280, 720, 'dark'],
    ['light-desktop', 1280, 720, 'light'],
    ['dark-mobile', 390, 640, 'dark'],
    ['light-mobile', 390, 640, 'light']
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
    await page.goto(`${base}/explore`, { waitUntil: 'domcontentloaded' });
    const search = page.locator('#explore-search');
    const category = page.locator('#explore-category');
    const view = page.locator('#aylith-view');
    const [searchIdle, categoryIdle] = await Promise.all([search.evaluate(style), category.evaluate(style)]);
    assert(searchIdle.borderColor === categoryIdle.borderColor && searchIdle.borderWidth === categoryIdle.borderWidth && searchIdle.radius === categoryIdle.radius && searchIdle.height === categoryIdle.height, `${name}: catalog controls differ ${JSON.stringify({searchIdle, categoryIdle})}`);
    const before = await search.boundingBox();
    await search.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(600);
    const searchFocus = await search.evaluate(style);
    const after = await search.boundingBox();
    assert(before.x === after.x && before.y === after.y && before.width === after.width && before.height === after.height && searchFocus.outlineStyle === 'none' && searchFocus.shadow === 'none', `${name}: search focus halo or layout shift ${JSON.stringify(searchFocus)}`);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(600);
    assert(await page.evaluate(() => document.activeElement?.id) === 'explore-category', `${name}: keyboard did not reach category`);
    const categoryFocus = await category.evaluate(style);
    assert(categoryFocus.outlineStyle === 'none' && categoryFocus.borderColor === searchFocus.borderColor, `${name}: category focus mismatch ${JSON.stringify(categoryFocus)}`);
    await page.screenshot({ path: `${output}/${name}-focus.png` });
    await view.click();
    const option = page.locator('#aylith-view-choice-2');
    const a = await option.boundingBox(), b = await category.boundingBox();
    assert(a && b, `${name}: missing menu geometry`);
    const left = Math.max(a.x, b.x), right = Math.min(a.x+a.width, b.x+b.width);
    const top = Math.max(a.y, b.y), bottom = Math.min(a.y+a.height, b.y+b.height);
    const point = right > left && bottom > top ? { x:(left+right)/2, y:(top+bottom)/2 } : { x:a.x+a.width/2, y:a.y+a.height/2 };
    const hit = await page.evaluate(({x,y}) => { const node=document.elementFromPoint(x,y); return node?.closest('[role=option]')?.id ?? node?.id ?? ''; }, point);
    assert(hit === 'aylith-view-choice-2', `${name}: menu obscured by ${hit}`);
    await page.screenshot({ path: `${output}/${name}-open.png` });
    await page.keyboard.press('Escape');
    assert(await view.getAttribute('aria-expanded') === 'false', `${name}: view Escape`);
    await view.click();
    await page.mouse.click(point.x, point.y);
    await page.waitForURL('**/ayla');
    await page.goto(`${base}/explore`);
    await category.click();
    assert(await category.getAttribute('aria-expanded') === 'true', `${name}: category did not open`);
    await page.keyboard.press('Escape');
    assert(await category.getAttribute('aria-expanded') === 'false', `${name}: category escape`);
    await category.click();
    await search.click();
    assert(await category.getAttribute('aria-expanded') === 'false', `${name}: category outside click`);
    await page.getByRole('button', { name: 'Settings and links' }).click();
    const settings = page.getByRole('group', { name: 'Theme preference' });
    assert(await settings.isVisible(), `${name}: settings hidden by catalog`);
    const settingsBox = await settings.boundingBox();
    assert(settingsBox && await page.evaluate(({x,y}) => document.elementFromPoint(x,y)?.closest('[role=group]')?.getAttribute('aria-label') === 'Theme preference', {x:settingsBox.x+settingsBox.width/2,y:settingsBox.y+settingsBox.height/2}), `${name}: settings obscured`);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Ask Ayla' }).click();
    const dialog = page.getByRole('dialog', { name: 'Ayla conversation' });
    assert(await dialog.isVisible() && await category.evaluate(e => e.closest('main')?.inert === true), `${name}: modal does not isolate catalog`);
    await page.keyboard.press('Escape');
    assert(!(await dialog.isVisible().catch(() => false)), `${name}: modal Escape`);
    await page.goto(`${base}/projects`);
    assert(await page.getByText('Restricted access', {exact:true}).count() === 0 && await page.getByText('Setup unverified', {exact:true}).count() === 0, `${name}: audit badge still visible`);
    const classicSearch = page.getByRole('textbox', {name:'Search catalog'});
    const classicCategory = page.locator('#catalog-category');
    const [classicIdle, classicCategoryIdle] = await Promise.all([classicSearch.evaluate(style), classicCategory.evaluate(style)]);
    assert(classicIdle.borderColor === classicCategoryIdle.borderColor && classicIdle.radius === classicCategoryIdle.radius && classicIdle.height === classicCategoryIdle.height, `${name}: Classic controls mismatch`);
    await classicSearch.focus();
    const classicFocus = await classicSearch.evaluate(style);
    assert(classicFocus.outlineStyle === 'none' && classicFocus.shadow === 'none', `${name}: Classic double focus`);
    const card = page.getByRole('link', {name:/Bract/}).first();
    const tagline = await card.locator('p').first().evaluate(node => getComputedStyle(node).color);
    console.log(`${name}: menu hit ${hit}, paired controls, focus, card copy passed; Bract tagline ${tagline}`);
    await page.waitForTimeout(650);
    await page.screenshot({ path: `${output}/${name}-cards.png` });
    const names = new Set();
    for (;;) {
      for (const title of await page.locator('main h3').allTextContents()) names.add(title.trim());
      assert(await page.getByText('Restricted access', {exact:true}).count() === 0 && await page.getByText('Setup unverified', {exact:true}).count() === 0, `${name}: page badge`);
      if (await page.getByRole('button', { name: 'Next page' }).isDisabled()) break;
      await page.getByRole('button', { name: 'Next page' }).click();
    }
    const expected = fs.readdirSync(path.resolve(import.meta.dirname, '../.generated/projects')).filter((file) => file.endsWith('.md')).length;
    assert(names.size === expected, `${name}: only ${names.size}/${expected} catalog cards seen`);
    await classicSearch.fill('no-matching-product-xyz');
    assert(await page.getByText(/No tools matched/).isVisible(), `${name}: empty search state`);
    assert(await page.getByText('Restricted access', {exact:true}).count() === 0 && await page.getByText('Setup unverified', {exact:true}).count() === 0, `${name}: empty-search badge`);
    await page.goto(`${base}/?view=classic`);
    assert(await page.getByRole('heading', { name: /Useful tools.*Connected work/ }).isVisible(), `${name}: Classic home`);
    assert(await page.getByTestId('public-showcase').locator('article').count() > 0, `${name}: home cards`);
    assert(await page.getByText('Restricted access', {exact:true}).count() === 0 && await page.getByText('Setup unverified', {exact:true}).count() === 0, `${name}: home badge`);
    assert(!(await page.locator('body').innerText()).includes('Early betas'), `${name}: old footer`);
    await page.screenshot({ path: `${output}/${name}-home.png` });
    await page.goto(`${base}/about`);
    assert(await page.getByRole('heading', { name: 'We listen first, then we move fast.' }).isVisible(), `${name}: About route`);
    if (name === 'dark-desktop') await page.screenshot({ path: `${output}/${name}-about.png` });
    await page.goto(`${base}/design`);
    assert(await page.getByRole('heading', { name: 'Aylith design system' }).isVisible(), `${name}: Design route`);
    if (name === 'dark-desktop') await page.screenshot({ path: `${output}/${name}-design.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
