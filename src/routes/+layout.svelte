<script lang="ts">
	// Import components
	import PageDescription from "../components/PageDescription.svelte";

	// Include CSS (+ Tailwind)
	import "../app.css";

	// Svelte transitions
	import { fly } from "svelte/transition";

	// Layout/page data
	export let data: Record<string, unknown>;
	import { page } from "$app/stores";
</script>

{#key $page.route}
	<!-- Page title, description & OGP data (updates whenever route changes) -->
	<PageDescription url={$page.url.toString()} title={$page.data.title} description={$page.data.description} />
{/key}

{#key data.url}
	<div in:fly={{ x: -200, duration: 300, delay: 300 }} out:fly={{ x: 200, duration: 300 }}>
		<slot />
	</div>
{/key}
