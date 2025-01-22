import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
	// Log the incoming request for debugging
	const payload = await request.json()
	console.log("Received Postmark webhook:", payload)

	return new Response("OK", { status: 200 })
}
