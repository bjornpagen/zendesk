"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from "@/components/ui/command"
import { Search, Shield, Lock } from "lucide-react"

const teamOptions = [
	{
		slug: "security",
		title: "Security Team",
		icon: Shield
	},
	{
		slug: "privacy",
		title: "Privacy Team",
		icon: Lock
	}
]

interface TeamCommandProps {
	selectedTeams: string[]
	intextSearch: string
	onFiltersChange: (filters: { teams: string[]; intext: string }) => void
}

export function TeamCommand({
	selectedTeams,
	intextSearch,
	onFiltersChange
}: TeamCommandProps) {
	const [searchText, setSearchText] = useState(intextSearch)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const focusInput = () => {
			if (inputRef.current) {
				inputRef.current.focus()
			}
		}
		window.addEventListener("focus", focusInput)
		focusInput()
		return () => window.removeEventListener("focus", focusInput)
	}, [])

	const toggleTeam = useCallback(
		(team: string) => {
			const newTeams = selectedTeams.includes(team)
				? selectedTeams.filter((t) => t !== team)
				: [...selectedTeams, team]
			onFiltersChange({
				teams: newTeams,
				intext: intextSearch
			})
		},
		[selectedTeams, intextSearch, onFiltersChange]
	)

	const applySearch = useCallback(() => {
		if (searchText) {
			onFiltersChange({
				teams: selectedTeams,
				intext: searchText
			})
		}
	}, [searchText, selectedTeams, onFiltersChange])

	const clearSearch = useCallback(() => {
		setSearchText("")
		onFiltersChange({
			teams: selectedTeams,
			intext: ""
		})
	}, [selectedTeams, onFiltersChange])

	return (
		<Command className="rounded-lg border shadow-md w-[450px]">
			<CommandInput
				ref={inputRef}
				autoFocus
				placeholder="Type a command or search..."
				value={searchText}
				onValueChange={setSearchText}
			/>
			<CommandList>
				<CommandGroup heading="Teams" className="p-2">
					{teamOptions.map((team) => (
						<CommandItem key={team.slug} onSelect={() => toggleTeam(team.slug)}>
							<team.icon className="mr-2 h-4 w-4" />
							<span>{team.title}</span>
						</CommandItem>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Search" className="p-2">
					<CommandItem onSelect={applySearch}>
						<Search className="mr-2 h-4 w-4" />
						<span>
							{searchText ? `Search for: ${searchText}` : "Type to search"}
						</span>
					</CommandItem>
					{searchText && (
						<CommandItem onSelect={clearSearch}>
							<Search className="mr-2 h-4 w-4" />
							<span>Clear search</span>
						</CommandItem>
					)}
				</CommandGroup>
				<CommandEmpty>No results found.</CommandEmpty>
			</CommandList>
		</Command>
	)
}
