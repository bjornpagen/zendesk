"use client"

import { useMemo, useRef, useState } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { mockTeamMembers } from "@/types/frontend"

interface GroupActionProps {
	teamId: string
	mode: "add" | "remove"
	onMemberUpdate: (
		memberId: string,
		teamId: string,
		action: "add" | "remove"
	) => void
	onClose?: () => void
}

export function GroupAction({
	teamId,
	mode,
	onMemberUpdate,
	onClose
}: GroupActionProps) {
	const [searchText, setSearchText] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	// Filter members based on team and search text
	const filteredMembers = useMemo(() => {
		return mockTeamMembers.filter((member) => {
			const matchesSearch =
				searchText.length === 0 ||
				member.name.toLowerCase().includes(searchText.toLowerCase()) ||
				member.email.toLowerCase().includes(searchText.toLowerCase())

			// For "add", show members NOT in the team
			// For "remove", show members IN the team
			const matchesMode =
				mode === "add" ? member.team !== teamId : member.team === teamId

			return matchesSearch && matchesMode
		})
	}, [teamId, searchText, mode])

	const handleSelect = (memberId: string) => {
		onMemberUpdate(memberId, teamId, mode)
		onClose?.()
	}

	const teamTitle = teamId === "security" ? "Security Team" : "Privacy Team"

	return (
		<Command className="rounded-lg border shadow-md w-[450px]">
			<CommandInput
				ref={inputRef}
				autoFocus
				placeholder={`Search members to ${mode === "add" ? "add to" : "remove from"} ${teamTitle}...`}
				value={searchText}
				onValueChange={setSearchText}
			/>
			<CommandList>
				<CommandGroup
					heading={`${mode === "add" ? "Add to" : "Remove from"} ${teamTitle}`}
				>
					{filteredMembers.map((member) => (
						<CommandItem
							key={member.id}
							onSelect={() => handleSelect(member.id)}
						>
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
				<CommandEmpty>No matching members found.</CommandEmpty>
			</CommandList>
		</Command>
	)
}
