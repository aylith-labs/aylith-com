<script lang="ts">
	import { motion, type MotionPreference } from '$lib/stores/motion.svelte';

	const options: { value: MotionPreference; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'reduced', label: 'Reduced' },
		{ value: 'full', label: 'Full' }
	];

	const status = $derived.by(() => {
		if (motion.preference === 'system') {
			return motion.systemPrefersReduced
				? 'Following your system setting: reduced motion is on, so the animations hold still.'
				: 'Following your system setting: motion is allowed, so the animations play.';
		}
		if (motion.preference === 'reduced') {
			return 'Forced reduced. Animations are held still for preview, regardless of your system setting.';
		}
		return motion.systemPrefersReduced
			? 'Forced full, overriding your system reduced-motion setting so you can preview the animations.'
			: 'Forced full. Every animation plays.';
	});
</script>

<div class="rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-900/40">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h3 class="text-sm font-semibold text-surface-900 dark:text-warm-50">Motion</h3>
			<p class="text-xs text-surface-500 dark:text-warm-400">
				Detected system preference:
				<span class="font-medium text-surface-700 dark:text-warm-300">
					{motion.systemPrefersReduced ? 'reduced motion' : 'motion allowed'}
				</span>
			</p>
		</div>

		<div
			class="inline-flex rounded-lg border border-surface-200 bg-white p-0.5 dark:border-surface-700 dark:bg-surface-800"
			role="group"
			aria-label="Motion preference"
		>
			{#each options as option (option.value)}
				<button
					type="button"
					onclick={() => motion.set(option.value)}
					aria-pressed={motion.preference === option.value}
					class="btn-press rounded-md px-3 py-1.5 text-xs font-medium transition-colors {motion.preference ===
					option.value
						? 'bg-accent-500 text-white'
						: 'text-surface-600 hover:bg-surface-100 dark:text-warm-300 dark:hover:bg-surface-700'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<p class="mt-3 text-xs leading-relaxed text-surface-500 dark:text-warm-400">{status}</p>
</div>
