<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	let { request, retirementId, active = true, onDone }: {
		request: string; retirementId: number; active?: boolean; onDone: (id: number) => void;
	} = $props();
	let canvas: HTMLCanvasElement;
	let label: HTMLParagraphElement;
	let frame = 0, finished = false;
	const duration = 900, limit = 420;
	function reduced() {
		return document.documentElement.dataset.motion === 'reduced' ||
			(document.documentElement.dataset.motion !== 'full' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	}
	function finish() {
		if (finished) return;
		finished = true;
		window.cancelAnimationFrame(frame);
		onDone(retirementId);
	}
	$effect(() => { if (!active) finish(); });
	onDestroy(() => { finished = true; window.cancelAnimationFrame(frame); });
	onMount(() => {
		if (!active || reduced()) { finish(); return; }
		const context = canvas.getContext('2d');
		const scratch = document.createElement('canvas');
		const ink = scratch.getContext('2d');
		if (!context || !ink) { finish(); return; }
		const style = window.getComputedStyle(label);
		const width = Math.min(640, Math.max(40, label.clientWidth || 320));
		const fontSize = Number.parseFloat(style.fontSize) || 20;
		const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.4;
		const font = style.font || `${style.fontWeight || '500'} ${fontSize}px ${style.fontFamily || 'sans-serif'}`;
		ink.font = font;
		const lines: string[] = [];
		// Rasterize only a bounded visible excerpt; the full request above remains intact.
		for (const paragraph of Array.from(request).slice(0,4096).join('').split('\n')) {
			let line = '';
			for (const character of Array.from(paragraph)) {
				if (line && ink.measureText(line + character).width > width - 4) { lines.push(line); line = ''; }
				line += character;
			}
			lines.push(line);
		}
		const height = Math.min(320, Math.max(lineHeight, lines.length * lineHeight + 8));
		scratch.width = canvas.width = width;
		scratch.height = canvas.height = height;
		canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
		ink.font = font; ink.textAlign = 'center'; ink.textBaseline = 'top';
		lines.forEach((line, index) => ink.fillText(line, width / 2, index * lineHeight));
		let pixels: ImageData;
		try { pixels = ink.getImageData(0, 0, width, height); } catch { finish(); return; }
		const samples: {x: number; y: number; alpha: number}[] = [];
		for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
			const alpha = pixels.data[(y * width + x) * 4 + 3];
			if (alpha > 80) samples.push({x, y, alpha: alpha / 255});
		}
		const stride = Math.max(1, Math.ceil(samples.length / limit));
		const grains = samples.filter((_, index) => index % stride === 0).slice(0, limit);
		if (!grains.length) { finish(); return; }
		canvas.dataset.grains = String(grains.length);
		context.fillStyle = style.color || '#6c5547';
		let started: number | undefined;
		function draw(now: number) {
			if (finished) return;
			if (!active || reduced()) { finish(); return; }
			started ??= now;
			const progress = Math.min(1, (now - started) / duration);
			context!.clearRect(0, 0, width, height);
			label.style.opacity = String(Math.max(0, 1 - progress * 7));
			grains.forEach((grain, index) => {
				const seed = ((index * 73 + 29) % 101) / 100;
				context!.globalAlpha = grain.alpha * Math.min(1, progress * 7) * (1 - progress);
				const drift = progress * progress;
				context!.fillRect(grain.x + drift * (30 + seed * 95), grain.y + drift * (seed * 62 - 31), 1 + seed, 1 + seed);
			});
			if (progress === 1) { finish(); return; }
			frame = window.requestAnimationFrame(draw);
		}
		frame = window.requestAnimationFrame(draw);
	});
</script>

<div class="ayla-request-retire relative max-w-[38ch]" aria-hidden="true">
	<p bind:this={label} class="whitespace-pre-wrap text-xl">{request}</p>
	<canvas bind:this={canvas} class="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2" aria-hidden="true"></canvas>
</div>
