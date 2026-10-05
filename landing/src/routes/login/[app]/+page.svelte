<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import AylaSignIn from '$lib/ask/AylaSignIn.svelte';
  import { resolveAiUrl } from '$lib/ask/config';
  let { data }: {data:{applicationId:string}} = $props();
  const apiUrl=resolveAiUrl();
  let open=$state(true);
  let authRequestId=$derived(!browser ? '' : page.url.searchParams.getAll('authRequest').length===1 ? page.url.searchParams.get('authRequest')??'' : page.url.searchParams.has('authRequest') ? 'invalid' : '');
</script>
<svelte:head><title>Sign in</title></svelte:head>
<main class="relative mx-auto min-h-[38rem] w-full max-w-xl px-4 py-12">
  {#key `${data.applicationId}:${authRequestId}`}
    <AylaSignIn {apiUrl} authPath={`/api/login/${data.applicationId}`} applicationId={data.applicationId} {authRequestId} {open} onClose={()=>{open=false}} onStatus={()=>{}} />
  {/key}
  {#if !open}<button type="button" onclick={()=>{open=true}}>Open sign in</button>{/if}
  <a class="absolute bottom-6 left-6 text-sm" href="/classic">Aylith</a>
</main>
