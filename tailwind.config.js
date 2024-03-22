/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,ts,svelte}"],
	theme: {
		extend: {
			colors: {
				good: {
					bg: "#4caf50",
					text: "#ffffff"
				},
				info: {
					bg: "#03a9f4",
					text: "#ffffff"
				},
				warning: {
					bg: "#ffeb3b",
					text: "#212121"
				},
				error: {
					bg: "#f44336",
					text: "#ffffff"
				}
			}
		}
	}
};
