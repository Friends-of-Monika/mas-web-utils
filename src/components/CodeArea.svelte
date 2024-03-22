<script lang="ts">
	// Import HighlightJS + Line Numbers plugin
	import hljs from "highlight.js/lib/core";
	import json from "highlight.js/lib/languages/json";
	import initLineNumbers from "../highlight/highlight-line-numbers.js";
	hljs.registerLanguage("json", json);

	// Load HighlightJS styles
	import "../highlight/dark.css";
	import "../highlight/light.css";
	import "../highlight/style.css";

	// Svelte functions & transitions
	import { onMount, tick } from "svelte";

	// Icons
	import { Icon, ExclamationCircle } from "svelte-hero-icons";
	import { error } from "@sveltejs/kit";

	// Parameters
	export let code: string = "";
	export let range: [number, number] = [0, Infinity];
	type ErrorHighlight = { line: number; message: string };
	export let errors: ErrorHighlight[] = [];

	// Bind <pre><code>... to this
	let codeArea: HTMLElement;
	let codeLines: string;

	// Capitalize string for error messages
	function capitalize(s: string): string {
		if (s.length <= 2) return s.toUpperCase();
		return `${s[0].toUpperCase()}${s.substring(1)}`;
	}

	// Change code area theme based on preference
	let mediaQuery: MediaQueryList;
	let themeClass: string;
	onMount(async () => {
		// Update on change
		mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const setDark = (dark: boolean) => (themeClass = dark ? "hljs-theme-dark" : "hljs-theme-light");
		mediaQuery.addEventListener("change", (e: MediaQueryListEvent) => setDark(e.matches));
		setDark(mediaQuery.matches);

		// Only get necessary lines
		codeLines = code
			.split("\n")
			.filter((_, idx) => idx >= range[0] && idx <= range[1])
			.join("\n");

		// Highlight after 1 tick
		await tick();

		// Reload on mount
		// @ts-ignore
		initLineNumbers(hljs, window, document);
		hljs.highlightElement(codeArea);
		// @ts-ignore
		await hljs.lineNumbersBlock(codeArea, { startFrom: range[0] + 1 });
		codeArea.children[0].classList.add("w-full");

		// Add error highlights
		for (const { line, message } of errors) {
			const lineIdx = line - 1 - range[0];
			const tr = codeArea.children[0].children[0].children[lineIdx];
			if (!tr) continue;

			const span = document.createElement("span");
			[...tr.children[1].childNodes].forEach(span.appendChild.bind(span));
			tr.children[1].appendChild(span);

			const hint = document.createElement("span");
			new Icon({ target: hint, props: { src: ExclamationCircle, class: "w-5 inline -translate-y-[1px]" } });
			hint.appendChild(document.createTextNode(` ${capitalize(message)}.`));
			hint.classList.add("text-red-500", "ml-4");
			tr.children[1].appendChild(hint);
		}
	});
</script>

<!-- This is formatted like this INTENTIONALLY. Do not edit. -->
<div class={`${themeClass} w-full h-full`}>
	<pre class="w-full h-full overflow-visible">
		<code bind:this={codeArea} class="rounded-md language-json w-full max-h-full overflow-auto">{codeLines}</code>
	</pre>
</div>
