/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#f0f8f7",
					100: "#d9efec",
					200: "#b3dfd8",
					300: "#8bcfc4",
					400: "#6eb4aa", // base
					500: "#5aa299",
					600: "#4a897f",
					700: "#3b6d66",
					800: "#2d524d",
					900: "#213b38"
				},
				surface: {
					DEFAULT: "rgb(var(--surface) / <alpha-value>)",
					muted: "rgb(var(--surface-muted) / <alpha-value>)"
				},
				text: {
					DEFAULT: "rgb(var(--text) / <alpha-value>)",
					muted: "rgb(var(--text-muted) / <alpha-value>)",
					inverse: "rgb(var(--text-inverse) / <alpha-value>)"
				},
				border: "rgb(var(--border) / <alpha-value>)",
				primary: "rgb(var(--primary) / <alpha-value>)",
				accent: "rgb(var(--accent) / <alpha-value>)",
				success: "rgb(var(--success) / <alpha-value>)",
				warning: "rgb(var(--warning) / <alpha-value>)",
				danger: "rgb(var(--danger) / <alpha-value>)"
			},
			boxShadow: {
				card: "0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)"
			}
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("tailwindcss-rtl")
	],
}

