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
	console.log("Starting roundRobinAssignThread for threadId:", threadId)

	return await db.transaction(async (tx) => {
		// 1. Get thread & problem => teamId
		console.log("Fetching thread:", threadId)
		const thread = await tx.query.threads.findFirst({
			where: eq(schema.threads.id, threadId),
			columns: {
				problemId: true
			}
		})
		console.log("Fetched thread:", { threadId, problemId: thread?.problemId })

		if (!thread) {
			console.log("Thread not found:", threadId)
			throw new Error("Thread not found")
		}

		// Determine teamId (if any)
		let teamId: string | null = null
		if (thread.problemId) {
			console.log("Fetching problem for teamId:", thread.problemId)
			const problem = await tx.query.problems.findFirst({
				where: eq(schema.problems.id, thread.problemId),
				columns: {
					teamId: true
				}
			})
			teamId = problem?.teamId ?? null
			console.log("Problem teamId:", teamId)
		}

		// 2. Get available users
		console.log("Fetching users for team:", teamId ?? "global")
		const users = await tx.query.users.findMany({
			where: teamId ? eq(schema.users.teamId, teamId) : undefined,
			columns: {
				clerkId: true
			},
			orderBy: (users, { asc }) => [asc(users.createdAt)]
		})
		console.log("Fetched users:", { count: users.length })

		if (users.length === 0) {
			console.warn(
				teamId
					? `No users found for team ${teamId}`
					: "No users available for assignment"
			)
			return
		}

		// 3. Get or create round robin state
		console.log("Fetching round robin state for team:", teamId ?? "global")
		const state = await tx.query.roundRobinState.findFirst({
			where: teamId
				? eq(schema.roundRobinState.teamId, teamId)
				: isNull(schema.roundRobinState.teamId)
		})
		console.log("Current round robin state:", state)

		let nextIndex = 0
		if (!state) {
			console.log("Creating initial round robin state")
			const [newState] = await tx
				.insert(schema.roundRobinState)
				.values({
					teamId,
					nextIndex: 0
				})
				.returning()

			if (!newState) {
				console.error("Failed to create round robin state")
				throw new Error("Failed to create round robin state")
			}
			nextIndex = newState.nextIndex
			console.log("Created new round robin state:", newState)
		} else {
			nextIndex = state.nextIndex
		}

		// 4. Get the next user
		const assignedToClerkId = users[nextIndex % users.length]?.clerkId
		console.log("Selected user for assignment:", {
			nextIndex,
			totalUsers: users.length,
			assignedToClerkId
		})

		if (!assignedToClerkId) {
			console.error("Failed to get next user for assignment")
			throw new Error("Failed to get next user for assignment")
		}

		// 5. Update the thread with the assigned user
		console.log("Updating thread with assigned user:", {
			threadId,
			assignedToClerkId
		})
		await tx
			.update(schema.threads)
			.set({
				assignedToClerkId,
				assignedAt: new Date()
			})
			.where(eq(schema.threads.id, threadId))

		// 6. Increment the next index
		if (state) {
			console.log("Updating round robin state index:", nextIndex + 1)
			await tx
				.update(schema.roundRobinState)
				.set({
					nextIndex: nextIndex + 1
				})
				.where(eq(schema.roundRobinState.id, state.id))
		}

		console.log("Round robin assignment completed:", {
			threadId,
			assignedToClerkId
		})
		return assignedToClerkId
	})
}
