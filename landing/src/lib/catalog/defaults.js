// Shared catalog constants — imported by both the build-time collector
// (scripts/collect.mjs, plain node) and the runtime loader (server/markdown.ts).
// Plain .js so node can import it without a TS loader.

export const ORG = 'aylith-labs';

// The site repo itself is always skipped; other non-product repos opt out by
// carrying this GitHub topic.
export const SELF_REPO = 'aylith-com';
export const EXCLUDE_TOPIC = 'aylith-no-catalog';

// Applied when a manifest omits the curation fields, or for placeholder repos.
export const DEFAULT_ICON =
	'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
export const DEFAULT_GRADIENT_FROM = '#6366f1';
export const DEFAULT_GRADIENT_TO = '#818cf8';

// Placeholder repos (no manifest) land here so the catalog filter has a home for them.
export const PLACEHOLDER_CATEGORY = 'uncategorized';
export const PLACEHOLDER_STATUS = 'planning';
