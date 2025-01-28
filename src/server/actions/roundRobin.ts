"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq, isNull } from "drizzle-orm"

/**
 * Assigns a thread to the next user in the round-robin sequence.
 * If the thread's problem has a team, assigns within that team.
 * Otherwise, assigns among all users.
 * Uses a transaction to ensure thread assignments are atomic and prevent race conditions.
 */
export async function roundRobinAssignThread(threadId: string) {
	return await db.transaction(async (tx) => {
		// 1. Get thread & problem => teamId
		const thread = await tx.query.threads.findFirst({
			where: eq(schema.threads.id, threadId),
			columns: {
				problemId: true
			}
		})
		if (!thread) {
			throw new Error("Thread not found")
		}

		// Determine teamId (if any)
		let teamId: string | null = null
		if (thread.problemId) {
			const problem = await tx.query.problems.findFirst({
				where: eq(schema.problems.id, thread.problemId),
				columns: {
					teamId: true
				}
			})
			teamId = problem?.teamId ?? null
		}

		// 2. Get available users (either team-specific or all users)
		const users = await tx.query.users.findMany({
			where: teamId ? eq(schema.users.teamId, teamId) : undefined,
			columns: {
				clerkId: true
			},
			orderBy: (users, { asc }) => [asc(users.createdAt)]
		})

		if (users.length === 0) {
			console.warn(
				teamId
					? `No users found for team ${teamId}`
					: "No users available for assignment"
			)
			return
		}

		// 3. Get or create round robin state (team-specific or global)
		const state = await tx.query.roundRobinState.findFirst({
			where: teamId
				? eq(schema.roundRobinState.teamId, teamId)
				: isNull(schema.roundRobinState.teamId)
		})

		let nextIndex = 0
		if (!state) {
			// Create initial state if it doesn't exist
			const [newState] = await tx
				.insert(schema.roundRobinState)
				.values({
					teamId,
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

		// 4. Get the next user
		const assignedToClerkId = users[nextIndex % users.length]?.clerkId

		if (!assignedToClerkId) {
			throw new Error("Failed to get next user for assignment")
		}

		// 5. Update the thread with the assigned user
		await tx
			.update(schema.threads)
			.set({
				assignedToClerkId,
				assignedAt: new Date()
			})
			.where(eq(schema.threads.id, threadId))

		// 6. Increment the next index
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
