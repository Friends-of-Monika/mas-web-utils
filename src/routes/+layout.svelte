<script lang="ts">
	// Include CSS (+ Tailwind)
	import "../app.css";

	// Components
	import PageMeta from "../components/PageMeta.svelte";
	import OpenGraph from "../components/OpenGraph.svelte";

	// Svelte transitions
	import { fly } from "svelte/transition";

	// Layout/page data
	export let data: Record<string, unknown>;
</script>

<!-- Include SEO metadata -->
<PageMeta />
<OpenGraph />

{#key data.url}
	<div in:fly={{ x: -200, duration: 300, delay: 300 }} out:fly={{ x: 200, duration: 300 }}>
		<slot />
	</div>
{/key}
