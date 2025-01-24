"use client"

import { useState, useCallback } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import {
	Mail,
	CheckCircle,
	AlertTriangle,
	Hash,
	AlertCircle,
	Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { getProblems, type Problem } from "@/server/actions/problems"
import { updateThreadProperty } from "@/server/actions/thread"
import { useParams } from "next/navigation"

interface ChangeThreadPropertyDialogProps {
	isOpen: boolean
	onClose: () => void
	propertyType: "status" | "priority" | "problem"
	currentValue: string
	onChangeProperty: (newValue: string) => void
}

export function ChangeThreadPropertyDialog({
	isOpen,
	onClose,
	propertyType,
	currentValue,
	onChangeProperty
}: ChangeThreadPropertyDialogProps) {
	const params = useParams()
	const [searchText, setSearchText] = useState("")
	const { data: problems = [] } = useSWR<Problem[]>("problems", getProblems)
	const { mutate: mutateThread } = useSWR(
		params.id ? ["thread", params.id] : null
	)

	const statusOptions = [
		{ value: "open", label: "Open", icon: Mail },
		{ value: "closed", label: "Closed", icon: CheckCircle },
		{ value: "spam", label: "Spam", icon: AlertTriangle }
	]

	const priorityOptions = [
		{ value: "urgent", label: "Urgent", icon: AlertCircle },
		{ value: "non-urgent", label: "Non-Urgent", icon: Clock }
	]

	const getOptions = () => {
		switch (propertyType) {
			case "status":
				return statusOptions
			case "priority":
				return priorityOptions
			case "problem":
				return problems.map((problem) => ({
					value: problem.id,
					label: problem.title,
					icon: Hash
				}))
			default:
				return []
		}
	}

	const handleSelect = useCallback(
		async (value: string) => {
			if (!params.id) {
				return
			}

			// Map propertyType to database field
			const dbField = propertyType === "problem" ? "problemId" : propertyType

			try {
				// Optimistically update UI
				onChangeProperty(value)
				onClose()

				// Update database
				await updateThreadProperty(params.id as string, dbField, value)

				// Revalidate thread data
				await mutateThread()
			} catch (error) {
				console.error("Failed to update thread property:", error)
				// TODO: Show error toast

				// Revert optimistic update on error
				onChangeProperty(currentValue)
			}
		},
		[
			params.id,
			propertyType,
			onChangeProperty,
			onClose,
			mutateThread,
			currentValue
		]
	)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Change {propertyType === "problem" ? "category" : propertyType}
					</DialogTitle>
				</DialogHeader>
				<Command className="rounded-lg border shadow-md">
					<CommandInput
						placeholder={`Search ${propertyType}...`}
						value={searchText}
						onValueChange={setSearchText}
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{getOptions().map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => handleSelect(option.value)}
									className={cn(
										option.value === currentValue &&
											"bg-accent text-accent-foreground"
									)}
								>
									<option.icon className="mr-2 h-4 w-4" />
									<span>{option.label}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	)
}
