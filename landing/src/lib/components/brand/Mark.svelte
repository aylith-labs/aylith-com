<script lang="ts">
	// The Aylith mark: six vertical strokes (one per letter of AYLITH) rising left to right and
	// breaking past the copper "signal" diagonal that crosses them. The strokes are a tally of
	// work shipped; the rise turns the count into a trend; the work exceeds the signal line. A
	// copper sparkle cluster in the top-left (a main spark with two companions) marks it as
	// AI-driven. Ink strokes follow currentColor; the diagonal and sparkles are the single accent.
	let { class: className = 'h-[22px] w-auto' }: { class?: string } = $props();
</script>

<svg
	viewBox="0 0 56 64"
	class={className}
	fill="none"
	stroke-linecap="square"
	aria-hidden="true"
>
	<g stroke="currentColor" stroke-width="4.2">
		<line x1="10" y1="40.5" x2="10" y2="50" />
		<line x1="17" y1="34.5" x2="17" y2="50" />
		<line x1="24" y1="28.5" x2="24" y2="50" />
		<line x1="31" y1="22.4" x2="31" y2="50" />
		<line x1="38" y1="16.4" x2="38" y2="50" />
		<line x1="45" y1="10.3" x2="45" y2="50" />
	</g>
	<line x1="6" y1="51" x2="50" y2="13" class="stroke-accent-500" stroke-width="4.2" />
	<g class="fill-accent-500">
		<path d="M10 4 L11.5 9.5 L17 11 L11.5 12.5 L10 18 L8.5 12.5 L3 11 L8.5 9.5 Z" />
		<path d="M18 14 L18.7 16.3 L21 17 L18.7 17.7 L18 20 L17.3 17.7 L15 17 L17.3 16.3 Z" />
		<path d="M17 3.4 L17.6 5.4 L19.6 6 L17.6 6.6 L17 8.6 L16.4 6.6 L14.4 6 L16.4 5.4 Z" />
	</g>
</svg>
