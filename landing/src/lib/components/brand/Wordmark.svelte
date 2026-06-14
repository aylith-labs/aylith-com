<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { motion } from '$lib/stores/motion.svelte';

	type Size = 'nav' | 'footer' | 'gallery' | 'hero';

	let {
		variant = 1,
		size = 'nav',
		hoverReplay = true,
		autoplay = true
	}: { variant?: number; size?: Size; hoverReplay?: boolean; autoplay?: boolean } = $props();

	const letters = ['A', 'Y', 'L', 'I', 'T', 'H'];

	// Total run time per variant (ms): base duration + the last letter's stagger delay.
	// Used to lock out re-triggers until the current pass finishes.
	const DURATIONS: Record<number, number> = {
		1: 2250, 2: 2650, 3: 1850, 4: 2750, 5: 1600, 6: 2200,
		7: 1750, 8: 2400, 9: 2250, 10: 2200, 11: 1250, 12: 1800
	};

	let host: HTMLElement;
	// 0 = static ink (SSR / pre-hydration); >0 = a play has been triggered. Bumping it
	// remounts the word via {#key}, which restarts the CSS animation from frame 0.
	let playKey = $state(0);
	let playing = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function startPlay() {
		playing = true;
		playKey += 1;
		clearTimeout(timer);
		timer = setTimeout(() => {
			playing = false;
		}, DURATIONS[variant] ?? 2800);
	}

	/** Replay the highlight. While a pass is in progress a non-forced call is ignored so the
	    running animation finishes; pass force=true (an explicit Play button) to restart now. */
	export function replay(force = false) {
		if (motion.isReduced) return;
		if (playing && !force) return;
		startPlay();
	}

	onMount(() => {
		if (motion.isReduced || !autoplay) return;

		if (size === 'hero') {
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							startPlay();
							observer.unobserve(host);
						}
					}
				},
				{ threshold: 0.4 }
			);
			observer.observe(host);
			return () => observer.disconnect();
		}

		startPlay();
	});

	onDestroy(() => clearTimeout(timer));
</script>

<span
	bind:this={host}
	class="word-host wm-{size}"
	role="img"
	aria-label="Aylith"
	onmouseenter={hoverReplay ? () => replay() : undefined}
