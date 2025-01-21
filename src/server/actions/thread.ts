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
