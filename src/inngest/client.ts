import { EventSchemas, type GetEvents, Inngest } from "inngest"
import { z } from "zod"
import { env } from "@/env"

const events = {
	"sleep/5": {
		data: z.object({})
	}
}

export const inngest = new Inngest({
	id: env.INNGEST_APP_NAME,
	schemas: new EventSchemas().fromZod(events)
})

export type Events = GetEvents<typeof inngest>
