export type Asset = {
	id: string; title: string; brand: string; kind: string; status: string; url: string;
	width: number; height: number; bytes: number; sha256: string; addedOn: string;
	createdOn: string | null; vectorUrl?: string;
	history: { date: string | null; event: string; source: string }[];
};
export type AssetCatalog = { schemaVersion: number; updatedOn: string; datePolicy: string; assets: Asset[] };
export const statusLabels: Record<string, string> = {
	'in-use': 'In use on X', selected: 'Selected · user reported', alternative: 'Saved alternative',
	retired: 'Replaced', exploration: 'Exploration', reference: 'Reference', candidate: 'Candidate'
};
export const kindLabels: Record<string, string> = { logo: 'Logo', banner: 'Banner', avatar: 'Avatar', 'contact-sheet': 'Contact sheet' };
export const views = ['grid', 'list', 'journey'] as const;
export type AssetView = typeof views[number];
export function validView(value: string | null): AssetView {
	return views.includes(value as AssetView) ? value as AssetView : 'grid';
}
export function filterAssets(assets: Asset[], query: string, brand: string, kind: string, status: string) {
	const needle = query.trim().toLocaleLowerCase();
	return assets.filter((asset) => (!brand || asset.brand === brand) && (!kind || asset.kind === kind) &&
		(!status || asset.status === status) && (!needle || `${asset.title} ${asset.brand} ${kindLabels[asset.kind]} ${statusLabels[asset.status]}`.toLocaleLowerCase().includes(needle)));
}
export function journey(assets: Asset[]) {
	const groups = new Map<string, { asset: Asset; event: Asset['history'][number] }[]>();
	for (const asset of assets) for (const event of asset.history) {
		const key = event.date ?? 'unknown';
		const group = groups.get(key) ?? [];
		group.push({ asset, event });
		groups.set(key, group);
	}
	return [...groups].sort(([a], [b]) => a === 'unknown' ? 1 : b === 'unknown' ? -1 : b.localeCompare(a));
}
export function dateLabel(value: string | null) {
	return value ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : 'Date not recorded';
}
export function parseCatalog(value: unknown): AssetCatalog {
	const catalog = value as AssetCatalog;
	if (catalog?.schemaVersion !== 1 || !Array.isArray(catalog.assets) || !catalog.assets.length) throw new Error('Invalid brand asset catalog');
	const ids = new Set<string>();
	const validDate = (date: unknown) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
	const mediaUrl = (url: unknown) => typeof url === 'string' && url.startsWith('https://media.aylith.com/');
	for (const asset of catalog.assets) {
		if (!asset.id || ids.has(asset.id) || !asset.title || !asset.brand || !kindLabels[asset.kind] || !statusLabels[asset.status] ||
			!mediaUrl(asset.url) || (asset.vectorUrl && !mediaUrl(asset.vectorUrl)) || !validDate(asset.addedOn) ||
			!(asset.width > 0 && asset.height > 0 && asset.bytes > 0) || !Array.isArray(asset.history) ||
			!asset.history.every(event => (event.date === null || validDate(event.date)) && event.event && event.source)) throw new Error(`Invalid brand asset: ${asset.id}`);
		ids.add(asset.id);
	}
	return catalog;
}
