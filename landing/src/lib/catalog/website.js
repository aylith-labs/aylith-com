/** A source-owned public website, distinct from repository and setup URLs.
 * @param {unknown} value
 */
export function normalizeWebsiteUrl(value) {
	if (typeof value !== 'string' || !value.trim()) return undefined;
	try {
		const url = new URL(value);
		if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return undefined;
		return url.href;
	} catch {
		return undefined;
	}
}
