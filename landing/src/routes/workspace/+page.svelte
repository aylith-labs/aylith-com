<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Seo from '$lib/components/Seo.svelte';
	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const q = params.get('q');
		const target = params.get('tab') === 'ask' || q ? `/ayla${q ? `?q=${encodeURIComponent(q)}` : ''}` : '/explore';
		void goto(target, { replaceState: true });
	});
</script>
<Seo title="Explore Aylith" description="Explore the Aylith catalog with Ayla." />
<p class="p-8"><a href="/explore" class="text-accent-700 underline">Continue to Explore →</a></p>
