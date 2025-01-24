"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { clerk } from "@/server/clerk"
import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

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
