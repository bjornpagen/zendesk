import { inngest } from "@/inngest/client"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"
import { openai } from "@/server/ai"
import { roundRobinAssignThread } from "@/server/actions/roundRobin"
import { problemCategories } from "./problem-categories"

// Define the expected response from our LLM for the AI autoreply
const AiReplySchema = z.object({
	action: z.enum(["reply", "escalate"]),
	message: z.string()
})

const aiReplyFunction = inngest.createFunction(
	{ id: "thread-ai-reply" },
	{ event: "thread/ai-reply" },
	async ({ event, step }) => {
		console.log("Starting AI reply function with event:", event)
		const { threadId } = event.data

		// Check thread status and assignment first
		console.log("Checking thread status for threadId:", threadId)
		const threadStatus = await step.run("check-thread-status", () =>
			db.query.threads.findFirst({
				where: eq(schema.threads.id, threadId),
				columns: {
					status: true,
					assignedToClerkId: true,
					problemId: true
				}
			})
		)
		console.log("Thread status result:", threadStatus)

		if (!threadStatus) {
			console.log("Thread not found, throwing error")
			throw new Error("Thread not found")
		}

		if (threadStatus.assignedToClerkId) {
			console.log("Thread already assigned to:", threadStatus.assignedToClerkId)
			return { skipped: "Thread already assigned to agent" }
		}

		if (threadStatus.status === "closed") {
			return { skipped: "Thread is closed" }
		}

		// If no problem is assigned, auto-tag it first
		if (!threadStatus.problemId) {
			await step.invoke("auto-tag-problem", {
				function: problemCategories,
				data: { threadId }
			})
		}

		// 1. Fetch the complete thread (with messages)
		console.log("Fetching complete thread data")
		const thread = await step.run("fetch-thread", () =>
			db.query.threads.findFirst({
				where: eq(schema.threads.id, threadId),
				with: {
					messages: {
						orderBy: [asc(schema.messages.createdAt)],
						columns: {
							content: true,
							createdAt: true,
							type: true
						}
					},
					customer: {
						columns: {
							name: true,
							email: true,
							metadata: true
						}
					}
				},
				columns: {
					customerId: true,
					problemId: true,
					subject: true,
					status: true,
					priority: true
				}
			})
		)
		console.log("Complete thread data:", thread)
		if (!thread) {
			throw new Error("Thread not found")
		}

		// Capture problemId early to avoid race condition
		const problemId = thread.problemId

		// 2. Fetch all threads for the same customer
		const customerThreads = await step.run("fetch-customer-threads", () =>
			db.query.threads.findMany({
				where: eq(schema.threads.customerId, thread.customerId),
				columns: {
					subject: true,
					status: true,
					priority: true
				},
				with: {
					messages: {
						orderBy: [desc(schema.messages.createdAt)],
						columns: {
							content: true,
							type: true,
							createdAt: true
						}
					}
				}
			})
		)

		// 3. If available, fetch all threads in the same problem category
		let categoryThreads: {
			subject: string
			status: string
			priority: string
			messages: {
				content: string
				type: string
				createdAt: string
			}[]
		}[] = []
		if (problemId) {
			categoryThreads = await step.run("fetch-category-threads", () =>
				db.query.threads.findMany({
					where: eq(schema.threads.problemId, problemId),
					columns: {
						subject: true,
						status: true,
						priority: true
					},
					with: {
						messages: {
							orderBy: [desc(schema.messages.createdAt)],
							columns: {
								content: true,
								type: true,
								createdAt: true
							}
						}
					}
				})
			)
		}

		console.log("Building context string")
		// 4. Build a context string from the gathered data
		const contextString = `
<thread>
	<subject>${thread.subject}</subject>
	<status>${thread.status}</status>
	<priority>${thread.priority}</priority>
	<customer>
		<name>${thread.customer.name}</name>
		<email>${thread.customer.email}</email>
		<metadata>${JSON.stringify(thread.customer.metadata, null, 2)}</metadata>
	</customer>
	<messages>
		${thread.messages
			.map(
				(m) => `
			<message>
				<type>${m.type}</type>
				<timestamp>${m.createdAt}</timestamp>
				<content>${m.content}</content>
			</message>
		`
			)
			.join("")}
	</messages>
</thread>

<customer_history>
	${customerThreads
		.map(
			(t) => `
		<thread>
			<subject>${t.subject}</subject>
			<status>${t.status}</status>
			<priority>${t.priority}</priority>
			<messages>
				${t.messages
					.map(
						(m) => `
					<message>
						<type>${m.type}</type>
						<timestamp>${m.createdAt}</timestamp>
						<content>${m.content}</content>
					</message>
				`
					)
					.join("")}
			</messages>
		</thread>
	`
		)
		.join("")}
</customer_history>

<category_threads>
	${categoryThreads
		.map(
			(t) => `
		<thread>
			<subject>${t.subject}</subject>
			<status>${t.status}</status>
			<priority>${t.priority}</priority>
			<messages>
				${t.messages
					.map(
						(m) => `
					<message>
						<type>${m.type}</type>
						<timestamp>${m.createdAt}</timestamp>
						<content>${m.content}</content>
					</message>
				`
					)
					.join("")}
			</messages>
		</thread>
	`
		)
		.join("")}
</category_threads>`
		console.log("Context string length:", contextString.length)

		// 5. Call the LLM with the context to decide whether to auto-reply or escalate
		console.log("Calling OpenAI")
		const completion = await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful customer support assistant. Analyze the customer's history and similar resolved tickets in the category to provide accurate, friendly support. Pay close attention to how other successful tickets were resolved and mirror that approach.\n\n" +
						"Escalate to a human agent only if:\n" +
						"- The customer explicitly asks for a human\n" +
						"- They're still having issues after receiving initial help\n\n" +
						"Otherwise, provide a complete and helpful response. Always maintain a professional, friendly tone."
				},
				{
					role: "user",
					content: contextString
				}
			],
			response_format: zodResponseFormat(AiReplySchema, "ai_reply")
		})
		console.log("OpenAI response:", completion)

		if (!completion.choices[0]?.message?.parsed) {
			console.log("Failed to parse OpenAI response")
			throw new Error("Failed to generate AI reply")
		}

		const aiResult = completion.choices[0].message.parsed
		console.log("AI decision:", aiResult)

		// 6. Handle the decision - using early returns
		if (aiResult.action === "escalate") {
			console.log("Escalating thread")
			const [aiMessage] = await step.run("insert-ai-message", () =>
				db
					.insert(schema.messages)
					.values({
						type: "ai",
						content: aiResult.message,
						threadId: threadId
					})
					.returning({
						id: schema.messages.id,
						content: schema.messages.content,
						createdAt: schema.messages.createdAt,
						type: schema.messages.type
					})
			)
			console.log("AI message inserted:", aiMessage)

			const assignedToClerkId = await step.run("escalate-thread", async () => {
				return await roundRobinAssignThread(threadId)
			})
			console.log("Thread escalated to:", assignedToClerkId)
			return { escalatedTo: assignedToClerkId, aiMessage }
		}

		// Handle AI reply case
		console.log("Handling AI reply")
		const [aiMessage] = await step.run("insert-ai-message", () =>
			db
				.insert(schema.messages)
				.values({
					type: "ai",
					content: aiResult.message,
					threadId: threadId
				})
				.returning({
					id: schema.messages.id,
					content: schema.messages.content,
					createdAt: schema.messages.createdAt,
					type: schema.messages.type
				})
		)
		console.log("AI message inserted:", aiMessage)
		return { aiMessage }
	}
)

export { aiReplyFunction }
