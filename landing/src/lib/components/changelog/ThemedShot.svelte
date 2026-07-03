<script lang="ts">
	let {
		light,
		dark,
		alt,
		width,
		height,
		caption
	}: {
		light: string;
		dark: string;
		alt: string;
		width: number;
		height: number;
		caption?: string;
	} = $props();
</script>

<figure class="not-prose my-8">
	<div
		class="overflow-hidden rounded-xl border border-surface-200 bg-surface-50 shadow-sm dark:border-warm-700 dark:bg-warm-900"
		style="aspect-ratio: {width} / {height}"
	>
		<img src={light} {alt} {width} {height} loading="lazy" class="block h-full w-full object-cover dark:hidden" />
		<img src={dark} {alt} {width} {height} loading="lazy" class="hidden h-full w-full object-cover dark:block" />
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-surface-500 dark:text-warm-400">
			{caption}
		</figcaption>
	{/if}
</figure>
