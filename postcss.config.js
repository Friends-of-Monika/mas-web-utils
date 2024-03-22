import postcssPrefixSelectorConfig from "./utils/prefix-highlight.js";

export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		"postcss-prefix-selector": postcssPrefixSelectorConfig
	}
};
