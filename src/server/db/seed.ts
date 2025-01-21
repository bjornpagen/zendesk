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

/**
 * Utility to pick multiple random items from an array without repetition.
 *
 * @param array Array to pick from
 * @param count Number of items to pick
 */
function randomItems<T>(array: T[], count: number): T[] {
	if (count >= array.length) {
		return [...array]
	}
	const shuffled = [...array].sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

async function main() {
	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding teams...")
	const teamCount = 5
	const createdTeams = await db
		.insert(schema.teams)
		.values(
			Array.from({ length: teamCount }).map(() => ({
				name: faker.company.name()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding users...")
	const userCount = 10
	const createdUsers = await db
		.insert(schema.users)
		.values(
			Array.from({ length: userCount }).map(() => ({
				clerkId: faker.string.uuid(), // must be unique
				teamId: randomItem(createdTeams).id,
				avatar: faker.image.avatar(),
				email: faker.internet.email(),
				name: faker.person.fullName()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding customers...")
	const customerCount = 10
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
	const problemCount = 5
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
	const threadCount = 15
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
	const fileCount = 5
	const createdFiles = await db
		.insert(schema.files)
		.values(
			Array.from({ length: fileCount }).map(() => ({
				name: faker.system.fileName(),
				size: faker.number.int({ min: 100, max: 2000 }),
				type: faker.system.mimeType(),
				url: faker.internet.url()
			}))
		)
		.returning()

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding messages...")
	const staffMessages: Array<
		Omit<typeof schema.messages.$inferInsert, "createdAt" | "updatedAt" | "id">
	> = []
	const widgetMessages: Array<
		Omit<typeof schema.messages.$inferInsert, "createdAt" | "updatedAt" | "id">
	> = []
	const emailMessages: Array<
		Omit<typeof schema.messages.$inferInsert, "createdAt" | "updatedAt" | "id">
	> = []

	for (const thread of createdThreads) {
		// Optionally attach a file
		const randomFileId = faker.datatype.boolean()
			? randomItem(createdFiles).id
			: null

		// staff message
		staffMessages.push({
			type: "staff",
			threadId: thread.id,
			userClerkId: randomItem(createdUsers).clerkId,
			customerId: null,
			fileId: randomFileId,
			messageId: null,
			inReplyTo: null,
			content: faker.lorem.paragraph()
		})

		// widget message
		widgetMessages.push({
			type: "widget",
			threadId: thread.id,
			userClerkId: null,
			customerId: thread.customerId,
			fileId: faker.datatype.boolean() ? randomItem(createdFiles).id : null,
			messageId: null,
			inReplyTo: null,
			content: faker.lorem.paragraph()
		})

		// email message
		emailMessages.push({
			type: "email",
			threadId: thread.id,
			userClerkId: null,
			customerId: thread.customerId,
			fileId: faker.datatype.boolean() ? randomItem(createdFiles).id : null,
			messageId: faker.string.uuid(),
			inReplyTo: faker.datatype.boolean() ? faker.string.uuid() : null,
			content: faker.lorem.paragraph()
		})
	}

	await db
		.insert(schema.messages)
		.values([...staffMessages, ...widgetMessages, ...emailMessages])

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding userThreads...")
	const userThreadInserts: Array<
		Omit<typeof schema.userThreads.$inferInsert, "createdAt" | "updatedAt">
	> = []
	for (let i = 0; i < 20; i++) {
		const randomUser = randomItem(createdUsers)
		const randomThread = randomItem(createdThreads)
		// Avoid duplicates
		const pairExists = userThreadInserts.some(
			(ut) =>
				ut.userClerkId === randomUser.clerkId && ut.threadId === randomThread.id
		)
		if (!pairExists) {
			userThreadInserts.push({
				userClerkId: randomUser.clerkId,
				threadId: randomThread.id,
				lastReadAt: faker.date.recent({ days: 365 })
			})
		}
	}
	await db.insert(schema.userThreads).values(userThreadInserts)

	// biome-ignore lint/suspicious/noConsole: Acceptable in seed script for progress tracking
	console.log("Seeding teamMembers...")
	const teamMemberInserts: Array<
		Omit<typeof schema.teamMembers.$inferInsert, "createdAt" | "updatedAt">
	> = []
	for (const user of createdUsers) {
		teamMemberInserts.push({
			userId: user.clerkId,
			teamId: user.teamId,
			role: faker.datatype.boolean() ? "admin" : "member",
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
