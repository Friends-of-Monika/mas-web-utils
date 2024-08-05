<script lang="ts">
	// Main layout for a tool page
	import ToolLayout from "../../layouts/ToolLayout.svelte";
	import SideLink from "../../components/SideLink.svelte";
	import SideParagraph from "../../components/SideParagraph.svelte";

	import UploadButton from "../../components/UploadButton.svelte";
	import CodeArea from "../../components/CodeArea.svelte";
	import Message from "../../components/Message.svelte";
	import BetaTag from "../../components/BetaTag.svelte";

	import { Icon, CodeBracketSquare } from "svelte-hero-icons";

	import { readTextFile, openFilePickerDialog } from "$lib/dom";
	import { JsonSyntaxError, ValidationError, getJsonSourceMap, validate } from "$lib/schema";

	let fileName: string;
	let json: string | undefined;
	let source: object | undefined;
	let error: Error | undefined;
	let validatePromise: Promise<void>;

	function getErrorPreviewRange(error: Error): [number, number] | null {
		let minLine: number;
		let maxLine: number;

		if (error instanceof JsonSyntaxError) {
			minLine = error.where[0];
			maxLine = minLine;
		} else if (error instanceof TypeError) {
			if (source === undefined) return null;
			const typeLine = getJsonPathLine("/type", source!);
			if (typeLine === null) return null;
			minLine = typeLine;
			maxLine = minLine;
		} else if (error instanceof ValidationError) {
			// prettier-ignore
			const lines = error.errors
				.map((it) => getJsonPathLine(it.instancePath, source!))
				.filter((it) => it !== null) as [number, number];
			minLine = Math.min(...lines);
			maxLine = Math.max(...lines);
		}

		return [Math.max(minLine! - 3, 0), maxLine! + 1];
	}

	// Hacky way to get this around svelte-check that doesn't allow TS in templates
	// but we need this to be non-null there (in case of JSON syntax error)
	const getErrorPreviewRangeNN = (error: Error) => getErrorPreviewRange(error)!;
	const getErrorPreviewRangeU = (error: Error) => getErrorPreviewRange(error) ?? undefined;

	function getJsonPathLine(path: string, sourceMap: object): number | null {
		// @ts-expect-error json-source-map output is untyped
		const ptr = sourceMap.pointers[path];
		const line = (ptr?.key ?? ptr?.value)?.line;
		if (line !== undefined) return line + 1;
		return null;
	}

	// Exists for the same reason as above.
	const getJsonPathLineN = (path: string, sourceMap: object | undefined) => getJsonPathLine(path, sourceMap!)!;

	function getValidationErrorHighlightsNN(error: ValidationError): { line: number; message: string }[] {
		return (
			error.errors
				// @ts-expect-error because this still stems from untyped JS
				.map((it) => [source?.pointers[it.instancePath]?.value?.line, it.message])
				.filter((it) => it[0] !== undefined)
				.map((it) => ({
					line: it[0] + 1,
					message: it[1]
				}))
		);
	}

	function onUploadClick() {
		openFilePickerDialog("application/json", (file: File) => {
			validatePromise = (async () => {
				// Reset errors
				json = undefined;
				source = undefined;
				error = undefined;

				// Store file name
				fileName = file.name;
				if (!file.name.endsWith(".json")) {
					error = new TypeError("JSON file must end with .json");
					return;
				}

				// Read and parse JSON
				json = await readTextFile(file);
				try {
					JSON.parse(json);
					source = getJsonSourceMap(json);
				} catch (e: unknown) {
					error = new JsonSyntaxError(e as SyntaxError);
					return;
				}

				// Validate against the schema
				try {
					await validate(json);
				} catch (e: unknown) {
					error = e as Error;
				}
			})();
		});
	}
</script>

