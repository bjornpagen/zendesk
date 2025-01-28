"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq, ilike, or, type SQL } from "drizzle-orm"

export type TeamMember = {
	clerkId: string
	name: string
	email: string
	avatar: string
	team: string
	teamId: string
	createdAt: Date
	role: "admin" | "member"
}

export type Team = {
	id: string
	name: string
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

	const { users, teams } = schema

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
			clerkId: users.clerkId,
			name: users.name,
			email: users.email,
			avatar: users.avatar,
			team: teams.name,
			teamId: teams.id,
			createdAt: users.createdAt,
			role: users.role
		})
		.from(users)
		.innerJoin(teams, eq(teams.id, users.teamId))
		.where(and(...conditions))
		.orderBy(users.name)

	return members
}

export async function getTeam(teamId: string): Promise<Team> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const team = await db
		.select({
			id: schema.teams.id,
			name: schema.teams.name
		})
		.from(schema.teams)
		.where(eq(schema.teams.id, teamId))
		.then((rows) => rows[0])

	if (!team) {
		throw new Error(`Team not found: ${teamId}`)
	}
	return team
}

export async function getAllTeams(): Promise<Team[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const teams = await db
		.select({
			id: schema.teams.id,
			name: schema.teams.name
		})
		.from(schema.teams)
		.orderBy(schema.teams.name)

	return teams
}
