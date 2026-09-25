export type SiteView = 'classic' | 'workspace' | 'ayla';

const key = 'aylith:site-view';

export function browserStorage(): Storage | undefined {
	try { return window.localStorage; } catch { return undefined; }
}

export function readView(storage?: Storage): SiteView {
	try {
		const value = storage?.getItem(key);
		return value === 'workspace' || value === 'ayla' ? value : 'classic';
	} catch { return 'classic'; }
}

export function rememberView(view: SiteView, storage?: Storage): void {
	try { storage?.setItem(key, view); } catch { /* Browser storage is optional. */ }
}

/** Initial root loads honor the saved view; explicit links and history select classic. */
export function rootEntry(type: string, query: string, framed: boolean, storage?: Storage): '/workspace' | '/ayla' | null {
	if (framed) return null;
	if (new URLSearchParams(query).get('view') === 'classic') {
		rememberView('classic', storage);
		return null;
	}
	if (type === 'enter') {
		const view = readView(storage);
		if (view !== 'classic') return `/${view}`;
	}
	rememberView('classic', storage);
	return null;
}
