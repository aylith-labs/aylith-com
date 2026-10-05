import { parseCatalog } from '$lib/brand/assets';
import catalog from '$lib/brand/catalog-2026-10-04-pruned-v3.json';

// Exact immutable owning-media Git blob is retained as a reproducible build input.
export function load() {
	return { catalog: parseCatalog(catalog) };
}
