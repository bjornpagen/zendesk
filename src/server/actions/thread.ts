"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { asc, eq } from "drizzle-orm"

export async function getThread(threadId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const thread = await db.query.threads.findFirst({
		where: eq(schema.threads.id, threadId),
		columns: {
			id: true,
			subject: true,
			status: true,
			priority: true
		},
		with: {
			customer: {
				columns: {
					name: true
				}
			},
			problem: {
				columns: {
					title: true
				}
			},
			messages: {
				orderBy: [asc(schema.messages.createdAt)],
				columns: {
					id: true,
					content: true,
					createdAt: true,
					type: true,
					userClerkId: true
				},
				with: {
					user: {
						columns: {
							name: true,
							avatar: true
						}
					}
				}
			}
		}
	})
	if (!thread) {
		throw new Error("Thread not found")
	}

	return thread
}

/**
 * Send a new message in a thread from a staff member
 */
export async function sendMessage(threadId: string, content: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Verify the thread exists and the user has access
	const thread = await db.query.threads.findFirst({
		where: eq(schema.threads.id, threadId),
		columns: {
			id: true
		}
	})
	if (!thread) {
		throw new Error("Thread not found")
	}

	// Create the message
	const message = await db
		.insert(schema.messages)
		.values({
			type: "staff",
			content,
			threadId,
			userClerkId: clerkId
		})
		.returning({
			id: schema.messages.id,
			content: schema.messages.content,
			createdAt: schema.messages.createdAt,
			type: schema.messages.type,
			userClerkId: schema.messages.userClerkId
		})
		.then(([message]) => message)

	// Update the thread's lastReadAt timestamp
	await db
		.update(schema.threads)
		.set({ lastReadAt: new Date() })
		.where(eq(schema.threads.id, threadId))

	return message
}
