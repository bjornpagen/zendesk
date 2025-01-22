/**
 * A comprehensive seed script to populate all tables using Faker and Drizzle.
 *
 * To run:
 *   1. Install dependencies if necessary:
 *       pnpm install @faker-js/faker
 *   2. Execute via ts-node or a similar runner:
 *       pnpm run db:seed
 */

import { faker } from "@faker-js/faker"
import { db } from "./index"
import * as schema from "./schema"

/**
 * Utility to pick a random item from an array.
 */
function randomItem<T>(array: T[]): T {
	// biome-ignore lint/style/noNonNullAssertion: array index is guaranteed to be in bounds
	return array[Math.floor(Math.random() * array.length)]!
}

async function main() {
	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Cleaning up existing data...")
	// Delete in reverse order of dependencies to avoid foreign key conflicts
	await db.delete(schema.messages)
	await db.delete(schema.teamMembers)
	await db.delete(schema.files)
	await db.delete(schema.threads)
	await db.delete(schema.problems)
	await db.delete(schema.customers)
	await db.delete(schema.users)
	await db.delete(schema.teams)

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Creating default team...")
	const defaultTeam = await db
		.insert(schema.teams)
		.values({
			name: "Default Team"
		})
		.returning()
		.then(([team]) => {
			if (!team) {
				throw new Error("Failed to create default team")
			}
			return team
		})

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding additional teams...")
	const teamCount = 16 // Changed from 4
	const additionalTeams = await db
		.insert(schema.teams)
		.values(
			Array.from({ length: teamCount }).map(() => ({
				name: faker.company.name()
			}))
		)
		.returning()

	const createdTeams = [defaultTeam, ...additionalTeams]

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding users...")
	const userCount = 40 // Changed from 10
	const createdUsers = await db
		.insert(schema.users)
		.values(
			Array.from({ length: userCount }).map((_, index) => ({
				clerkId: faker.string.uuid(),
				// First 3 users go to default team, rest are random
				teamId: index < 3 ? defaultTeam.id : randomItem(createdTeams).id,
				avatar: faker.image.avatar(),
				email: faker.internet.email(),
				name: faker.person.fullName()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding customers...")
	const customerCount = 40 // Changed from 10
	const createdCustomers = await db
		.insert(schema.customers)
		.values(
			Array.from({ length: customerCount }).map(() => ({
				email: faker.internet.email(),
				name: faker.person.fullName()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding problems...")
	const problemCount = 20 // Changed from 5
	const createdProblems = await db
		.insert(schema.problems)
		.values(
			Array.from({ length: problemCount }).map(() => ({
				title: faker.hacker.noun(),
				description: faker.hacker.phrase()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding threads...")
	const threadCount = 60 // Changed from 15
	const createdThreads = await db
		.insert(schema.threads)
		.values(
			Array.from({ length: threadCount }).map(() => ({
				customerId: randomItem(createdCustomers).id,
				problemId: faker.datatype.boolean()
					? randomItem(createdProblems).id
					: null,
				assignedToClerkId: faker.datatype.boolean()
					? randomItem(createdUsers).clerkId
					: null,
				priority: faker.helpers.arrayElement<"urgent" | "non-urgent">([
					"urgent",
					"non-urgent"
				]),
				status: faker.helpers.arrayElement<"open" | "closed" | "spam">([
					"open",
					"closed",
					"spam"
				]),
				subject: faker.lorem.sentence()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding files...")
	const fileCount = 20 // Changed from 5
	const createdFiles = await db
		.insert(schema.files)
		.values(
			Array.from({ length: fileCount }).map(() => ({
				name: `${faker.word.sample()}.webp`,
				size: faker.number.int({ min: 20_000, max: 500_000 }), // 20KB - 500KB (WebP is typically smaller)
				type: "image/webp",
				url: `https://picsum.photos/${faker.number.int({ min: 200, max: 800 })}/${faker.number.int({ min: 200, max: 800 })}?format=webp` // Explicitly request WebP format
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding messages...")
	const staffMessages: Array<typeof schema.messages.$inferInsert> = []
	const widgetMessages: Array<typeof schema.messages.$inferInsert> = []
	const emailMessages: Array<typeof schema.messages.$inferInsert> = []

	for (const thread of createdThreads) {
		for (let i = 0; i < 4; i++) {
			const randomFileId = faker.datatype.boolean()
				? randomItem(createdFiles).id
				: null

			// Create messages with random timestamps in the past 30 days
			const timestamp = faker.date.recent({ days: 30 })

			staffMessages.push({
				type: "staff",
				threadId: thread.id,
				userClerkId: randomItem(createdUsers).clerkId,
				customerId: null,
				fileId: randomFileId,
				messageId: null,
				content: faker.lorem.paragraph(),
				createdAt: timestamp,
				updatedAt: timestamp
			})

			widgetMessages.push({
				type: "widget",
				threadId: thread.id,
				userClerkId: null,
				customerId: thread.customerId,
				fileId: faker.datatype.boolean() ? randomItem(createdFiles).id : null,
				messageId: null,
				content: faker.lorem.paragraph(),
				createdAt: faker.date.recent({ days: 30 }),
				updatedAt: faker.date.recent({ days: 30 })
			})

			emailMessages.push({
				type: "email",
				threadId: thread.id,
				userClerkId: null,
				customerId: thread.customerId,
				fileId: faker.datatype.boolean() ? randomItem(createdFiles).id : null,
				messageId: faker.string.uuid(),
				content: faker.lorem.paragraph(),
				createdAt: faker.date.recent({ days: 30 }),
				updatedAt: faker.date.recent({ days: 30 })
			})
		}
	}

	await db
		.insert(schema.messages)
		.values([...staffMessages, ...widgetMessages, ...emailMessages])

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding teamMembers...")
	const teamMemberInserts: Array<
		Omit<typeof schema.teamMembers.$inferInsert, "createdAt" | "updatedAt">
	> = []
	for (const user of createdUsers) {
		// Make first user in default team an admin
		const role = (() => {
			if (user.teamId === defaultTeam.id && teamMemberInserts.length === 0) {
				return "admin"
			}
			return faker.datatype.boolean() ? "admin" : "member"
		})()
		teamMemberInserts.push({
			userId: user.clerkId,
			teamId: user.teamId,
			role,
			lastAssignedAt: faker.datatype.boolean()
				? faker.date.recent({ days: 100 })
				: null
		})
	}
	await db.insert(schema.teamMembers).values(teamMemberInserts)

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Database seeding complete!")
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		// biome-ignore lint/suspicious/noConsole: Error logging is acceptable in catch blocks
		console.error("Error seeding database:", err)
		process.exit(1)
	})
