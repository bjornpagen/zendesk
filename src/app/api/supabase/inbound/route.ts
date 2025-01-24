import { NextResponse } from "next/server"
import type { Payload } from "@/types/supabase-webhook"
import type * as schema from "@/server/db/schema"

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as Payload<
			typeof schema.messages.$inferSelect
		>

		// Verify this is an insert operation
		if (payload.type !== "INSERT") {
			return new NextResponse("Invalid operation type", { status: 400 })
		}

		// Verify the table
		if (payload.table !== "message") {
			return new NextResponse("Invalid table", { status: 400 })
		}

		// Process the message record
		const record = payload.record

		// TODO: Add any additional processing logic here
		// For example: Send notifications, update analytics, etc.

		return new NextResponse("OK", { status: 200 })
	} catch (error) {
		console.error("Error processing webhook:", error)
		return new NextResponse("Internal Server Error", { status: 500 })
	}
}
