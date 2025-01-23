"use server"
import { clerk } from "@/server/clerk"
import { auth } from "@clerk/nextjs/server"

export async function createInvitation(email: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	try {
		// Validate email
		if (!email || !email.includes("@")) {
			throw new Error("Invalid email address")
		}

		const invitation = await clerk.invitations.createInvitation({
			emailAddress: email.trim(),
			publicMetadata: {
				invitedBy: clerkId
			}
		})
		// Return only the necessary serializable data
		return {
			id: invitation.id,
			emailAddress: invitation.emailAddress,
			status: invitation.status
		}
	} catch (error: any) {
		// Log the detailed error for debugging
		console.error("Clerk invitation error:", {
			error,
			status: error.status,
			clerkTraceId: error.clerkTraceId,
			errors: error.errors
		})

		// Throw a more user-friendly error
		if (error.errors?.[0]?.message) {
			throw new Error(`Invitation failed: ${error.errors[0].message}`)
		}
		throw error
	}
}
