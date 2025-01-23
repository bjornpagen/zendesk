"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { asc, desc, eq } from "drizzle-orm"
import { postmark } from "@/server/postmark"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod"
import { uploadToS3 } from "@/server/s3"

// TODO: Move to environment variables
const WHITELISTED_DOMAIN = "gauntletai.com"
const SUPPORT_EMAIL = "support@bjornpagen.com"
const SUPPORT_EMAIL_REPLY_TO = (threadId: string) =>
	`71da76937c16ed736c59255930611266+${threadId}@inbound.postmarkapp.com`

// Add schema for form validation
const MessageFormSchema = z.object({
	content: z.string(),
	threadId: z.string()
})

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

	// Fetch thread data with customer metadata
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
			customer: {
				columns: {
					id: true,
					name: true,
					email: true,
					metadata: true
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
					fileId: true
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
					},
					file: {
						columns: {
							name: true,
							url: true,
							type: true
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
async function sendMessage(threadId: string, content: string, file?: File) {
	console.log("🚀 Starting sendMessage", { threadId, content, hasFile: !!file })
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		console.error("❌ No clerk ID found")
		throw new Error("Unauthorized")
	}
	console.log("👤 Authenticated user:", { clerkId })

	// Handle file upload if present
	let fileId: string | undefined
	if (file) {
		try {
			console.log("📁 Uploading file to S3...")
			const fileUrl = await uploadToS3(file)

			// Insert file record into database
			const fileRecord = await db
				.insert(schema.files)
				.values({
					name: file.name,
					size: file.size,
					type: file.type,
					url: fileUrl
				})
				.returning({
					id: schema.files.id
				})
				.then(([f]) => f)
			if (!fileRecord) {
				throw new Error("Failed to upload file")
			}

			fileId = fileRecord.id
			console.log("✅ File uploaded and recorded:", { fileId, url: fileUrl })
		} catch (error) {
			console.error("❌ File upload failed:", error)
			throw new Error("Failed to upload file")
		}
	}

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
				fileId: fileId // Add the file ID if present
			})
			.returning({
				id: schema.messages.id,
				content: schema.messages.content,
				createdAt: schema.messages.createdAt,
				type: schema.messages.type,
				userClerkId: schema.messages.userClerkId,
				messageId: schema.messages.messageId,
				fileId: schema.messages.fileId
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
				inReplyTo: inReplyToId,
				fileId: fileId
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
	inReplyTo,
	fileId
}: {
	to: string
	subject: string
	textBody: string
	threadId: string
	newMessageId: string
	inReplyTo: string | null
	fileId?: string
}) {
	console.log("🚀 Starting sendEmailReply:", {
		to,
		subject,
		threadId,
		newMessageId,
		inReplyTo,
		fileId
	})

	try {
		const emailSubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`
		console.log("📝 Formatted subject:", emailSubject)

		const headers = [
			{
				Name: "Message-ID",
				Value: newMessageId
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

		// If there's a file, fetch it and add as attachment
		if (fileId) {
			console.log("📎 Fetching file data for attachment:", fileId)
			const file = await db.query.files.findFirst({
				where: eq(schema.files.id, fileId),
				columns: {
					name: true,
					url: true,
					type: true
				}
			})

			if (file) {
				// Fetch the file content from S3
				const response = await fetch(file.url)
				const arrayBuffer = await response.arrayBuffer()
				const base64Content = btoa(
					String.fromCharCode(...new Uint8Array(arrayBuffer))
				)

				// Remove Content-Type and Content-Transfer-Encoding from headers
				await postmark.sendEmail({
					From: SUPPORT_EMAIL,
					To: to,
					ReplyTo: SUPPORT_EMAIL_REPLY_TO(threadId),
					Subject: emailSubject,
					TextBody: textBody,
					MessageStream: "outbound",
					Headers: headers,
					Attachments: [
						{
							Name: file.name,
							Content: base64Content,
							ContentType: file.type,
							ContentID: fileId
						}
					]
				})
				console.log("📎 Added attachment to email:", file.name)
			}
		} else {
			await postmark.sendEmail({
				From: SUPPORT_EMAIL,
				To: to,
				ReplyTo: SUPPORT_EMAIL_REPLY_TO(threadId),
				Subject: emailSubject,
				TextBody: textBody,
				MessageStream: "outbound",
				Headers: headers
			})
		}

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

/**
 * Update thread properties (status, priority, or problem)
 */
export async function updateThreadProperty(
	threadId: string,
	property: "status" | "priority" | "problemId",
	value: string
) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const updatedThread = await db
		.update(schema.threads)
		.set({
			[property]: value,
			lastReadAt: new Date() // Update read timestamp
		})
		.where(eq(schema.threads.id, threadId))
		.returning({
			id: schema.threads.id,
			status: schema.threads.status,
			priority: schema.threads.priority,
			problemId: schema.threads.problemId
		})
		.then(([thread]) => thread)

	if (!updatedThread) {
		throw new Error("Failed to update thread")
	}

	return updatedThread
}

// New function to handle form submissions
export async function sendMessageForm(formData: FormData) {
	try {
		// Validate the form data
		const validation = MessageFormSchema.safeParse({
			content: formData.get("content"),
			threadId: formData.get("threadId")
		})

		if (!validation.success) {
			console.error("Validation failed", validation.error)
			throw new Error("Invalid input")
		}

		const { content, threadId } = validation.data

		// Handle file upload if present
		let file: File | undefined
		const formFile = formData.get("file")
		if (formFile && formFile instanceof File) {
			file = formFile
		}

		// Create the message using existing function
		await sendMessage(threadId, content, file)

		return
	} catch (error) {
		console.error("Failed to send message:", error)
		throw error
	}
}
