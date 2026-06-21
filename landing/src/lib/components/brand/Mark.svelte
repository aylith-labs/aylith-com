<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { motion } from '$lib/stores/motion.svelte';

	// The Aylith mark: six bars climbing from the bottom edge, crossed by a copper parabolic
	// progress curve that sweeps from the lower-left up to the upper-right. A copper sparkle
	// cluster (one large, two small) fills the upper-left. Bars follow currentColor (theme
	// ink); the curve and sparkles are the single copper accent. With `animate`, the bars grow
	// up, the curve draws in behind them, then the three sparkles pop.
	let {
		class: className = 'h-[22px] w-auto',
		animate = false,
		hoverReplay = true,
		autoplay = true
	}: { class?: string; animate?: boolean; hoverReplay?: boolean; autoplay?: boolean } = $props();

	const BARS = [
		[40, 228],
		[76, 212],
		[112, 188],
		[148, 156],
		[184, 112],
		[220, 60]
	];
	const CURVE = 'M0 256 Q 209 219 256 0';
	const STARS = [
		'M70 8 L86 64 L142 80 L86 96 L70 152 L54 96 L-2 80 L54 64 Z',
		'M150 6 L157 29 L180 36 L157 43 L150 66 L143 43 L120 36 L143 29 Z',
		'M120 100 L125 117 L142 122 L125 127 L120 144 L115 127 L98 122 L115 117 Z'
	];

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
	viewBox="0 0 256 256"
	class="{className}{animate ? ' amark' : ''}"
	fill="none"
	stroke-linecap="butt"
	aria-hidden="true"
	onmouseenter={animate && hoverReplay ? () => replay() : undefined}
>
	<g stroke="currentColor" stroke-width="15">
		{#each BARS as [x, y], index}
			<line class="bar" style="--i:{index}" x1={x} y1={y} x2={x} y2="256" />
		{/each}
	</g>
	<path class="diag stroke-accent-500" d={CURVE} pathLength="100" stroke-width="17" />
	<g class="fill-accent-500">
		{#each STARS as d, index}
			<path class="final s{index + 1}" {d} />
		{/each}
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
	/* every sparkle scales around its own centre, not the SVG origin */
	.amark .final {
		transform-box: fill-box;
		transform-origin: center;
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

	.amark.play .final {
		animation: sparkPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.amark.play .s1 { animation-delay: 0.95s; }
	.amark.play .s2 { animation-delay: 1.1s; }
	.amark.play .s3 { animation-delay: 1.25s; }
	@keyframes sparkPop {
		from { opacity: 0; transform: scale(0) rotate(-12deg); }
		to { opacity: 1; transform: scale(1) rotate(0); }
	}

	:global([data-motion='reduced']) .amark .bar,
	:global([data-motion='reduced']) .amark .diag,
	:global([data-motion='reduced']) .amark .final {
		animation: none !important;
		opacity: 1 !important;
		transform: none !important;
		stroke-dashoffset: 0 !important;
	}
</style>
