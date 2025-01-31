import { inngest } from "@/inngest/client"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"
import { openai } from "@/server/ai"

const problemCategories = inngest.createFunction(
	{ id: "problems-autotag" },
	{ event: "problems/autotag" },
	async ({ event, step }) => {
		const { threadId } = event.data

		// 1. Fetch thread with all its messages
		const thread = await step.run("fetch-thread", () =>
			db.query.threads.findFirst({
				where: eq(schema.threads.id, threadId),
				with: {
					messages: {
						orderBy: [desc(schema.messages.createdAt)],
						columns: {
							content: true,
							type: true
						}
					}
				}
			})
		)

		if (!thread) {
			throw new Error("Thread not found")
		}
		if (thread.messages.length === 0) {
			throw new Error("Thread has no messages")
		}

		// 2. Fetch all existing problems
		const problems = await step.run("fetch-problems", () =>
			db.query.problems.findMany({
				columns: {
					id: true,
					title: true,
					description: true
				}
			})
		)

		// If no problems exist, create a new one immediately
		if (problems.length === 0) {
			const newProblem = await step.run("create-new-problem", () =>
				createNewProblem(thread)
			)
			if (!newProblem) {
				throw new Error("Failed to create new problem")
			}
			await step.run("update-thread", () =>
				db
					.update(schema.threads)
					.set({ problemId: newProblem.id })
					.where(eq(schema.threads.id, threadId))
			)
			return { problemId: newProblem.id }
		}

		// 3. Find best matching problem
		const match = await step.run("find-matching-problem", async () => {
			const result = await findBestMatchingProblem(thread, problems)
			if (!result) {
				throw new Error("Failed to classify thread")
			}

			if (!result.problemId) {
				const newProblem = await createNewProblem(thread)
				if (!newProblem) {
					throw new Error("Failed to create new problem")
				}
				await db
					.update(schema.threads)
					.set({ problemId: newProblem.id })
					.where(eq(schema.threads.id, threadId))
				return { problemId: newProblem.id }
			}

			await db
				.update(schema.threads)
				.set({ problemId: result.problemId })
				.where(eq(schema.threads.id, threadId))
			return { problemId: result.problemId }
		})

		return match
	}
)

const classifyThread = inngest.createFunction(
	{ id: "problems-classify-thread" },
	{ event: "problems/classify-thread" },
	async ({ event, step }) => {
		const { threadId, currentProblemId } = event.data

		const thread = await step.run("fetch-thread", () =>
			db.query.threads.findFirst({
				where: eq(schema.threads.id, threadId),
				with: {
					messages: {
						orderBy: [desc(schema.messages.createdAt)],
						columns: {
							content: true,
							type: true
						}
					}
				}
			})
		)
		if (!thread || thread.messages.length === 0) {
			return
		}

		const problems = await step.run("fetch-problems", () =>
			db.query.problems.findMany({
				columns: {
					id: true,
					title: true,
					description: true
				}
			})
		)

		const match = await step.run("find-matching-problem", () =>
			findBestMatchingProblem(thread, problems)
		)
		const newProblemId = match?.problemId ?? null

		if (!newProblemId) {
			if (currentProblemId) {
				await step.run("clear-problem", () =>
					db
						.update(schema.threads)
						.set({ problemId: null })
						.where(eq(schema.threads.id, threadId))
				)
			}
			return
		}

		if (newProblemId !== currentProblemId) {
			await step.run("update-problem", () =>
				db
					.update(schema.threads)
					.set({ problemId: newProblemId })
					.where(eq(schema.threads.id, threadId))
			)
		}
	}
)

const reclassifyAll = inngest.createFunction(
	{ id: "problems-reclassify-all" },
	{ event: "problems/reclassify-all" },
	async ({ step }) => {
		const threads = await step.run("fetch-threads", () =>
			db
				.select({
					id: schema.threads.id,
					problemId: schema.threads.problemId
				})
				.from(schema.threads)
		)

		// Process each thread by sending a classify event
		for (const thread of threads) {
			await step.sendEvent("classify-thread", {
				name: "problems/classify-thread",
				data: {
					threadId: thread.id,
					currentProblemId: thread.problemId
				}
			})
		}
	}
)

const ClassificationSchema = z.object({
	problemId: z.string().nullable(),
	explanation: z.string()
})

type ClassificationResult = z.infer<typeof ClassificationSchema>

type Thread = {
	messages: {
		content: string
		type: string
	}[]
}

/**
 * Find the best matching problem category for a thread.
 * Returns null if no good match is found.
 */
async function findBestMatchingProblem(
	thread: Thread,
	problems: { id: string; title: string; description: string }[]
): Promise<ClassificationResult | null> {
	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are a classification assistant that determines which problem category best matches a support thread's content. If none of the categories are a good fit, return null for the problemId.

Your response must include:
1. problemId: The exact ID from the provided categories (must be one of the 24 charecter IDs listed), or null if none match well. Never make up an ID.
2. explanation: A brief explanation of your choice

IMPORTANT: The problemId must be exactly one of the IDs provided in the list, or null. Do not modify or create new IDs.`
			},
			{
				role: "user",
				content: `Existing problem categories:
${problems.map((p) => `- ${p.title}: ${p.description} (id: ${p.id})`).join("\n")}

Support thread messages (from newest to oldest):
${thread.messages.map((m) => `[${m.type}] ${m.content}`).join("\n\n")}`
			}
		],
		response_format: zodResponseFormat(ClassificationSchema, "classification")
	})

	if (!completion.choices[0]?.message?.parsed) {
		return null
	}

	const result = completion.choices[0].message.parsed

	// Validate that the problemId is either null or one of the valid IDs
	if (
		result.problemId !== null &&
		!problems.some((p) => p.id === result.problemId)
	) {
		return null
	}

	return result
}

const ProblemCreationSchema = z.object({
	title: z.string(),
	description: z.string()
})

/**
 * Create a new problem category based on the thread content.
 */
async function createNewProblem(thread: Thread) {
	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are a classification assistant that creates new problem categories. Categories should be general enough to group similar issues, but specific enough to be meaningful.

Your response must include:
1. title: A concise 2-5 word title for the category
2. description: A clear 1-2 sentence description of what issues this category encompasses`
			},
			{
				role: "user",
				content: `Support thread messages (from newest to oldest):
${thread.messages.map((m) => `[${m.type}] ${m.content}`).join("\n\n")}`
			}
		],
		response_format: zodResponseFormat(
			ProblemCreationSchema,
			"problem_creation"
		)
	})
	if (!completion.choices[0]?.message?.parsed) {
		return null
	}

	const result = completion.choices[0].message.parsed

	const inserted = await db
		.insert(schema.problems)
		.values({
			title: result.title,
			description: result.description
		})
		.returning({
			id: schema.problems.id
		})
		.then(([problem]) => problem)
	if (!inserted) {
		throw new Error("Failed to insert new problem")
	}

	return inserted
}

export { problemCategories, reclassifyAll, classifyThread }
