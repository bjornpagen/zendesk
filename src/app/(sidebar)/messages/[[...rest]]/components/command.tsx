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
import {
	Mail,
	CheckCircle,
	AlertTriangle,
	Eye,
	EyeOff,
	Hash,
	Search,
	AlertCircle,
	Clock,
	MessageCircle,
	MessageCircleOff
} from "lucide-react"
import useSWR from "swr"
import { getProblems, type Problem } from "@/server/actions/problems"

interface AppCommandProps {
	selectedStatuses: string[]
	selectedProblems: string[]
	selectedPriorities: string[]
	selectedVisibility: string[]
	selectedNeedsResponse: string[]
	intextSearch: string
	onFiltersChange: (filters: {
		statuses: string[]
		problems: string[]
		priorities: string[]
		visibility: string[]
		needsResponse: string[]
		intext: string
	}) => void
}

export function MessagesCommand({
	selectedStatuses,
	selectedProblems,
	selectedPriorities,
	selectedVisibility,
	selectedNeedsResponse,
	intextSearch,
	onFiltersChange
}: AppCommandProps) {
	const [searchText, setSearchText] = useState(intextSearch)

	const inputRef = useRef<HTMLInputElement>(null)

	const { data: problems = [] } = useSWR<Problem[]>("problems", getProblems)

	useEffect(() => {
		const focusInput = () => {
			if (inputRef.current) {
				inputRef.current.focus()
			}
		}

		// Focus when the window gains focus
		window.addEventListener("focus", focusInput)

		// Initial focus
		focusInput()

		return () => {
			window.removeEventListener("focus", focusInput)
		}
	}, [])

	const toggleStatus = useCallback(
		(status: string) => {
			const newStatuses = selectedStatuses.includes(status)
				? selectedStatuses.filter((s) => s !== status)
				: [...selectedStatuses, status]
			onFiltersChange({
				statuses: newStatuses,
				problems: selectedProblems,
				priorities: selectedPriorities,
				visibility: selectedVisibility,
				needsResponse: selectedNeedsResponse,
				intext: intextSearch
			})
		},
		[
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedVisibility,
			selectedNeedsResponse,
			intextSearch,
			onFiltersChange
		]
	)

	const toggleProblem = useCallback(
		(problem: string) => {
			const newProblems = selectedProblems.includes(problem)
				? selectedProblems.filter((p) => p !== problem)
				: [...selectedProblems, problem]
			onFiltersChange({
				statuses: selectedStatuses,
				problems: newProblems,
				priorities: selectedPriorities,
				visibility: selectedVisibility,
				needsResponse: selectedNeedsResponse,
				intext: intextSearch
			})
		},
		[
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedVisibility,
			selectedNeedsResponse,
			intextSearch,
			onFiltersChange
		]
	)

	const togglePriority = useCallback(
		(priority: string) => {
			const newPriorities = selectedPriorities.includes(priority)
				? selectedPriorities.filter((p) => p !== priority)
				: [...selectedPriorities, priority]
			onFiltersChange({
				statuses: selectedStatuses,
				problems: selectedProblems,
				priorities: newPriorities,
				visibility: selectedVisibility,
				needsResponse: selectedNeedsResponse,
				intext: intextSearch
			})
		},
		[
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedVisibility,
			selectedNeedsResponse,
			intextSearch,
			onFiltersChange
		]
	)

	const toggleVisibility = useCallback(
		(visibility: string) => {
			const newVisibility = selectedVisibility.includes(visibility)
				? selectedVisibility.filter((v) => v !== visibility)
				: [...selectedVisibility, visibility]
			onFiltersChange({
				statuses: selectedStatuses,
				problems: selectedProblems,
				priorities: selectedPriorities,
				visibility: newVisibility,
				needsResponse: selectedNeedsResponse,
				intext: intextSearch
			})
		},
		[
			selectedVisibility,
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedNeedsResponse,
			intextSearch,
			onFiltersChange
		]
	)

	const toggleNeedsResponse = useCallback(
		(value: string) => {
			const newNeedsResponse = selectedNeedsResponse.includes(value)
				? selectedNeedsResponse.filter((r) => r !== value)
				: [...selectedNeedsResponse, value]
			onFiltersChange({
				statuses: selectedStatuses,
				problems: selectedProblems,
				priorities: selectedPriorities,
				visibility: selectedVisibility,
				needsResponse: newNeedsResponse,
				intext: intextSearch
			})
		},
		[
			selectedNeedsResponse,
			selectedStatuses,
			selectedProblems,
			selectedPriorities,
			selectedVisibility,
			intextSearch,
			onFiltersChange
		]
	)

	const applySearch = useCallback(() => {
		if (searchText) {
			onFiltersChange({
				statuses: selectedStatuses,
				problems: selectedProblems,
				priorities: selectedPriorities,
				visibility: selectedVisibility,
				needsResponse: selectedNeedsResponse,
				intext: searchText
			})
		}
	}, [
		searchText,
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		selectedNeedsResponse,
		onFiltersChange
	])

	const clearSearch = useCallback(() => {
		setSearchText("")
		onFiltersChange({
			statuses: selectedStatuses,
			problems: selectedProblems,
			priorities: selectedPriorities,
			visibility: selectedVisibility,
			needsResponse: selectedNeedsResponse,
			intext: ""
		})
	}, [
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		selectedNeedsResponse,
		onFiltersChange
	])

	const invisibleStyle =
		"absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-rect-0 border-0 whitespace-nowrap"

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
				<CommandGroup heading="Filter Status" className="p-2">
					<CommandItem onSelect={() => toggleStatus("open")}>
						<Mail className="mr-2 h-4 w-4" />
						<span>Open</span>
						<span className={invisibleStyle}>status:open</span>
					</CommandItem>
					<CommandItem onSelect={() => toggleStatus("closed")}>
						<CheckCircle className="mr-2 h-4 w-4" />
						<span>Closed</span>
						<span className={invisibleStyle}>status:closed</span>
					</CommandItem>
					<CommandItem onSelect={() => toggleStatus("spam")}>
						<AlertTriangle className="mr-2 h-4 w-4" />
						<span>Spam</span>
						<span className={invisibleStyle}>status:spam</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Filter Response Status" className="p-2">
					<CommandItem onSelect={() => toggleNeedsResponse("true")}>
						<MessageCircle className="mr-2 h-4 w-4" />
						<span>Needs Response</span>
						<span className={invisibleStyle}>needsResponse:true</span>
					</CommandItem>
					<CommandItem onSelect={() => toggleNeedsResponse("false")}>
						<MessageCircleOff className="mr-2 h-4 w-4" />
						<span>Responded</span>
						<span className={invisibleStyle}>needsResponse:false</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Filter Visibility" className="p-2">
					<CommandItem onSelect={() => toggleVisibility("read")}>
						<Eye className="mr-2 h-4 w-4" />
						<span>Read</span>
						<span className={invisibleStyle}>visibility:read</span>
					</CommandItem>
					<CommandItem onSelect={() => toggleVisibility("unread")}>
						<EyeOff className="mr-2 h-4 w-4" />
						<span>Unread</span>
						<span className={invisibleStyle}>visibility:unread</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Filter Priority" className="p-2">
					<CommandItem onSelect={() => togglePriority("urgent")}>
						<AlertCircle className="mr-2 h-4 w-4" />
						<span>Urgent</span>
						<span className={invisibleStyle}>priority:urgent</span>
					</CommandItem>
					<CommandItem onSelect={() => togglePriority("non-urgent")}>
						<Clock className="mr-2 h-4 w-4" />
						<span>Non-Urgent</span>
						<span className={invisibleStyle}>priority:non-urgent</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Filter Problems" className="p-2">
					{problems.map((problem) => (
						<CommandItem
							key={problem.id}
							onSelect={() => toggleProblem(problem.id)}
						>
							<Hash className="mr-2 h-4 w-4" />
							<span className="capitalize">{problem.title}</span>
							<span className={invisibleStyle}>problem:{problem.title}</span>
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
						<span className={invisibleStyle}>intext:{searchText}</span>
					</CommandItem>
					{searchText && (
						<CommandItem onSelect={clearSearch}>
							<AlertCircle className="mr-2 h-4 w-4" />
							<span>Clear search</span>
						</CommandItem>
					)}
				</CommandGroup>
				<CommandSeparator />
				<CommandEmpty>No results found.</CommandEmpty>
			</CommandList>
		</Command>
	)
}
