<script lang="ts">
  let { name = 'Ayla', endorsement = 'Aylith', heading }: { name?: string; endorsement?: string; heading: string } = $props();
</script>

<div>
  <p class="text-xs text-surface-500 dark:text-warm-400">{endorsement}</p>
  <p class="mt-1 text-lg font-semibold text-accent-700 dark:text-accent-300">{name}</p>
  <h2 class="mt-1 text-2xl font-semibold tracking-tight">{heading}</h2>
</div>