<ToolLayout>
	<svelte:fragment slot="title">
		MAS Spritepack JSON validator <BetaTag />
	</svelte:fragment>
	<svelte:fragment slot="subtitle">Pick a file and see if it'll work right away</svelte:fragment>
	<svelte:fragment slot="tool">
		{#if validatePromise !== undefined}
			{#key validatePromise}
				{#await validatePromise}
					<div class="flex justify-center">
						<div class="w-full lg:w-2/3">
							<Message title="Validating..." text="Just a moment, your JSON is being validated." type="info" />
						</div>
					</div>
				{:then}
					{#if error === undefined && json !== undefined}
						<div class="flex justify-center">
							<div class="w-full lg:w-2/3">
								<Message
									title="This JSON file is valid!"
									text="MAS should not have any trouble loading it in."
									type="good"
								/>
							</div>
						</div>
					{:else if error instanceof JsonSyntaxError}
						<div class="flex justify-center">
							<div class="w-full lg:w-2/3">
								<Message
									title="This JSON file is invalid and MAS won't even load it."
									text="There were some JSON syntax errors that you need to resolve."
									type="error"
								/>
							</div>
						</div>
					{:else if error instanceof TypeError}
						{#if error.message === "JSON file must end with .json"}
							<div class="flex justify-center">
								<div class="w-full lg:w-2/3">
									<Message
										title="This isn't a JSON file."
										text="JSON files must have a file name that ends with .json"
										type="error"
									/>
								</div>
							</div>
						{:else}
							<div class="flex justify-center">
								<div class="w-full lg:w-2/3">
									<!-- prettier-ignore -->
									<Message
									title='This JSON file has invalid "type" property.'
									text="Validator is unable to apply a spritepack JSON schema."
									type="warning"
								/>
								</div>
							</div>
						{/if}
					{:else if error instanceof ValidationError}
						<div class="flex justify-center">
							<div class="w-full lg:w-2/3">
								<Message
									title="This JSON file is invalid."
									text="MAS will fail to load this JSON file due to some issues."
									type="warning"
								/>
							</div>
						</div>
					{/if}
					{#if error !== undefined && getErrorPreviewRange(error) !== null}
						{#key error}
							<!-- I have ABSOLUTELY no idea, why exactly I had to set these heights. -->
							<!-- Apparently flex or overflow do this trickery. Works like that though. -->
							<div class="h-1/3 lg:h-2/3">
								<div class="flex h-[82%] flex-col place-content-between gap-4">
									<div>
										<h1 class="text-medium -mb-1 text-center text-xl">Preview of what went wrong</h1>
										<h2 class="text-md -mb-2 text-center text-gray-500">Only relevant parts are shown</h2>
									</div>
									<div class="h-4/5">
										{#if error instanceof JsonSyntaxError}
											<CodeArea
												code={json}
												errors={[{ line: error.where[0], message: error.what }]}
												range={getErrorPreviewRangeNN(error)}
											/>
										{:else if error instanceof TypeError}
											<CodeArea
												code={json}
												errors={[{ line: getJsonPathLineN("/type", source), message: error.message }]}
												range={getErrorPreviewRangeU(error)}
											/>
										{:else if error instanceof ValidationError}
											<CodeArea
												code={json}
												errors={getValidationErrorHighlightsNN(error)}
												range={getErrorPreviewRangeNN(error)}
											/>
										{/if}
									</div>
								</div>
							</div>
						{/key}
					{/if}
				{/await}
			{/key}
		{/if}
		<div class="flex flex-col place-items-center gap-2">
			{#if fileName !== undefined}
				<div class="mb-2 flex w-full place-content-center text-lg text-gray-500">
					<Icon src={CodeBracketSquare} class="mr-0.5 inline w-5 align-bottom" />
					<span class="max-w-[80%] truncate" dir="rtl">{fileName}</span>
				</div>
			{/if}
			<div class="mb-3">
				<UploadButton on:click={onUploadClick} />
			</div>
			<div class="text-center text-sm text-gray-500">
				Validation is done locally, right in your browser.<br />
				Your files <i>are not</i> sent anywhere.
			</div>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="links">
		<SideLink href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Adding-Sprite-Objects">
			📄 Official spritepacks documentation
		</SideLink>
		<SideLink href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Official-MAS-Art-PSDs-and-Guidelines">
			🎨 Official spritepack PSDs and templates
		</SideLink>
		<SideLink href="https://github.com/Friends-of-Monika/mas-web-utils">🧪 MAS Web Utils Github repository</SideLink>
		<SideLink href="https://github.com/Friends-of-Monika/mas-sprite-schema">
			🔍 MAS Spritepack JSON schema repository
		</SideLink>
		<SideLink href="https://github.com/Friends-of-Monika/mas-web-utils/issues/new">🐛 Report an issue</SideLink>
	</svelte:fragment>
	<svelte:fragment slot="about">
		<SideParagraph>
			This validator will help you quickly (without starting up the game) check for common issues in the JSON file you
			select. Supports both split/unsplit Accessories, Clothes and Hair spritepack JSONs.
		</SideParagraph>
		<SideParagraph>
			<b>This is public beta.</b> While this tool has been tested thoroughly on some official spritepack files, it could
			still produce false positives/negatives &mdash; if you're absolutely sure that the file is valid (or invalid), don't
			hesitate to test it on MAS, and consider reporting an issue.
		</SideParagraph>
	</svelte:fragment>
</ToolLayout>
