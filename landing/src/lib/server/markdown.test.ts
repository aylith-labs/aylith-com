import { describe, expect, it } from 'vitest';
import '$lib/ask/markdown';
import { renderProjectBody } from '$lib/server/markdown';

// The assistant renders chat with `breaks: true`; loading it must not turn manifest newlines into <br>.
describe('renderProjectBody', () => {
	it('joins hard-wrapped lines even after the assistant renderer has loaded', () => {
		const html = renderProjectBody('changes are\ncherry-picked across when they are worth taking');
		expect(html).toContain('<p>changes are');
		expect(html).not.toContain('<br');
	});
});
