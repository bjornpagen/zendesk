"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq } from "drizzle-orm"

/**
 * Assigns a thread to the next user in the round-robin sequence.
 * Uses a transaction to ensure thread assignments are atomic and prevent race conditions.
 */
export async function roundRobinAssignThread(threadId: string) {
	return await db.transaction(async (tx) => {
		// Get all available users
		const users = await tx.query.users.findMany({
			columns: {
				clerkId: true
			},
			orderBy: (users, { asc }) => [asc(users.createdAt)]
		})

		if (users.length === 0) {
			console.warn("No users available for assignment")
			return
		}

		// Get or create round robin state
		const state = await tx.query.roundRobinState.findFirst()
		let nextIndex = 0

		if (!state) {
			// Create initial state if it doesn't exist
			const [newState] = await tx
				.insert(schema.roundRobinState)
				.values({
					nextIndex: 0
				})
				.returning()

			if (!newState) {
				throw new Error("Failed to create round robin state")
			}
			nextIndex = newState.nextIndex
		} else {
			nextIndex = state.nextIndex
		}

		// Get the next user
		const assignedToClerkId = users[nextIndex % users.length]?.clerkId

		if (!assignedToClerkId) {
			throw new Error("Failed to get next user for assignment")
		}

		// Update the thread with the assigned user
		await tx
			.update(schema.threads)
			.set({
				assignedToClerkId,
				assignedAt: new Date()
			})
			.where(eq(schema.threads.id, threadId))

		// Increment the next index
		if (state) {
			await tx
				.update(schema.roundRobinState)
				.set({
					nextIndex: nextIndex + 1
				})
				.where(eq(schema.roundRobinState.id, state.id))
		}

		return assignedToClerkId
	})
}
