<script lang="ts">
    import { page } from "$app/stores";

    export let title: string = $page.data.meta?.title ?? $page.data.ogp?.title;
    export let description: string = $page.data.meta?.description ?? $page.data.ogp?.description;
    export let keywords: string[] = $page.data.meta?.keywords ?? [];
</script>

<svelte:head>
    {#if title}
        <title>{title} &bull; MAS Web Utils</title>
    {:else}
        <title>MAS Web Utils</title>
    {/if}

    {#if description}<meta name="description" content={description} />{/if}
    {#if keywords?.length}<meta name="keywords" content={keywords.join(", ")} />{/if}
</svelte:head>