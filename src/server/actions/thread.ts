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

	// Update lastReadAt
	await db
		.update(schema.threads)
		.set({ lastReadAt: new Date() })
		.where(eq(schema.threads.id, threadId))

	// Fetch thread data
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
	console.log("🚀 Starting sendMessage", { threadId, content })
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		console.error("❌ No clerk ID found")
		throw new Error("Unauthorized")
	}
	console.log("👤 Authenticated user:", { clerkId })

	// Retrieve thread & customer data
	console.log("🔍 Fetching thread data...")
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
		console.error("❌ Thread not found:", threadId)
		throw new Error("Thread not found")
	}
	console.log("📝 Found thread:", thread)

	const shouldSendEmail = thread.customer.email.endsWith(
		`@${WHITELISTED_DOMAIN}`
	)
	console.log("📧 Should send email?", {
		shouldSendEmail,
		customerEmail: thread.customer.email
	})

	// Get the first message's ID for email threading
	// This will always exist due to our invariant
	// biome-ignore lint/style/noNonNullAssertion: We know there's at least one customer message
	const lastMessage = thread.messages[0]!
	const inReplyToId = lastMessage.messageId
	console.log("💌 Threading info:", { inReplyToId })

	const staffMessageId = `<${createId()}.${WHITELISTED_DOMAIN}>`
	console.log("🆔 Generated staff message ID:", staffMessageId)

	try {
		console.log("📝 Inserting staff message...")
		const message = await db
			.insert(schema.messages)
			.values({
				type: "staff",
				content,
				threadId,
				userClerkId: clerkId,
				messageId: staffMessageId,
				inReplyTo: inReplyToId
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

		console.log("✅ Message inserted:", message)

		console.log("⏰ Updating lastReadAt...")
		await db
			.update(schema.threads)
			.set({ lastReadAt: new Date() })
			.where(eq(schema.threads.id, threadId))

		if (shouldSendEmail) {
			console.log("📨 Sending email reply...")
			await sendEmailReply({
				to: thread.customer.email,
				subject: thread.subject,
				textBody: content,
				threadId: thread.id,
				newMessageId: staffMessageId,
				inReplyTo: inReplyToId
			})
		}

		console.log("🎉 Operation completed successfully:", message)
		return message
	} catch (error) {
		console.error("💥 Error in sendMessage:", error)
		console.error("Error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined
		})
		throw error
	}
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
	console.log("🚀 Starting sendEmailReply:", {
		to,
		subject,
		threadId,
		newMessageId,
		inReplyTo
	})

	try {
		const emailSubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`
		console.log("📝 Formatted subject:", emailSubject)

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

		if (inReplyTo) {
			console.log("🔗 Adding threading headers for:", inReplyTo)
			headers.push(
				{ Name: "In-Reply-To", Value: inReplyTo },
				{ Name: "References", Value: inReplyTo }
			)
		}

		console.log("📨 Sending via Postmark with headers:", headers)
		await postmark.sendEmail({
			From: SUPPORT_EMAIL,
			To: to,
			Subject: emailSubject,
			TextBody: textBody,
			MessageStream: "outbound",
			Headers: headers
		})
		console.log("✅ Email sent successfully")
	} catch (error) {
		console.error("💥 Error in sendEmailReply:", error)
		console.error("Error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined
		})
		throw new Error("Failed to send email response")
	}
}
