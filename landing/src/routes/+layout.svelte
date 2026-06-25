<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { motion } from '$lib/stores/motion.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { children, data } = $props();

	onMount(() => {
		const stopMotion = motion.init();
		const stopTheme = theme.init();
		return () => {
			stopMotion();
			stopTheme();
		};
	});

	if (browser) {
		// Console easter egg
		console.log(
			'%c A Y L I T H ',
			'background: #1c1a16; color: #f8f7f4; font-family: "Space Grotesk", system-ui, sans-serif; font-size: 24px; font-weight: 600; padding: 8px 16px; letter-spacing: 0.34em;'
		);
		console.log(
			'%cA lab that turns demand signals into shipped AI tools.\n%cgithub.com/aylith-labs',
			'color: #c97a3a; font-size: 13px; font-weight: 500;',
			'color: #908970; font-size: 12px;'
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

	<Footer projects={data.navProjects} />
</div>
