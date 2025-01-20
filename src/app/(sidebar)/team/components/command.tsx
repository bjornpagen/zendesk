"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from "@/components/ui/command"
import { Search, Shield, Lock, UserPlus, UserMinus, Check } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { mockTeamMembers } from "@/types/frontend"
import { useRouter } from "next/navigation"

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
	onMemberUpdate?: (
		memberId: string,
		teamId: string,
		action: "add" | "remove"
	) => void
	onClose?: () => void
}

const TeamSelector = ({
	onSelect,
	onBack
}: {
	onSelect: (team: string) => void
	onBack: () => void
}) => (
	<>
		<CommandGroup heading="Select Team" className="p-2">
			{teamOptions.map((team) => (
				<CommandItem key={team.slug} onSelect={() => onSelect(team.slug)}>
					<team.icon className="mr-2 h-4 w-4" />
					<span>{team.title}</span>
				</CommandItem>
			))}
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup>
			<CommandItem onSelect={onBack}>← Back to main menu</CommandItem>
		</CommandGroup>
	</>
)

const MemberSelector = ({
	teamSlug,
	mode,
	members,
	onSelect,
	onBack
}: {
	teamSlug: string
	mode: "add" | "remove"
	members: typeof mockTeamMembers
	onSelect: (memberId: string) => void
	onBack: () => void
}) => (
	<>
		<CommandGroup
			heading={`${mode === "add" ? "Add to" : "Remove from"} ${
				teamOptions.find((t) => t.slug === teamSlug)?.title
			}`}
			className="p-2"
		>
			{members.map((member) => (
				<CommandItem key={member.id} onSelect={() => onSelect(member.id)}>
					<Avatar className="h-6 w-6 mr-2">
						<AvatarImage src={member.avatar} />
						<AvatarFallback>
							{member.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span>{member.name}</span>
						<span className="text-xs text-muted-foreground">
							{member.email}
						</span>
					</div>
				</CommandItem>
			))}
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup>
			<CommandItem onSelect={onBack}>← Back to team selection</CommandItem>
		</CommandGroup>
	</>
)

const FilterView = ({
	selectedTeams,
	searchText,
	onTeamSelect,
	onModeChange,
	onSearch,
	onClearSearch
}: {
	selectedTeams: string[]
	searchText: string
	onTeamSelect: (team: string) => void
	onModeChange: (mode: "add" | "remove") => void
	onSearch: () => void
	onClearSearch: () => void
}) => (
	<>
		<CommandGroup heading="Actions" className="p-2">
			<CommandItem onSelect={() => onModeChange("add")}>
				<UserPlus className="mr-2 h-4 w-4" />
				<span>Add to Team</span>
			</CommandItem>
			<CommandItem onSelect={() => onModeChange("remove")}>
				<UserMinus className="mr-2 h-4 w-4" />
				<span>Remove from Team</span>
			</CommandItem>
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup heading="Team Filters" className="p-2">
			{teamOptions.map((team) => (
				<CommandItem key={team.slug} onSelect={() => onTeamSelect(team.slug)}>
					<team.icon className="mr-2 h-4 w-4" />
					<span>{team.title}</span>
					{selectedTeams.includes(team.slug) && (
						<Check className="ml-auto h-4 w-4" />
					)}
				</CommandItem>
			))}
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup heading="Search" className="p-2">
			<CommandItem onSelect={onSearch}>
				<Search className="mr-2 h-4 w-4" />
				<span>
					{searchText ? `Search for: ${searchText}` : "Type to search"}
				</span>
			</CommandItem>
			{searchText && (
				<CommandItem onSelect={onClearSearch}>
					<Search className="mr-2 h-4 w-4" />
					<span>Clear search</span>
				</CommandItem>
			)}
		</CommandGroup>
	</>
)

export function TeamCommand({
	selectedTeams,
	intextSearch,
	onFiltersChange,
	onMemberUpdate,
	onClose
}: TeamCommandProps) {
	const router = useRouter()
	const [searchText, setSearchText] = useState(intextSearch)
	const [mode, setMode] = useState<"filter" | "add" | "remove">("filter")
	const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
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

	const handleModeChange = (newMode: "add" | "remove") => {
		setMode(newMode)
		setSearchText("")
	}

	const handleTeamSelect = (team: string) => {
		setSelectedTeam(team)
		setSearchText("")
	}

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

	// Filter members based on selected team and search text
	const filteredMembers = useMemo(() => {
		if (!selectedTeam) {
			return []
		}

		return mockTeamMembers.filter((member) => {
			const matchesSearch =
				searchText.length === 0 ||
				member.name.toLowerCase().includes(searchText.toLowerCase()) ||
				member.email.toLowerCase().includes(searchText.toLowerCase())

			const matchesMode =
				mode === "add"
					? member.team !== selectedTeam // Show members NOT in team when adding
					: member.team === selectedTeam // Show members IN team when removing

			return matchesSearch && matchesMode
		})
	}, [selectedTeam, searchText, mode])

	const getPlaceholder = () => {
		if (!selectedTeam) {
			return mode === "filter"
				? "Type a command or search..."
				: "Select a team first..."
		}
		return `Search for members to ${mode}...`
	}

	const handleMemberUpdate = (memberId: string) => {
		if (!selectedTeam) {
			return
		}
		if (mode === "filter") {
			return
		}

		onMemberUpdate?.(memberId, selectedTeam, mode)
		setMode("filter")
		setSelectedTeam(null)
		setSearchText("")
		onClose?.()
	}

	const renderCommandList = () => {
		if (mode === "filter") {
			return (
				<FilterView
					selectedTeams={selectedTeams}
					searchText={searchText}
					onTeamSelect={toggleTeam}
					onModeChange={handleModeChange}
					onSearch={applySearch}
					onClearSearch={clearSearch}
				/>
			)
		}

		if (!selectedTeam) {
			return (
				<TeamSelector
					onSelect={handleTeamSelect}
					onBack={() => {
						setMode("filter")
						setSearchText("")
					}}
				/>
			)
		}

		return (
			<MemberSelector
				teamSlug={selectedTeam}
				mode={mode}
				members={filteredMembers}
				onSelect={handleMemberUpdate}
				onBack={() => {
					setSelectedTeam(null)
					setSearchText("")
				}}
			/>
		)
	}

	return (
		<Command className="rounded-lg border shadow-md w-[450px]">
			<CommandInput
				ref={inputRef}
				autoFocus
				placeholder={getPlaceholder()}
				value={searchText}
				onValueChange={setSearchText}
			/>
			<CommandList>
				{renderCommandList()}
				<CommandEmpty>No results found.</CommandEmpty>
			</CommandList>
		</Command>
	)
}
