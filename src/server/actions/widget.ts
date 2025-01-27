"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq, asc, desc } from "drizzle-orm"
import { autoTagProblemForThread } from "./problemClassifier"

/**
 * Get the oldest customer ID for widget-based messaging.
 */
async function getOldestCustomerId() {
	const customer = await db.query.customers.findFirst({
		orderBy: [asc(schema.customers.createdAt)],
		columns: {
			id: true
		}
	})

	if (!customer) {
		throw new Error("No customers found in the database")
	}

	return customer.id
}

/**
 * Get a specific widget thread by ID.
 */
export async function getWidgetThread(threadId: string) {
	const thread = await db.query.threads.findFirst({
		where: eq(schema.threads.id, threadId),
		with: {
			messages: {
				orderBy: [desc(schema.messages.createdAt)],
				columns: {
					id: true,
					content: true,
					createdAt: true,
					type: true
				}
			},
			customer: {
				columns: {
					name: true
				}
			}
		},
		columns: {
			id: true,
			subject: true,
			createdAt: true,
			updatedAt: true
		}
	})

	if (!thread) {
		throw new Error("Thread not found")
	}

	return thread
}

/**
 * Send a new message of type "widget" from the customer side.
 */
export async function sendWidgetMessage(content: string, threadId: string) {
	const customerId = await getOldestCustomerId()
	const thread = await getWidgetThread(threadId)
	if (!thread) {
		throw new Error("Thread not found")
	}

	// Insert the message
	const [newMessage] = await db
		.insert(schema.messages)
		.values({
			type: "widget",
			content,
			threadId: thread.id,
			customerId
		})
		.returning({
			id: schema.messages.id,
			content: schema.messages.content,
			createdAt: schema.messages.createdAt,
			type: schema.messages.type
		})

	// Update lastReadAt on the thread
	await db
		.update(schema.threads)
		.set({ lastReadAt: new Date() })
		.where(eq(schema.threads.id, thread.id))

	// Classify the problem
	await autoTagProblemForThread(thread.id)

	return newMessage
}

/**
 * Get all widget threads for the customer, ordered by most recent activity.
 */
export async function getWidgetThreads() {
	const customerId = await getOldestCustomerId()
	const threads = await db.query.threads.findMany({
		where: eq(schema.threads.customerId, customerId),
		with: {
			messages: {
				orderBy: [desc(schema.messages.createdAt)],
				columns: {
					id: true,
					content: true,
					createdAt: true,
					type: true
				}
			},
			customer: {
				columns: {
					name: true
				}
			}
		},
		columns: {
			id: true,
			subject: true,
			createdAt: true,
			updatedAt: true
		},
		orderBy: [desc(schema.threads.updatedAt)]
	})

	return threads
}

/**
 * Create a new widget thread
 */
export async function createWidgetThread() {
	const customerId = await getOldestCustomerId()
	const insertedThreads = await db
		.insert(schema.threads)
		.values({
			customerId,
			subject: "Widget Support Request",
			status: "open",
			priority: "non-urgent"
		})
		.returning({
			id: schema.threads.id
		})

	const newThread = insertedThreads[0]
	if (!newThread) {
		throw new Error("Failed to create new thread")
	}

	// Refetch with relations
	const thread = await db.query.threads.findFirst({
		where: eq(schema.threads.id, newThread.id),
		with: {
			messages: {
				orderBy: [desc(schema.messages.createdAt)],
				columns: {
					id: true,
					content: true,
					createdAt: true,
					type: true
				}
			},
			customer: {
				columns: {
					name: true
				}
			}
		},
		columns: {
			id: true,
			subject: true,
			createdAt: true,
			updatedAt: true
		}
	})

	return thread
}
