<script lang="ts">
	import { theme, type ThemePreference } from '$lib/stores/theme.svelte';
	import { motion, type MotionPreference } from '$lib/stores/motion.svelte';

	let open = $state(false);
	let container: HTMLElement;
	let trigger: HTMLButtonElement;
	const panelId = $props.id();

	const close = () => (open = false);

	const themeOptions: { value: ThemePreference; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
	const motionOptions: { value: MotionPreference; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'reduced', label: 'Reduced' },
		{ value: 'full', label: 'Full' }
	];
	const links = [
		{ href: '/design', label: 'Design system', external: false },
		{ href: 'https://github.com/aylith-labs', label: 'GitHub', external: true }
	];

	$effect(() => {
		if (!open) return;
		function onDocClick(event: MouseEvent) {
			if (container && !container.contains(event.target as Node)) close();
		}
		function onKey(event: KeyboardEvent) {
			if (event.key !== 'Escape') return;
			const returnFocus = container.contains(document.activeElement);
			close();
			if (returnFocus) {
				event.preventDefault();
				trigger.focus({ preventScroll: true });
			}
		}
		document.addEventListener('click', onDocClick, true);
		window.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', onDocClick, true);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

{#snippet segment(
	title: string,
	options: { value: string; label: string }[],
	current: string,
	select: (value: string) => void
)}
	<div class="px-1 pb-1 pt-1.5">
		<p class="px-2 text-[0.7rem] font-semibold uppercase tracking-wider text-surface-500 dark:text-warm-400">{title}</p>
		<div
			role="group"
			aria-label={`${title} preference`}
			class="mt-1.5 flex gap-0.5 rounded-lg border border-surface-200 p-0.5 dark:border-surface-700"
		>
			{#each options as option (option.value)}
				<button
					type="button"
					onclick={() => select(option.value)}
					aria-pressed={current === option.value}
					class="preference-option flex-1"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>
{/snippet}

<div class="relative" bind:this={container}>
	<button
		type="button"
		bind:this={trigger}
		onclick={() => (open = !open)}
		aria-controls={open ? panelId : undefined}
		aria-expanded={open}
		aria-label="Settings and links"
		class="flex size-11 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-warm-300 dark:hover:bg-surface-800 dark:hover:text-surface-100"
	>
		<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.7 7.7 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.5 6.5 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.5 6.5 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.9 6.9 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.184.582-.496.644-.87l.214-1.28Z" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
		</svg>
	</button>

	{#if open}
		<div
			id={panelId}
			class="absolute -right-9 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-surface-200 bg-white p-2 shadow-lg shadow-surface-900/5 md:right-0 dark:border-surface-700 dark:bg-surface-900"
		>
			{@render segment('Theme', themeOptions, theme.preference, (value) => theme.set(value as ThemePreference))}
			{@render segment('Motion', motionOptions, motion.preference, (value) => motion.set(value as MotionPreference))}

			<div class="my-2 border-t border-surface-200/70 dark:border-surface-700/60"></div>

			{#each links as link (link.href)}
				<a
					href={link.href}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noreferrer' : undefined}
					onclick={close}
					class="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-warm-200 dark:hover:bg-surface-800 dark:hover:text-warm-50"
				>
					{link.label}
					{#if link.external}
						<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
						</svg>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
