"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

const CategorySchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	teamId: z.string().nullable()
})

export type Category = {
	id: string
	title: string
	description: string
	teamId: string | null
	createdAt: Date
	updatedAt: Date
}

export async function getCategories(): Promise<Category[]> {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	return db.query.problems.findMany({
		orderBy: (problems, { asc }) => [asc(problems.title)]
	})
}

export async function createCategory(data: z.infer<typeof CategorySchema>) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const validation = CategorySchema.safeParse(data)
	if (!validation.success) {
		throw new Error("Invalid input")
	}

	const category = await db
		.insert(schema.problems)
		.values(validation.data)
		.returning()
		.then(([c]) => c)

	if (!category) {
		throw new Error("Failed to create category")
	}

	return category
}

export async function updateCategory(
	id: string,
	data: z.infer<typeof CategorySchema>
) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const validation = CategorySchema.safeParse(data)
	if (!validation.success) {
		throw new Error("Invalid input")
	}

	const category = await db
		.update(schema.problems)
		.set(validation.data)
		.where(eq(schema.problems.id, id))
		.returning()
		.then(([c]) => c)

	if (!category) {
		throw new Error("Failed to update category")
	}

	return category
}

export async function updateCategoryTeam(id: string, teamId: string | null) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const category = await db
		.update(schema.problems)
		.set({ teamId })
		.where(eq(schema.problems.id, id))
		.returning()
		.then(([c]) => c)

	if (!category) {
		throw new Error("Failed to update category team")
	}

	return category
}

export async function deleteCategory(id: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	await db.delete(schema.problems).where(eq(schema.problems.id, id))
}
