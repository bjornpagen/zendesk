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
					<div className="p-4">
						<SheetHeader className="mb-4">
							<SheetTitle>User Details</SheetTitle>
						</SheetHeader>

						<div className="space-y-4">
							<div className="grid gap-2">
								<div className="font-medium">Role</div>
								<div>{userDetails.role === "admin" ? "Admin" : "Member"}</div>
							</div>

							<div className="grid gap-2">
								<div className="font-medium">Statistics</div>
								<div className="grid gap-1">
									<div>
										Total Tickets Closed: {userDetails.closedTicketsTotal}
									</div>
									<div>
										Tickets Closed Today: {userDetails.closedTicketsToday}
									</div>
									<div>
										Average Close Time: {userDetails.averageCloseTime} minutes
									</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
