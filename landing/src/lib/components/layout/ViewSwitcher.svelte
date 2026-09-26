<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	let current = $derived(page.url.pathname === '/ayla' ? 'ayla' : page.url.pathname.startsWith('/explore') ? 'explore' : 'classic');
	function switchView(event: Event) {
		const view = (event.currentTarget as HTMLSelectElement).value;
		const target = view === 'ayla' ? '/ayla' : view === 'explore' ? '/explore' : '/?view=classic';
		void goto(target);
	}
</script>
<label class="inline-flex items-center"><span class="sr-only">Aylith view</span><select aria-label="Aylith view" value={current} onchange={switchView} class="rounded-full border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 dark:border-surface-700 dark:bg-surface-900 dark:text-warm-100"><option value="classic">Classic</option><option value="explore">Explore</option><option value="ayla">Ayla</option></select></label>
