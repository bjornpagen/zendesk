"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import { Search } from "lucide-react"

interface TeamsCommandProps {
	intextSearch: string
	onFiltersChange: (filters: { intext: string }) => void
	onClose?: () => void
}

export function TeamsCommand({
	intextSearch,
	onFiltersChange,
	onClose
}: TeamsCommandProps) {
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

		return () => {
			window.removeEventListener("focus", focusInput)
		}
	}, [])

	const applySearch = useCallback(() => {
		if (searchText) {
			onFiltersChange({ intext: searchText })
		}
	}, [searchText, onFiltersChange])

	const clearSearch = useCallback(() => {
		setSearchText("")
		onFiltersChange({ intext: "" })
		onClose?.()
	}, [onFiltersChange, onClose])

	return (
		<Command className="rounded-lg border shadow-md w-[450px]">
			<CommandInput
				ref={inputRef}
				autoFocus
				placeholder="Search team members..."
				value={searchText}
				onValueChange={setSearchText}
			/>
			<CommandList>
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
