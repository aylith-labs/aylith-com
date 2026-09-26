import { getEntries } from '$lib/changelog/entries';
export function load({ params }) { return { entries: getEntries(params.slug) }; }
