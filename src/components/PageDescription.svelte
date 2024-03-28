<script lang="ts">
	export let siteName = "MAS Web Utils";
	export let description = "🧰 A collection of useful tools for Monika After Story you can use online!";
	export let type = "website";
	export let title: string | undefined;
	export let url: string | undefined;
</script>

<svelte:head>
	{#if title !== undefined}
		<title>{title} &bull; {siteName}</title>
	{:else}
		<title>{siteName}</title>
	{/if}

	{#if url !== undefined}
		<meta property="og:url" content={url} />
	{/if}

	<meta name="description" content={description} />

	<meta property="og:site_name" content={siteName} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
</svelte:head>
