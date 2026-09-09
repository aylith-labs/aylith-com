/** Validate optional setup data before any surface treats it as a usable path.
 * @param {unknown} raw
 */
export function normalizeOnboarding(raw) {
	if (!raw || typeof raw !== 'object') return undefined;
	const value = /** @type {{access?: unknown, url?: unknown, releasesUrl?: unknown, prerequisites?: unknown, limitations?: unknown}} */ (raw);
	if (value.access !== 'public-source' && value.access !== 'restricted') return undefined;
	/** @param {unknown} items @returns {items is string[]} */
	const nonemptyStrings = (items) => Array.isArray(items) && items.every((item) => typeof item === 'string' && item.trim());
	if (!nonemptyStrings(value.prerequisites) || !nonemptyStrings(value.limitations)) return undefined;
	for (const candidate of [value.url, value.releasesUrl]) {
		if (candidate === undefined) continue;
		if (typeof candidate !== 'string') return undefined;
		try {
			const url = new URL(candidate);
			if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return undefined;
		} catch { return undefined; }
	}
	return { access: value.access, ...(value.url === undefined ? {} : { url: value.url }), ...(value.releasesUrl === undefined ? {} : { releasesUrl: value.releasesUrl }), prerequisites: value.prerequisites, limitations: value.limitations };
}
