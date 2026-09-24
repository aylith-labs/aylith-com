// Temporary compatibility for source manifests that still contain the retired
// catalog maturity copy. Product owners can remove these phrases at the source;
// all other product prose remains source-owned and unchanged.
/** @param {string} body */
export function publicCatalogBody(body) {
	return body
		.replace('This catalog entry is in planning; it is not', 'This catalog entry is not')
		.replace('Videx is a beta in a private repository', 'Videx is in a private repository')
		.replace(/^### Try the beta$/gm, '### Set up Tickets locally');
}
