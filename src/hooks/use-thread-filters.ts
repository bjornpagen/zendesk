"use client"

import { useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getThreads } from "@/server/actions/threads"
import { z } from "zod"
import useSWR from "swr"

interface Filters {
	statuses: string[]
	problems: string[]
	priorities: string[]
	visibility: string[]
	needsResponse: string[]
	intext: string
}

// Define the enums for our filter types
const ThreadStatus = z.enum(["open", "closed", "spam"])
const ThreadPriority = z.enum(["urgent", "non-urgent"])
const ThreadVisibility = z.enum(["read", "unread"])
const ThreadNeedsResponse = z.enum(["true", "false"])

// Schema for validating URL parameters
const SearchParamsSchema = z.object({
	command: z.literal("open").optional(),
	status: z
		.string()
		.transform((str) => str.split(","))
		.pipe(z.array(ThreadStatus))
		.optional(),
	problem: z
		.string()
		.transform((str) => str.split(","))
		.pipe(z.array(z.string()))
		.optional(),
	priority: z
		.string()
		.transform((str) => str.split(","))
		.pipe(z.array(ThreadPriority))
		.optional(),
	visibility: z
		.string()
		.transform((str) => str.split(","))
		.pipe(z.array(ThreadVisibility))
		.optional(),
	needsResponse: z
		.string()
		.transform((str) => str.split(","))
		.pipe(z.array(ThreadNeedsResponse))
		.optional(),
	q: z.string().optional()
})

export function useThreadFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Parse and validate search params
	const parsedParams = SearchParamsSchema.safeParse(
		Object.fromEntries(searchParams.entries())
	)

	// Use validated params or fallback to defaults
	const {
		command = undefined,
		status: selectedStatuses = [],
		problem: selectedProblems = [],
		priority: selectedPriorities = [],
		visibility: selectedVisibility = [],
		needsResponse: selectedNeedsResponse = [],
		q: intextSearch = ""
	} = parsedParams.success ? parsedParams.data : {}

	const isOpen = command === "open"

	// Update the URL with the new parameters
	const updateSearchParams = useCallback(
		(newParams: { [key: string]: string | string[] | undefined }) => {
			const params = new URLSearchParams(searchParams.toString())
			for (const [key, value] of Object.entries(newParams)) {
				if (value === undefined) {
					params.delete(key)
				} else if (Array.isArray(value)) {
					params.set(key, value.join(","))
				} else {
					params.set(key, value)
				}
			}
			router.replace(`/messages?${params.toString()}`)
		},
		[router, searchParams]
	)

	// Toggling open/closed for the command overlay
	const handleOpenChange = useCallback(
		(open: boolean) => {
			updateSearchParams({ command: open ? "open" : undefined })
		},
		[updateSearchParams]
	)

	// Replace useState and useEffect with useSWR
	const { data: threads = [] } = useSWR(
		// Create a unique key based on all filter parameters
		[
			"threads",
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedVisibility,
			selectedNeedsResponse,
			intextSearch
		],
		// Fetch function that ignores the key and uses the filter parameters
		() =>
			getThreads(
				selectedStatuses,
				selectedProblems,
				selectedPriorities,
				selectedVisibility,
				selectedNeedsResponse,
				intextSearch
			)
	)

	// Keyboard shortcuts for toggling the command overlay (⌘J or Ctrl+J)
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				handleOpenChange(!isOpen)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [isOpen, handleOpenChange])

	// Close overlay with Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				handleOpenChange(false)
			}
		}
		document.addEventListener("keydown", handleEscape)
		return () => document.removeEventListener("keydown", handleEscape)
	}, [isOpen, handleOpenChange])

	// Handler function to update selected filters in the URL
	const onFiltersChange = useCallback(
		(filters: Filters) => {
			updateSearchParams({
				status: filters.statuses.length > 0 ? filters.statuses : undefined,
				problem: filters.problems.length > 0 ? filters.problems : undefined,
				priority:
					filters.priorities.length > 0 ? filters.priorities : undefined,
				visibility:
					filters.visibility.length > 0 ? filters.visibility : undefined,
				needsResponse:
					filters.needsResponse.length > 0 ? filters.needsResponse : undefined,
				q: filters.intext || undefined
			})
		},
		[updateSearchParams]
	)

	return {
		isOpen,
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		selectedNeedsResponse,
		intextSearch,
		filteredThreads: threads,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	}
}
