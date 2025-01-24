"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq, ilike, not, or, type SQL } from "drizzle-orm"
import { clerk } from "@/server/clerk"

export type TeamMember = {
	clerkId: string
	name: string
	email: string
	avatar: string
	createdAt: Date
}

async function checkAdminRole(clerkId: string) {
	const user = await db
		.select({ role: schema.users.role })
		.from(schema.users)
		.where(eq(schema.users.clerkId, clerkId))
		.then((rows) => rows[0])

	if (!user || user.role !== "admin") {
		throw new Error("Unauthorized: Admin role required")
	}
}

export async function createInvitation(email: string, teamId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await checkAdminRole(clerkId)

	// Validate email and teamId
	if (!email || !email.includes("@")) {
		throw new Error("Invalid email address")
	}
	if (!teamId) {
		throw new Error("Team ID is required")
	}

	const invitation = await clerk.invitations.createInvitation({
		emailAddress: email.trim(),
		redirectUrl: "https://zendesk-sable.vercel.app/sign-in",
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

/**
 * Get all members of a specific team, optionally filtered by search text
 */
export async function getTeamMembers(
	teamId: string,
	searchQuery = ""
): Promise<TeamMember[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await checkAdminRole(clerkId)

	const conditions: SQL[] = [eq(schema.users.teamId, teamId)]

	if (searchQuery) {
		const term = `%${searchQuery}%`
		const nameCondition = or(
			ilike(schema.users.name, term),
			ilike(schema.users.email, term)
		)
		if (nameCondition) {
			conditions.push(nameCondition)
		}
	}

	const members = await db
		.select({
			clerkId: schema.users.clerkId,
			name: schema.users.name,
			email: schema.users.email,
			avatar: schema.users.avatar,
			createdAt: schema.users.createdAt
		})
		.from(schema.users)
		.where(and(...conditions))
		.orderBy(schema.users.name)

	return members
}

/**
 * Get all users NOT in a specific team, for adding new members
 */
export async function getAvailableUsers(
	teamId: string,
	searchQuery = ""
): Promise<TeamMember[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await checkAdminRole(clerkId)

	const conditions: SQL[] = [not(eq(schema.users.teamId, teamId))]

	if (searchQuery) {
		const term = `%${searchQuery}%`
		const nameCondition = or(
			ilike(schema.users.name, term),
			ilike(schema.users.email, term)
		)
		if (nameCondition) {
			conditions.push(nameCondition)
		}
	}

	const availableUsers = await db
		.select({
			clerkId: schema.users.clerkId,
			name: schema.users.name,
			email: schema.users.email,
			avatar: schema.users.avatar,
			createdAt: schema.users.createdAt
		})
		.from(schema.users)
		.where(and(...conditions))
		.orderBy(schema.users.name)

	return availableUsers
}

/**
 * Add a user to a team
 */
export async function addTeamMember(userId: string, teamId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await checkAdminRole(clerkId)

	// Make sure the team actually exists (foreign key constraint requirement)
	const existingTeam = await db
		.select({ id: schema.teams.id })
		.from(schema.teams)
		.where(eq(schema.teams.id, teamId))
		.then((rows) => rows[0])

	if (!existingTeam) {
		throw new Error(`Cannot add user to non-existent team: ${teamId}`)
	}

	await db
		.update(schema.users)
		.set({ teamId })
		.where(eq(schema.users.clerkId, userId))
}

/**
 * Remove a user from a team by moving them to the default team
 */
export async function removeTeamMember(userId: string, currentTeamId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await checkAdminRole(clerkId)

	const defaultTeam = await db
		.select({ id: schema.teams.id })
		.from(schema.teams)
		.orderBy(schema.teams.createdAt)
		.limit(1)
		.then((rows) => rows[0])

	if (!defaultTeam) {
		throw new Error("No teams found")
	}

	// Optionally, check that the user is actually in the team you're removing them from
	const userRecord = await db
		.select({ teamId: schema.users.teamId })
		.from(schema.users)
		.where(eq(schema.users.clerkId, userId))
		.then((rows) => rows[0])

	if (!userRecord) {
		throw new Error(`User not found: ${userId}`)
	}
	if (userRecord.teamId !== currentTeamId) {
		throw new Error(`User ${userId} is not in team ${currentTeamId}`)
	}

	// Move the user to the default team
	await db
		.update(schema.users)
		.set({ teamId: defaultTeam.id })
		.where(
			and(
				eq(schema.users.clerkId, userId),
				eq(schema.users.teamId, currentTeamId)
			)
		)
}
