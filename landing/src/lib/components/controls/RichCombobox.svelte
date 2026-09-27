<script lang="ts">
	import { tick } from 'svelte';
	import {
		filterChoices,
		highlightSegments,
		moveChoiceIndex,
		type RichChoice
	} from './choice-options';

	type Props = {
		id: string;
		label: string;
		value: string;
		options: readonly RichChoice[];
		onSelect: (value: string) => void;
		placeholder?: string;
		emptyLabel?: string;
		disabled?: boolean;
		hideLabel?: boolean;
		popupMode?: 'inline' | 'floating';
		compact?: boolean;
		searchable?: boolean;
		showSelectedMeta?: boolean;
		tall?: boolean;
	};

	let {
		id,
		label,
		value,
		options,
		onSelect,
		placeholder = 'Search choices…',
		emptyLabel = 'No matching choices',
		disabled = false,
		hideLabel = false,
		popupMode = 'inline',
		compact = false,
		searchable = true,
		showSelectedMeta = false,
		tall = false
	}: Props = $props();
	let root = $state<HTMLDivElement>();
	let input = $state<HTMLInputElement>();
	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);
	let query = $state('');
	let activeIndex = $state(0);
	let selected = $derived(options.find((option) => option.value === value));
	let filtered = $derived(searchable ? filterChoices(options, query) : [...options]);
	let active = $derived(filtered.length ? Math.min(Math.max(activeIndex, 0), filtered.length - 1) : -1);
	let visibleValue = $derived(open ? query : (selected?.label ?? ''));

	$effect(() => {
		if (disabled) open = false;
	});

	function openList() {
		if (disabled || open) return;
		query = '';
		activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
		open = true;
	}

	function closeList() {
		open = false;
		query = '';
	}

	function choose(choice: RichChoice) {
		onSelect(choice.value);
		closeList();
		if (searchable) input?.focus(); else trigger?.focus();
	}

	async function scrollActive() {
		await tick();
		const index = filtered.length ? Math.min(Math.max(activeIndex, 0), filtered.length - 1) : -1;
		if (index >= 0) document.getElementById(`${id}-choice-${index}`)?.scrollIntoView({ block: 'nearest' });
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (open) {
				event.preventDefault();
				closeList();
				if (searchable) input?.focus(); else trigger?.focus();
			}
			return;
		}
		if (event.key === 'Tab') {
			closeList();
			return;
		}
		if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
			event.preventDefault();
			if (!open) openList();
			activeIndex = moveChoiceIndex(event.key, active, filtered.length);
			void scrollActive();
			return;
		}
		if ((event.key === 'Enter' || (!searchable && event.key === ' ')) && open) {
			event.preventDefault();
			const choice = filtered[active];
			if (choice) choose(choice);
		}
	}

	function onOutsidePointer(event: PointerEvent) {
		if (open && root && !root.contains(event.target as Node)) closeList();
	}
</script>

<svelte:window onpointerdown={onOutsidePointer} />

