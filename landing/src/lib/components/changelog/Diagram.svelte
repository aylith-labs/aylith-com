<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		caption,
		children
	}: {
		caption?: string;
		children: Snippet;
	} = $props();
</script>

<!-- Inline SVG/HTML diagrams inherit currentColor, so they adapt to the active theme. -->
<figure class="not-prose my-8">
	<div
		class="overflow-x-auto rounded-xl border border-surface-200 bg-surface-50 p-6 text-surface-700 dark:border-warm-700 dark:bg-warm-900 dark:text-warm-200"
	>
		{@render children()}
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-surface-500 dark:text-warm-400">
			{caption}
		</figcaption>
	{/if}
</figure>
