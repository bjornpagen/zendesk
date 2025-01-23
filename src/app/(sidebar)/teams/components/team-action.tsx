"use client"

import { useRef, useState } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import useSWR from "swr"
import {
	getTeamMembers,
	getAvailableUsers
} from "@/server/actions/team-members"
import { getTeam } from "@/server/actions/teams"

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

export function TeamsAction({
	teamId,
	mode,
	onMemberUpdate,
	onClose
}: GroupActionProps) {
	const [searchText, setSearchText] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	// Replace useEffect with useSWR
	const { data: members = [] } = useSWR(
		["teamMembers", teamId, mode, searchText],
		() =>
			mode === "add"
				? getAvailableUsers(teamId, searchText)
				: getTeamMembers(teamId, searchText)
	)

	const { data: team } = useSWR(["team", teamId], () => getTeam(teamId))

	const handleSelect = async (memberId: string) => {
		try {
			await onMemberUpdate(memberId, teamId, mode)
			onClose?.()
		} catch (error) {
			console.error("Failed to update team member:", error)
		}
	}

	return (
		<Command className="rounded-lg border shadow-md w-[450px]">
			<CommandInput
				ref={inputRef}
				autoFocus
				placeholder={`Search members to ${mode === "add" ? "add to" : "remove from"} ${team?.name || "team"}...`}
				value={searchText}
				onValueChange={setSearchText}
			/>
			<CommandList>
				<CommandGroup
					heading={`${mode === "add" ? "Add to" : "Remove from"} ${team?.name || "team"}`}
				>
					{members.map((member) => (
						<CommandItem
							key={member.clerkId}
							onSelect={() => handleSelect(member.clerkId)}
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
