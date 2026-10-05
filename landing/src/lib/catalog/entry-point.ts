/** Product roots with an authoritative owner mapping and a verified landing path.
 * Kept separate from websiteUrl: a root may open the signed-in app, while /home
 * is a distinct product contract. Never derive missing hostnames from slugs.
 */
const roots: Readonly<Record<string, string>> = Object.freeze({
	linkstash: 'https://linkstash.aylith.com/',
 proomptal: 'https://proomptal.aylith.com/',
 brainstash: 'https://brainstash.aylith.com/',
 inspekt: 'https://aylith-labs.github.io/inspekt/home/',
 specwatch: 'https://aylith-labs.github.io/specwatch/home/',
 bindlume: 'https://bindlume.aylith.com/',
	contactly: 'https://contactly.aylith.com/',
	lintel: 'https://lintel.aylith.com/',
	mullion: 'https://mullion.aylith.com/',
	torbie: 'https://torbie.aylith.com/'
});
export function verifiedProductEntry(slug: string): string | undefined {
	return Object.hasOwn(roots, slug) ? roots[slug] : undefined;
}

/** Public-home role is distinct from the signed-in product entry. The verified owner homepages below include their real public acquisition
 * actions; a private repository does not prevent a public package download. Contactly root is session-dependent. */
const publicHomes: Readonly<Record<string,string>> = Object.freeze({linkstash:'https://linkstash.aylith.com/home',proomptal:'https://proomptal.aylith.com/home',brainstash:'https://brainstash.aylith.com/home',inspekt:'https://aylith-labs.github.io/inspekt/home/',specwatch:'https://aylith-labs.github.io/specwatch/home/',bindlume:'https://bindlume.aylith.com/home',lintel:'https://lintel.aylith.com/',mullion:'https://mullion.aylith.com/',torbie:'https://torbie.aylith.com/'});
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
