<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { motion } from '$lib/stores/motion.svelte';

	// The Aylith mark: six vertical strokes (one per letter of AYLITH) rising left to right and
	// breaking past the copper "signal" diagonal that crosses them. The strokes are a tally of
	// work shipped; the rise turns the count into a trend; the work exceeds the signal line. A
	// copper sparkle cluster in the top-left (a main spark with two companions) marks it as
	// AI-driven. Ink strokes follow currentColor; the diagonal and sparkles are the single accent.
	// With `animate`, the mark builds itself on mount: bars grow left to right, the diagonal draws
	// up in sync, a spark lifts off each bar and a field twinkles across, then the three settle.
	let {
		class: className = 'h-[22px] w-auto',
		animate = false,
		hoverReplay = true,
		autoplay = true
	}: { class?: string; animate?: boolean; hoverReplay?: boolean; autoplay?: boolean } = $props();

	const BARS = [
		[10, 40.5],
		[17, 34.5],
		[24, 28.5],
		[31, 22.4],
		[38, 16.4],
		[45, 10.3]
	];

	const round = (value: number) => value.toFixed(2);
	const star = (cx: number, cy: number, radius: number, waist: number) =>
		`M${round(cx)} ${round(cy - radius)} L${round(cx + waist)} ${round(cy - waist)} ` +
		`L${round(cx + radius)} ${round(cy)} L${round(cx + waist)} ${round(cy + waist)} ` +
		`L${round(cx)} ${round(cy + radius)} L${round(cx - waist)} ${round(cy + waist)} ` +
		`L${round(cx - radius)} ${round(cy)} L${round(cx - waist)} ${round(cy - waist)} Z`;

	// a spark lifts off each bar top (bigger, higher); plus a dense field across the mark
	const cascade = BARS.map(([x, y], index) => ({
		d: star(x, y - 5, 2.6, 2.6 * 0.32),
		delay: 0.12 + index * 0.13
	}));
	const field = [
		[5, 10, 1.6], [16, 6, 1.6], [27, 13, 1.5], [38, 7, 1.7], [48, 11, 1.5], [8, 20, 1.5],
		[21, 24, 1.5], [33, 20, 1.6], [44, 24, 1.5], [11, 14, 1.4], [30, 4, 1.5], [50, 5, 1.4],
		[14, 18, 1.3], [25, 8, 1.3], [36, 14, 1.3], [42, 4, 1.3], [3, 16, 1.2], [19, 12, 1.3]
	].map(([x, y, radius], index) => ({ d: star(x, y, radius, radius * 0.32), delay: index * 0.045 }));

	let svgEl: SVGSVGElement;
	let playing = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function startPlay() {
		if (!svgEl) return;
		playing = true;
		svgEl.classList.remove('play');
		void svgEl.getBoundingClientRect();
		svgEl.classList.add('play');
		clearTimeout(timer);
		timer = setTimeout(() => {
			playing = false;
		}, 2200);
	}

	/** Replay the build-in. While a pass runs a non-forced call is ignored so it finishes;
	    force=true (e.g. the joined hero lockup) restarts now. */
	export function replay(force = false) {
		if (motion.isReduced) return;
		if (playing && !force) return;
		startPlay();
	}

	onMount(() => {
		if (!animate || !autoplay || motion.isReduced) return;
		startPlay();
	});

	onDestroy(() => clearTimeout(timer));
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 56 64"
	class="{className}{animate ? ' amark' : ''}"
	fill="none"
	stroke-linecap="square"
	aria-hidden="true"
	onmouseenter={animate && hoverReplay ? () => replay() : undefined}
>
	<g stroke="currentColor" stroke-width="4.2">
		{#each BARS as [x, y], index}
			<line class="bar" style="--i:{index}" x1={x} y1={y} x2={x} y2="50" />
		{/each}
	</g>
	<line
		class="diag stroke-accent-500"
		x1="6"
		y1="51"
		x2="50"
		y2="13"
		pathLength="100"
		stroke-width="4.2"
	/>
	<g class="fill-accent-500">
		{#if animate}
			{#each field as spark}
				<path class="wide" style="animation-delay:{spark.delay}s" d={spark.d} />
			{/each}
			{#each cascade as spark}
				<path class="casc" style="animation-delay:{spark.delay}s" d={spark.d} />
			{/each}
		{/if}
		<path class="final s1" d="M10 4 L11.5 9.5 L17 11 L11.5 12.5 L10 18 L8.5 12.5 L3 11 L8.5 9.5 Z" />
		<path class="final s2" d="M18 14 L18.7 16.3 L21 17 L18.7 17.7 L18 20 L17.3 17.7 L15 17 L17.3 16.3 Z" />
		<path class="final s3" d="M17 3.4 L17.6 5.4 L19.6 6 L17.6 6.6 L17 8.6 L16.4 6.6 L14.4 6 L16.4 5.4 Z" />
	</g>
</svg>

<style>
	/* All animation styling is gated behind .amark, so the static mark is untouched. */
	.amark .bar {
		transform-box: fill-box;
		transform-origin: center bottom;
	}
	.amark .diag {
		stroke-dasharray: 100;
	}
	/* every sparkle scales/rotates around its own centre, not the SVG origin */
	.amark .casc,
	.amark .wide,
	.amark .final {
		transform-box: fill-box;
		transform-origin: center;
	}
	.amark .casc,
	.amark .wide {
		opacity: 0;
	}

	.amark.play .bar {
		animation: barGrow 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i) * 0.13s);
	}
	@keyframes barGrow {
		from { transform: scaleY(0); }
		to { transform: scaleY(1); }
	}

	.amark.play .diag {
		animation: diagDraw 1.05s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes diagDraw {
		from { stroke-dashoffset: 100; }
		to { stroke-dashoffset: 0; }
	}

	.amark.play .wide {
		animation: sparkStar 0.85s ease-in-out both;
	}
	@keyframes sparkStar {
		0% { opacity: 0; transform: scale(0); }
		45% { opacity: 0.95; transform: scale(0.8); }
		100% { opacity: 0; transform: scale(0.15); }
	}

	.amark.play .casc {
		animation: cascRise 0.8s ease-out both;
	}
	@keyframes cascRise {
		0% { opacity: 0; transform: translateY(3px) scale(0); }
		42% { opacity: 1; transform: translateY(-1px) scale(1); }
		100% { opacity: 0; transform: translateY(-9px) scale(0.45); }
	}

	.amark.play .final {
		animation: sparkPop 0.78s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.amark.play .s1 { animation-delay: 0.95s; }
	.amark.play .s2 { animation-delay: 1.1s; }
	.amark.play .s3 { animation-delay: 1.25s; }
	@keyframes sparkPop {
		0% { opacity: 0; transform: scale(0); }
		45% { opacity: 1; transform: scale(1.8) rotate(25deg); }
		72% { transform: scale(0.82) rotate(-6deg); }
		100% { opacity: 1; transform: scale(1) rotate(0); }
	}

	:global([data-motion='reduced']) .amark .bar,
	:global([data-motion='reduced']) .amark .diag,
	:global([data-motion='reduced']) .amark .final {
		animation: none !important;
		opacity: 1 !important;
		transform: none !important;
		stroke-dashoffset: 0 !important;
	}
	:global([data-motion='reduced']) .amark .casc,
	:global([data-motion='reduced']) .amark .wide {
		display: none !important;
	}
</style>
