<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Seo from '$lib/components/Seo.svelte';
	onMount(() => { void goto(`/ayla${window.location.search}`, { replaceState: true }); });
</script>
<Seo title="Ask Ayla" description="Continue the conversation with Ayla." />
<p class="p-8"><a href="/ayla" class="text-accent-700 underline">Continue to Ayla →</a></p>
