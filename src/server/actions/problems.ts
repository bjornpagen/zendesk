"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { inngest } from "@/inngest/client"

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
 * Trigger reclassification of all threads
 */
export async function reclassifyAllTickets(): Promise<void> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await inngest.send({
		name: "problems/reclassify-all",
		data: {}
	})
}
