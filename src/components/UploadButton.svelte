<script lang="ts">
	import { ArrowUpTray, Icon } from "svelte-hero-icons";
</script>

<button
	on:click
	class="rounded-md bg-good-bg px-5 py-3 text-good-text shadow-md shadow-gray-300 transition duration-300 active:brightness-105"
>
	<Icon src={ArrowUpTray} solid class="inline w-5 align-text-bottom" />
	Select .json file
</button>
