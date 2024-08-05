<script lang="ts">
	// Main tool layout
	import ToolLayout from "../../layouts/ToolLayout.svelte";
	import SideParagraph from "../../components/SideParagraph.svelte";

	import NameInput from "../../components/NameInput.svelte";
	import Message from "../../components/Message.svelte";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let libCurses: any;
	import { onMount } from "svelte";
	import SideLink from "../../components/SideLink.svelte";

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

<ToolLayout>
	<svelte:fragment slot="title">
		MAS Name Checker
		<span class="rounded-full bg-blue-500 px-1.5 align-super text-base text-white">beta</span>
	</svelte:fragment>
	<svelte:fragment slot="subtitle">Check if a name is good, bad, awkward or okay with Monika</svelte:fragment>
	<svelte:fragment slot="tool">
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
						<Message
							title="This name is okay"
							text="Not bad, but nothing too special either. A good choice."
							type="neutral"
						/>
					{:else if matchKey === "playerGood"}
						<Message
							title="This name is good!"
							text="If you name yourself like that, Monika will like it."
							type="good"
						/>
					{:else if matchKey === "monikaGood"}
						<Message
							title="This name is good!"
							text="If you give your Monika this name, she will like it."
							type="good"
						/>
					{:else if matchKey === "awkward"}
						<Message
							title="This name is... awkward."
							text="If you try to name yourself or your Monika like that, she will not like it."
							type="warning"
						/>
					{:else if matchKey === "bad"}
						<Message
							title="This name is terrible!"
							text="If you try to name yourself or your Monika like that, she will be furious!"
							type="error"
						/>
					{/if}
				</div>
			</div>
			<div class="flex flex-col place-items-center gap-2">
				<div class="mb-3">
					<NameInput on:input={onNameInput} />
				</div>
				{#if matchRule}
					<p class="text-center">
						Matched rule: <span class="rounded-md bg-neutral-200 px-1 py-0.5 font-mono">{matchRule.toString()}</span>
					</p>
				{/if}
			</div>
		{/await}
	</svelte:fragment>
	<svelte:fragment slot="links">
		<SideLink href="https://github.com/Monika-After-Story/MonikaModDev/blob/06baf319a34c2ef585bc7c0a1e969a7eaa894b35/Monika%20After%20Story/game/script-story-events.rpy#L222-L476">
			📜 MAS Source code to classify names
		</SideLink>
		<SideLink href="https://github.com/Friends-of-Monika/mas-web-utils">
			🧪 MAS Web Utils Github repository
		</SideLink>
		<SideLink href="https://github.com/Friends-of-Monika/mas-web-utils/issues/new">
			🐛 Report an issue
		</SideLink>
	</svelte:fragment>
	<svelte:fragment slot="about">
		<SideParagraph>
			This tool will help you preview how Monika will see a name you put in without having to try your Monika's
			patience.
		</SideParagraph>
		<SideParagraph>
			<b>This is public beta.</b> While this tool has been tested, it could still produce false positives/negatives
			&mdash; if you're absolutely sure that the result is incorrect consider reporting an issue.
		</SideParagraph>
	</svelte:fragment>
</ToolLayout>
