"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { matchThreadToExistingProblem } from "./problemClassifier"
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
	console.log("Starting reclassifyAllTickets")
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		console.log("Unauthorized attempt to reclassify tickets")
		throw new Error("Unauthorized")
	}

	// Get all threads
	const threads = await db
		.select({
			id: schema.threads.id,
			problemId: schema.threads.problemId
		})
		.from(schema.threads)
	console.log(`Found ${threads.length} threads to process`)

	const results = await Promise.allSettled(
		threads.map(async (thread) => {
			try {
				console.log(`Processing thread ${thread.id}`)
				const newProblemId = await matchThreadToExistingProblem(thread.id)

				if (newProblemId === null) {
					console.log(`No matching category found for thread ${thread.id}`)
					if (thread.problemId) {
						console.log(`Removing existing category from thread ${thread.id}`)
						await db
							.update(schema.threads)
							.set({ problemId: null })
							.where(eq(schema.threads.id, thread.id))
					}
					return { status: "skipped" as const }
				}

				if (newProblemId === thread.problemId) {
					console.log(`Thread ${thread.id} category unchanged: ${newProblemId}`)
					return { status: "fulfilled" as const }
				}

				console.log(`Updating thread ${thread.id} category to ${newProblemId}`)
				await db
					.update(schema.threads)
					.set({ problemId: newProblemId })
					.where(eq(schema.threads.id, thread.id))
				return { status: "fulfilled" as const }
			} catch (error) {
				console.error(`Error processing thread ${thread.id}:`, error)
				throw error
			}
		})
	)

	const stats = results.reduce(
		(acc, result) => {
			if (result.status === "fulfilled") {
				if (result.value.status === "fulfilled") {
					acc.processed++
				} else {
					acc.skipped++
				}
			} else {
				console.error("Thread processing failed:", result.reason)
				acc.failed++
			}
			return acc
		},
		{ processed: 0, failed: 0, skipped: 0 }
	)

	console.log("Reclassification complete:", stats)
	return stats
}
