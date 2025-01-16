import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["neue-haas-grotesk-text", ...fontFamily.sans],
				display: ["neue-haas-grotesk-display", ...fontFamily.sans]
			}
		}
	},
	plugins: []
} satisfies Config
