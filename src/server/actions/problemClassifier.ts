import { openai } from "@/server/ai"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"

/**
 * Classify a thread into an existing problem or create a new one.
 *
 * @param threadId The thread to tag.
 * @returns The problemId that was assigned or created.
 */
export async function autoTagProblemForThread(
	threadId: string
): Promise<string> {
	// 1. Fetch thread with all its messages
	const thread = await db.query.threads.findFirst({
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

	if (!thread) {
		throw new Error("Thread not found")
	}
	if (thread.messages.length === 0) {
		throw new Error("Thread has no messages")
	}

	// 2. Fetch all existing problems
	const problems = await db.query.problems.findMany({
		columns: {
			id: true,
			title: true,
			description: true
		}
	})

	// If no problems exist, create a new one immediately
	if (problems.length === 0) {
		const newProblem = await createNewProblem(thread)
		if (!newProblem) {
			throw new Error("Failed to create new problem")
		}
		await updateThreadWithProblem(threadId, newProblem.id)
		return newProblem.id
	}

	// 3. Find best matching problem
	const match = await findBestMatchingProblem(thread, problems)
	if (!match) {
		throw new Error("Failed to classify thread")
	}

	// 4. If no good match found, create new problem
	if (!match.problemId) {
		const newProblem = await createNewProblem(thread)
		if (!newProblem) {
			throw new Error("Failed to create new problem")
		}
		await updateThreadWithProblem(threadId, newProblem.id)
		return newProblem.id
	}

	// 5. Update thread with matched problem
	await updateThreadWithProblem(threadId, match.problemId)
	return match.problemId
}

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
		model: "gpt-4o-2024-08-06",
		messages: [
			{
				role: "system",
				content: `You are a classification assistant that determines which problem category best matches a support thread's content. If none of the categories are a good fit, return null for the problemId.

Your response must include:
1. problemId: The ID of the best matching category, or null if none match well
2. explanation: A brief explanation of your choice`
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
	return completion.choices[0].message.parsed
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
		model: "gpt-4o-2024-08-06",
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

	return inserted
}

/**
 * Update the thread with the given problemId
 */
async function updateThreadWithProblem(threadId: string, problemId: string) {
	await db
		.update(schema.threads)
		.set({ problemId })
		.where(eq(schema.threads.id, threadId))
}
