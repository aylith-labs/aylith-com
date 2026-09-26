<script lang="ts">
	import type { Project } from '$lib/types/project';
	import type { ChangelogEntry } from '$lib/types/changelog';
	import Seo from '$lib/components/Seo.svelte';
	let { data } = $props();
	let project: Project = $derived(data.project);
	let entries: ChangelogEntry[] = $derived(data.entries);
	const dates = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
</script>
<Seo title="{project.name} Changelog — Explore Aylith" description="Studio release notes for {project.name}." type="article" />
<section class="mx-auto max-w-4xl px-5 py-9 pb-32 sm:px-10 sm:py-14">
	<p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent-700 dark:text-accent-300">Studio notes · {project.name}</p>
	<h2 class="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">Changelog</h2>
	<p class="mt-4 max-w-2xl text-sm text-surface-600 dark:text-warm-300">Dated studio notes are distinct from package releases and current setup requirements.</p>
	{#if entries.length}
		<ol class="mt-12 space-y-14 border-l border-surface-200 pl-6 dark:border-surface-800 sm:pl-10">
			{#each entries as entry (entry.id)}
				<li id={entry.id} class="relative scroll-mt-24"><span class="absolute -left-[1.8rem] top-2 size-3 rounded-full border-2 border-white bg-accent-600 dark:-left-[2.8rem] dark:border-surface-950 sm:-left-[2.8rem]"></span>
					<p class="text-xs font-medium uppercase tracking-[0.12em] text-surface-500"><time datetime={entry.date}>{dates.format(new Date(`${entry.date}T00:00:00Z`))}</time> · {entry.tags.join(' / ')}</p>
					<h3 class="mt-2 text-2xl font-semibold tracking-tight">{entry.title}</h3>
					<div class="prose mt-5 max-w-none dark:prose-invert prose-a:text-accent-700 dark:prose-a:text-accent-300"><entry.component /></div>
				</li>
			{/each}
		</ol>
	{:else}<p class="mt-10 rounded-xl border border-dashed border-surface-300 p-8 text-surface-600 dark:border-surface-700 dark:text-warm-300">No studio changelog entries yet. This does not determine whether the project is available.</p>{/if}
</section>
