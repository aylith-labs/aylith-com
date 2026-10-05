<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { legacyClassicHref } from '$lib/explore/view-context';
	import Seo from '$lib/components/Seo.svelte';
	onMount(() => {
		const target = legacyClassicHref(page.url);
		if (target) void goto(target, {replaceState: true}).catch(() => {});
	});
</script>

<Seo title="Ayla immersive" description="A focused voice and chat space with Ayla." />
<h1 class="sr-only">Ayla immersive</h1>
