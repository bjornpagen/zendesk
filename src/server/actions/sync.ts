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

	// Get or create default team
	const defaultTeam = await db
		.select({
			id: schema.teams.id
		})
		.from(schema.teams)
		.where(eq(schema.teams.name, "Default Team"))
		.limit(1)
		.then(([team]) => team)
	if (!defaultTeam) {
		throw new Error("Default team not found")
	}

	if (!existing) {
		// Insert new user
		await db.insert(schema.users).values({
			clerkId: user.id,
			name: user.firstName
				? `${user.firstName} ${user.lastName || ""}`.trim()
				: user.username || "Anonymous",
			avatar: user.imageUrl,
			email: user.emailAddresses[0]?.emailAddress || "",
			teamId: defaultTeam.id
		})

		// Add them to the default team
		await db.insert(schema.teamMembers).values({
			userId: user.id,
			teamId: defaultTeam.id
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
