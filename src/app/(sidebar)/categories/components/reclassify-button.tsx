"use client"

import { Button } from "@/components/ui/button"
import { reclassifyAllTickets } from "@/server/actions/problems"
import { useState } from "react"
import { RefreshCw } from "lucide-react"

export function ReclassifyButton() {
	const [isLoading, setIsLoading] = useState(false)
	const [status, setStatus] = useState<string>("")

	const handleReclassify = async () => {
		try {
			setIsLoading(true)
			setStatus("")
			const result = await reclassifyAllTickets()
			setStatus(
				`Processed ${result.processed} tickets${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}${result.failed > 0 ? `, ${result.failed} failed` : ""}`
			)
		} catch (error) {
			setStatus("Failed to reclassify tickets")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="secondary"
				onClick={handleReclassify}
				disabled={isLoading}
			>
				<RefreshCw className="h-4 w-4 mr-2" />
				{isLoading ? "Reclassifying..." : "Reclassify All"}
			</Button>
			{status && (
				<span className="text-sm text-muted-foreground">{status}</span>
			)}
		</div>
	)
}
