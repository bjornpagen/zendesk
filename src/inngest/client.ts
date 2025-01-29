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
	"problems/classify-thread": {
		data: z.object({
			threadId: z.string(),
			currentProblemId: z.string().nullable()
		})
	}
}

export const inngest = new Inngest({
	id: env.INNGEST_APP_NAME,
	schemas: new EventSchemas().fromZod(events)
})

export type Events = GetEvents<typeof inngest>
