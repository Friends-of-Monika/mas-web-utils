<script lang="ts">
	import { Icon, ChevronDoubleDown } from "svelte-hero-icons";
</script>

<div class="h-auto w-screen lg:h-screen">
	<div
		class="flex h-full w-full flex-col place-content-center place-items-center justify-center lg:flex-row lg:place-content-around lg:place-items-center"
	>
		<div class="flex h-[90vh] w-4/5 flex-col place-content-center gap-2 p-[2%] lg:h-2/3 lg:w-1/2">
			<div class="mb-3 text-center">
				<h1 class="text-2xl font-medium">
					<slot name="title" />
				</h1>
				{#if $$slots.subtitle}
					<h2 class="text-xl text-gray-500">
						<slot name="subtitle" />
					</h2>
				{/if}
			</div>
			<slot name="tool" />
		</div>
		<div class="flex h-[10vh] flex-col place-items-center gap-1 lg:hidden">
			Scroll for more
			<Icon src={ChevronDoubleDown} class="h-5 w-5" />
		</div>
		<div
			class="mb-[3vh] flex min-h-[100vh] w-4/5 flex-col place-content-center gap-[5vh] p-[2%] lg:h-2/3 lg:w-1/4 lg:gap-4"
		>
			{#if $$slots.links}
				<div>
					<h1 class="mb-4 text-2xl">Helpful links</h1>
					<ul>
						<slot name="links" />
					</ul>
				</div>
			{/if}
			<div>
				{#if $$slots.about}
					<h1 class="mb-3 text-2xl">About this tool</h1>
					<slot name="about" />
				{/if}
				<p class="mt-[3vh] text-center text-gray-500">
					Made by
					<span class="font-medium text-blue-500">
						<a href="https://github.com/Friends-of-Monika" target="_blank"> Friends of Monika </a>
					</span>
					❤️
				</p>
			</div>
		</div>
	</div>
</div>
