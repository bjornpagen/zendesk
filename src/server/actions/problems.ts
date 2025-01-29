"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { matchThreadsToExistingProblems } from "./problemClassifier"
import { eq } from "drizzle-orm"

export type Problem = {
	id: string
	title: string
	description: string
}

/**
 * Fetch all problems from the database
 */
export async function getProblems(): Promise<Problem[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const problems = await db
		.select({
			id: schema.problems.id,
			title: schema.problems.title,
			description: schema.problems.description
		})
		.from(schema.problems)
		.orderBy(schema.problems.title)

	return problems
}

/**
 * Reclassify all threads into existing problem categories.
 * This will not create new categories, only match threads to existing ones.
 */
export async function reclassifyAllTickets(): Promise<{
	processed: number
	failed: number
	skipped: number
}> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const threads = await db
		.select({
			id: schema.threads.id,
			problemId: schema.threads.problemId
		})
		.from(schema.threads)

	const stats = { processed: 0, failed: 0, skipped: 0 }

	try {
		const threadIds = threads.map((t) => t.id)
		const results = await matchThreadsToExistingProblems(threadIds)

		// Batch update threads with their new problemIds
		for (const thread of threads) {
			const newProblemId = results.get(thread.id)

			if (!newProblemId) {
				if (thread.problemId) {
					await db
						.update(schema.threads)
						.set({ problemId: null })
						.where(eq(schema.threads.id, thread.id))
				}
				stats.skipped++
				continue
			}

			if (newProblemId !== thread.problemId) {
				await db
					.update(schema.threads)
					.set({ problemId: newProblemId })
					.where(eq(schema.threads.id, thread.id))
			}
			stats.processed++
		}
	} catch (error) {
		console.error("Error during batch classification:", error)
		stats.failed = threads.length
	}

	return stats
}
