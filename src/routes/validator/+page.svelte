<script lang="ts">
	import UploadButton from "../../components/UploadButton.svelte";
	import CodeArea from "../../components/CodeArea.svelte";
	import Message from "../../components/Message.svelte";

	import { Icon, CodeBracketSquare } from "svelte-hero-icons";

	import { readTextFile, openFilePickerDialog } from "$lib/dom";
	import { JsonSyntaxError, ValidationError, getJsonSourceMap, validate } from "$lib/schema";

	let fileName: string;
	let json: string | undefined;
	let source: any | undefined;
	let error: Error | undefined;
	let validatePromise: Promise<void>;

	function getErrorPreviewRange(error: Error): [number, number] | null {
		let minLine: number;
		let maxLine: number;

		if (error instanceof JsonSyntaxError) {
			minLine = error.where[0];
			maxLine = minLine;
		} else if (error instanceof TypeError) {
			const typeLine = getJsonPathLine("/type", source);
			if (typeLine === null) return null;
			minLine = typeLine;
			maxLine = minLine;
		} else if (error instanceof ValidationError) {
			const lines = error.errors.map((it) => getJsonPathLine(it.instancePath, source)).filter((it) => it !== null) as [
				number,
				number
			];
			minLine = Math.min(...lines);
			maxLine = Math.max(...lines);
		}

		return [Math.max(minLine! - 3, 0), maxLine! + 1];
	}

	// Hacky way to get this around svelte-check that doesn't allow TS in templates
	// but we need this to be non-null there (in case of JSON syntax error)
	const getErrorPreviewRangeNN = (error: Error) => getErrorPreviewRange(error)!;
	const getErrorPreviewRangeU = (error: Error) => getErrorPreviewRange(error) ?? undefined;

	function getJsonPathLine(path: string, sourceMap: any): number | null {
		const ptr = sourceMap.pointers[path];
		const line = (ptr?.key ?? ptr?.value)?.line;
		if (line !== undefined) return line + 1;
		return null;
	}

	// Exists for the same reason as above.
	const getJsonPathLineN = (path: string, sourceMap: any) => getJsonPathLine(path, sourceMap)!;

	function getValidationErrorHighlightsNN(error: ValidationError): { line: number; message: string }[] {
		return error.errors
			.map((it) => [source.pointers[it.instancePath]?.value?.line, it.message])
			.filter((it) => it[0] !== undefined)
			.map((it) => ({
				line: it[0] + 1,
				message: it[1]
			}));
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
				} catch (e: any) {
					error = new JsonSyntaxError(e as SyntaxError);
					return;
				}

				// Validate against the schema
				try {
					await validate(json);
				} catch (e: any) {
					error = e;
					console.log(e, e.errors);
				}
			})();
		});
	}
</script>

