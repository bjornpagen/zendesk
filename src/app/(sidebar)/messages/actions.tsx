"use server"

import {
	and,
	eq,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	lt,
	max,
	or,
	type sql,
	type SQL,
	desc
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
		body: string
		createdAt: Date
	}
}

/**
 * Ensures userThread entries exist for the given user and thread IDs.
 * Creates any missing entries with default lastReadAt timestamps.
 */
async function ensureUserThreads(clerkId: string, threadIds: string[]) {
	const { userThreads } = schema

	// Find existing userThread rows for this user
	const existingRows = await db
		.select()
		.from(userThreads)
		.where(
			and(
				eq(userThreads.userClerkId, clerkId),
				inArray(userThreads.threadId, threadIds)
			)
		)

	// Get set of thread IDs that already have userThread entries
	const existingThreadIds = new Set(existingRows.map((row) => row.threadId))

	// Find thread IDs that need new userThread entries
	const missingIds = threadIds.filter((id) => !existingThreadIds.has(id))

	// Create missing userThread entries
	if (missingIds.length > 0) {
		await db.insert(userThreads).values(
			missingIds.map((id) => ({
				userClerkId: clerkId,
				threadId: id
			}))
		)
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

	const { threads, customers, messages, userThreads } = schema
	const conditions: Array<ReturnType<typeof sql>> = []

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
	// Add condition to filter userThreads by current user
	conditions.push(eq(userThreads.userClerkId, clerkId))

	const wantsRead = visibility.includes("read")
	const wantsUnread = visibility.includes("unread")

	/**
	 * Subselect for the latest message time per thread:
	 * SELECT MAX(messages.createdAt)
	 * FROM messages
	 * WHERE messages.threadId = threads.id
	 */
	const lastMessageTimeSubselect = db
		.select({
			lastMessageTime: max(messages.createdAt)
		})
		.from(messages)
		.where(eq(messages.threadId, threads.id))
		.as("lastMessageTimeSubselect")

	let readCondition: SQL<unknown> | undefined
	let unreadCondition: SQL<unknown> | undefined
	if (wantsRead) {
		readCondition = and(
			isNotNull(userThreads.threadId),
			gte(userThreads.lastReadAt, lastMessageTimeSubselect.lastMessageTime)
		)
	}
	if (wantsUnread) {
		unreadCondition = or(
			isNull(userThreads.threadId),
			lt(userThreads.lastReadAt, lastMessageTimeSubselect.lastMessageTime)
		)
	}
	// If user has chosen exactly one => add that condition
	if (wantsRead && !wantsUnread && readCondition) {
		conditions.push(readCondition)
	} else if (!wantsRead && wantsUnread && unreadCondition) {
		conditions.push(unreadCondition)
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
		.leftJoin(userThreads, eq(threads.id, userThreads.threadId))
		.where(conditions.length > 0 ? and(...conditions) : undefined)

	const threadIds = threadIdsQuery.map((row) => row.threadId)
	await ensureUserThreads(clerkId, threadIds)

	/**
	 * We'll use a CTE with DISTINCT ON to select the latest message for each thread.
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
			.where(inArray(messages.threadId, threadIds))
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
			body: row.content,
			createdAt: row.messageCreatedAt
		}
	}))
}
