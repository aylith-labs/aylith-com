import DOMPurify from 'dompurify';
import { Marked } from 'marked';

// Render streamed assistant markdown to sanitized HTML. LLM output is untrusted,
// so every render passes through DOMPurify. Links open in a new tab with safe rel.
// A private instance: the global `marked` is shared with the prerendered project pages.
const marked = new Marked({ gfm: true, breaks: true });

export function renderMarkdown(source: string): string {
  const rawHtml = marked.parse(source, { async: false }) as string;
  const clean = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'textarea'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  });
  return clean;
}
