"use client"

import { Button } from "@/components/ui/button"
import { reclassifyAllTickets } from "@/server/actions/problems"
import { RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function ReclassifyButton() {
	const handleReclassify = () => {
		toast({
			title: "Reclassifying tickets",
			description: "This may take a while in the background"
		})

		reclassifyAllTickets()
			.then(() => {
				toast({
					title: "Reclassification started",
					description: "The tickets will be updated in the background"
				})
			})
			.catch(() => {
				toast({
					title: "Error",
					description: "Failed to start reclassification",
					variant: "destructive"
				})
			})
	}

	return (
		<Button variant="secondary" onClick={handleReclassify}>
			<RefreshCw className="h-4 w-4 mr-2" />
			Reclassify All
		</Button>
	)
}
