"use client"

import Link from "next/link"
import Masonry from "react-masonry-css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/format"
import { useThreadFilters } from "@/hooks/use-thread-filters"
import { MASONRY_BREAKPOINTS } from "@/lib/constants"

import { DashboardCommand } from "./command"
import { DashboardSelectedFilters } from "./selected-filters"

export default function Dashboard() {
	const {
		isOpen,
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		intextSearch,
		filteredThreads,
		handleOpenChange,
		onFiltersChange,
		updateSearchParams
	} = useThreadFilters()

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

			<DashboardSelectedFilters
				statuses={selectedStatuses}
				problems={selectedProblems}
				priorities={selectedPriorities}
				visibility={selectedVisibility}
				intext={intextSearch}
				onFilterRemove={(type, value) => {
					if (type === "status") {
						updateSearchParams({
							status:
								selectedStatuses.filter((s) => s !== value).join(",") ||
								undefined
						})
					} else if (type === "problem") {
						updateSearchParams({
							problem:
								selectedProblems.filter((p) => p !== value).join(",") ||
								undefined
						})
					} else if (type === "priority") {
						updateSearchParams({
							priority:
								selectedPriorities.filter((p) => p !== value).join(",") ||
								undefined
						})
					} else if (type === "visibility") {
						updateSearchParams({
							visibility:
								selectedVisibility.filter((v) => v !== value).join(",") ||
								undefined
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
				{filteredThreads.map((thread) => (
					<Link
						href={`/dashboard/thread/${thread.id}?message=${
							// biome-ignore lint/style/noNonNullAssertion: Thread messages array is guaranteed to have at least one message
							thread.messages[thread.messages.length - 1]!.id
						}`}
						key={thread.id}
					>
						<Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
							<CardContent className="flex flex-col p-4 space-y-1">
								<div className="flex justify-between items-start">
									<p className="text-sm font-medium">{thread.customerName}</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(
											// biome-ignore lint/style/noNonNullAssertion: Thread messages array is guaranteed to have at least one message
											thread.messages[thread.messages.length - 1]!.createdAt
										)}
									</p>
								</div>
								<div className="text-sm" aria-label={thread.subject}>
									<p>
										{
											// biome-ignore lint/style/noNonNullAssertion: Thread messages array is guaranteed to have at least one message
											thread.messages[thread.messages.length - 1]!.body
										}
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</Masonry>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => handleOpenChange(false)}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<DashboardCommand
							selectedStatuses={selectedStatuses}
							selectedProblems={selectedProblems}
							selectedPriorities={selectedPriorities}
							selectedVisibility={selectedVisibility}
							intextSearch={intextSearch}
							onFiltersChange={onFiltersChange}
						/>
					</div>
				</div>
			)}
		</>
	)
}
