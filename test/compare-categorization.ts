import fs from "node:fs"
import path from "node:path"
import { z } from "zod"

interface CategorizationRecord {
	threadSubject: string
	problem: {
		title: string
		description: string
	} | null
}

const ThreadCategorySchema = z.object({
	threadCategories: z.array(
		z.object({
			threadSubject: z.string(),
			problem: z
				.object({
					title: z.string(),
					description: z.string()
				})
				.nullable()
				.optional()
		})
	)
})

function loadCategorizationFile(filePath: string) {
	const fullPath = path.join(process.cwd(), filePath)
	const rawData = fs.readFileSync(fullPath, "utf8")
	const parsed = ThreadCategorySchema.parse(JSON.parse(rawData))

	const records: CategorizationRecord[] = parsed.threadCategories.map(
		(item) => ({
			threadSubject: item.threadSubject,
			problem: item.problem ?? null
		})
	)

	return records
}

function calculateAgreement(
	data1: CategorizationRecord[],
	data2: CategorizationRecord[]
) {
	// Build a map for quick lookup by threadSubject
	const map2 = new Map<string, CategorizationRecord>()
	for (const record of data2) {
		map2.set(record.threadSubject, record)
	}

	let matchedThreads = 0
	let sameLabelCount = 0

	// Compare labels from first file to second
	for (const record1 of data1) {
		const match2 = map2.get(record1.threadSubject)

		if (!match2) {
			// Thread not found in second file. Skip it.
			continue
		}

		matchedThreads++

		// Compare problem titles (or null if no problem)
		const title1 = record1.problem?.title || null
		const title2 = match2.problem?.title || null

		if (title1 === title2) {
			sameLabelCount++
		}
	}

	const agreement =
		matchedThreads === 0 ? 0 : (sameLabelCount / matchedThreads) * 100

	return {
		matchedThreads,
		sameLabelCount,
		agreement
	}
}

/**
 * Usage:
 *   ts-node compare-categorization.ts <file1.json> <file2.json>
 */
async function main() {
	const args = process.argv.slice(2)
	if (args.length < 2) {
		console.error(
			"Usage: ts-node compare-categorization.ts <file1.json> <file2.json>"
		)
		process.exit(1)
	}

	const file1 = args[0]
	const file2 = args[1]
	if (!file1 || !file2) {
		console.error(
			"Usage: ts-node compare-categorization.ts <file1.json> <file2.json>"
		)
		process.exit(1)
	}

	let data1: CategorizationRecord[] | undefined
	let data2: CategorizationRecord[] | undefined
	try {
		data1 = loadCategorizationFile(file1)
		data2 = loadCategorizationFile(file2)
	} catch (error) {
		console.error("Error loading files:", (error as Error).message)
		process.exit(1)
	}
	if (!data1 || !data2) {
		console.error("Unexpected error loading files")
		process.exit(1)
	}

	const { matchedThreads, sameLabelCount, agreement } = calculateAgreement(
		data1,
		data2
	)

	console.log(`Compared classifications in "${file1}" vs. "${file2}"`)
	console.log(`Matched threads by subject:   ${matchedThreads}`)
	console.log(`Same category label count:    ${sameLabelCount}`)
	console.log(`Agreement percentage:         ${agreement.toFixed(2)}%`)
}

main().catch(console.error)
