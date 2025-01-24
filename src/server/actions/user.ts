"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { clerk } from "@/server/clerk"
import { currentUser } from "@clerk/nextjs/server"
import { eq, and, gte, sql } from "drizzle-orm"
import { startOfDay } from "date-fns"

export async function updateUserName(name: string): Promise<void> {
	const user = await currentUser()
	if (!user) {
		throw new Error("Unauthorized")
	}

	// Update name in Clerk
	await clerk.users.updateUser(user.id, {
		firstName: name.split(" ")[0] || "",
		lastName: name.split(" ").slice(1).join(" ") || ""
	})

	// Update name in local database
	await db
		.update(schema.users)
		.set({ name })
		.where(eq(schema.users.clerkId, user.id))
}

export async function getUserName(): Promise<string> {
	const user = await currentUser()
	if (!user) {
		throw new Error("Unauthorized")
	}

	const dbUser = await db
		.select({ name: schema.users.name })
		.from(schema.users)
		.where(eq(schema.users.clerkId, user.id))
		.then(([user]) => user)

	if (!dbUser) {
		throw new Error("User not found")
	}

	return dbUser.name
}

export type UserDetails = {
	clerkId: string
	name: string
	email: string
	role: "admin" | "member"
	closedTicketsTotal: number
	closedTicketsToday: number
	averageCloseTime: number // in minutes
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
	// 1. Get user info
	const [user] = await db
		.select({
			clerkId: schema.users.clerkId,
			name: schema.users.name,
			email: schema.users.email,
			role: schema.users.role
		})
		.from(schema.users)
		.where(eq(schema.users.clerkId, userId))

	if (!user) {
		throw new Error("User not found")
	}

	// 2. Count total closed tickets
	const totalResult = await db
		.select({
			total: sql<number>`count(${schema.threads.id})`
		})
		.from(schema.threads)
		.where(
			and(
				eq(schema.threads.status, "closed"),
				eq(schema.threads.assignedToClerkId, userId)
			)
		)
	const total = totalResult[0]?.total ?? 0

	// 3. Count tickets closed today
	const todayResult = await db
		.select({
			today: sql<number>`count(${schema.threads.id})`
		})
		.from(schema.threads)
		.where(
			and(
				eq(schema.threads.status, "closed"),
				eq(schema.threads.assignedToClerkId, userId),
				gte(schema.threads.statusChangedAt, startOfDay(new Date()))
			)
		)
	const today = todayResult[0]?.today ?? 0

	// 4. Calculate average close time in minutes
	const avgResult = await db
		.select({
			avgTime: sql<number>`
				avg(
					extract(epoch from (${schema.threads.statusChangedAt} - ${schema.threads.createdAt})) / 60
				)
			`
		})
		.from(schema.threads)
		.where(
			and(
				eq(schema.threads.status, "closed"),
				eq(schema.threads.assignedToClerkId, userId)
			)
		)
	const avgTime = avgResult[0]?.avgTime ?? 0

	return {
		clerkId: user.clerkId,
		name: user.name,
		email: user.email,
		role: user.role as "admin" | "member",
		closedTicketsTotal: total,
		closedTicketsToday: today,
		averageCloseTime: Math.round(avgTime)
	}
}
