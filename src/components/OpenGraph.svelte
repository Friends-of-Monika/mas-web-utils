<script lang="ts">
	import { page } from "$app/stores";

	// OpenGraph generic parameters
	export let ogpTitle: string = $page.data.ogp?.title ?? $page.data.meta?.title;
	export let ogpUrl = $page.url.toString();
	export let ogpType = "website";
	export let ogpDescription: string = $page.data.ogp?.description ?? $page.data.meta?.description;
	export let ogpImage: string = $page.data.ogp?.image ?? $page.data.meta?.image;

	// Twitter-specific parameters
	export let twiCard: string | undefined = undefined;
	export let twiDomain = $page.url.hostname;
	export let twiUrl = ogpUrl;
	export let twiTitle = ogpTitle;
	export let twiDescription = ogpDescription;
	export let twiImage = ogpImage;
</script>

<svelte:head>
	<meta property="og:url" content={ogpUrl} />
	<meta property="og:type" content={ogpType} />
	{#if ogpTitle}<meta property="og:title" content={ogpTitle} />{/if}
	{#if ogpDescription}<meta property="og:description" content={ogpDescription} />{/if}
	{#if ogpImage}<meta property="og:image" content={ogpImage} />{/if}

	{#if twiCard}<meta name="twitter:card" content={twiCard} />{/if}
	<meta property="twitter:domain" content={twiDomain} />
	<meta property="twitter:url" content={twiUrl} />
	{#if twiTitle}<meta name="twitter:title" content={twiTitle} />{/if}
	{#if twiDescription}<meta name="twitter:description" content={twiDescription} />{/if}
	{#if twiImage}<meta name="twitter:image" content={twiImage} />{/if}
</svelte:head>
