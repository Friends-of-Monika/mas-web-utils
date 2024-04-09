<script lang="ts">
	import { Icon, InformationCircle, ExclamationTriangle, ExclamationCircle, CheckCircle, QuestionMarkCircle } from "svelte-hero-icons";

	export let title: string = "";
	export let text: string = "";
	export let type: keyof typeof theme = "info";

	const theme = {
		info: ["bg-info-bg", "text-info-text", InformationCircle],
		warning: ["bg-warning-bg", "text-warning-text", ExclamationTriangle, "translate-y-[2px]"],
		error: ["bg-error-bg", "text-error-text", ExclamationCircle],
		good: ["bg-good-bg", "text-good-text", CheckCircle],
		neutral: ["bg-neutral-400", "text-white", QuestionMarkCircle]
	};
</script>

<div class="{theme[type][0]} {theme[type][1]} mb-4 rounded-md p-2 shadow-md shadow-gray-300">
	<div class="flex flex-row">
		<div class="flex w-12 place-content-center">
			<Icon src={theme[type][2]} solid class="w-10 {theme[type][3] ?? ''}" />
		</div>
		<div class="ml-2 flex-col">
			<h1 class="text-lg font-medium">{title}</h1>
			<p class="text-base">{text}</p>
		</div>
	</div>
</div>
