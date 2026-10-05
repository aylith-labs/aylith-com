<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import AylaSignIn from '$lib/ask/AylaSignIn.svelte';
  import { resolveAiUrl } from '$lib/ask/config';
  let { data }: {data:{applicationId:string;authorizationStartUri:string}} = $props();
  const apiUrl=resolveAiUrl();
  let open=$state(true);
  let authRequestId=$derived(!browser ? '' : page.url.searchParams.getAll('authRequest').length===1 ? page.url.searchParams.get('authRequest')||'invalid' : page.url.searchParams.has('authRequest') ? 'invalid' : '');
  const authorizationFailed=$derived(browser && page.url.searchParams.has('error'));
  $effect(()=>{ if(browser && !authRequestId && !authorizationFailed) window.location.assign(data.authorizationStartUri); });
</script>
<svelte:head><title>Sign in</title></svelte:head>
<main class="relative mx-auto min-h-[38rem] w-full max-w-xl px-4 py-12">
  {#if authRequestId}
    {#key `${data.applicationId}:${authRequestId}`}
      <AylaSignIn {apiUrl} authPath={`/api/login/${data.applicationId}`} applicationId={data.applicationId} {authRequestId} {open} onClose={()=>{open=false}} onStatus={()=>{}} />
    {/key}
    {#if !open}<button type="button" onclick={()=>{open=true}}>Open sign in</button>{/if}
  {:else}
    <p class="text-sm text-surface-700 dark:text-warm-200">{authorizationFailed ? 'Sign-in did not finish. Please try again.' : 'Continuing secure sign-in…'}</p>
    <a class="mt-4 inline-block text-sm font-semibold underline" href={data.authorizationStartUri}>Continue sign-in</a>
  {/if}
  <a class="absolute bottom-6 left-6 text-sm" href="/classic">Aylith</a>
</main>
