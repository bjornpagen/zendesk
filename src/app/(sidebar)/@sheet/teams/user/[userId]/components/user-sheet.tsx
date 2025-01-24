"use client"

import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserDetails } from "@/server/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { Clock, Mail, Ticket } from "lucide-react"

export default function UserSheet() {
	const params = useParams()
	const router = useRouter()
	const { data: userDetails, mutate } = useSWR(
		params.userId ? ["userDetails", params.userId] : null,
		() => getUserDetails(params.userId as string)
	)

	const handleClose = () => {
		router.back()
	}

	if (!userDetails) {
		return null
	}

	return (
		<Sheet defaultOpen open onOpenChange={handleClose}>
			<SheetContent className="sm:max-w-[600px] p-0">
				<ScrollArea className="h-full">
					<div className="p-6">
						<SheetHeader className="mb-6">
							<div className="flex items-center gap-6">
								<Avatar className="h-20 w-20">
									<AvatarImage src={userDetails.avatar} />
									<AvatarFallback className="text-lg">
										{userDetails.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-1">
									<SheetTitle className="text-2xl font-display">
										{userDetails.name}
									</SheetTitle>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Mail className="h-4 w-4" />
										<span>{userDetails.email}</span>
									</div>
									<div className="pt-2">
										{userDetails.role === "admin" ? (
											<Badge
												variant="default"
												className="bg-purple-500 hover:bg-purple-600"
											>
												Admin
											</Badge>
										) : (
											<Badge variant="secondary">Member</Badge>
										)}
									</div>
								</div>
							</div>
						</SheetHeader>

						<div className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<h3 className="font-semibold mb-4 flex items-center gap-2">
										<Ticket className="h-4 w-4" />
										Support Statistics
									</h3>
									<div className="grid gap-4 sm:grid-cols-3">
										<div>
											<div className="text-2xl font-semibold">
												{userDetails.closedTicketsTotal}
											</div>
											<div className="text-sm text-muted-foreground">
												Total Tickets Closed
											</div>
										</div>
										<div>
											<div className="text-2xl font-semibold">
												{userDetails.closedTicketsToday}
											</div>
											<div className="text-sm text-muted-foreground">
												Closed Today
											</div>
										</div>
										<div>
											<div className="text-2xl font-semibold flex items-center gap-2">
												<Clock className="h-4 w-4" />
												{userDetails.averageCloseTime}m
											</div>
											<div className="text-sm text-muted-foreground">
												Average Close Time
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<div>
								<h3 className="text-sm font-medium mb-4">Recent Activity</h3>
								<div className="text-sm text-muted-foreground">
									Member since {formatDate(userDetails.createdAt)}
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
