"use server"

import {
	and,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	isNull,
	lt,
	max,
	or,
	type SQL
} from "drizzle-orm"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"

export type ThreadWithLatestMessage = {
	id: string
	subject: string
	customerName: string
	latestMessage: {
		id: string
		content: string
		createdAt: Date
	}
}

/**
 * Fetch threads from the database, optionally filtered by
 * statuses, problems, priorities, visibility (read/unread),
 * and intext (subject/messages).
 */
export async function getThreads(
	statuses: ("open" | "closed" | "spam")[] = [],
	problems: string[] = [],
	priorities: ("urgent" | "non-urgent")[] = [],
	visibility: ("read" | "unread")[] = [],
	intext = ""
): Promise<ThreadWithLatestMessage[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const { threads, customers, messages } = schema
	const conditions: SQL[] = []

	// Filter by statuses
	if (statuses.length > 0) {
		conditions.push(inArray(threads.status, statuses))
	}
	// Filter by problems => these are stored in threads.problemId
	if (problems.length > 0) {
		conditions.push(inArray(threads.problemId, problems))
	}
	// Filter by priorities
	if (priorities.length > 0) {
		conditions.push(inArray(threads.priority, priorities))
	}

	const wantsRead = visibility.includes("read")
	const wantsUnread = visibility.includes("unread")

	/**
	 * Subselect for the latest message time per thread:
	 * SELECT MAX(messages.createdAt) as "lastMessageTime"
	 * FROM messages
	 * WHERE messages.threadId = threads.id
	 */
	const lastMessageTimeSubselect = db
		.select({
			lastMessageTime: max(messages.createdAt).as("lastMessageTime")
		})
		.from(messages)
		.where(eq(messages.threadId, threads.id))
		.as("lastMessageTimeSubselect")

	// For "read" => thread.lastReadAt >= the last message creation time
	// For "unread" => thread.lastReadAt < the last message creation time OR thread.lastReadAt is null
	let lastReadAtCondition: SQL<unknown> | undefined
	if (wantsRead && !wantsUnread) {
		lastReadAtCondition = gte(
			threads.lastReadAt,
			lastMessageTimeSubselect.lastMessageTime
		)
	} else if (!wantsRead && wantsUnread) {
		lastReadAtCondition = or(
			isNull(threads.lastReadAt),
			lt(threads.lastReadAt, lastMessageTimeSubselect.lastMessageTime)
		)
	}
	if (lastReadAtCondition) {
		conditions.push(lastReadAtCondition)
	}

	// Filter by intext => look for subject or message content match.
	if (intext) {
		const term = `%${intext}%`
		const intextCondition = or(
			ilike(threads.subject, term),
			ilike(messages.content, term)
		)
		if (intextCondition) {
			conditions.push(intextCondition)
		}
	}

	// First query for distinct thread IDs that match our conditions
	const threadIdsQuery = await db
		.selectDistinct({ threadId: threads.id })
		.from(threads)
		.innerJoin(customers, eq(threads.customerId, customers.id))
		.leftJoin(messages, eq(threads.id, messages.threadId))
		.where(conditions.length > 0 ? and(...conditions) : undefined)

	const threadIds = threadIdsQuery.map((row) => row.threadId)

	/**
	 * We'll use a CTE with DISTINCT ON to select the latest non-staff message for each thread.
	 * We ORDER BY threadId first, and then descending createdAt so the first row
	 * is the newest message.
	 */
	const latestMessages = db.$with("latest_messages").as(
		db
			.selectDistinctOn([messages.threadId], {
				threadId: messages.threadId,
				messageId: messages.id,
				content: messages.content,
				createdAt: messages.createdAt
			})
			.from(messages)
			.where(
				and(
					inArray(messages.threadId, threadIds),
					// Only select non-staff messages (email or widget)
					or(eq(messages.type, "email"), eq(messages.type, "widget"))
				)
			)
			.orderBy(messages.threadId, desc(messages.createdAt))
	)

	// Now get the actual threads + their latest messages
	const queryResult = await db
		.with(latestMessages)
		.select({
			threadId: threads.id,
			subject: threads.subject,
			customerName: customers.name,
			messageId: latestMessages.messageId,
			content: latestMessages.content,
			messageCreatedAt: latestMessages.createdAt
		})
		.from(threads)
		.innerJoin(customers, eq(threads.customerId, customers.id))
		.innerJoin(latestMessages, eq(threads.id, latestMessages.threadId))
		.where(inArray(threads.id, threadIds))

	return queryResult.map((row) => ({
		id: row.threadId,
		subject: row.subject,
		customerName: row.customerName,
		latestMessage: {
			id: row.messageId,
			content: row.content,
			createdAt: row.messageCreatedAt
		}
	}))
}
