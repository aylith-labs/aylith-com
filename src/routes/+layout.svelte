<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children } = $props();

	if (browser) {
		// Console easter egg
		console.log(
			'%c Aylith ',
			'background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; font-size: 24px; font-weight: bold; padding: 8px 16px; border-radius: 8px;'
		);
		console.log(
			'%cAI Product Studio — 10 products, 0 bullshit.\n%cCurious? https://github.com/aylith-apps',
			'color: #8b5cf6; font-size: 14px; font-weight: 600;',
			'color: #64748b; font-size: 12px;'
		);

		// Konami code: up up down down left right left right b a
		const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
		let pos = 0;
		document.addEventListener('keydown', (e) => {
			if (e.keyCode === konami[pos]) {
				pos++;
				if (pos === konami.length) {
					pos = 0;
					document.body.style.transition = 'filter 0.6s ease';
					document.body.style.filter = 'hue-rotate(180deg)';
					console.log('%c🎉 You found the Konami code!', 'font-size: 20px;');
					setTimeout(() => {
						document.body.style.filter = '';
					}, 3000);
				}
			} else {
				pos = 0;
			}
		});
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navbar />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
