"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { asc, desc, eq } from "drizzle-orm"
import { postmark } from "@/server/postmark"
import { createId } from "@paralleldrive/cuid2"

// TODO: Move to environment variables
const WHITELISTED_DOMAIN = "gauntletai.com"
const SUPPORT_EMAIL = "support@bjornpagen.com"

/**
 * Fetch a thread (plus related messages) by ID
 */
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
					userClerkId: true,
					messageId: true,
					inReplyTo: true
				},
				with: {
					user: {
						columns: {
							name: true,
							avatar: true
						}
					},
					customer: {
						columns: {
							name: true
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
 * Send a new message in a thread from a staff member.
 * Optionally send an email reply if the customer's domain is whitelisted.
 *
 * INVARIANT: Staff can only reply to existing threads that were initiated by customers.
 * This means there will always be at least one message in the thread with a messageId
 * that we can use for email threading (In-Reply-To header).
 */
export async function sendMessage(threadId: string, content: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Retrieve thread & customer data
	const thread = await db.query.threads.findFirst({
		where: eq(schema.threads.id, threadId),
		columns: { id: true, subject: true },
		with: {
			customer: {
				columns: { email: true, name: true }
			},
			messages: {
				orderBy: [desc(schema.messages.createdAt)],
				columns: {
					messageId: true
				},
				limit: 1
			}
		}
	})

	if (!thread) {
		throw new Error("Thread not found")
	}

	// Decide whether we should send an email
	const shouldSendEmail = thread.customer.email.endsWith(
		`@${WHITELISTED_DOMAIN}`
	)

	// Get the first message's ID for email threading
	// This will always exist due to our invariant
	// biome-ignore lint/style/noNonNullAssertion: We know there's at least one customer message
	const lastMessage = thread.messages[0]!
	const inReplyToId = lastMessage.messageId

	// Generate a unique Message-ID for this new staff message
	// RFC 2822: Message-IDs should be of the form <unique@domain>
	const staffMessageId = `<${createId()}.${WHITELISTED_DOMAIN}>`

	// Insert staff message & optionally send email
	const result = await db.transaction(async (tx) => {
		// Create the staff message
		const message = await tx
			.insert(schema.messages)
			.values({
				type: "staff",
				content,
				threadId,
				userClerkId: clerkId,
				messageId: staffMessageId, // store the staff message ID
				inReplyTo: inReplyToId // reference last message's messageId
			})
			.returning({
				id: schema.messages.id,
				content: schema.messages.content,
				createdAt: schema.messages.createdAt,
				type: schema.messages.type,
				userClerkId: schema.messages.userClerkId,
				messageId: schema.messages.messageId,
				inReplyTo: schema.messages.inReplyTo
			})
			.then(([m]) => m)

		// Update the thread's lastReadAt
		await tx
			.update(schema.threads)
			.set({ lastReadAt: new Date() })
			.where(eq(schema.threads.id, threadId))

		// If allowed, send an email reply via Postmark
		if (shouldSendEmail) {
			await sendEmailReply({
				to: thread.customer.email,
				subject: thread.subject,
				textBody: content,
				threadId: thread.id,
				newMessageId: staffMessageId,
				inReplyTo: inReplyToId
			})
		}

		return message
	})

	return result
}

/**
 * Helper function to send email replies via Postmark.
 * Includes headers to maintain correct threading in email clients.
 */
async function sendEmailReply({
	to,
	subject,
	textBody,
	threadId,
	newMessageId,
	inReplyTo
}: {
	to: string
	subject: string
	textBody: string
	threadId: string
	newMessageId: string
	inReplyTo: string | null
}) {
	try {
		// Standard "Re:" prefix if it doesn't exist
		const emailSubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`

		// Build the header array for threading
		const headers = [
			{
				Name: "Message-ID",
				Value: newMessageId
			},
			{
				Name: "X-PM-Thread-Id",
				Value: threadId
			}
		]

		// If we know the previous message's ID, set In-Reply-To & References
		if (inReplyTo) {
			headers.push(
				{ Name: "In-Reply-To", Value: inReplyTo },
				{ Name: "References", Value: inReplyTo }
			)
		}

		await postmark.sendEmail({
			From: SUPPORT_EMAIL, // Updated to use constant
			To: to,
			Subject: emailSubject,
			TextBody: textBody,
			MessageStream: "outbound",
			Headers: headers
		})
	} catch (error) {
		console.error("Failed to send email:", error)
		throw new Error("Failed to send email response")
	}
}
