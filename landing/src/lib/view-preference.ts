export type SiteView = 'ayla' | 'explore';

const key = 'aylith:site-view';

export function browserStorage(): Storage | undefined {
	try { return window.localStorage; } catch { return undefined; }
}

export function rememberView(view: SiteView, storage?: Storage): void {
	try { storage?.setItem(key, view); } catch { /* Browser storage is optional. */ }
}

/** The explicit immersive root always wins; stored view remains available to controls. */
export function rememberedEntry(_url: URL, _storage?: Storage): null {
	return null;
}
