/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				brand: {
					/* Align with Salama tones: deep teal primary and light teal accent */
					50: "#edf7f7",
					100: "#d6efee",
					200: "#aee0de",
					300: "#86d1ce",
					400: "#6eb4aa",    /* accent */
					500: "#4fa29a",
					600: "#2b8d88",
					700: "#1f7a76",
					800: "#156665",
					900: "#0b6d6b"     /* primary */
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