<div class="w-screen h-screen">
	<div class="w-full h-full flex justify-center place-content-around place-items-center">
		<div class="flex flex-col place-content-center gap-2 w-1/2 h-2/3 p-[2%]">
			<div class="text-center mb-3">
				<h1 class="text-2xl font-medium">
					MAS Spritepack JSON validator
					<span class="bg-blue-600 align-super text-base text-white capitalize rounded-md px-1">Beta</span>
				</h1>
				<h2 class="text-xl text-gray-500">Pick a file and see if it'll work right away</h2>
			</div>
			{#if validatePromise !== undefined}
				{#key validatePromise}
					{#await validatePromise}
						<div class="flex justify-center">
							<div class="w-2/3">
								<Message title="Validating..." text="Just a moment, your JSON is being validated." type="info" />
							</div>
						</div>
					{:then _}
						{#if error === undefined && json !== undefined}
							<div class="flex justify-center">
								<div class="w-2/3">
									<Message
										title="This JSON file is valid!"
										text="MAS should not have any trouble loading it in."
										type="good"
									/>
								</div>
							</div>
						{:else if error instanceof JsonSyntaxError}
							<Message
								title="This JSON file is invalid and MAS won't even load it."
								text="There were some JSON syntax errors that you need to resolve."
								type="error"
							/>
						{:else if error instanceof TypeError}
							{#if error.message === "JSON file must end with .json"}
								<div class="flex justify-center">
									<div class="w-2/3">
										<Message
											title="This isn't a JSON file."
											text="JSON files must have a file name that ends with .json"
											type="error"
										/>
									</div>
								</div>
							{:else}
								<div class="flex justify-center">
									<div class="w-2/3">
										<Message
											title={`This JSON file has invalid "type" property.`}
											text="Validator is unable to apply a spritepack JSON schema."
											type="warning"
										/>
									</div>
								</div>
							{/if}
						{:else if error instanceof ValidationError}
							<Message
								title="This JSON file is invalid."
								text="MAS will fail to load this JSON file due to some issues."
								type="warning"
							/>
						{/if}
						{#if error !== undefined && getErrorPreviewRange(error) !== null}
							{#key error}
								<!-- I have ABSOLUTELY no idea, why exactly I had to set these heights. -->
								<!-- Apparently flex or overflow do this trickery. Works like that though. -->
								<div class="h-2/3">
									<div class="h-[82%] flex flex-col gap-4 place-content-between">
										<div>
											<h1 class="text-xl text-medium text-center -mb-1">Preview of what went wrong</h1>
											<h2 class="text-md text-gray-500 text-center -mb-2">Only relevant parts are shown</h2>
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
			<div class="flex flex-col gap-2 place-items-center">
				{#if fileName !== undefined}
					<p class="text-lg text-gray-500 text-center mb-2">
						<Icon src={CodeBracketSquare} class="w-5 inline -translate-y-[1px]"/>
						{fileName}
					</p>
				{/if}
				<div class="mb-3">
					<UploadButton on:click={onUploadClick} />
				</div>
				<p class="text-sm text-gray-500 text-center">
					Validation is done locally, right in your browser.<br />
					Your files <i>are not</i> sent anywhere.
				</p>
			</div>
		</div>
		<div class="flex flex-col place-content-center gap-4 w-1/4 h-2/3 p-[2%]">
			<div>
				<h1 class="text-2xl mb-4">Helpful links</h1>
				<ul>
					<li class="text-blue-500 font-medium mb-1">
						<a href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Adding-Sprite-Objects" target="_blank">
							📄 Official spritepacks documentation
						</a>
					</li>
					<li class="text-blue-500 font-medium mb-1">
						<a href="https://github.com/Monika-After-Story/MonikaModDev/wiki/Official-MAS-Art-PSDs-and-Guidelines" target="_blank">
							🎨 Official spritepack PSDs and templates
						</a>
					</li>
					<li class="text-blue-500 font-medium mb-1">
						<a href="https://github.com/Friends-of-Monika/mas-web-utils" target="_blank">
							🧪 MAS Web Utils Github repository
						</a>
					</li>
					<li class="text-blue-500 font-medium mb-1">
						<a href="https://github.com/Friends-of-Monika/mas-sprite-schema" target="_blank">
							🔍 MAS Spritepack JSON schema repository
						</a>
					</li>
					<li class="text-blue-500 font-medium">
						<a href="https://github.com/Friends-of-Monika/mas-web-utils/issues/new" target="_blank">
							🐛 Report an issue
						</a>
					</li>
				</ul>
			</div>
			<div>
				<h1 class="text-2xl mb-3">About this tool</h1>
				<p class="text-gray-700 mb-2">
					This validator will help you quickly (without starting up the game) check for common issues in the
					JSON file you select. Supports both split/unsplit Accessories, Clothes and Hair spritepack JSONs.
				</p>
				<p class="text-gray-700 mb-[5%]">
					<b>This is public beta.</b> While this tool has been tested thoroughly on some official spritepack
					files, it could still produce false positives/negatives &mdash; if you're absolutely sure that the
					file is valid (or invalid), don't hesitate to test it on MAS, and consider reporting an issue.
				</p>
				<p class="text-gray-500 text-center">
					Made by
					<span class="text-blue-500 font-medium">
						<a href="https://github.com/Friends-of-Monika" target="_blank">
							Friends of Monika
						</a>
					</span>
					❤️
				</p>
			</div>
		</div>
	</div>
</div>
