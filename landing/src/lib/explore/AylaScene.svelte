<script lang="ts">
 import{responsePreview,type ImmersivePhase}from './immersive';import PromptDissolve from './PromptDissolve.svelte';
 let{phase,request='',requestId='',summary,response='',error='',active=true}:{phase:ImmersivePhase;request?:string;requestId?:string;summary?:{requestId:string;summary:string};response?:string;error?:string;active?:boolean}=$props();
 let pending=$state(''),retiring=$state(''),retirementId=$state(0);let serial=0;
 const preview=$derived(responsePreview(response));
 $effect(()=>{if(phase==='thinking'&&request){pending=request;retiring='';}else if(response&&pending){retiring=pending;pending='';retirementId=++serial;}});
</script>
<div class="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-4 pb-20 text-center" data-phase={phase}>
 <svg class="ayla-aperture ayla-aperture--immersive" data-active={active&&phase!=='error'} viewBox="0 0 360 150" aria-hidden="true"><path d="M9 104 C82 43 129 29 193 54 C251 79 286 24 351 18 C301 68 282 117 216 119 C151 121 80 86 9 104Z" fill="currentColor" opacity=".8"/><path d="M48 91 C110 58 150 52 199 68 C249 86 287 51 326 38 C283 82 263 98 214 99 C150 100 102 78 48 91Z" class="ayla-aperture-cut"/></svg>
 {#if phase==='thinking'}<p class="max-w-[38ch] whitespace-pre-wrap text-xl font-medium" aria-label="Your pending request" aria-live="polite">{request||'Ayla is thinking…'}</p>
 {:else}
  {#if retiring}{#key retirementId}<PromptDissolve request={retiring} {retirementId} {active} onDone={(id)=>{if(id===retirementId)retiring='';}}/>{/key}{/if}
  {#if request}<p class="max-w-[42ch] text-xs leading-relaxed text-surface-600 dark:text-warm-300" aria-label="Your request">You asked: {summary?.requestId===requestId?(summary?.summary??request):request}</p>{/if}
  {#if phase==='error'}<p class="max-w-[40ch] text-sm text-red-700 dark:text-red-300" role="alert">{error||'Voice is unavailable here. You can still chat.'}</p>
  {:else if response}<p class="max-w-[48ch] whitespace-pre-wrap text-balance font-medium leading-relaxed {preview.text.length<=100?'text-3xl sm:text-5xl':'text-xl sm:text-3xl'}" aria-label="Ayla response" aria-live="polite" class:ayla-response-living={preview.text.length<=100} data-living={active&&preview.text.length<=100}>{preview.text}</p>{#if preview.shortened}<p class="text-xs text-surface-600 dark:text-warm-300">Reply preview · full answer in Full conversation</p>{/if}
  {:else if phase==='listening'}<p class="text-xl font-medium" aria-live="polite">Listening…</p>{:else}<p class="text-2xl font-medium" aria-live="polite">I’m here.</p>{/if}
 {/if}
</div>
