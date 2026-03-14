<script lang="ts">
	import { browser } from '$app/environment';

	type Theme = 'light' | 'dark' | 'system';

	let theme: Theme = $state(
		browser ? ((localStorage.getItem('theme') as Theme) ?? 'system') : 'system'
	);

	function applyTheme(t: Theme) {
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (t === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.classList.toggle('dark', prefersDark);
		}
	}

	$effect(() => {
		applyTheme(theme);

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		function handleChange() {
			if (theme === 'system') {
				applyTheme('system');
			}
		}
		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	});

	function cycle() {
		const order: Theme[] = ['light', 'dark', 'system'];
		const next = order[(order.indexOf(theme) + 1) % order.length];
		theme = next;
		localStorage.setItem('theme', next);
	}

	let label = $derived(
		theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'
	);
</script>

<button
	onclick={cycle}
	class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
	aria-label="Toggle theme: {label}"
>
	<span class="theme-spin inline-flex">
		{#if theme === 'light'}
			<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="5" />
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
		{:else if theme === 'dark'}
			<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
			</svg>
		{:else}
			<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
				<path d="M8 21h8M12 17v4" />
			</svg>
		{/if}
	</span>
	<span class="hidden sm:inline">{label}</span>
</button>
