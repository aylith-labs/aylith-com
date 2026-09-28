<script lang="ts">
	import { tick } from 'svelte';
	import { buildEntries, filterEntries, type LanguageEntry, type LanguageRow, visibleWindow } from '$lib/translate/catalog';
	import { translation } from '$lib/translate/translation.svelte';

	// About eight thousand rows: loaded on first open, drawn a window at a time.
	const ROW = 44;
	const VIEWPORT = 352;

	let open = $state(false);
	let entries = $state<LanguageEntry[] | null>(null);
	let query = $state('');
	let scrollTop = $state(0);
	let active = $state(0);
	let container = $state<HTMLElement | null>(null);
	let trigger = $state<HTMLButtonElement | null>(null);
	let list = $state<HTMLElement | null>(null);
	let search = $state<HTMLInputElement | null>(null);
	const listId = $props.id();

	const filtered = $derived(entries ? filterEntries(entries, query) : []);
	const view = $derived(visibleWindow(scrollTop, VIEWPORT, ROW, filtered.length));
	const current = $derived(translation.choice);

	async function toggle() {
		open = !open;
		if (!open) return;
		if (!entries) {
			const rows = (await import('$lib/translate/languages.json')).default as LanguageRow[];
			entries = buildEntries(rows);
		}
		await tick();
		search?.focus();
	}

	function close(returnFocus = false) {
		open = false;
		query = '';
		scrollTop = 0;
		active = 0;
		if (returnFocus) trigger?.focus({ preventScroll: true });
	}

	function pick(entry: LanguageEntry | null) {
		translation.choose(entry ? { code: entry.code, label: entry.label, target: entry.target } : null);
		close(true);
	}

	function reveal(index: number) {
		if (!list) return;
		const top = index * ROW;
		if (top < list.scrollTop) list.scrollTop = top;
		else if (top + ROW > list.scrollTop + VIEWPORT) list.scrollTop = top + ROW - VIEWPORT;
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const step = event.key === 'ArrowDown' ? 1 : -1;
			active = Math.min(filtered.length - 1, Math.max(0, active + step));
			reveal(active);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const entry = filtered[active];
			if (entry) pick(entry);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
		}
	}

	$effect(() => {
		// A new query starts at the top.
		void query;
		active = 0;
		scrollTop = 0;
		if (list) list.scrollTop = 0;
	});

	$effect(() => {
		if (!open) return;
		const onDocClick = (event: MouseEvent) => {
			if (container && !container.contains(event.target as Node)) close();
		};
		document.addEventListener('click', onDocClick, true);
		return () => document.removeEventListener('click', onDocClick, true);
	});

	const groupStarts = $derived(
		new Set(filtered.map((e, i) => (i === 0 || filtered[i - 1]?.group !== e.group ? i : -1)).filter((i) => i >= 0))
	);
</script>

{#if translation.available}
	<div class="relative" bind:this={container} data-no-translate>
		<button
			type="button"
			bind:this={trigger}
			onclick={toggle}
			aria-expanded={open}
			aria-controls={open ? listId : undefined}
			aria-label={current ? `Language: ${current.label}` : 'Translate this site'}
			class="flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-warm-300 dark:hover:bg-surface-800 dark:hover:text-surface-100"
		>
			<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
			</svg>
			<span class="hidden max-w-28 truncate sm:inline">{current ? current.label : 'English'}</span>
			{#if translation.busy || translation.pending > 0}
				<span class="size-1.5 animate-pulse rounded-full bg-accent-500" aria-hidden="true"></span>
			{/if}
		</button>

		{#if open}
			<div class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-surface-200 bg-white p-2 shadow-lg shadow-surface-900/5 dark:border-surface-700 dark:bg-surface-900">
				<input
					bind:this={search}
					bind:value={query}
					onkeydown={onKey}
					type="search"
					placeholder="Search {entries ? new Set(entries.map((e) => e.code)).size.toLocaleString() : ''} languages…"
					aria-label="Search languages"
					aria-controls={listId}
					aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].code}` : undefined}
					class="w-full rounded-lg border border-surface-200 bg-transparent px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:text-warm-50"
				/>
				{#if current}
					<button
						type="button"
						onclick={() => pick(null)}
						class="mt-1 flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-accent-700 hover:bg-surface-100 dark:text-accent-300 dark:hover:bg-surface-800"
					>
						Show the original (English)
					</button>
				{/if}
				{#if !entries}
					<p class="px-3 py-6 text-center text-sm text-surface-500">Loading languages…</p>
				{:else if filtered.length === 0}
					<p class="px-3 py-6 text-center text-sm text-surface-500">
						No language called “{query}”.
					</p>
				{:else}
					<div
						bind:this={list}
						id={listId}
						role="listbox"
						aria-label="Languages"
						tabindex="-1"
						onscroll={(event) => (scrollTop = (event.currentTarget as HTMLElement).scrollTop)}
						class="relative mt-1 overflow-y-auto overscroll-contain"
						style="height: {Math.min(VIEWPORT, filtered.length * ROW)}px"
					>
						<div style="height: {filtered.length * ROW}px"></div>
						{#each filtered.slice(view.start, view.end) as entry, offset (entry.group + entry.code)}
							{@const index = view.start + offset}
							<button
								type="button"
								role="option"
								id="{listId}-{entry.code}"
								aria-selected={index === active}
								onclick={() => pick(entry)}
								onmousemove={() => (active = index)}
								class="absolute inset-x-0 flex flex-col justify-center rounded-lg px-3 text-left {index === active
									? 'bg-surface-100 dark:bg-surface-800'
									: ''} {current?.code === entry.code ? 'text-accent-700 dark:text-accent-300' : 'text-surface-800 dark:text-warm-100'}"
								style="top: {index * ROW}px; height: {ROW}px"
							>
								{#if groupStarts.has(index) && !query}
									<span class="absolute -top-px right-3 text-[0.6rem] font-semibold uppercase tracking-wider text-surface-400">{entry.group}</span>
								{/if}
								<span class="truncate text-sm font-medium">{entry.label}</span>
								<span class="truncate text-xs text-surface-500 dark:text-warm-400">{entry.detail}</span>
							</button>
						{/each}
					</div>
				{/if}
				<p class="mt-2 border-t border-surface-200/70 px-2 pt-2 text-[0.7rem] leading-snug text-surface-500 dark:border-surface-700/60 dark:text-warm-400">
					Translated progressively: a fast draft appears at once, and a better translation replaces it as it lands.
				</p>
			</div>
		{/if}
	</div>
{/if}
