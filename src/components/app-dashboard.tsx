"use client"

import { useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Masonry from "react-masonry-css"
import { mockThreads } from "@/types/frontend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AppCommand } from "@/components/command"
import { SelectedFilters } from "@/components/selected-filters"
import { formatDate } from "@/lib/format"

export default function ZendeskDashboard() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get("command") === "open"
	const selectedStatuses = searchParams.get("status")?.split(",") || []
	const selectedProblems = searchParams.get("problem")?.split(",") || []
	const selectedPriorities = searchParams.get("priority")?.split(",") || []
	const selectedVisibility = searchParams.get("visibility")?.split(",") || []
	const intextSearch = searchParams.get("q") || ""

	const updateSearchParams = useCallback(
		(newParams: { [key: string]: string | string[] | null }) => {
			const params = new URLSearchParams(searchParams.toString())
			for (const [key, value] of Object.entries(newParams)) {
				if (value === null) {
					params.delete(key)
				} else if (Array.isArray(value)) {
					params.set(key, value.join(","))
				} else {
					params.set(key, value)
				}
			}
			router.replace(`/dashboard?${params.toString()}`)
		},
		[router, searchParams]
	)

	const handleOpenChange = useCallback(
		(open: boolean) => {
			updateSearchParams({ command: open ? "open" : null })
		},
		[updateSearchParams]
	)

	const filteredThreads = useMemo(() => {
		return mockThreads.filter((thread) => {
			const matchesStatus =
				selectedStatuses.length === 0 ||
				selectedStatuses.includes(thread.status)
			const matchesProblem =
				selectedProblems.length === 0 ||
				selectedProblems.includes(thread.problem)
			const matchesPriority =
				selectedPriorities.length === 0 ||
				selectedPriorities.includes(thread.priority)
			const matchesVisibility =
				selectedVisibility.length === 0 ||
				(selectedVisibility.includes("read") && thread.isRead) ||
				(selectedVisibility.includes("unread") && !thread.isRead)
			const matchesIntext =
				!intextSearch ||
				thread.subject.toLowerCase().includes(intextSearch.toLowerCase()) ||
				thread.messages.some((message) =>
					message.body.toLowerCase().includes(intextSearch.toLowerCase())
				)
			return (
				matchesStatus &&
				matchesProblem &&
				matchesPriority &&
				matchesVisibility &&
				matchesIntext
			)
		})
	}, [
		selectedStatuses,
		selectedProblems,
		selectedPriorities,
		selectedVisibility,
		intextSearch
	])

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				handleOpenChange(!isOpen)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [isOpen, handleOpenChange])

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				handleOpenChange(false)
			}
		}

		document.addEventListener("keydown", handleEscape)
		return () => document.removeEventListener("keydown", handleEscape)
	}, [isOpen, handleOpenChange])

	const onFiltersChange = useCallback(
		(filters: {
			statuses: string[]
			problems: string[]
			priorities: string[]
			visibility: string[]
			intext: string
		}) => {
			updateSearchParams({
				status: filters.statuses.length > 0 ? filters.statuses : null,
				problem: filters.problems.length > 0 ? filters.problems : null,
				priority: filters.priorities.length > 0 ? filters.priorities : null,
				visibility: filters.visibility.length > 0 ? filters.visibility : null,
				q: filters.intext || null
			})
		},
		[updateSearchParams]
	)

	const breakpointColumnsObj = {
		default: 6,
		1800: 5,
		1500: 4,
		1200: 3,
		900: 2,
		600: 1
	}

	return (
		<div className="min-h-screen bg-background p-4 lg:px-8 xl:px-16 flex justify-center">
			<div className="w-full max-w-[1800px]">
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
				<SelectedFilters
					statuses={selectedStatuses}
					problems={selectedProblems}
					priorities={selectedPriorities}
					visibility={selectedVisibility}
					intext={intextSearch}
					onFilterRemove={(type, value) => {
						if (type === "status") {
							updateSearchParams({
								status:
									selectedStatuses.filter((s) => s !== value).join(",") || null
							})
						} else if (type === "problem") {
							updateSearchParams({
								problem:
									selectedProblems.filter((p) => p !== value).join(",") || null
							})
						} else if (type === "priority") {
							updateSearchParams({
								priority:
									selectedPriorities.filter((p) => p !== value).join(",") ||
									null
							})
						} else if (type === "visibility") {
							updateSearchParams({
								visibility:
									selectedVisibility.filter((v) => v !== value).join(",") ||
									null
							})
						} else if (type === "intext") {
							updateSearchParams({ q: null })
						}
					}}
				/>
				<Masonry
					breakpointCols={breakpointColumnsObj}
					className="flex w-auto -ml-4"
					columnClassName="pl-4 bg-clip-padding"
				>
					{filteredThreads.map((thread) => (
						<Link
							href={`/dashboard/thread/${thread.id}?message=${thread.messages[thread.messages.length - 1].id}`}
							key={thread.id}
						>
							<Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="flex flex-col p-4 space-y-1">
									<div className="flex justify-between items-start">
										<p className="text-sm font-medium">{thread.customerName}</p>
										<p className="text-xs text-muted-foreground">
											{formatDate(
												thread.messages[thread.messages.length - 1].createdAt
											)}
										</p>
									</div>
									<div className="text-sm" aria-label={thread.subject}>
										<p>{thread.messages[thread.messages.length - 1].body}</p>
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
							<AppCommand
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
			</div>
		</div>
	)
}
