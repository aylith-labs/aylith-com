import { getEntries } from '$lib/changelog/entries';

export function load({ params, data }) {
	return { ...data, entries: getEntries(params.slug) };
}
