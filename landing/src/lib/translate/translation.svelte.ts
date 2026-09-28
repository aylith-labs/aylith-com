import { browser } from '$app/environment';
import { resolveAiUrl } from '$lib/ask/config';
import type { LanguageEntry } from './catalog';
import { collectSections, paint, restoreAll, type Section } from './page';
import { type Painted, planPaints, progress, type SectionResult } from './plan';

// The reader's language and the page translation it drives. The choice and the
// "flash what changed" preference live beside the theme in localStorage; the
// translations themselves live in the gateway's cache, shared by every reader.

export const LANGUAGE_STORAGE_KEY = 'aylith:language';
export const HIGHLIGHT_STORAGE_KEY = 'aylith:translate-highlight';

type Choice = Pick<LanguageEntry, 'code' | 'label' | 'target'>;

const POLL_MS = 2500;
const POLL_FOR_MS = 120_000;

function readChoice(): Choice | null {
	if (!browser) return null;
	try {
		const value = JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'null');
		return value && typeof value.code === 'string' && typeof value.target === 'string' ? value : null;
	} catch {
		return null;
	}
}

function readHighlight(): boolean {
	if (!browser) return true;
	try {
		return localStorage.getItem(HIGHLIGHT_STORAGE_KEY) !== 'off';
	} catch {
		return true;
	}
}

function write(key: string, value: string | null) {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {
		// The choice still holds for this page when storage is unavailable.
	}
}

class TranslationState {
	choice = $state<Choice | null>(readChoice());
	highlight = $state(readHighlight());
	/** null until the gateway has said whether it translates at all. */
	available = $state<boolean | null>(null);
	busy = $state(false);
	pending = $state(0);
	stale = $state(0);
	failed = $state(false);

	private run = 0;
	private painted = new Map<string, Painted>();
	private sections = new Map<string, Section>();
	private pollTimer: ReturnType<typeof setTimeout> | null = null;

	async checkAvailable(): Promise<void> {
		if (!browser || this.available !== null) return;
		try {
			const response = await fetch(`${resolveAiUrl()}/api/translate/status`);
			this.available = response.ok && (await response.json()).enabled === true;
		} catch {
			this.available = false;
		}
	}

	choose(choice: Choice | null) {
		this.choice = choice;
		write(LANGUAGE_STORAGE_KEY, choice ? JSON.stringify(choice) : null);
		void this.apply();
	}

	setHighlight(on: boolean) {
		this.highlight = on;
		write(HIGHLIGHT_STORAGE_KEY, on ? 'on' : 'off');
	}

	/** Translate the current page into the chosen language, or restore it. Call after every navigation. */
	async apply(): Promise<void> {
		if (!browser) return;
		const run = ++this.run;
		this.stopPolling();
		const root = document.querySelector('main');
		if (!root) return;
		restoreAll(root);
		this.painted.clear();
		this.pending = this.stale = 0;
		this.failed = false;
		const choice = this.choice;
		document.documentElement.lang = choice && choice.code.length === 2 ? choice.code : 'en';
		if (!choice) return;
		await this.checkAvailable();
		if (!this.available || run !== this.run) return;

		const sections = collectSections(root);
		this.sections = new Map(sections.map((s) => [s.id, s]));
		if (sections.length === 0) return;
		this.busy = true;
		try {
			const response = await fetch(`${resolveAiUrl()}/api/translate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					target: choice.target,
					page: location.pathname,
					segments: sections.map(({ id, html }) => ({ id, html }))
				})
			});
			if (run !== this.run) return;
			if (!response.ok) throw new Error(`translate ${response.status}`);
			const { results } = (await response.json()) as { results: SectionResult[] };
			if (run !== this.run) return;
			this.show(results);
			if (this.pending > 0) this.poll(run, choice.target, results, Date.now());
		} catch {
			if (run === this.run) this.failed = true;
		} finally {
			if (run === this.run) this.busy = false;
		}
	}

	private show(results: SectionResult[]) {
		for (const { id, html, flash } of planPaints(results, this.painted)) {
			const section = this.sections.get(id);
			if (!section) continue;
			paint(section.el, html, flash && this.highlight);
		}
		for (const r of results) {
			if (r.html === null) this.painted.delete(r.id);
			else this.painted.set(r.id, { sourceHash: r.sourceHash, html: r.html });
		}
		({ pending: this.pending, stale: this.stale } = progress(results));
	}

	private poll(run: number, target: string, results: SectionResult[], startedAt: number) {
		this.pollTimer = setTimeout(async () => {
			if (run !== this.run) return;
			const waiting = results.filter((r) => r.pending);
			try {
				const hashes = waiting.map((r) => r.sourceHash).join(',');
				const response = await fetch(
					`${resolveAiUrl()}/api/translate/peek?target=${encodeURIComponent(target)}&hashes=${hashes}`
				);
				if (!response.ok || run !== this.run) return;
				const { results: peeked } = (await response.json()) as {
					results: { sourceHash: string; html: string | null; tier: SectionResult['tier']; pending: boolean }[];
				};
				const byHash = new Map(peeked.map((p) => [p.sourceHash, p]));
				results = results.map((r) => {
					const p = byHash.get(r.sourceHash);
					// A peek with nothing yet keeps what is on screen, including a stale translation.
					if (!p || p.html === null) return r;
					return { ...r, html: p.html, tier: p.tier, pending: p.pending, stale: false };
				});
				this.show(results);
			} catch {
				// A missed poll is retried on the next tick.
			}
			if (run === this.run && this.pending > 0 && Date.now() - startedAt < POLL_FOR_MS) {
				this.poll(run, target, results, startedAt);
			}
		}, POLL_MS);
	}

	private stopPolling() {
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = null;
	}
}

export const translation = new TranslationState();
