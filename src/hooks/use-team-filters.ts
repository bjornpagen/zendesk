import { useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import useSWR from "swr"
import { getTeamMembers } from "@/server/actions/teams"
import { useAuth } from "@clerk/nextjs"

// Define schema for validating URL parameters
const SearchParamsSchema = z.object({
	command: z.literal("open").optional(),
	q: z.string().optional()
})

export function useTeamFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { userId } = useAuth()

	// Parse and validate search params
	const parsedParams = SearchParamsSchema.safeParse(
		Object.fromEntries(searchParams.entries())
	)

	// Use validated params or fallback to defaults
	const { command = undefined, q: intextSearch = "" } = parsedParams.success
		? parsedParams.data
		: {}

	const isOpen = command === "open"

	// Update the URL with the new parameters
	const updateSearchParams = useCallback(
		(newParams: { [key: string]: string | undefined }) => {
			const params = new URLSearchParams(searchParams.toString())
			for (const [key, value] of Object.entries(newParams)) {
				if (value === undefined) {
					params.delete(key)
				} else {
					params.set(key, value)
				}
			}
			router.replace(`/teams?${params.toString()}`)
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

	// Replace useMemo with useSWR
	const { data: filteredTeamMembers = [] } = useSWR(
		["teamMembers", intextSearch],
		() => getTeamMembers(intextSearch)
	)

	// Get current user's role from the team members data
	const currentUserRole =
		filteredTeamMembers.find((member) => member.clerkId === userId)?.role ||
		"member"

	// Add keyboard shortcuts for command overlay (⌘J or Ctrl+J)
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

	// Handler function to update search in the URL
	const onFiltersChange = useCallback(
		(filters: { intext: string }) => {
			updateSearchParams({
				q: filters.intext || undefined
			})
		},
		[updateSearchParams]
	)

	return {
		isOpen,
		intextSearch,
		filteredTeamMembers,
		currentUserRole,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	}
}