{#snippet highlighted(text: string)}
	{#each highlightSegments(text, query) as segment}
		{#if segment.match}<mark class="rounded-sm bg-accent-100 text-accent-900 dark:bg-accent-900/50 dark:text-accent-100">{segment.text}</mark>{:else}{segment.text}{/if}
	{/each}
{/snippet}

<div bind:this={root} class="relative z-50 min-w-0">
	<label for={id} class={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-surface-900 dark:text-warm-50'}>{label}</label>
	<div class="relative">
		{#if searchable}<input
			bind:this={input}
			{id}
			type="text"
			role="combobox"
			aria-label={label}
			aria-autocomplete="list"
			aria-haspopup="listbox"
			aria-expanded={open}
			aria-controls={`${id}-listbox`}
			aria-activedescendant={open && active >= 0 ? `${id}-choice-${active}` : undefined}
			autocomplete="off"
			spellcheck="false"
			{disabled}
			value={visibleValue}
			placeholder={open && selected ? selected.label : placeholder}
			onfocus={openList}
			onclick={openList}
			oninput={(event) => { query = event.currentTarget.value; activeIndex = 0; open = true; }}
			onkeydown={onKeydown}
			class={`rich-combobox-trigger w-full min-w-0 rounded-xl border border-surface-300 bg-white px-3 pr-10 text-sm text-surface-900 shadow-sm transition-colors placeholder:text-surface-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-900 dark:text-warm-50 dark:placeholder:text-warm-400 ${compact ? 'py-2' : 'py-2.5'}`}
		/>{:else}<button
			bind:this={trigger}
			{id}
			type="button"
			role="combobox"
			aria-label={label}
			aria-autocomplete="none"
			aria-haspopup="listbox"
			aria-expanded={open}
			aria-controls={`${id}-listbox`}
			aria-activedescendant={open && active >= 0 ? `${id}-choice-${active}` : undefined}
			{disabled}
			onclick={() => { if (open) closeList(); else openList(); }}
			onkeydown={onKeydown}
			class={`rich-combobox-trigger w-full min-w-0 px-3 pr-10 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tall ? 'catalog-control h-12' : 'rounded-xl border border-surface-300 bg-white text-surface-900 shadow-sm dark:border-surface-600 dark:bg-surface-900 dark:text-warm-50'} ${compact ? 'py-2' : 'py-2.5'}`}
		><span>{selected?.label ?? placeholder}</span>{#if showSelectedMeta && selected?.meta}<span class="ml-2 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs tabular-nums text-surface-600 dark:bg-surface-800 dark:text-warm-300">{selected.meta}</span>{/if}</button>{/if}
		<span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-surface-500 dark:text-warm-400" aria-hidden="true">⌄</span>
	</div>
	{#if open}
		<div class={`z-50 mt-1 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-[0_16px_40px_-18px_rgba(36,22,18,.45)] dark:border-surface-700 dark:bg-surface-900 ${popupMode === 'floating' ? 'absolute right-0 top-full w-[min(20rem,calc(100vw-2rem))]' : 'relative'}`}>
			<div id={`${id}-listbox`} role="listbox" aria-label={label} class="max-h-52 overflow-y-auto overscroll-contain p-1.5">
				{#each filtered as choice, index (choice.value)}
					<button
						id={`${id}-choice-${index}`}
						type="button"
						role="option"
						aria-selected={choice.value === value}
						tabindex="-1"
						onpointerdown={(event) => event.preventDefault()}
						onclick={() => choose(choice)}
						class={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${index === active ? 'bg-accent-50 text-surface-950 dark:bg-accent-900/25 dark:text-warm-50' : 'text-surface-800 hover:bg-surface-50 dark:text-warm-100 dark:hover:bg-surface-800'}`}
					>
						<span class="min-w-0 flex-1"><span class="block font-medium">{@render highlighted(choice.label)}</span>{#if choice.description}<span class="mt-0.5 block text-xs text-surface-600 dark:text-warm-300">{@render highlighted(choice.description)}</span>{/if}</span>
						<span class="flex shrink-0 items-center gap-2 text-xs text-surface-500 dark:text-warm-400">{#if choice.meta}<span>{@render highlighted(choice.meta)}</span>{/if}{#if choice.value === value}<span class="font-bold text-accent-700 dark:text-accent-300" aria-hidden="true">✓</span>{/if}</span>
					</button>
				{:else}
					<p class="px-3 py-4 text-sm text-surface-600 dark:text-warm-300">{emptyLabel}</p>
				{/each}
			</div>
			{#if searchable && options.length > 8}<p class="border-t border-surface-100 px-3 py-1.5 text-[11px] text-surface-500 dark:border-surface-700 dark:text-warm-400">{filtered.length} of {options.length} choices</p>{/if}
		</div>
	{/if}
</div>
