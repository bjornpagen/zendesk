"use server"

import { db } from "@/server/db"
import { users } from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"

export type AssignableUser = {
	clerkId: string
	name: string
	avatar: string
}

/**
 * Get all users that can be assigned to threads.
 * Currently returns all users in the system.
 */
export async function getAssignableUsers(): Promise<AssignableUser[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const allUsers = await db
		.select({
			clerkId: users.clerkId,
			name: users.name,
			avatar: users.avatar
		})
		.from(users)
		.execute()

	return allUsers
}
