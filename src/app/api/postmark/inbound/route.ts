import type { NextRequest } from "next/server"
import type { PostmarkWebhookPayload } from "@/types/postmark-webhook"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq } from "drizzle-orm"

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

		// 2. Find or create thread
		let threadId: string | undefined
		console.log("🔍 Looking for In-Reply-To in headers")
		const inReplyTo = payload.Headers.find(
			(h) => h.Name === "In-Reply-To"
		)?.Value
		console.log("📝 Found In-Reply-To:", inReplyTo)

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

			// Find thread ID if it exists
			if (inReplyTo) {
				threadId = await tx
					.select({ threadId: schema.messages.threadId })
					.from(schema.messages)
					.where(eq(schema.messages.messageId, inReplyTo))
					.limit(1)
					.then(([message]) => message?.threadId)
			}

			// Create new thread if needed
			if (!threadId) {
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
			}

			// Create message
			const message = await tx
				.insert(schema.messages)
				.values({
					type: "email",
					customerId: customer.id,
					threadId: threadId,
					messageId: rfcMessageId,
					inReplyTo: inReplyTo,
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
