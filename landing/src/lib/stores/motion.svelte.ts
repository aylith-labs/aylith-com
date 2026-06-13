import { browser } from '$app/environment';

export type MotionPreference = 'system' | 'reduced' | 'full';
export type ResolvedMotion = 'reduced' | 'full';

export const MOTION_STORAGE_KEY = 'aylith:motion';

function readStored(): MotionPreference {
	if (!browser) return 'system';
	const value = localStorage.getItem(MOTION_STORAGE_KEY);
	return value === 'reduced' || value === 'full' || value === 'system' ? value : 'system';
}

function systemReduced(): boolean {
	return browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Three-state motion preference resolved against the OS `prefers-reduced-motion` setting
 * and written to `<html data-motion>`. CSS gates animations on that attribute, so the
 * design system can override the system setting purely for preview. Mirrors the technique
 * used in larger design systems; reimplemented here with Svelte 5 runes.
 */
class MotionState {
	preference = $state<MotionPreference>(readStored());
	system = $state<ResolvedMotion>(systemReduced() ? 'reduced' : 'full');

	get resolved(): ResolvedMotion {
		return this.preference === 'system' ? this.system : this.preference;
	}

	get isReduced(): boolean {
		return this.resolved === 'reduced';
	}

	get systemPrefersReduced(): boolean {
		return this.system === 'reduced';
	}

	set(preference: MotionPreference) {
		this.preference = preference;
		if (browser) localStorage.setItem(MOTION_STORAGE_KEY, preference);
		this.apply();
	}

	cycle() {
		const next: MotionPreference =
			this.preference === 'system' ? 'reduced' : this.preference === 'reduced' ? 'full' : 'system';
		this.set(next);
	}

	private apply() {
		if (browser) document.documentElement.dataset.motion = this.resolved;
	}

	/** Call once on mount. Syncs the live OS setting and keeps `data-motion` current. */
	init(): () => void {
		if (!browser) return () => {};
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			this.system = mediaQuery.matches ? 'reduced' : 'full';
			this.apply();
		};
		sync();
		mediaQuery.addEventListener('change', sync);
		return () => mediaQuery.removeEventListener('change', sync);
	}
}

export const motion = new MotionState();
