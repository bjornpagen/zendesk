import "server-only"

import { clerkClient } from "@clerk/nextjs/server"

/**
 * Create and export a shared instance of the Clerk client.
 * This helps centralize Clerk usage and makes it easier to mock in tests.
 */
export const clerk = await clerkClient()
