<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { originalLoginRequest, resolvedLoginTarget } from '$lib/auth/login-resolver';
  import AylaSignIn from '$lib/ask/AylaSignIn.svelte';
  import { resolveAiUrl } from '$lib/ask/config';
  const apiUrl = resolveAiUrl();
  let open = $state(true);
  let failed = $state(false);
  const providerRequest = $derived(browser && page.url.searchParams.has('authRequest'));
  $effect(() => {
    if (!browser || !providerRequest) return;
    const authRequest = originalLoginRequest(page.url.searchParams);
    if (!authRequest) { failed = true; return; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;
    void (async () => {
      try {
        const target = new URL('/api/login/resolve', resolveAiUrl());
        target.searchParams.set('authRequest', authRequest);
        const response = await fetch(target, { credentials: 'omit', redirect: 'error', signal: controller.signal });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Sign-in could not continue');
        const next = resolvedLoginTarget(authRequest, await response.json());
        if (!next) throw new Error('Sign-in could not continue');
        if (active) window.location.replace(next);
      } catch { if (active) failed = true; }
      finally { clearTimeout(timeout); }
    })();
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  });
</script>
<svelte:head><title>{providerRequest ? 'Sign in · Aylith' : 'Sign in to Ayla'}</title></svelte:head>
<main class="relative mx-auto min-h-[38rem] w-full max-w-xl px-4 py-12">
  {#if providerRequest}
    <p class="text-sm text-surface-700 dark:text-warm-200">{failed ? 'Sign-in could not continue. Please try again from your app.' : 'Continuing secure sign-in…'}</p>
    <a class="mt-4 inline-block text-sm font-semibold underline" href="/classic">Aylith</a>
  {:else if browser}
    <AylaSignIn {apiUrl} {open} onClose={() => { open = false; }} onStatus={() => {}} />
    {#if !open}<button type="button" onclick={() => { open = true; }} class="min-h-11">Sign in to Ayla</button>{/if}
    <a class="absolute bottom-6 left-6 text-sm" href="/ayla">Return to Ayla</a>
  {:else}
    <p class="text-sm text-surface-700 dark:text-warm-200">Opening sign-in…</p>
  {/if}
</main>
