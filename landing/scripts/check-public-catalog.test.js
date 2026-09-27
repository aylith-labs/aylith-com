import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const validator = new URL('./check-public-catalog.mjs', import.meta.url).pathname;

function receipt(markdown) {
  return {
    sourceCommit: 'a'.repeat(40),
    sha256: createHash('sha256').update(markdown).digest('hex'),
    collectedAt: new Date().toISOString()
  };
}

it('accepts a source-owned HTTPS website while rejecting unknown public fields', () => {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-fields-'));
  const dashcam = '---\nname: Dashcam\n---\n';
  const bindlume = '---\nname: Bindlume\nwebsiteUrl: https://bindlume.aylith.com/\n---\n';
  try {
    writeFileSync(join(dir, 'dashcam.md'), dashcam);
    writeFileSync(join(dir, 'bindlume.md'), bindlume);
    writeFileSync(join(dir, 'catalog-provenance.json'), JSON.stringify({ dashcam: receipt(dashcam), bindlume: receipt(bindlume) }));
    const valid = spawnSync(process.execPath, [validator, dir], { encoding: 'utf8' });
    expect(valid.status).toBe(0);
    expect(valid.stdout).toContain('2 source receipts');

    const unknown = bindlume.replace('websiteUrl:', 'arbitraryField:');
    writeFileSync(join(dir, 'bindlume.md'), unknown);
    writeFileSync(join(dir, 'catalog-provenance.json'), JSON.stringify({ dashcam: receipt(dashcam), bindlume: receipt(unknown) }));
    const invalid = spawnSync(process.execPath, [validator, dir], { encoding: 'utf8' });
    expect(invalid.status).not.toBe(0);
    expect(invalid.stderr).toContain('unexpected frontmatter field arbitraryField');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