>
	{#key playKey}
		<span class="word v{variant}" class:is-playing={playKey > 0} aria-hidden="true">
			{#each letters as letter, index}
				<span style="--i:{index}">{letter}</span>
			{/each}
		</span>
	{/key}
</span>

<style>
	.word-host {
		display: inline-flex;
		align-items: center;
		--wm-ink: var(--color-surface-900);
		--wm-copper: var(--color-accent-500);
		--wm-copper-soft: color-mix(in oklab, var(--color-accent-500) 18%, transparent);
		--wm-copper-glow: color-mix(in oklab, var(--color-accent-500) 55%, transparent);
	}
	:global(.dark) .word-host {
		--wm-ink: var(--color-warm-50);
	}

	.word {
		position: relative;
		display: inline-flex;
		align-items: center;
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-weight: 600;
		line-height: 1;
		color: var(--wm-ink);
	}
	.word > span {
		display: inline-block;
		position: relative;
		color: var(--wm-ink);
		will-change: transform, color, opacity;
	}

	/* sizes */
	.wm-nav .word {
		font-size: 1.05rem;
		gap: 0.34em;
	}
	.wm-footer .word {
		font-size: 0.95rem;
		gap: 0.32em;
	}
	.wm-gallery .word {
		font-size: 1.85rem;
		gap: 0.4em;
	}
	.wm-hero .word {
		font-size: clamp(2.5rem, 8vw, 5rem);
		gap: 0.4em;
		font-weight: 500;
	}

	/* ===== 1 — Slash sweep ignite ===== */
	.word.is-playing.v1 > span {
		animation: wm-v1 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.13s);
	}
	@keyframes wm-v1 {
		0%,
		100% {
			color: var(--wm-ink);
			text-shadow: none;
		}
		14% {
			color: var(--wm-copper);
			text-shadow: 0 0 14px var(--wm-copper-glow);
		}
		40% {
			color: var(--wm-ink);
			text-shadow: none;
		}
	}
	.word.is-playing.v1::after {
		content: '';
		position: absolute;
		top: -18%;
		bottom: -18%;
		left: -14%;
		width: 0.42em;
		background: var(--wm-copper);
		transform: skewX(-22deg);
		border-radius: 2px;
		animation: wm-v1-slash 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
	}
	@keyframes wm-v1-slash {
		0% {
			left: -16%;
			opacity: 0;
		}
		12% {
			opacity: 0.9;
		}
		78% {
			left: 104%;
			opacity: 0.9;
		}
		100% {
			left: 104%;
			opacity: 0;
		}
	}

	/* ===== 2 — Sequential fill ===== */
	.word.is-playing.v2 > span {
		animation: wm-v2 1.9s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.15s);
	}
	@keyframes wm-v2 {
		0% {
			color: var(--wm-ink);
		}
		18% {
			color: var(--wm-copper);
		}
		70% {
			color: var(--wm-copper);
		}
		100% {
			color: var(--wm-ink);
		}
	}

	/* ===== 3 — Shimmer band ===== */
	.word.is-playing.v3 > span {
		color: transparent;
		background-image: linear-gradient(
			100deg,
			var(--wm-ink) 0 40%,
			var(--wm-copper) 50%,
			var(--wm-ink) 60% 100%
		);
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		animation: wm-v3 1.5s linear 1 both;
		animation-delay: calc(var(--i) * 0.07s);
	}
	@keyframes wm-v3 {
		0% {
			background-position: 130% 0;
		}
		100% {
			background-position: -130% 0;
		}
	}

	/* ===== 4 — Tally count ===== */
	.word.is-playing.v4 > span::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.18em;
		height: 3px;
		background: var(--wm-copper);
		border-radius: 2px;
		transform: scaleX(0);
		transform-origin: left;
		animation: wm-v4 1.9s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.17s);
	}
	@keyframes wm-v4 {
		0% {
			transform: scaleX(0);
			transform-origin: left;
		}
		22% {
			transform: scaleX(1);
			transform-origin: left;
		}
		70% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	/* ===== 5 — Typewriter reveal ===== */
	.word.is-playing.v5 > span {
		animation: wm-v5 1s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.12s);
	}
	@keyframes wm-v5 {
		0% {
			opacity: 0;
			transform: translateY(0.18em);
			filter: blur(3px);
			color: var(--wm-copper);
		}
		55% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
			color: var(--wm-copper);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			color: var(--wm-ink);
		}
	}

	/* ===== 6 — Stroke draw ===== */
	.word.is-playing.v6 > span {
		color: transparent;
		-webkit-text-stroke: 1.2px var(--wm-copper);
		animation: wm-v6 1.5s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.14s);
	}
	@keyframes wm-v6 {
		0% {
			color: transparent;
			-webkit-text-stroke-color: var(--wm-copper);
			clip-path: inset(0 100% 0 0);
		}
		28% {
			color: transparent;
			-webkit-text-stroke-color: var(--wm-copper);
			clip-path: inset(0 0 0 0);
		}
		60% {
			color: var(--wm-ink);
			-webkit-text-stroke-color: transparent;
			clip-path: inset(0 0 0 0);
		}
		100% {
			color: var(--wm-ink);
			-webkit-text-stroke-color: transparent;
			clip-path: inset(0 0 0 0);
		}
	}

	/* ===== 7 — Wave bob ===== */
	.word.is-playing.v7 > span {
		animation: wm-v7 1.2s ease-in-out 1 both;
		animation-delay: calc(var(--i) * 0.11s);
	}
	@keyframes wm-v7 {
		0%,
		100% {
			transform: translateY(0);
			color: var(--wm-ink);
		}
		40% {
			transform: translateY(-0.22em);
			color: var(--wm-copper);
		}
	}

	/* ===== 8 — Flicker ignite ===== */
	.word.is-playing.v8 > span {
		animation: wm-v8 1.6s steps(1, end) 1 both;
		animation-delay: calc(var(--i) * 0.16s);
	}
	@keyframes wm-v8 {
		0% {
			color: var(--wm-ink);
			opacity: 0.35;
		}
		8% {
			color: var(--wm-copper);
			opacity: 1;
		}
		13% {
			color: var(--wm-ink);
			opacity: 0.5;
		}
		18% {
			color: var(--wm-copper);
			opacity: 1;
			text-shadow: 0 0 12px var(--wm-copper-glow);
		}
		24% {
			opacity: 0.7;
		}
		30% {
			color: var(--wm-copper);
			opacity: 1;
			text-shadow: 0 0 12px var(--wm-copper-glow);
		}
		55% {
			color: var(--wm-ink);
			opacity: 1;
			text-shadow: none;
		}
		100% {
			color: var(--wm-ink);
			opacity: 1;
		}
	}

	/* ===== 9 — Spotlight scan ===== */
	.word.is-playing.v9 > span {
		animation: wm-v9 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.13s);
	}
	@keyframes wm-v9 {
		0%,
		100% {
			color: var(--wm-ink);
			text-shadow: none;
		}
		14% {
			color: var(--wm-copper);
			text-shadow: 0 0 18px var(--wm-copper-glow);
		}
		36% {
			color: var(--wm-ink);
			text-shadow: none;
		}
	}
	.word.is-playing.v9::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 2.6em;
		height: 2.6em;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle, var(--wm-copper-soft) 0%, transparent 70%);
		pointer-events: none;
		animation: wm-v9-scan 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
	}
	@keyframes wm-v9-scan {
		0% {
			left: -8%;
			opacity: 0;
		}
		12% {
			opacity: 1;
		}
		80% {
			left: 108%;
			opacity: 1;
		}
		100% {
			left: 108%;
			opacity: 0;
		}
	}

	/* ===== 10 — Underline sweep ===== */
	.word.is-playing.v10 > span {
		animation: wm-v10 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.12s);
	}
	@keyframes wm-v10 {
		0%,
		100% {
			color: var(--wm-ink);
		}
		16% {
			color: var(--wm-copper);
		}
		40% {
			color: var(--wm-ink);
		}
	}
	.word.is-playing.v10::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.14em;
		height: 2.5px;
		background: var(--wm-copper);
		border-radius: 2px;
		transform: scaleX(0);
		transform-origin: left;
		animation: wm-v10-line 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
	}
	@keyframes wm-v10-line {
		0% {
			transform: scaleX(0);
			transform-origin: left;
		}
		45% {
			transform: scaleX(1);
			transform-origin: left;
		}
		70% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	/* ===== 11 — Track-in ===== */
	.word.is-playing.v11 {
		transform-origin: center;
		animation: wm-v11-track 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
	}
	@keyframes wm-v11-track {
		0% {
			transform: scaleX(0.74);
		}
		100% {
			transform: scaleX(1);
		}
	}
	.word.is-playing.v11 > span {
		animation: wm-v11 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
	}
	@keyframes wm-v11 {
		0% {
			color: var(--wm-copper);
		}
		55% {
			color: var(--wm-copper);
		}
		100% {
			color: var(--wm-ink);
		}
	}

	/* ===== 12 — Diagonal rise ===== */
	.word.is-playing.v12 > span {
		animation: wm-v12 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
		animation-delay: calc(var(--i) * 0.12s);
	}
	@keyframes wm-v12 {
		0% {
			opacity: 0;
			transform: translate(-0.22em, 0.34em);
			color: var(--wm-copper);
		}
		55% {
			opacity: 1;
			transform: translate(0, 0);
			color: var(--wm-copper);
		}
		100% {
			opacity: 1;
			transform: translate(0, 0);
			color: var(--wm-ink);
		}
	}

	/* ===== Reduced motion: hold static ink =====
	   Gated on html[data-motion="reduced"] (resolved system setting OR design-system
	   override), not the media query, so forcing "full" can preview animations even when
	   the OS prefers reduced motion. With JS off the word is static anyway (it only ever
	   animates once playKey is bumped on mount). */
	:global([data-motion='reduced']) .word > span {
		animation: none !important;
		color: var(--wm-ink) !important;
		opacity: 1 !important;
		transform: none !important;
		-webkit-text-stroke: 0 !important;
		background: none !important;
		clip-path: none !important;
	}
	:global([data-motion='reduced']) .word::after,
	:global([data-motion='reduced']) .word::before,
	:global([data-motion='reduced']) .word > span::after {
		display: none !important;
	}
</style>
