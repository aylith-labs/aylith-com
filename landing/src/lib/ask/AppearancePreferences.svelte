<script lang="ts">
  import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
  import { theme } from '$lib/stores/theme.svelte';
  import { motion } from '$lib/stores/motion.svelte';
  let { apiUrl, authPath = '/api/auth', identity, visible = false }: { apiUrl: string; authPath?: string; identity: string; visible?: boolean } = $props();
  type Preferences = { revision: number; theme: 'system' | 'light' | 'dark'; motion: 'system' | 'reduced' | 'full' };
  let value = $state<Preferences | null>(null);
  let busy = $state(false);
  let error = $state('');
  let epoch = 0;
  let controller: AbortController | null = null;
  function valid(v: unknown): v is Preferences {
    if (!v || typeof v !== 'object') return false;
    const p = v as Preferences;
    return Number.isSafeInteger(p.revision) && p.revision >= 0 && ['system', 'light', 'dark'].includes(p.theme) && ['system', 'reduced', 'full'].includes(p.motion);
  }
  async function request(signal: AbortSignal, body?: Preferences) {
    return fetch(`${apiUrl}${authPath}/preferences`, { method: body ? 'POST' : 'GET', credentials: 'include', cache: 'no-store', redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  }
  $effect(() => {
    const scope = identity;
    const lease = ++epoch;
    controller?.abort(); value = null; busy = false; error = '';
    const abort = new AbortController(); controller = abort;
    if (/^[a-f0-9]{64}$/.test(scope)) {
      void (async () => {
        try {
          const response = await request(abort.signal);
          const data: unknown = await response.json();
          if (lease !== epoch || abort.signal.aborted || scope !== identity) return;
          if (!response.ok || !valid(data)) throw new Error();
          value = data; theme.set(data.theme); motion.set(data.motion);
        } catch { if (lease === epoch && !abort.signal.aborted && scope === identity) error = 'Saved appearance could not be loaded.'; }
      })();
    }
    return () => { ++epoch; abort.abort(); };
  });
  async function save() {
    if (!value || busy) return;
    const lease = epoch;
    const scope = identity;
    const abort = controller;
    if (!abort) return;
    busy = true; error = '';
    try {
      const response = await request(abort.signal, value);
      const data: unknown = await response.json();
      if (lease !== epoch || abort.signal.aborted || scope !== identity) return;
      if (!response.ok || !valid(data)) throw new Error();
      value = data; theme.set(data.theme); motion.set(data.motion);
    } catch { if (lease === epoch && !abort.signal.aborted && scope === identity) error = 'Appearance was not saved. Reopen sign-in to reload your saved choices and retry.'; }
    finally { if (lease === epoch && scope === identity) busy = false; }
  }
</script>

{#if visible}
  <section aria-label="Saved appearance" class="mt-5 border-t border-surface-200 pt-4 dark:border-surface-700">
    <h3 class="font-semibold">Appearance for your account</h3>
    {#if value}
      <RichCombobox id="account-theme" label="Account theme" value={value.theme} options={[{value:'system',label:'System'},{value:'light',label:'Light'},{value:'dark',label:'Dark'}]} searchable={false} disabled={busy} onSelect={selected => { if (value && ['system','light','dark'].includes(selected)) value = {...value,theme:selected as Preferences['theme']}; }} />
      <RichCombobox id="account-motion" label="Account motion" value={value.motion} options={[{value:'system',label:'System'},{value:'reduced',label:'Reduced'},{value:'full',label:'Full'}]} searchable={false} disabled={busy} onSelect={selected => { if (value && ['system','reduced','full'].includes(selected)) value = {...value,motion:selected as Preferences['motion']}; }} />
      <button type="button" onclick={save} disabled={busy} class="mt-3 min-h-11 rounded-full px-4">{busy ? 'Saving…' : 'Save appearance'}</button>
    {/if}
    {#if error}<p role="alert">{error}</p>{/if}
  </section>
{/if}
