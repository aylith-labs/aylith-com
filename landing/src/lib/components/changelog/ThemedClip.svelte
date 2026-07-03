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
		<video
			src={light}
			{width}
			{height}
			aria-label={alt}
			autoplay
			muted
			loop
			playsinline
			preload="metadata"
			class="block h-full w-full object-cover dark:hidden"
		></video>
		<video
			src={dark}
			{width}
			{height}
			aria-label={alt}
			autoplay
			muted
			loop
			playsinline
			preload="metadata"
			class="hidden h-full w-full object-cover dark:block"
		></video>
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-surface-500 dark:text-warm-400">
			{caption}
		</figcaption>
	{/if}
</figure>
