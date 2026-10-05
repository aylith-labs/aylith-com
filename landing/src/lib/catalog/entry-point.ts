/** Product roots with an authoritative owner mapping and a verified landing path.
 * Kept separate from websiteUrl: a root may open the signed-in app, while /home
 * is a distinct product contract. Never derive missing hostnames from slugs.
 */
const roots: Readonly<Record<string, string>> = Object.freeze({
	linkstash: 'https://linkstash.aylith.com/',
 proomptal: 'https://proomptal.aylith.com/',
 brainstash: 'https://brainstash.aylith.com/',
 bindlume: 'https://bindlume.aylith.com/',
	contactly: 'https://contactly.aylith.com/',
	lintel: 'https://lintel.aylith.com/',
	mullion: 'https://mullion.aylith.com/',
	torbie: 'https://torbie.aylith.com/',
	tuilith: 'https://tuilith.aylith.com/',
	githerald: 'https://githerald.aylith.com/',
	specwatch: 'https://specwatch.aylith.com/',
	inspekt: 'https://inspekt.aylith.com/',
	dictaro: 'https://dictaro.aylith.com/',
	'agent-quota': 'https://agent-quota.aylith.com/',
	daylog: 'https://daylog.aylith.com/',
	pintle: 'https://pintle.aylith.com/',
});
export function verifiedProductEntry(slug: string): string | undefined {
	return Object.hasOwn(roots, slug) ? roots[slug] : undefined;
}

/** Public-home role is distinct from the signed-in product entry. The verified owner homepages below include their real public acquisition
 * actions; a private repository does not prevent a public package download. Contactly root is session-dependent. */
const publicHomes: Readonly<Record<string,string>> = Object.freeze({linkstash:'https://linkstash.aylith.com/home',proomptal:'https://proomptal.aylith.com/home',brainstash:'https://brainstash.aylith.com/home',inspekt:'https://inspekt.aylith.com/home/',specwatch:'https://specwatch.aylith.com/home/',bindlume:'https://bindlume.aylith.com/home',lintel:'https://lintel.aylith.com/',mullion:'https://mullion.aylith.com/',torbie:'https://torbie.aylith.com/',tuilith:'https://tuilith.aylith.com/home/',githerald:'https://githerald.aylith.com/home/',dictaro:'https://dictaro.aylith.com/home/','agent-quota':'https://agent-quota.aylith.com/home/',daylog:'https://daylog.aylith.com/home/',pintle:'https://pintle.aylith.com/home/'});
export function productWebsitePreview(project: {slug:string;websiteUrl?:string}): string | undefined {
 if(Object.hasOwn(publicHomes,project.slug)) return publicHomes[project.slug];
 if(!project.websiteUrl) return undefined;
 try {
  const url=new URL(project.websiteUrl);
  if(url.protocol!=='https:' || url.username || url.password) return undefined;
  // An owner-declared public /home may be prepared, not proven live. Product
  // roots may open a private app and must never be inferred as public preview.
  if(url.hostname.endsWith('.aylith.com') && !/\/home\/?$/.test(url.pathname)) return undefined;
  return project.websiteUrl;
 } catch { return undefined; }
}
