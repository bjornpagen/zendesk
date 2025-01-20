import { useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { mockTeamMembers } from "@/types/frontend"

interface Filters {
	teams: string[]
	intext: string
}

export function useTeamFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get("command") === "open"
	const selectedTeams = searchParams.get("team")?.split(",") || []
	const intextSearch = searchParams.get("q") || ""

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
			router.replace(`/team?${params.toString()}`)
		},
		[router, searchParams]
	)

	const handleOpenChange = useCallback(
		(open: boolean) => {
			updateSearchParams({ command: open ? "open" : undefined })
		},
		[updateSearchParams]
	)

	const filteredTeamMembers = useMemo(() => {
		return mockTeamMembers.filter((member) => {
			const matchesTeam =
				selectedTeams.length === 0 || selectedTeams.includes(member.team)
			const intextLower = intextSearch.toLowerCase()
			const matchesIntext =
				!intextSearch ||
				member.name.toLowerCase().includes(intextLower) ||
				member.email.toLowerCase().includes(intextLower)

			return matchesTeam && matchesIntext
		})
	}, [selectedTeams, intextSearch])

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

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				handleOpenChange(false)
			}
		}
		document.addEventListener("keydown", handleEscape)
		return () => document.removeEventListener("keydown", handleEscape)
	}, [isOpen, handleOpenChange])

	const onFiltersChange = useCallback(
		(filters: Filters) => {
			updateSearchParams({
				team: filters.teams.length > 0 ? filters.teams : undefined,
				q: filters.intext || undefined
			})
		},
		[updateSearchParams]
	)

	return {
		isOpen,
		selectedTeams,
		intextSearch,
		filteredTeamMembers,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	}
}
