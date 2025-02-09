"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, UserMinus, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { useTeamFilters } from "@/hooks/use-team-filters"
import { useMemo, useState, useCallback } from "react"
import { TeamsSelectedFilters } from "./selected-filters"
import { TeamsAction } from "./team-action"
import { TeamsCommand } from "./command"
import { mutate } from "swr"
import { addTeamMember, removeTeamMember } from "@/server/actions/team-members"
import type { TeamMember } from "@/server/actions/teams"
import Link from "next/link"

export default function Teams() {
	const {
		isOpen,
		intextSearch,
		filteredTeamMembers,
		currentUserRole,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	} = useTeamFilters()

	const [selectedAction, setSelectedAction] = useState<
		"add" | "remove" | "invite" | null
	>(null)
	const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

	const isAdmin = currentUserRole === "admin"

	// Group members by team and store team IDs
	const groupedMembers = useMemo(() => {
		const groups: {
			[key: string]: {
				members: TeamMember[]
				teamId: string
			}
		} = {}

		for (const member of filteredTeamMembers) {
			if (!groups[member.team]) {
				groups[member.team] = {
					members: [],
					teamId: member.teamId
				}
			}
			// biome-ignore lint/style/noNonNullAssertion: Property existence verified by preceding if-check
			groups[member.team]!.members.push(member)
		}

		return groups
	}, [filteredTeamMembers])

	// Get team labels from the teamOptions constant
	const teamLabels: { [key: string]: string } = {
		security: "Security Team",
		privacy: "Privacy Team"
	}

	const handleTeamAction = useCallback(
		async (
			memberId: string,
			teamId: string,
			action: "add" | "remove" | "invite"
		) => {
			if (!isAdmin) {
				console.error("Unauthorized: Admin role required")
				return
			}

			try {
				switch (action) {
					case "add":
						await addTeamMember(memberId, teamId)
						break
					case "remove":
						await removeTeamMember(memberId, teamId)
						break
					case "invite":
						// No-op since invite is handled directly in TeamsAction
						break
				}
				await mutate((key) => Array.isArray(key) && key[0] === "teamMembers")
			} catch (error) {
				console.error("Failed to update team member:", error)
			}
		},
		[isAdmin]
	)

	const handleClose = () => {
		handleOpenChange(false)
		setSelectedAction(null)
		setSelectedTeam(null)
	}

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="bg-black hover:bg-black/90"
						onClick={() => handleOpenChange(true)}
					>
						<Search className="h-4 w-4 text-white" />
					</Button>
					<p className="text-sm text-muted-foreground">
						Press{" "}
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">⌘</span>J
						</kbd>
					</p>
				</div>
			</div>

			<TeamsSelectedFilters
				intext={intextSearch}
				onFilterRemove={(type) => {
					if (type === "intext") {
						updateSearchParams({ q: undefined })
					}
				}}
			/>

			<div className="space-y-8">
				{Object.entries(groupedMembers).map(
					([teamName, { members, teamId }]) => (
						<div key={teamId} className="space-y-6 px-0 rounded-lg">
							<div className="flex justify-between items-center mb-4">
								<div>
									<h2 className="text-xl font-semibold text-gray-800 inline-block font-display">
										{teamLabels[teamName] || teamName}
									</h2>
									<span className="text-sm text-muted-foreground ml-3">
										({members.length}{" "}
										{members.length === 1 ? "member" : "members"})
									</span>
								</div>
								{isAdmin && (
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedAction("invite")
												setSelectedTeam(teamId)
												handleOpenChange(true)
											}}
											title={`Invite new member to ${teamLabels[teamName]}`}
										>
											<Mail className="h-4 w-4 mr-2" />
											Invite
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedAction("add")
												setSelectedTeam(teamId)
												handleOpenChange(true)
											}}
											title={`Add member to ${teamLabels[teamName]}`}
										>
											<UserPlus className="h-4 w-4 mr-2" />
											Add
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedAction("remove")
												setSelectedTeam(teamId)
												handleOpenChange(true)
											}}
											title={`Remove member from ${teamLabels[teamName]}`}
										>
											<UserMinus className="h-4 w-4 mr-2" />
											Remove
										</Button>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{members.map((member) => (
									<Link
										key={member.clerkId}
										href={`/teams/user/${member.clerkId}`}
										className="block"
									>
										<Card className="cursor-pointer hover:shadow-md transition-shadow">
											<CardContent className="flex flex-col p-4 space-y-4">
												<div className="flex items-start gap-4">
													<Avatar>
														<AvatarImage src={member.avatar} />
														<AvatarFallback>
															{member.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
															{member.name}
														</h3>
														<p className="text-sm text-gray-500 truncate">
															{member.email}
														</p>
													</div>
												</div>
												<div className="flex items-center justify-between">
													{member.role === "admin" ? (
														<Badge
															variant="default"
															className="bg-purple-500 hover:bg-purple-600"
														>
															Admin
														</Badge>
													) : (
														<Badge variant="secondary">Member</Badge>
													)}
													<p className="text-xs text-gray-400">
														Joined {formatDate(member.createdAt)}
													</p>
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						</div>
					)
				)}
			</div>

			{isOpen && !selectedAction && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={handleClose}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<TeamsCommand
							intextSearch={intextSearch}
							onFiltersChange={onFiltersChange}
							onClose={handleClose}
						/>
					</div>
				</div>
			)}

			{isOpen && selectedAction && selectedTeam && isAdmin && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={handleClose}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<TeamsAction
							teamId={selectedTeam}
							mode={selectedAction}
							onMemberUpdate={handleTeamAction}
							onClose={handleClose}
						/>
					</div>
				</div>
			)}
		</>
	)
}
