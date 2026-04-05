/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				info: {
					DEFAULT: "rgb(var(--border-info) / <alpha-value>)",
					muted: "rgb(var(--surface-info) / <alpha-value>)",
					fg: "rgb(var(--text-info) / <alpha-value>)",
				},
				tint: {
					success: {
						bg: "rgb(var(--tint-success-bg) / <alpha-value>)",
						fg: "rgb(var(--tint-success-fg) / <alpha-value>)",
					},
					warning: {
						bg: "rgb(var(--tint-warning-bg) / <alpha-value>)",
						fg: "rgb(var(--tint-warning-fg) / <alpha-value>)",
					},
					accent: {
						bg: "rgb(var(--tint-accent-bg) / <alpha-value>)",
						fg: "rgb(var(--tint-accent-fg) / <alpha-value>)",
					},
					neutral: {
						bg: "rgb(var(--tint-neutral-bg) / <alpha-value>)",
						fg: "rgb(var(--tint-neutral-fg) / <alpha-value>)",
					},
					danger: {
						bg: "rgb(var(--tint-danger-bg) / <alpha-value>)",
						fg: "rgb(var(--tint-danger-fg) / <alpha-value>)",
					},
				},
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
			},
			borderRadius: {
				card: "var(--radius-card)",
				table: "var(--radius-table)",
				input: "var(--radius-input)",
			}
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("tailwindcss-rtl")
	],
}

