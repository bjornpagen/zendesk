import "server-only"

import OpenAI from "openai"
import { env } from "@/env"

/**
 * Create and export a shared instance of the OpenAI client
 * using the newly added AI_API_KEY from your environment.
 */
export const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY
})
