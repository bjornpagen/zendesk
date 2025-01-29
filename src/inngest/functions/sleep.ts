import { inngest } from "@/inngest/client"

const sleep5 = inngest.createFunction(
	{ id: "sleep-5" },
	{ event: "sleep/5" },
	async ({ event }) => {
		console.log("sleep/5", event)
		await new Promise((resolve) => setTimeout(resolve, 5000))
	}
)

export default [sleep5]
