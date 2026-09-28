// The DOM half of page translation: which elements are sections, remembering
// what each said originally, and painting a translation into one safely.

import DOMPurify from 'dompurify';

const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,th,td,summary,label';
const SKIP = 'pre,code,script,style,svg,textarea,input,select,button,[data-no-translate],[contenteditable]';
const HOLDS = 'svg,img,picture,video,audio,iframe,canvas,input,select,textarea,button';
// Inline markup a translation may carry back. Anything else — a script, a
// handler, a form — is stripped, because the HTML came from a model.
const INLINE = ['a', 'b', 'strong', 'i', 'em', 'u', 's', 'small', 'sub', 'sup', 'mark', 'abbr', 'br', 'span', 'code', 'kbd', 'q', 'cite', 'time'];

const originals = new WeakMap<Element, string>();

export type Section = { id: string; el: Element; html: string };

/**
 * The translatable sections under `root`: the innermost block elements holding
 * text, outside code, controls and anything marked `data-no-translate`. Ids are
 * ordinal per page, so a section keeps its id across visits while the page's
 * shape holds.
 */
export function collectSections(root: Element): Section[] {
	const sections: Section[] = [];
	for (const el of root.querySelectorAll(BLOCKS)) {
		// A section holding a control, an icon or an image is left whole: sanitizing its
		// translation would strip what makes it work.
		if (el.closest(SKIP) || el.querySelector(BLOCKS) || el.querySelector(HOLDS)) continue;
		const original = originals.get(el) ?? el.innerHTML;
		if (!(el.textContent ?? '').trim() || original.length > 8000) continue;
		originals.set(el, original);
		// Svelte's hydration anchors are comments; a model has no use for them.
		const html = original.replace(/<!--[\s\S]*?-->/g, '').trim();
		sections.push({ id: `${sections.length}:${el.tagName.toLowerCase()}`, el, html });
	}
	return sections;
}

/** Paint a translation, or the original when `html` is null. */
export function paint(el: Element, html: string | null, flash: boolean): void {
	const original = originals.get(el);
	if (html === null) {
		if (original !== undefined) el.innerHTML = original;
		el.removeAttribute('data-translated');
		return;
	}
	el.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: INLINE, ALLOWED_ATTR: ['href', 'title', 'datetime', 'class', 'target', 'rel'] });
	el.setAttribute('data-translated', '');
	if (flash) {
		el.classList.remove('translation-updated');
		// Restart the animation when two updates land close together.
		void (el as HTMLElement).offsetWidth;
		el.classList.add('translation-updated');
		setTimeout(() => el.classList.remove('translation-updated'), 1200);
	}
}

export function restoreAll(root: Element): void {
	for (const el of root.querySelectorAll('[data-translated]')) paint(el, null, false);
}
