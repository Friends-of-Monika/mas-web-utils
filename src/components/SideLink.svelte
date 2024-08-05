<script lang="ts">
	export let href: string;
</script>

<li class="mt-1 font-medium text-blue-500 first:mt-0">
	<a {href} target="_blank">
		<slot />
	</a>
</li>
