"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

export async function syncUser(): Promise<void> {
	const user = await currentUser()
	if (!user) {
		throw new Error("Unauthorized")
	}

	const existing = await db
		.select({
			clerkId: schema.users.clerkId,
			updatedAt: schema.users.updatedAt
		})
		.from(schema.users)
		.where(eq(schema.users.clerkId, user.id))
		.limit(1)
		.then(([user]) => user)

	if (!existing) {
		// Get teamId from publicMetadata if available
		const invitedTeamId = user.publicMetadata?.teamId as string | undefined

		// If no teamId in metadata, fallback to oldest team
		let teamId = invitedTeamId
		if (!teamId) {
			const oldestTeam = await db
				.select({
					id: schema.teams.id
				})
				.from(schema.teams)
				.orderBy(schema.teams.createdAt)
				.limit(1)
				.then(([team]) => team)

			if (!oldestTeam) {
				throw new Error("No teams found")
			}
			teamId = oldestTeam.id
		}

		// Insert new user
		await db.insert(schema.users).values({
			clerkId: user.id,
			name: user.firstName
				? `${user.firstName} ${user.lastName || ""}`.trim()
				: user.username || "Anonymous",
			avatar: user.imageUrl,
			email: user.emailAddresses[0]?.emailAddress || "",
			teamId: teamId,
			role: "admin"
		})

		return
	}

	// Check if last update was less than an hour ago
	const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)
	if (existing.updatedAt > oneHourAgo) {
		return // Skip update if recently updated
	}

	// Update user if more than an hour old
	await db
		.update(schema.users)
		.set({
			name: user.firstName
				? `${user.firstName} ${user.lastName || ""}`.trim()
				: user.username || "Anonymous",
			avatar: user.imageUrl,
			email: user.emailAddresses[0]?.emailAddress || ""
		})
		.where(eq(schema.users.clerkId, user.id))
}
