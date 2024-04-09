<script lang="ts">
	import { ChevronDoubleDown, Icon } from "svelte-hero-icons";
	import NameInput from "../../components/NameInput.svelte";
	import Message from "../../components/Message.svelte";

	let libCurses: any;
	import { onMount } from "svelte";

	let regexps: Record<string, RegExp[]>;
	let loadingPromise: Promise<Record<string, RegExp[]>>;

	let name: string;
	let matchKey: string;
	let matchRule: RegExp;

	onMount(async () => {
		libCurses = await import("$lib/curses");
		loadingPromise = libCurses.getNameRegexps();
		regexps = await loadingPromise;
	});

	function onNameInput(e: Event) {
		name = (e.target as HTMLInputElement).value;
		const match = libCurses.checkName(name, regexps);
		[matchKey, matchRule] = match ?? [null, null];
	}
</script>

<div class="h-auto w-screen lg:h-screen">
	<div
		class="flex h-full w-full flex-col place-content-center place-items-center justify-center lg:flex-row lg:place-content-around lg:place-items-center"
	>
		<div class="flex h-[90vh] w-4/5 flex-col place-content-center gap-2 p-[2%] lg:h-2/3 lg:w-1/2">
			<div class="mb-3 text-center">
				<h1 class="text-2xl font-medium">
					MAS Name Checker
					<span class="rounded-full bg-blue-500 px-1.5 align-super text-base text-white">beta</span>
				</h1>
				<h2 class="text-xl text-gray-500">Check if a name is good, bad, awkward or okay with Monika</h2>
			</div>
			{#await loadingPromise}
				<div class="flex justify-center">
					<div class="w-full lg:w-2/3">
						<Message title="Loading" text="Please wait while the tool loads..." type="neutral" />
					</div>
				</div>
			{:then}
				<div class="flex justify-center">
					<div class="w-full lg:w-2/3">
						{#if matchKey === undefined || name?.length === 0}
							<Message title="Enter your name" text="To check a name, type it in the box below." type="neutral" />
						{:else if !matchKey}
							<Message title="This name is okay" text="Not bad, but nothing too special either. A good choice." type="neutral" />
						{:else if matchKey === "playerGood"}
							<Message title="This name is good!" text="If you name yourself like that, Monika will like it." type="good" />
						{:else if matchKey === "monikaGood"}
							<Message title="This name is good!" text="If you give your Monika this name, she will like it." type="good" />
						{:else if matchKey === "awkward"}
							<Message title="This name is... awkward." text="If you try to name yourself or your Monika like that, she will not like it." type="warning" />
						{:else if matchKey === "bad"}
							<Message title="This name is terrible!" text="If you try to name yourself or your Monika like that, she will be furious!" type="error" />
						{/if}
					</div>
				</div>
				<div class="flex flex-col place-items-center gap-2">
					<div class="mb-3">
						<NameInput on:input={onNameInput}/>
					</div>
					{#if matchRule}
						<p class="text-center">Matched rule: <span class="font-mono bg-neutral-200 rounded-md py-0.5 px-1">{matchRule.toString()}</span></p>
					{/if}
				</div>
			{/await}
		</div>
		<div class="flex h-[10vh] flex-col place-items-center gap-1 lg:hidden">
			Scroll for more
			<Icon src={ChevronDoubleDown} class="h-5 w-5" />
		</div>
		<div
			class="mb-[3vh] flex min-h-[100vh] w-4/5 flex-col place-content-center gap-[5vh] p-[2%] lg:h-2/3 lg:w-1/4 lg:gap-4"
		>
			<div>
				<h1 class="mb-4 text-2xl">Helpful links</h1>
				<ul>
					<li class="mb-1 font-medium text-blue-500">
						<a href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Adding-Sprite-Objects" target="_blank">
							📄 Official spritepacks documentation
						</a>
					</li>
					<li class="mb-1 font-medium text-blue-500">
						<a
							href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Official-MAS-Art-PSDs-and-Guidelines"
							target="_blank"
						>
							🎨 Official spritepack PSDs and templates
						</a>
					</li>
					<li class="mb-1 font-medium text-blue-500">
						<a href="https://github.com/Friends-of-Monika/mas-web-utils" target="_blank">
							🧪 MAS Web Utils Github repository
						</a>
					</li>
					<li class="mb-1 font-medium text-blue-500">
						<a href="https://github.com/Friends-of-Monika/mas-sprite-schema" target="_blank">
							🔍 MAS Spritepack JSON schema repository
						</a>
					</li>
					<li class="font-medium text-blue-500">
						<a href="https://github.com/Friends-of-Monika/mas-web-utils/issues/new" target="_blank">
							🐛 Report an issue
						</a>
					</li>
				</ul>
			</div>
			<div>
				<h1 class="mb-3 text-2xl">About this tool</h1>
				<p class="mb-2 text-gray-700">
					This validator will help you quickly (without starting up the game) check for common issues in the JSON file
					you select. Supports both split/unsplit Accessories, Clothes and Hair spritepack JSONs.
				</p>
				<p class="mb-[3vh] text-gray-700">
					<b>This is public beta.</b> While this tool has been tested thoroughly on some official spritepack files, it could
					still produce false positives/negatives &mdash; if you're absolutely sure that the file is valid (or invalid),
					don't hesitate to test it on MAS, and consider reporting an issue.
				</p>
				<p class="text-center text-gray-500">
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
