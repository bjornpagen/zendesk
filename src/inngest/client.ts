import { EventSchemas, type GetEvents, Inngest } from "inngest"
import { z } from "zod"
import { env } from "@/env"

const events = {
	"problems/autotag": {
		data: z.object({
			threadId: z.string()
		})
	},
	"problems/reclassify-all": {
		data: z.object({})
	},
	"problems/find-matching": {
		data: z.object({
			threadId: z.string()
		})
	},
	"problems/create-new": {
		data: z.object({
			threadId: z.string()
		})
	}
}

export const inngest = new Inngest({
	id: env.INNGEST_APP_NAME,
	schemas: new EventSchemas().fromZod(events)
})

export type Events = GetEvents<typeof inngest>
