import { useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { mockThreads } from "@/types/frontend"

interface Filters {
	statuses: string[]
	problems: string[]
	priorities: string[]
	visibility: string[]
	intext: string
}

export function useThreadFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Pull values from the search params
	const isOpen = searchParams.get("command") === "open"
	const selectedStatuses = searchParams.get("status")?.split(",") || []
	const selectedProblems = searchParams.get("problem")?.split(",") || []
	const selectedPriorities = searchParams.get("priority")?.split(",") || []
	const selectedVisibility = searchParams.get("visibility")?.split(",") || []
	const intextSearch = searchParams.get("q") || ""

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

	// Compute the filtered threads list
	const filteredThreads = useMemo(() => {
		return mockThreads.filter((thread) => {
			const matchesStatus =
				selectedStatuses.length === 0 ||
				selectedStatuses.includes(thread.status)
			const matchesProblem =
				selectedProblems.length === 0 ||
				selectedProblems.includes(thread.problem)
			const matchesPriority =
				selectedPriorities.length === 0 ||
				selectedPriorities.includes(thread.priority)
			const matchesVisibility =
				selectedVisibility.length === 0 ||
				(selectedVisibility.includes("read") && thread.isRead) ||
				(selectedVisibility.includes("unread") && !thread.isRead)
			const intextLower = intextSearch.toLowerCase()
			const matchesIntext =
				!intextSearch ||
				thread.subject.toLowerCase().includes(intextLower) ||
				thread.messages.some((message) =>
					message.body.toLowerCase().includes(intextLower)
				)

			return (
				matchesStatus &&
				matchesProblem &&
				matchesPriority &&
				matchesVisibility &&
				matchesIntext
			)
		})
	}, [
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		intextSearch
	])

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
		intextSearch,
		filteredThreads,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	}
}
