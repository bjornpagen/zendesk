/**
 * A comprehensive seed script to populate all tables using Faker and Drizzle.
 *
 * To run:
 *   1. Install dependencies if necessary:
 *       pnpm install @faker-js/faker
 *   2. Execute via ts-node or a similar runner:
 *       bun run src/server/db/seed.ts
 */

import { faker } from "@faker-js/faker"
import { db } from "./index"
import * as schema from "./schema"
import { initialProblems, initialTeams, supportThreads } from "./seed-data"

/**
 * Utility to pick a random item from an array.
 */
function randomItem<T>(array: T[]): T {
	if (array.length === 0) {
		throw new Error("Cannot pick from empty array")
	}
	const index = Math.floor(Math.random() * array.length)
	const item = array.at(index)
	if (!item) {
		throw new Error("Failed to get random item")
	}
	return item
}

async function main() {
	console.log("Cleaning up existing data...")
	await db.delete(schema.messages)
	await db.delete(schema.files)
	await db.delete(schema.threads)
	await db.delete(schema.problems)
	await db.delete(schema.customers)
	await db.delete(schema.users)
	await db.delete(schema.roundRobinState)
	await db.delete(schema.teams)

	console.log("Creating default team...")
	// IMPORTANT: Default team must always exist as a fallback for users and problems
	// that aren't assigned to a specialized team
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

	console.log("Creating specialized teams...")
	const specializedTeams = await db
		.insert(schema.teams)
		.values(initialTeams)
		.returning()

	// Create a map of team names to their IDs for easy lookup
	const allTeams = [defaultTeam, ...specializedTeams]
	const teamsByName = new Map(allTeams.map((team) => [team.name, team.id]))

	console.log("Seeding users...")
	const userCount = 10
	const createdUsers = await db
		.insert(schema.users)
		.values(
			Array.from({ length: userCount }).map((_, index) => ({
				clerkId: faker.string.uuid(),
				teamId: randomItem(allTeams).id, // Randomly assign users to teams
				avatar: faker.image.avatar(),
				email: faker.internet.email(),
				name: faker.person.fullName(),
				role: index === 0 ? ("admin" as const) : ("member" as const)
			}))
		)
		.returning()

	console.log("Seeding customers...")
	const customerCount = 20
	const createdCustomers = await db
		.insert(schema.customers)
		.values(
			Array.from({ length: customerCount }).map(() => ({
				email: faker.internet.email(),
				name: faker.person.fullName(),
				metadata: {}
			}))
		)
		.returning()

	console.log("Seeding initial problem categories with team assignments...")
	const problemsWithTeams = initialProblems.map((problem) => ({
		title: problem.title,
		description: problem.description,
		teamId: problem.teamName
			? (teamsByName.get(problem.teamName) ?? null)
			: null
	}))

	const createdProblems = await db
		.insert(schema.problems)
		.values(problemsWithTeams)
		.returning()

	console.log("Seeding support threads with realistic conversations...")
	const threadInstances = supportThreads.map((template, templateIndex) => ({
		customerId: randomItem(createdCustomers).id,
		subject: template.subject,
		status: "open" as const,
		priority: faker.helpers.arrayElement(["urgent", "non-urgent"] as const),
		assignedToClerkId: faker.datatype.boolean(0.8)
			? randomItem(createdUsers).clerkId
			: null,
		problemId: null,
		statusChangedAt: faker.date.recent({ days: 90 }),
		assignedAt: faker.date.recent({ days: 90 }),
		_templateIndex: templateIndex // This won't be inserted since it's not in the schema
	}))

	const createdThreads = await db
		.insert(schema.threads)
		.values(threadInstances.map(({ _templateIndex, ...thread }) => thread)) // Remove _templateIndex before insert
		.returning()

	console.log("Seeding messages for each thread...")
	// Create messages for each thread based on templates
	const allMessages = createdThreads.flatMap((thread, index) => {
		const template = supportThreads[threadInstances[index]?._templateIndex ?? 0]
		if (!template) {
			throw new Error(`No template found for thread ${index}`)
		}

		return template.messages.map((msg) => ({
			type: msg.type,
			content: msg.content,
			threadId: thread.id,
			userClerkId:
				msg.type === "staff" ? randomItem(createdUsers).clerkId : null,
			customerId: msg.type !== "staff" ? thread.customerId : null,
			messageId: msg.type === "email" ? faker.string.uuid() : null,
			createdAt: faker.date.recent({ days: 30 }),
			updatedAt: faker.date.recent({ days: 30 })
		}))
	})

	await db.insert(schema.messages).values(allMessages)

	console.log("Database seeding complete!")
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("Error seeding database:", err)
		process.exit(1)
	})
