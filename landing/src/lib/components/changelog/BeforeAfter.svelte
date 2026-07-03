<script lang="ts">
	import type { ThemedMedia } from '$lib/types/changelog';

	let {
		before,
		after,
		caption
	}: {
		before: ThemedMedia;
		after: ThemedMedia;
		caption?: string;
	} = $props();

	let position = $state(50);
	let container: HTMLDivElement;
	let dragging = $state(false);

	function positionFromEvent(event: PointerEvent) {
		const rect = container.getBoundingClientRect();
		position = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
	}

	function onPointerDown(event: PointerEvent) {
		dragging = true;
		container.setPointerCapture(event.pointerId);
		positionFromEvent(event);
	}

	function onPointerMove(event: PointerEvent) {
		if (dragging) positionFromEvent(event);
	}

	function onPointerUp() {
		dragging = false;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') position = Math.max(0, position - 5);
		if (event.key === 'ArrowRight') position = Math.min(100, position + 5);
	}
</script>

<figure class="not-prose my-8">
	<div
		bind:this={container}
		role="slider"
		tabindex="0"
		aria-label="Compare before and after"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(position)}
		class="relative cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-surface-200 bg-surface-50 shadow-sm focus-visible:outline-2 focus-visible:outline-accent-500 dark:border-warm-700 dark:bg-warm-900"
		style="aspect-ratio: {after.width} / {after.height}"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		onkeydown={onKeyDown}
	>
		<!-- After (full) -->
		<img src={after.light} alt={after.alt} width={after.width} height={after.height} loading="lazy" draggable="false" class="block h-full w-full object-cover dark:hidden" />
		<img src={after.dark} alt={after.alt} width={after.width} height={after.height} loading="lazy" draggable="false" class="hidden h-full w-full object-cover dark:block" />

		<!-- Before (clipped to the left of the handle) -->
		<div class="absolute inset-0" style="clip-path: inset(0 {100 - position}% 0 0)">
			<img src={before.light} alt={before.alt} width={before.width} height={before.height} loading="lazy" draggable="false" class="block h-full w-full object-cover dark:hidden" />
			<img src={before.dark} alt={before.alt} width={before.width} height={before.height} loading="lazy" draggable="false" class="hidden h-full w-full object-cover dark:block" />
		</div>

		<!-- Handle -->
		<div class="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]" style="left: {position}%">
			<div
				class="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-surface-600 shadow-md"
			>
				<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
				</svg>
			</div>
		</div>

		<span class="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">Before</span>
		<span class="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">After</span>
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-surface-500 dark:text-warm-400">
			{caption}
		</figcaption>
	{/if}
</figure>
