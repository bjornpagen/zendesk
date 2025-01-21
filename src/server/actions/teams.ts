"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq, ilike, or, type SQL } from "drizzle-orm"

export type TeamMember = {
	id: string // Using clerk_id as the id
	name: string
	email: string
	avatar: string
	team: string
	createdAt: Date
}

/**
 * Fetch team members from the database, optionally filtered by search text
 * which matches against name or email
 */
export async function getTeamMembers(searchQuery = ""): Promise<TeamMember[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const { users, teams, teamMembers } = schema

	const conditions: SQL[] = []
	if (searchQuery) {
		const term = `%${searchQuery}%`
		const condition = or(ilike(users.name, term), ilike(users.email, term))
		if (condition) {
			conditions.push(condition)
		}
	}

	const members = await db
		.select({
			id: users.clerkId,
			name: users.name,
			email: users.email,
			avatar: users.avatar,
			team: teams.name,
			createdAt: teamMembers.createdAt
		})
		.from(users)
		.innerJoin(teamMembers, eq(teamMembers.userId, users.clerkId))
		.innerJoin(teams, eq(teams.id, teamMembers.teamId))
		.where(and(...conditions))
		.orderBy(users.name)

	return members
}
