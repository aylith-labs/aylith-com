<script lang="ts">
  import AylaSignIn from '$lib/ask/AylaSignIn.svelte';
  import { resolveAiUrl } from '$lib/ask/config';
  const apiUrl = resolveAiUrl();
  let open = $state(true);
</script>
<svelte:head><title>Sign in to Ayla</title></svelte:head>
<main class="relative mx-auto min-h-[38rem] w-full max-w-xl px-4 py-12">
  <AylaSignIn {apiUrl} {open} onClose={() => { open = false; }} onStatus={() => {}} />
  {#if !open}<button type="button" onclick={() => { open = true; }} class="min-h-11">Sign in to Ayla</button>{/if}
  <a class="absolute bottom-6 left-6 text-sm" href="/ayla">Return to Ayla</a>
</main>
