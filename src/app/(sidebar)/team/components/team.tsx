"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Masonry from "react-masonry-css"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/format"
import { MASONRY_BREAKPOINTS } from "@/lib/constants"
import { useTeamFilters } from "@/hooks/use-team-filters"

import { TeamCommand } from "./command"
import { TeamSelectedFilters } from "./selected-filters"

export default function Team() {
	const {
		isOpen,
		selectedTeams,
		intextSearch,
		filteredTeamMembers,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	} = useTeamFilters()

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

			<TeamSelectedFilters
				teams={selectedTeams}
				intext={intextSearch}
				onFilterRemove={(type, value) => {
					if (type === "team") {
						updateSearchParams({
							team:
								selectedTeams.filter((t) => t !== value).join(",") || undefined
						})
					} else if (type === "intext") {
						updateSearchParams({ q: undefined })
					}
				}}
			/>

			<Masonry
				breakpointCols={MASONRY_BREAKPOINTS}
				className="flex w-auto -ml-4"
				columnClassName="pl-4 bg-clip-padding"
			>
				{filteredTeamMembers.map((member) => (
					<Card
						key={member.id}
						className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
					>
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
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-medium">{member.name}</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										{member.email}
									</p>
								</div>
							</div>
							<div className="flex items-center justify-end">
								<p className="text-xs text-muted-foreground">
									Joined {formatDate(member.createdAt)}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</Masonry>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => handleOpenChange(false)}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<TeamCommand
							selectedTeams={selectedTeams}
							intextSearch={intextSearch}
							onFiltersChange={onFiltersChange}
						/>
					</div>
				</div>
			)}
		</>
	)
}
