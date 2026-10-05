import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = readFileSync(new URL('../build/index.html', import.meta.url), 'utf8');
const web = readFileSync(new URL('../build/web.html', import.meta.url), 'utf8');
const immersive = readFileSync(new URL('../build/ayla/immersive.html', import.meta.url), 'utf8');

assert.match(root, /id="ayla-conversation"/);
assert.match(root, /Ayla · conversation/);
assert.match(root, /Sign in/);
assert.doesNotMatch(root, /Useful tools\./);
assert.match(web, /Useful tools\./);
assert.match(web, /Get started/);
assert.match(immersive, /Ayla immersive/);
assert.match(immersive, /id="ayla-conversation"/);
assert.doesNotMatch(immersive, /Useful tools\./);
