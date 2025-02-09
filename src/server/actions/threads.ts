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
	type SQL,
	ne
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
 * needsResponse ("true"/"false"), intext (subject/messages),
 * and assignees (clerkIds).
 *
 * needsResponse logic:
 *  - A thread needs response if its final message is NOT "staff".
 *  - A thread does NOT need response if its final message is "staff".
 */
export async function getThreads(
	statuses: ("open" | "closed" | "spam")[] = [],
	problems: string[] = [],
	priorities: ("urgent" | "non-urgent")[] = [],
	visibility: ("read" | "unread")[] = [],
	needsResponse: ("true" | "false")[] = [],
	intext = "",
	assignees: string[] = []
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
	// Filter by assignees
	if (assignees.length > 0) {
		conditions.push(inArray(threads.assignedToClerkId, assignees))
	}

	const wantsRead = visibility.includes("read")
	const wantsUnread = visibility.includes("unread")

	/**
	 * Subselect for the latest message time per thread:
	 * This helps with read/unread checks.
	 */
	const lastMessageTimeSubselect = db.$with("last_message_time").as(
		db
			.select({
				threadId: messages.threadId,
				lastMessageTime: max(messages.createdAt).as("lastMessageTime")
			})
			.from(messages)
			.groupBy(messages.threadId)
	)

	// For "read" => thread.lastReadAt >= the last message creation time
	// For "unread" => thread.lastReadAt < the last message creation time OR thread.lastReadAt is null
	let lastReadAtCondition: SQL<unknown> | undefined
	if (wantsRead && !wantsUnread) {
		lastReadAtCondition = and(
			eq(lastMessageTimeSubselect.threadId, threads.id),
			gte(threads.lastReadAt, lastMessageTimeSubselect.lastMessageTime)
		)
	} else if (!wantsRead && wantsUnread) {
		lastReadAtCondition = and(
			eq(lastMessageTimeSubselect.threadId, threads.id),
			or(
				isNull(threads.lastReadAt),
				lt(threads.lastReadAt, lastMessageTimeSubselect.lastMessageTime)
			)
		)
	}
	if (lastReadAtCondition) {
		conditions.push(lastReadAtCondition)
	}

	// Filter by intext => look for subject or message content match.
	let intextCondition: SQL<unknown> | undefined
	if (intext) {
		const term = `%${intext}%`
		intextCondition = or(
			ilike(threads.subject, term),
			ilike(messages.content, term)
		)
	}
	if (intextCondition) {
		conditions.push(intextCondition)
	}

	/**
	 * Subselect for the ACTUAL latest message (any type), to check if it's "staff".
	 * We'll call this CTE "latest_any_message" so we can filter by needsResponse.
	 */
	const latestAnyMessageSubselect = db.$with("latest_any_message").as(
		db
			.selectDistinctOn([messages.threadId], {
				threadId: messages.threadId,
				lastMessageType: messages.type
			})
			.from(messages)
			.orderBy(messages.threadId, desc(messages.createdAt))
	)

	// Build the logic to filter by needsResponse.
	// If needsResponse includes "true" but NOT "false", we only want lastMessageType != 'staff'
	// If needsResponse includes "false" but NOT "true", we only want lastMessageType = 'staff'
	const wantsNeedsResponse = needsResponse.includes("true")
	const wantsNoResponse = needsResponse.includes("false")

	let needsResponseCondition: SQL<unknown> | undefined
	if (wantsNeedsResponse && !wantsNoResponse) {
		// Filter threads whose final message is NOT staff
		needsResponseCondition = and(
			eq(latestAnyMessageSubselect.threadId, threads.id),
			ne(latestAnyMessageSubselect.lastMessageType, "staff")
		)
	} else if (!wantsNeedsResponse && wantsNoResponse) {
		// Filter threads whose final message is staff
		needsResponseCondition = and(
			eq(latestAnyMessageSubselect.threadId, threads.id),
			eq(latestAnyMessageSubselect.lastMessageType, "staff")
		)
	}
	if (needsResponseCondition) {
		conditions.push(needsResponseCondition)
	}

	// Now gather distinct thread IDs that match all the above conditions.
	const threadIdsQuery = await db
		.with(lastMessageTimeSubselect, latestAnyMessageSubselect)
		.selectDistinct({ threadId: threads.id })
		.from(threads)
		.innerJoin(customers, eq(threads.customerId, customers.id))
		.leftJoin(messages, eq(threads.id, messages.threadId))
		.leftJoin(
			lastMessageTimeSubselect,
			eq(threads.id, lastMessageTimeSubselect.threadId)
		)
		.leftJoin(
			latestAnyMessageSubselect,
			eq(threads.id, latestAnyMessageSubselect.threadId)
		)
		.where(conditions.length > 0 ? and(...conditions) : undefined)

	const threadIds = threadIdsQuery.map((row) => row.threadId)

	/**
	 * We'll use a CTE with DISTINCT ON to select the latest NON-staff message for each thread
	 * just for returning as the "latestMessage". This remains the same as before (example usage).
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

	// Now get the actual threads + their latest non-staff message
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
