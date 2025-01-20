import { useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { mockTeamMembers } from "@/types/frontend"

export function useTeamFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Pull values from the search params
	const isOpen = searchParams.get("command") === "open"
	const intextSearch = searchParams.get("q") || ""

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

	// Compute the filtered team members list
	const filteredTeamMembers = useMemo(() => {
		return mockTeamMembers.filter((member) => {
			const intextLower = intextSearch.toLowerCase()
			return (
				!intextSearch ||
				member.name.toLowerCase().includes(intextLower) ||
				member.email.toLowerCase().includes(intextLower)
			)
		})
	}, [intextSearch])

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
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	}
}
