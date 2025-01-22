/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js"

/** @type {import("next").NextConfig} */
const config = {
	images: {
		domains: ["picsum.photos", "s3.us-east-2.amazonaws.com"]
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "5mb"
		}
	}
}

export default config
