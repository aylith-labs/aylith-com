<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import { getMonthlyVariant } from '$lib/brand/rotation';

	const variant = getMonthlyVariant();

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/design', label: 'Design' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="sticky top-0 z-50 border-b border-surface-200/50 bg-white/80 backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-950/80">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<a href="/" class="flex items-center gap-2.5 text-surface-900 dark:text-warm-50" aria-label="Aylith — home">
				<Mark class="h-[22px] w-auto shrink-0" />
				<Wordmark {variant} size="nav" />
			</a>

			<div class="hidden items-center gap-1 md:flex">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {isActive(link.href)
							? 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
							: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<div class="flex items-center gap-1">
				<a
					href="https://github.com/aylith-labs"
					target="_blank"
					rel="noreferrer"
					class="rounded-lg p-1.5 text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
					aria-label="Aylith on GitHub"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
					</svg>
				</a>
				<ThemeToggle />
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="rounded-lg p-1.5 text-surface-600 transition-colors hover:bg-surface-100 md:hidden dark:text-surface-400 dark:hover:bg-surface-800"
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="border-t border-surface-200 px-4 pb-3 pt-2 md:hidden dark:border-surface-800">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(link.href)
						? 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
						: 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'}"
				>
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</nav>
