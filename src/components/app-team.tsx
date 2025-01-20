"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Masonry from "react-masonry-css"
import { mockTeamMembers } from "@/types/frontend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/format"
import { MASONRY_BREAKPOINTS } from "@/lib/constants"

export default function AppTeam() {
	const breakpointColumnsObj = MASONRY_BREAKPOINTS

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="bg-black hover:bg-black/90"
					>
						<Search className="h-4 w-4 text-white" />
					</Button>
					<p className="text-sm text-muted-foreground">
						{mockTeamMembers.length} team members
					</p>
				</div>
			</div>

			<Masonry
				breakpointCols={breakpointColumnsObj}
				className="flex w-auto -ml-4"
				columnClassName="pl-4 bg-clip-padding"
			>
				{mockTeamMembers.map((member) => (
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
		</>
	)
}
