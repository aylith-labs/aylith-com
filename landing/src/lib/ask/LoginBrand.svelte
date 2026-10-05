<script lang="ts">
  let { name = 'Ayla', endorsement = 'Aylith', heading, productId = '' }: { name?: string; endorsement?: string; heading: string; productId?: string } = $props();
</script>

<div>
  {#if productId === 'agentry'}
    <p aria-label="Agentry" class="agentry-wordmark text-surface-900 dark:text-warm-100">agentry<span aria-hidden="true" class="text-accent-700 dark:text-accent-300">/</span></p>
    <p class="mt-2 text-xs text-surface-500 dark:text-warm-400">{endorsement}</p>
  {:else}
    <p class="text-xs text-surface-500 dark:text-warm-400">{endorsement}</p>
    <p class="mt-1 text-lg font-semibold text-accent-700 dark:text-accent-300">{name}</p>
  {/if}
  <h2 class="mt-1 text-2xl font-semibold tracking-tight">{heading}</h2>
</div>

<style>
  /* Exact wordmark typography from the owning Agentry public home. */
  .agentry-wordmark { font: 700 1.5rem/1 'Space Grotesk', sans-serif; letter-spacing: -.075em; }
</style>
