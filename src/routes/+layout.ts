export const prerender = true;

export function load({ url }) {
	// prettier-ignore
	return { url: url.pathname };
}
