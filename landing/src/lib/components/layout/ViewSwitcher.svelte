<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import RichCombobox from '$lib/components/controls/RichCombobox.svelte';
	import { viewHref } from '$lib/explore/view-context';
	let current = $derived(page.url.pathname === '/' || page.url.pathname === '/ayla' || page.url.pathname === '/ayla/immersive' ? 'ayla' : 'web');
	function switchView(view: string) {
		const target = viewHref(page.url, view === 'ayla' ? 'ayla' : 'web');
		void goto(target);
	}
</script>
<div class="w-28"><RichCombobox id="site-view" label="View" value={current} options={[{value:'web',label:'Web'},{value:'ayla',label:'Ayla'}]} onSelect={switchView} searchable={false} hideLabel compact popupMode="floating" /></div>
