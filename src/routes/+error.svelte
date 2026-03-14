<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>404 — Aylith</title>
</svelte:head>

<section class="flex flex-1 items-center justify-center px-4 py-24">
	<div class="max-w-md text-center">
		<p class="text-8xl font-bold tabular-nums text-accent-500/20">
			{page.status}
		</p>
		<h1 class="mt-4 text-2xl font-bold text-surface-900 dark:text-warm-50">
			{#if page.status === 404}
				This page went to production without tests.
			{:else}
				Something unexpected happened.
			{/if}
		</h1>
		<p class="mt-3 text-surface-500 dark:text-warm-300">
			{#if page.status === 404}
				It happens to the best of us. The page you're looking for doesn't exist — yet.
			{:else}
				{page.error?.message ?? 'An error occurred.'}
			{/if}
		</p>
		<div class="mt-8 flex justify-center gap-4">
			<a
				href="/"
				class="btn-press rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-400"
			>
				Back home
			</a>
			<a
				href="/projects"
				class="btn-press rounded-xl border border-surface-200 px-5 py-2.5 text-sm font-semibold text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:text-warm-200 dark:hover:border-surface-600"
			>
				View projects
			</a>
		</div>
	</div>
</section>
