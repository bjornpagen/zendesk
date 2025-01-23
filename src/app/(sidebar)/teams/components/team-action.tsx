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
import { createInvitation } from "@/server/actions/invitations"
import { UserPlus } from "lucide-react"

interface GroupActionProps {
	teamId: string
	mode: "add" | "remove" | "invite"
	onMemberUpdate: (
		memberId: string,
		teamId: string,
		action: "add" | "remove" | "invite"
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

	if (mode === "invite") {
		return (
			<Command className="rounded-lg border shadow-md w-[450px]">
				<CommandInput
					ref={inputRef}
					autoFocus
					placeholder="Enter email address to invite..."
					value={searchText}
					onValueChange={setSearchText}
				/>
				<CommandList>
					<CommandGroup heading="Invite new member">
						<CommandItem
							onSelect={async () => {
								try {
									await createInvitation(searchText, teamId)
									onClose?.()
								} catch (error) {
									console.error("Failed to invite user:", error)
								}
							}}
							disabled={!searchText.includes("@")}
						>
							<UserPlus className="h-4 w-4 mr-2" />
							<span>Invite {searchText}</span>
						</CommandItem>
					</CommandGroup>
					<CommandEmpty>Enter a valid email address to invite</CommandEmpty>
				</CommandList>
			</Command>
		)
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
