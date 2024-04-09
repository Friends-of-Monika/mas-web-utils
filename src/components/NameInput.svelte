<script lang="ts">
	export let placeholder: string = "Enter your name";
	export let maxlength: number = 20;
</script>

<input
	on:input
	type="text"
	{placeholder}
	{maxlength}
	autocapitalize="words"
	class="rounded-md border-2 border-neutral-300 p-3 text-2xl italic"
/>
