const themeTypeRe = /src\/highlight\/(light|dark)\.css$/;
export default {
	includeFiles: [themeTypeRe],
	transform: function (prefix, selector, prefixedSelector, filePath) {
		const themeType = themeTypeRe.exec(filePath)?.[1];
		return `.hljs-theme-${themeType} ${selector}`;
	}
};
