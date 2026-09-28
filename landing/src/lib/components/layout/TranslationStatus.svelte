<script lang="ts">
	import { translation } from '$lib/translate/translation.svelte';

	// Says, on whatever page the reader is on, that its translation is still
	// being improved or refreshed, and that it will update in place.
	const message = $derived.by(() => {
		if (!translation.choice) return null;
		if (translation.failed) return 'Translation is unavailable right now — showing the original.';
		if (translation.busy) return `Translating into ${translation.choice.label}…`;
		if (translation.stale > 0)
			return `This page changed since it was last translated — ${translation.stale} ${translation.stale === 1 ? 'section is' : 'sections are'} queued for an update.`;
		if (translation.pending > 0) return 'A better translation is on its way — this page updates as it lands.';
		return null;
	});
</script>

{#if message}
	<div
		role="status"
		data-no-translate
		class="fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-surface-200 bg-white/90 px-3.5 py-2 text-xs font-medium text-surface-700 shadow-md backdrop-blur dark:border-surface-700 dark:bg-surface-900/90 dark:text-warm-200"
	>
		{#if !translation.failed}
			<span class="size-1.5 shrink-0 animate-pulse rounded-full bg-accent-500" aria-hidden="true"></span>
		{/if}
		{message}
	</div>
{/if}
