import { browser } from '$app/environment';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

function readStored(): ThemePreference {
	if (!browser) return 'system';
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
	} catch {
		return 'system';
	}
}

function systemDark(): boolean {
	return browser && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Three-state theme preference resolved against the OS setting and applied as `.dark` on `<html>`. */
class ThemeState {
	preference = $state<ThemePreference>(readStored());
	systemPrefersDark = $state(systemDark());

	get isDark(): boolean {
		return this.preference === 'dark' || (this.preference === 'system' && this.systemPrefersDark);
	}

	set(preference: ThemePreference) {
		this.preference = preference;
		this.apply();
		if (browser) {
			try {
				localStorage.setItem(THEME_STORAGE_KEY, preference);
			} catch {
				// Keep the current-page choice usable when persistence is unavailable.
			}
		}
	}

	private apply() {
		if (!browser) return;
		const root = document.documentElement;
		root.classList.toggle('dark', this.isDark);
		if (this.preference === 'system') delete root.dataset.theme;
		else root.dataset.theme = this.preference;
	}

	/** Call once on mount. Keeps the resolved theme current when the OS setting changes. */
	init(): () => void {
		if (!browser) return () => {};
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const sync = () => {
			this.systemPrefersDark = mediaQuery.matches;
			this.apply();
		};
		const syncStorage = (event: StorageEvent) => {
			if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
			try {
				if (event.storageArea !== localStorage) return;
			} catch {
				return;
			}
			this.preference = readStored();
			sync();
		};
		sync();
		mediaQuery.addEventListener('change', sync);
		window.addEventListener('storage', syncStorage);
		return () => {
			mediaQuery.removeEventListener('change', sync);
			window.removeEventListener('storage', syncStorage);
		};
	}
}

export const theme = new ThemeState();
