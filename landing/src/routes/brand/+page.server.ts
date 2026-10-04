import { parseCatalog } from '$lib/brand/assets';

// Pull the immutable media catalog at prerender time, without a runtime API.
export async function load({ fetch }) {
	const response = await fetch('https://media.aylith.com/aylith-com/brand/2026-10-04-social-library/catalog-2026-10-04-pruned.json');
	if (!response.ok) throw new Error(`Brand asset catalog unavailable: ${response.status}`);
	return { catalog: parseCatalog(await response.json()) };
}

