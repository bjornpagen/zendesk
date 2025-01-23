"use server"
import { env } from "@/env"
import { clerk } from "@/server/clerk"
import { auth } from "@clerk/nextjs/server"

export async function createInvitation(email: string, teamId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Validate email and teamId
	if (!email || !email.includes("@")) {
		throw new Error("Invalid email address")
	}
	if (!teamId) {
		throw new Error("Team ID is required")
	}

	const invitation = await clerk.invitations.createInvitation({
		emailAddress: email.trim(),
		redirectUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
		publicMetadata: {
			invitedBy: clerkId,
			teamId: teamId
		}
	})
	// Return only the necessary serializable data
	return {
		id: invitation.id,
		emailAddress: invitation.emailAddress,
		status: invitation.status
	}
}
