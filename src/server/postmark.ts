import "server-only"

import { ServerClient } from "postmark"
import { env } from "@/env"

/**
 * Create and export a shared instance of the Postmark client
 * using the POSTMARK_API_KEY from environment variables.
 */
export const postmark = new ServerClient(env.POSTMARK_API_KEY)
