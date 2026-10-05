<script lang="ts">
	import { productWebsitePreview } from '$lib/catalog/entry-point';
	import type { Project } from '$lib/types/project';
	let { project, className = '' }: { project: Project; className?: string } = $props();
	let homepage=$derived(productWebsitePreview(project));
</script>

{#if homepage}
	<iframe title="{project.name} website" src={homepage} loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation" class={className}></iframe>
{/if}
