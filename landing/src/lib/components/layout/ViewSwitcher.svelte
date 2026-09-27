<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { VIEW_CHOICES } from '$lib/components/controls/choice-options';
	let current = $derived(page.url.pathname === '/ayla' ? 'ayla' : page.url.pathname.startsWith('/explore') ? 'explore' : 'classic');
	function switchView(view: string) {
		const target = view === 'ayla' ? '/ayla' : view === 'explore' ? '/explore' : '/?view=classic';
		void goto(target);
	}
</script>
<div class="w-28 sm:w-32"><RichCombobox id="aylith-view" label="Aylith view" value={current} options={VIEW_CHOICES} onSelect={switchView} popupMode="floating" compact hideLabel /></div>
