import { db } from "../src/server/db"
import fs from "node:fs"
import path from "node:path"

interface ProblemInfo {
	title: string
	description: string
}

interface CategorizationResult {
	threadSubject: string
	problem: ProblemInfo | null
}

async function main() {
	console.log("Analyzing thread categorizations...")

	// Get all threads with their problems
	const threads = await db.query.threads.findMany({
		columns: {
			subject: true,
			problemId: true
		},
		orderBy: (threads, { asc }) => [asc(threads.subject)]
	})

	// Get all problems for lookup
	const problems = await db.query.problems.findMany({
		columns: {
			id: true,
			title: true,
			description: true
		}
	})

	// Create a map of problem IDs to problem info for easy lookup
	const problemMap = new Map(
		problems.map((p) => [p.id, { title: p.title, description: p.description }])
	)

	// Map threads to their problem categories
	const results: CategorizationResult[] = threads.map((thread) => ({
		threadSubject: thread.subject,
		problem: thread.problemId
			? (problemMap.get(thread.problemId) ?? null)
			: null
	}))

	// Calculate some basic statistics
	const totalThreads = results.length
	const categorizedThreads = results.filter((r) => r.problem !== null).length
	const uncategorizedThreads = totalThreads - categorizedThreads

	const stats = {
		totalThreads,
		categorizedThreads,
		uncategorizedThreads,
		categorizationRate: (categorizedThreads / totalThreads) * 100,
		categoryDistribution: {} as Record<string, number>
	}

	// Calculate category distribution
	for (const result of results) {
		const category = result.problem?.title || "uncategorized"
		stats.categoryDistribution[category] =
			(stats.categoryDistribution[category] || 0) + 1
	}

	// Create output object with results and stats
	const output = {
		timestamp: new Date().toISOString(),
		statistics: stats,
		threadCategories: results
	}

	// Write to file in test directory
	const formattedDate = new Date().toISOString().split("T")[0]
	const outputPath = path.join(
		process.cwd(),
		"test",
		"json",
		`${formattedDate}-categorization-analysis.json`
	)
	fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

	console.log(
		`Analysis complete! Results written to test/json/${formattedDate}-categorization-analysis.json`
	)
	console.log("\nSummary:")
	console.log(`Total Threads: ${totalThreads}`)
	console.log(
		`Categorized: ${categorizedThreads} (${stats.categorizationRate.toFixed(2)}%)`
	)
	console.log(`Uncategorized: ${uncategorizedThreads}`)
}

main()
	.catch(console.error)
	.finally(() => process.exit())
