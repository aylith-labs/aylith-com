/** Customer presentation of source-owned scope. Never adds an access path or capability. */
const descriptions: Record<string, string> = {
 bract: 'Local agent lifecycle records, PostgreSQL memory storage, and trace views.',
 compokit: 'Match an existing component library and design tokens to reviewable generated code.',
 dictaro: 'Local voice dictation with on-device transcription and deterministic cleanup in a browser extension and Windows desktop pipeline.',
 docpeel: 'Extract fields from supported PDFs, Word files, and images. Review typed fields and confidence flags against the retained original, then export the result.',
 plainbase: 'Ask questions of a connected PostgreSQL database and inspect the generated SQL, result table, and suggested charts.'
};
const replacements: Record<string, [string, string][]> = {
 bract: [
  ['Agent operations, explored through local prototypes', 'Agent lifecycle records, memory, and traces'],
  ['Local deployment-lifecycle prototype; no production compute backend', 'Records deployment lifecycle transitions; compute runs separately'],
  ['Prototype persistent memory storage; semantic search not yet connected', 'Stores and retrieves agent-scoped key/value memory in PostgreSQL'],
  ['Prototype trace ingestion and waterfall visualization', 'Trace ingestion and waterfall visualization']
 ],
 compokit: [['A planned design-to-code workflow', 'A design-to-code workflow']],
 knowmine: [['This source prototype has', 'The source application has'], ['do not yet verify', 'do not verify']],
 plainbase: [['It is a prototype; accuracy, permissions, and deployment readiness have not been established.', 'Review generated SQL and use a separate, least-privilege database role.']],
 ourobuild: [['Ourobuild is a scaffold and PRD-issue CLI prototype.', 'Ourobuild scaffolds configuration and previews or creates PRD issues.']]
};
const rolloutLimit = /^(No public .* (?:verified|route)|Public product notes below describe|No verified public dictation app)/;
export function customerProjectFields(data: Record<string, unknown>, slug: string): Record<string, unknown> {
 const result = { ...data };
 if (descriptions[slug]) result.description = descriptions[slug];
 for (const key of ['tagline', 'features']) {
  const rewrite = (text: string) => (replacements[slug] ?? []).reduce((value, [before, after]) => value.replaceAll(before, after), text);
  if (typeof result[key] === 'string') result[key] = rewrite(result[key] as string);
  else if (Array.isArray(result[key])) result[key] = (result[key] as string[]).filter(item => !/^(Planned |Provider-neutral product direction|Five-surface parity catalog)/.test(item)).map(rewrite);
 }
 if (data.onboarding && typeof data.onboarding === 'object') {
  const setup = data.onboarding as Record<string, unknown>;
  if (Array.isArray(setup.limitations)) result.onboarding = { ...setup, limitations: (setup.limitations as string[]).filter(item => !rolloutLimit.test(item)) };
 }
 return result;
}
const customerBodies: Record<string, string> = {
 bract: `## Agent lifecycle records, memory, and traces

Bract brings local deployment records, PostgreSQL key/value memory, and trace views into one workspace.

- Record lifecycle transitions and endpoint strings. The runner records activity; compute runs separately.
- Store and retrieve agent-scoped key/value entries in PostgreSQL.
- Ingest traces and inspect recorded agent activity.

Source setup requires authorized repository access.`,
 compokit: `## Code that fits your component library

Compokit scans an existing component library and design tokens, matches components by keyword, and produces code for review. Component scanning covers React, Vue, and Svelte.

Review generated output and validate it against the design and the host application. Use your existing accessibility and test checks before adopting a change.

The [Compokit overview](https://aylith-labs.github.io/compokit/) explains this source-run flow. Source setup requires authorized repository access.`,
 dictaro: `## Local speech, useful text

Dictaro provides local speech-to-text and deterministic cleanup. The browser extension runs Whisper in the browser. The Windows desktop daemon uses a resident local faster-whisper server and injects cleaned text into the focused application.

Vocabulary corrections and snippets reduce repetitive typing. Build the extension from source or run the Windows daemon with its local speech server.

The desktop loopback JSON export returns the latest successfully injected transcript held in memory for the daemon session: raw and cleaned text, capture time, source application, and permissionToShare:false. Export is an explicit API request; the result is not automatically archived, uploaded, or shared.

The [Dictaro overview](https://aylith-labs.github.io/dictaro/) describes the local workflow.`,
 docpeel: `## Extract fields, check the source

Turn supported client documents into typed fields for inspection and export. Upload PDF, DOCX, JPEG, PNG, or TIFF files, and use a document type or a supplied field list. Review confidence and validation flags against the retained original, then export JSON, CSV, or Excel.

Source setup requires repository access, a configured Supabase Auth/database/private Storage project with the app migrations, and a model provider key. Keep the app process running while background processing finishes; processing does not use a durable serverless queue.

Review extraction results before relying on them.`,
 knowmine: `## A record of what you own

Photo and receipt scans suggest item details for review; you decide what to enter and save. A suggestion is not a saved record or proof of value. Search saved items, filter by category or location, and add manual value and warranty fields.

Run the Bun web and API workspaces with local SQLite and Google OAuth credentials. Optional photo and receipt suggestions require an Anthropic API key.

Scan-page links open an empty item form: enter the item manually. Photos used for suggestions are not attached to the saved item by that action. Export skips missing or unreadable photo files, so verify the archive.

Item and photo reads are session-protected. Item writes do not verify ownership of referenced categories, locations, or tags; keep this use within a single trusted account.`,
 ourobuild: `## Scaffold a workflow and preview PRD issues

Ourobuild writes starter configuration, MCP settings, skills, and GitHub workflow templates into a target repository. Layer 2 parses configured PRD checklist items and previews issue proposals with --dry-run; without that flag it uses GitHub credentials to create issues.

Source setup requires Bun and a resolvable ourobuild package in the target configuration. Review generated files and issue proposals before a write. Repeated issue creation can produce duplicates.

Other run layers print guidance about the scaffolded workflows. Workflow execution requires engine credentials, configuration, and an external runner. Doctor checks setup; it does not certify a workflow run or enforce a spending budget.`,
 plainbase: `## Ask a question, inspect the query

Plainbase turns questions about connected PostgreSQL data into SQL, result tables, and suggested charts. Schema metadata is sent to the configured model; follow-up questions can use conversation history supplied by the current client session. Pin queries to dashboards or export results as CSV.

Source setup requires the Next.js app, its own PostgreSQL store, and an AI provider key. Use a separate, least-privilege database role and review generated SQL and results. A static SQL guard and a read-only transaction limit writes.

Shared dashboard tokens grant unauthenticated reruns without row-level scope or rate limits. The connection form's TLS option disables certificate verification. Use synthetic data for this source-run evaluation.`
};
export function customerProjectBody(content: string, slug: string): string {
 return customerBodies[slug] ?? content;
}
