import type { NextRequest } from "next/server"
import type { PostmarkWebhookPayload } from "@/types/postmark-webhook"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { uploadToS3 } from "@/server/s3"
import { autoTagProblemForThread } from "@/server/actions/problemClassifier"

export async function POST(request: NextRequest) {
	try {
		console.log("🎯 Starting to process incoming Postmark webhook")
		const payload = (await request.json()) as PostmarkWebhookPayload
		console.log(
			"📨 Received Postmark webhook payload:",
			JSON.stringify(payload, null, 2)
		)

		// Get the RFC Message-ID from Headers
		console.log("🔍 Looking for Message-ID in headers:", payload.Headers)
		const rfcMessageId = payload.Headers.find(
			(h) => h.Name === "Message-ID"
		)?.Value
		console.log("📝 Found RFC Message-ID:", rfcMessageId)

		if (!rfcMessageId) {
			console.error("❌ No RFC Message-ID found in headers!")
			throw new Error("No RFC Message-ID found in email headers")
		}

		// 1. Find or create customer
		const fromEmail = payload.FromFull.Email
		const fromName = payload.FromFull.Name || fromEmail.split("@")[0] || ""
		console.log("👤 Processing customer data:", { fromEmail, fromName })

		// Extract threadId from email address if present
		console.log("🔍 Looking for threadId in recipient email")
		const threadIdMatch = payload.OriginalRecipient.match(/\+([^@]+)@/)
		const existingThreadId = threadIdMatch ? threadIdMatch[1] : undefined
		console.log("📝 Found threadId from email:", existingThreadId)

		// Process first attachment if present
		console.log("📎 Processing attachments:", payload.Attachments)
		let fileId: string | undefined
		if (payload.Attachments && payload.Attachments.length > 0) {
			const attachment = payload.Attachments[0]
			if (!attachment) {
				console.error("❌ No attachment found in payload")
				throw new Error("No attachment found in payload")
			}
			console.log("📎 Processing attachment:", attachment.Name)

			// Convert base64 to File object
			const binaryData = Buffer.from(attachment.Content, "base64")
			const file = new File([binaryData], attachment.Name, {
				type: attachment.ContentType
			})

			// Upload to S3
			const fileUrl = await uploadToS3(file)
			console.log("📤 Uploaded file to S3:", fileUrl)

			// Start transaction
			const result = await db.transaction(async (tx) => {
				// Create file record
				const fileRecord = await tx
					.insert(schema.files)
					.values({
						name: attachment.Name,
						size: attachment.ContentLength,
						type: attachment.ContentType,
						url: fileUrl
					})
					.returning({
						id: schema.files.id
					})
					.then(([file]) => file)

				if (!fileRecord) {
					throw new Error("Failed to create file record")
				}
				fileId = fileRecord.id

				// 1. Find or create customer using upsert
				console.log("💾 Attempting to upsert customer...")
				const customer = await tx
					.insert(schema.customers)
					.values({
						email: fromEmail,
						name: fromName
					})
					.onConflictDoUpdate({
						target: schema.customers.email,
						set: { email: fromEmail }
					})
					.returning({
						id: schema.customers.id,
						email: schema.customers.email
					})
					.then(([customer]) => customer)

				if (!customer) {
					throw new Error("Failed to create/update customer")
				}

				// Create new thread if no threadId found in email
				let threadId: string | undefined
				if (!existingThreadId) {
					const thread = await tx
						.insert(schema.threads)
						.values({
							customerId: customer.id,
							subject: payload.Subject || "",
							status: "open",
							priority: "non-urgent"
						})
						.returning({
							id: schema.threads.id
						})
						.then(([thread]) => thread)

					if (!thread) {
						throw new Error("Failed to create thread")
					}
					threadId = thread.id
				} else {
					threadId = existingThreadId
				}

				// Create message (removed inReplyTo)
				const message = await tx
					.insert(schema.messages)
					.values({
						type: "email",
						customerId: customer.id,
						threadId: threadId,
						messageId: rfcMessageId,
						content: payload.StrippedTextReply || payload.TextBody || "",
						fileId: fileId
					})
					.returning({
						id: schema.messages.id
					})
					.then(([message]) => message)

				if (!message) {
					throw new Error("Failed to create message")
				}

				return { customer, threadId, message }
			})

			// After the transaction completes, classify the problem
			await autoTagProblemForThread(result.threadId)

			console.log("🎉 Successfully processed email:", {
				customerId: result.customer.id,
				threadId: result.threadId,
				messageId: result.message.id,
				rfcMessageId,
				fileId
			})

			return new Response(
				JSON.stringify({ success: true, messageId: result.message.id }),
				{
					status: 200,
					headers: { "Content-Type": "application/json" }
				}
			)
		}

		// Start transaction
		const result = await db.transaction(async (tx) => {
			// 1. Find or create customer using upsert
			console.log("💾 Attempting to upsert customer...")
			const customer = await tx
				.insert(schema.customers)
				.values({
					email: fromEmail,
					name: fromName
				})
				.onConflictDoUpdate({
					target: schema.customers.email,
					set: { email: fromEmail }
				})
				.returning({
					id: schema.customers.id,
					email: schema.customers.email
				})
				.then(([customer]) => customer)

			if (!customer) {
				throw new Error("Failed to create/update customer")
			}

			// Create new thread if no threadId found in email
			let threadId: string | undefined
			if (!existingThreadId) {
				const thread = await tx
					.insert(schema.threads)
					.values({
						customerId: customer.id,
						subject: payload.Subject || "",
						status: "open",
						priority: "non-urgent"
					})
					.returning({
						id: schema.threads.id
					})
					.then(([thread]) => thread)

				if (!thread) {
					throw new Error("Failed to create thread")
				}
				threadId = thread.id
			} else {
				threadId = existingThreadId
			}

			// Create message (removed inReplyTo)
			const message = await tx
				.insert(schema.messages)
				.values({
					type: "email",
					customerId: customer.id,
					threadId: threadId,
					messageId: rfcMessageId,
					content: payload.StrippedTextReply || payload.TextBody || ""
				})
				.returning({
					id: schema.messages.id
				})
				.then(([message]) => message)

			if (!message) {
				throw new Error("Failed to create message")
			}

			return { customer, threadId, message }
		})

		// After the transaction completes, classify the problem
		await autoTagProblemForThread(result.threadId)

		console.log("🎉 Successfully processed email:", {
			customerId: result.customer.id,
			threadId: result.threadId,
			messageId: result.message.id,
			rfcMessageId
		})

		return new Response(
			JSON.stringify({ success: true, messageId: result.message.id }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" }
			}
		)
	} catch (error) {
		console.error("💥 Error processing Postmark webhook:", error)
		console.error("Error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined
		})
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error"
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" }
			}
		)
	}
}
