<script lang="ts">
	import { projectMeta } from '$lib/data/projects';
	import Mark from '$lib/components/brand/Mark.svelte';
	import Wordmark from '$lib/components/brand/Wordmark.svelte';
	import { getMonthlyVariant } from '$lib/brand/rotation';

	const variant = getMonthlyVariant();
</script>

<footer class="mt-auto border-t border-surface-200/60 bg-surface-50 dark:border-surface-800/40 dark:bg-surface-900/30">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<div>
				<div class="flex items-center gap-2 text-surface-900 dark:text-warm-50">
					<Mark class="h-[20px] w-auto shrink-0" />
					<Wordmark {variant} size="footer" />
				</div>
				<p class="mt-3 max-w-xs text-sm text-surface-500 dark:text-warm-400">
					A lab that turns demand signals into shipped AI tools. Days, not quarters.
				</p>
			</div>

			<div>
				<h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-warm-400">Products</h3>
				<ul class="mt-3 columns-2 gap-x-8 space-y-2">
					{#each projectMeta as project}
						<li>
							<a href="/projects/{project.slug}" class="text-sm text-surface-600 transition-colors hover:text-accent-600 dark:text-warm-300 dark:hover:text-accent-400">
								{project.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-warm-400">Company</h3>
				<ul class="mt-3 space-y-2">
					<li>
						<a href="/" class="text-sm text-surface-600 transition-colors hover:text-accent-600 dark:text-warm-300 dark:hover:text-accent-400">
							About
						</a>
					</li>
					<li>
						<a href="/design" class="text-sm text-surface-600 transition-colors hover:text-accent-600 dark:text-warm-300 dark:hover:text-accent-400">
							Design system
						</a>
					</li>
					<li>
						<a href="https://github.com/aylith-labs" class="text-sm text-surface-600 transition-colors hover:text-accent-600 dark:text-warm-300 dark:hover:text-accent-400">
							GitHub
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-10 border-t border-surface-200/60 pt-6 dark:border-surface-800/40">
			<p class="text-xs text-surface-400 dark:text-warm-400">
				&copy; 2026 Aylith
			</p>
		</div>
	</div>
</footer>
