const PUBLIC_KEYS = ['q', 'category', 'view', 'selected', 'pane', 'lang'] as const;
const OWNED_WEB_PATH = /^\/(?:classic|web|projects|explore)(?:\/[a-z0-9-]+(?:\/(?:website|changelog))?)?\/?$/;

/** Carry only public discovery state, never chat, credentials or arbitrary URLs. */
export function publicWebContext(url: URL): string | null {
	if (!OWNED_WEB_PATH.test(url.pathname)) return null;
	const result = new URL(['/web','/web/','/explore','/explore/'].includes(url.pathname) ? '/classic' : url.pathname, url.origin);
	for (const key of PUBLIC_KEYS) {
		const value = url.searchParams.get(key);
		if (value && value.length <= 200) result.searchParams.set(key, value);
	}
	return `${result.pathname}${result.search}`;
}

export function readWebContext(url: URL): URL | null {
	if (OWNED_WEB_PATH.test(url.pathname)) return new URL(publicWebContext(url)!, url.origin);
	const stored = url.searchParams.get('web');
	if (!stored || stored.length > 1600 || !stored.startsWith('/') || stored.startsWith('//')) return null;
	try {
		const candidate = new URL(stored, url.origin);
		const clean = candidate.origin === url.origin ? publicWebContext(candidate) : null;
		return clean ? new URL(clean, url.origin) : null;
	} catch { return null; }
}

export function viewHref(url: URL, mode: 'web' | 'ayla' | 'conversation'): string {
	const context = readWebContext(url);
	if (mode === 'web') return context ? `${context.pathname}${context.search}` : '/classic';
	const target = new URL(mode === 'conversation' ? '/ayla' : '/', url.origin);
	if (context) target.searchParams.set('web', `${context.pathname}${context.search}`);
	return `${target.pathname}${target.search}`;
}

export function publicPageContext(url: URL, projects: readonly {slug:string;name:string}[]) {
	const source = readWebContext(url) ?? new URL(url.pathname, url.origin);
	const slug = source.pathname.match(/^\/(?:explore|projects)\/([a-z0-9-]+)/)?.[1] ?? source.searchParams.get('selected');
	const project = projects.find(item => item.slug === slug);
	return { surface: 'aylith.com — Ayla and Web', route: source.pathname,
		...(source.searchParams.get('q') ? {query:source.searchParams.get('q')!.slice(0,200)} : {}),
		...(source.searchParams.get('category') ? {category:source.searchParams.get('category')!.slice(0,100)} : {}),
		...(project ? {projectSlug:project.slug,projectName:project.name} : {}) };
}

/** Canonicalize the former classic query without carrying private request data. */
export function legacyClassicHref(url: URL): string | null {
	if (url.pathname !== '/' || url.searchParams.get('view') !== 'classic') return null;
	const target = new URL('/classic', url.origin);
	for (const key of PUBLIC_KEYS) {
		if (key === 'view') continue;
		const value = url.searchParams.get(key);
		if (value && value.length <= 200) target.searchParams.set(key, value);
	}
	if (url.hash === '#try' || url.hash === '#method') target.hash = url.hash;
	return target.pathname + target.search + target.hash;
}

/** The former discovery/home entries alias one Web surface, preserving public context only. */
export function canonicalWebHref(url: URL): string | null {
 if (!['/web','/web/','/explore','/explore/'].includes(url.pathname)) return null;
 const clean=publicWebContext(url);
 if (!clean) return null;
 return clean+(['#try','#catalog','#method'].includes(url.hash)?url.hash:'');
}
