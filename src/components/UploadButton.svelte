<script lang="ts">
	import { ArrowUpTray, Icon } from "svelte-hero-icons";
</script>

<button
	on:click
	class="py-3 px-5 bg-good-bg text-good-text rounded-md shadow-md shadow-gray-300 transition duration-300 active:brightness-105"
>
	<Icon src={ArrowUpTray} solid class="w-5 inline align-text-bottom" />
	Select .json file
</button>
