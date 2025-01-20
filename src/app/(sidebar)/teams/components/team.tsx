"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, UserMinus } from "lucide-react"
import Masonry from "react-masonry-css"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/format"
import { MASONRY_BREAKPOINTS } from "@/lib/constants"
import { useTeamFilters } from "@/hooks/use-team-filters"
import { useMemo, useState } from "react"
import type { TeamMemberUpdate } from "@/types/frontend"
import { TeamsSelectedFilters } from "./selected-filters"

import { TeamsAction } from "./team-action"
import { TeamsCommand } from "./command"

export default function Teams() {
	const {
		isOpen,
		intextSearch,
		filteredTeamMembers,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	} = useTeamFilters()

	const [selectedAction, setSelectedAction] = useState<"add" | "remove" | null>(
		null
	)
	const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

	// Group members by team
	const groupedMembers = useMemo(() => {
		const groups: { [key: string]: typeof filteredTeamMembers } = {}

		for (const member of filteredTeamMembers) {
			if (!groups[member.team]) {
				groups[member.team] = []
			}
			// biome-ignore lint/style/noNonNullAssertion: We know this exists because we initialize it in the if statement above
			groups[member.team]!.push(member)
		}

		return groups
	}, [filteredTeamMembers])

	// Get team labels from the teamOptions constant
	const teamLabels: { [key: string]: string } = {
		security: "Security Team",
		privacy: "Privacy Team"
	}

	const handleTeamAction = (action: TeamMemberUpdate) => {
		console.log("Team action:", action)
		// TODO: Implement the actual team management logic
	}

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
				{Object.entries(groupedMembers).map(([team, members]) => (
					<div key={team} className="space-y-6 px-0 rounded-lg">
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-xl font-semibold text-gray-800 inline-block font-display">
									{teamLabels[team] || team}
								</h2>
								<span className="text-sm text-muted-foreground ml-3">
									({members.length}{" "}
									{members.length === 1 ? "member" : "members"})
								</span>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setSelectedAction("add")
										setSelectedTeam(team)
										handleOpenChange(true)
									}}
									title={`Add member to ${teamLabels[team]}`}
								>
									<UserPlus className="h-4 w-4 mr-2" />
									Add
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setSelectedAction("remove")
										setSelectedTeam(team)
										handleOpenChange(true)
									}}
									title={`Remove member from ${teamLabels[team]}`}
								>
									<UserMinus className="h-4 w-4 mr-2" />
									Remove
								</Button>
							</div>
						</div>

						<Masonry
							breakpointCols={MASONRY_BREAKPOINTS}
							className="flex w-auto -ml-4"
							columnClassName="pl-4 bg-clip-padding"
						>
							{members.map((member) => (
								<Card
									key={member.id}
									className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
								>
									<CardContent className="flex flex-col p-4 space-y-3">
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
												<h3 className="text-sm font-medium text-gray-900 truncate">
													{member.name}
												</h3>
												<p className="text-sm text-gray-500 truncate">
													{member.email}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-end">
											<p className="text-xs text-gray-400">
												Joined {formatDate(member.createdAt)}
											</p>
										</div>
									</CardContent>
								</Card>
							))}
						</Masonry>
					</div>
				))}
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

			{isOpen && selectedAction && selectedTeam && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={handleClose}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<TeamsAction
							teamId={selectedTeam}
							mode={selectedAction}
							onMemberUpdate={(memberId, teamId, action) =>
								handleTeamAction({ memberId, teamId, action })
							}
							onClose={handleClose}
						/>
					</div>
				</div>
			)}
		</>
	)
}
