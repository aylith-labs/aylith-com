<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
  let { apiUrl, onPolicyChange }: { apiUrl: string; onPolicyChange: () => void } = $props();
  type Policy = {revision: number; processing: 'auto'|'browser'|'owned'; serverProvider: 'owned'; legacyTransport: 'disabled'|'cartesia'; synthesis: 'owned'|'cartesia_then_owned'; recognition: 'owned'|'cartesia_ink_whisper_then_owned'};
  let authorized = $state(false);
  let open = $state(false);
  let saving = $state(false);
  let error = $state('');
  let policy = $state<Policy>();
  type ManagedPolicy={revision:number;enabled:boolean;guest:boolean};
  let managed=$state<ManagedPolicy>();
  let usage = $state<{day: string; provider: string; tickets: number}[]>([]);
  let measured=$state<{modelId:string|null;provider:string;inputTokens:number|null;outputTokens:number|null;totalTokens:number|null;observedAt:string}[]>([]);
  let outcomes=$state<{observedAt:string;route:string;status:string;durationMs:number}[]>([]);
  let connection = $state<{provider:string;mode:string;modelId:string|null}>();
  let cloudSynthesis = $state(false);
  let cloudRecognition = $state(false);
  let voiceSessions=$state<{id:string;kind:string;expiresAt:number;reservedCents:number}[]>([]);
  let actions=$state<{id:string;observedAt:string;operation:string;target:string;result:string}[]>([]);
  let epoch = 0;
  let destroyed = false;
  const controllers = new Set<AbortController>();
  async function request(path: string, body?: Policy|ManagedPolicy|{id:string}) {
    const controller = new AbortController(); controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${apiUrl}${path}`, {credentials: 'include', cache: 'no-store', signal: controller.signal,
        ...(body ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)} : {})});
      if (response.status === 401 || response.status === 403) { authorized = false; policy = undefined; managed=undefined; connection = undefined; usage = []; measured=[]; outcomes=[]; voiceSessions=[]; actions=[]; cloudSynthesis = false; cloudRecognition = false; open = false; throw new Error('Administrative access is unavailable.'); }
      if (!response.ok) throw new Error(response.status === 409 ? 'Policy changed. Reload before saving.' : 'Settings could not be loaded.');
      return await response.json();
    } finally {clearTimeout(timer); controllers.delete(controller);}
  }
  async function refresh() {
    const current = ++epoch;
    authorized = false; policy = undefined; managed=undefined; connection = undefined; usage = []; measured=[]; outcomes=[]; voiceSessions=[]; actions=[]; cloudSynthesis = false; cloudRecognition = false; error = '';
    try {
      const capability = await request('/api/auth/administration/capability');
      if (destroyed || current !== epoch || capability.authorized !== true) return;
      const [saved, counts, available, operational, managedPolicy, responseUsage, sessions, audit] = await Promise.all([
        request('/api/auth/administration/voice-policy'), request('/api/auth/administration/usage'), request('/api/voice/capabilities'), request('/api/auth/administration/connection'),request('/api/auth/administration/managed-voice'),request('/api/auth/administration/model-usage'),request('/api/auth/administration/voice-sessions'),request('/api/auth/administration/actions')
      ]);
      if (destroyed || current !== epoch) return;
      policy = saved;managed=managedPolicy; connection = operational; usage = counts.rows;measured=responseUsage.records;outcomes=responseUsage.outcomes??[];voiceSessions=sessions.sessions??[];actions=audit.rows??[];
      cloudSynthesis = available.providers?.cartesia?.tts?.serverAvailable === true;
      cloudRecognition = available.providers?.owned?.fastCloudStt?.serverAvailable === true;
      authorized = true;
    } catch { if (!destroyed && current === epoch) authorized = false; }
  }
  async function endVoiceSession(id:string) {
    if (!authorized || saving) return;
    const current=epoch;
    saving=true;error='';
    try {
      const capability=await request('/api/auth/administration/capability');
      if (destroyed || current!==epoch || capability.authorized!==true) return;
      await request('/api/auth/administration/voice-sessions/end',{id});
      if (destroyed || current!==epoch) return;
      const [sessions,audit]=await Promise.all([request('/api/auth/administration/voice-sessions'),request('/api/auth/administration/actions')]);
      if (destroyed || current!==epoch) return;
      voiceSessions=sessions.sessions??[];actions=audit.rows??[];
    } catch {if (!destroyed && current===epoch) error='The voice session could not be ended. Reload and retry.';}
    finally {if (!destroyed && current===epoch) saving=false;}
  }
  async function save() {
    if (!policy || saving) return;
    saving = true; error = '';
    const current = epoch;
    try {
      const capability = await request('/api/auth/administration/capability');
      if (destroyed || current !== epoch || capability.authorized !== true) return;
      const result = await request('/api/auth/administration/voice-policy', policy);
      if (destroyed || current !== epoch) return;
      policy = result; onPolicyChange();
    } catch (cause) { if (!destroyed && current === epoch) error = cause instanceof Error ? cause.message : 'Policy could not be saved.'; }
    finally { if (!destroyed && current === epoch) saving = false; }
  }
  async function saveManaged(){
    if(!managed||saving)return;saving=true;error='';const current=epoch;
    try{const capability=await request('/api/auth/administration/capability');if(destroyed||current!==epoch||capability.authorized!==true)return;
      const saved=await request('/api/auth/administration/managed-voice',managed);if(destroyed||current!==epoch)return;managed=saved;onPolicyChange();
    }catch(cause){if(!destroyed&&current===epoch)error=cause instanceof Error?cause.message:'Policy could not be saved.';}finally{if(!destroyed&&current===epoch)saving=false;}
  }
  onMount(() => {void refresh();});
  onDestroy(() => {destroyed = true; epoch++; authorized = false; open = false; policy = undefined; managed=undefined; connection = undefined; usage = []; measured=[]; outcomes=[]; voiceSessions=[]; actions=[]; cloudSynthesis = false; cloudRecognition = false; controllers.forEach(controller => controller.abort());});
</script>

{#if authorized && policy}
  <div class="border-t border-surface-200 pt-3 dark:border-surface-700">
    <button onclick={() => {open = !open; if (open) void refresh();}} aria-expanded={open} class="rounded-lg px-2 py-2 text-sm font-semibold">Administration</button>
    {#if open}
      <div class="grid gap-4 pt-3">
        {#if connection}<div class="text-xs"><p class="font-semibold">Effective text connection</p><p>{connection.provider} · {connection.mode} · {connection.modelId ?? 'Unavailable'}</p></div>{/if}
        <RichCombobox id="ayla-admin-processing" label="Speech processing" value={policy.processing} options={[{value:'auto',label:'Automatic'},{value:'browser',label:'On this device'},{value:'owned',label:'Aylith server'}]} searchable={false} onSelect={(value) => {if (policy && (value === 'auto' || value === 'browser' || value === 'owned')) policy = {...policy, processing:value};}} />
        <RichCombobox id="ayla-admin-synthesis" label="Voice synthesis" value={policy.synthesis} options={[{value:'owned',label:'Aylith speech'},...((cloudSynthesis || policy.synthesis === 'cartesia_then_owned') ? [{value:'cartesia_then_owned',label:'Cartesia with Aylith fallback'}] : [])]} onSelect={(value) => {if (policy && (value === 'owned' || value === 'cartesia_then_owned')) policy = {...policy,synthesis:value};}} />
        <RichCombobox id="ayla-admin-legacy" label="Legacy English voice transport" value={policy.legacyTransport} options={[{value:'disabled',label:'Disabled'},{value:'cartesia',label:'Cartesia (configured server credentials required)'}]} onSelect={(value) => {if (policy && (value === 'disabled' || value === 'cartesia')) policy = {...policy,legacyTransport:value};}} />
        <RichCombobox id="ayla-admin-recognition" label="Recognition" value={policy.recognition} options={[{value:'owned',label:'Aylith recognition'},...((cloudRecognition || policy.recognition === 'cartesia_ink_whisper_then_owned') ? [{value:'cartesia_ink_whisper_then_owned',label:'Verified Cartesia with Aylith fallback'}] : [])]} onSelect={(value) => {if (policy && (value === 'owned' || value === 'cartesia_ink_whisper_then_owned')) policy = {...policy,recognition:value};}} />
        {#if managed}<div class="grid gap-2 text-sm"><p class="font-semibold">Conversational voice profile</p><label><input type="checkbox" bind:checked={managed.enabled}/> Enable configured conversational voice</label><label><input type="checkbox" bind:checked={managed.guest}/> Allow the configured visitor quota</label><p class="text-xs">Requires a verified server language/voice profile and operator spending ceilings. Saving ends current conversational sessions. Reservation ceilings are estimates, not provider billing.</p><button onclick={saveManaged} disabled={saving} class="rounded-lg border border-surface-300 px-3 py-2 dark:border-surface-600">Save conversational voice policy</button></div>{/if}
        <div class="flex gap-2"><button onclick={save} disabled={saving} class="rounded-lg border border-surface-300 px-3 py-2 dark:border-surface-600">{saving ? 'Saving…' : 'Save policy'}</button><button onclick={refresh} class="rounded-lg px-3 py-2 underline">Reload</button></div>
        {#if error}<p role="alert">{error}</p>{/if}
        <div class="text-xs"><p class="font-semibold">Active conversational voice sessions</p><p>Ending one voice session stops its current stream. It does not sign out the account or block future eligible conversations. Reserved costs are admission estimates, not billing.</p>{#each voiceSessions as session}<div><p>{session.kind} · {session.id} · Reserved {session.reservedCents} cents</p><button data-end-voice-session disabled={saving} onclick={()=>endVoiceSession(session.id)}>End voice session</button></div>{/each}</div>
        <div class="text-xs"><p class="font-semibold">Owner action audit</p>{#each actions as action}<p>{action.observedAt} · {action.operation} · {action.target} · {action.result}</p>{/each}</div>
        <div class="text-xs"><p class="font-semibold">Provider billing</p><p>Provider accounts show charges and credits separately from the response measurements below.</p><div class="flex flex-wrap gap-3"><a data-provider-billing href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer" class="underline">OpenAI API billing</a><a data-provider-billing href="https://platform.claude.com/settings/billing" target="_blank" rel="noopener noreferrer" class="underline">Claude API billing</a><a data-provider-billing href="https://play.cartesia.ai/dashboard" target="_blank" rel="noopener noreferrer" class="underline">Cartesia credits</a></div></div>
        <div class="text-xs"><p class="font-semibold">Observed text request outcomes</p><p>Actual completed, failed or cancelled generation requests and elapsed time. No observations means unknown; this is not live uptime, audio usage or provider billing. Route labels are configured routing; received model identifiers remain in response usage below.</p>{#if !outcomes.length}<p>Request outcome unknown — no recorded observation.</p>{/if}{#each outcomes as row}<p>{row.observedAt} · {row.route} · {row.status} · {row.durationMs} ms</p>{/each}</div>
        <div class="text-xs"><p class="font-semibold">Model response usage</p><p>Provider-reported response metadata per model step; unavailable values remain unknown. These are not monetary billing or conversational voice reservation estimates.</p>{#each measured as row}<p>{row.observedAt} · {row.provider} · {row.modelId??'Model unknown'} · Input {row.inputTokens??'unknown'} · Output {row.outputTokens??'unknown'} · Total {row.totalTokens??'unknown'}</p>{/each}</div>
        <div class="text-xs"><p class="font-semibold">Voice session tickets issued</p><p class="mt-1 text-surface-600 dark:text-warm-300">Gateway requests only; these counts do not measure model tokens, provider calls or billing.</p>{#each usage as row}<p class="mt-1">{row.day} · {row.provider} · {row.tickets}</p>{/each}</div>
      </div>
    {/if}
  </div>
{/if}
