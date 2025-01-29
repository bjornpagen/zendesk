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
import { getAssignableUsers, type AssignableUser } from "@/server/actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChangeThreadPropertyDialogProps {
	isOpen: boolean
	onClose: () => void
	propertyType: "status" | "priority" | "problem" | "assignee"
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
	const { data: assignableUsers = [] } = useSWR<AssignableUser[]>(
		"assignableUsers",
		getAssignableUsers
	)
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
			case "assignee":
				return [
					{
						value: "",
						label: "Unassigned",
						icon: () => (
							<Avatar className="h-4 w-4">
								<AvatarFallback>?</AvatarFallback>
							</Avatar>
						)
					},
					...assignableUsers.map((user) => ({
						value: user.clerkId,
						label: user.name,
						icon: () => (
							<Avatar className="h-4 w-4">
								<AvatarImage src={user.avatar} />
								<AvatarFallback>{user.name[0]}</AvatarFallback>
							</Avatar>
						)
					}))
				]
			default:
				return []
		}
	}

	const getDialogTitle = () => {
		if (propertyType === "problem") {
			return "Change category"
		}
		if (propertyType === "assignee") {
			return "Assign thread"
		}
		return `Change ${propertyType}`
	}

	const getPlaceholder = () => {
		if (propertyType === "assignee") {
			return "Search users..."
		}
		return `Search ${propertyType}...`
	}

	const handleSelect = useCallback(
		async (value: string) => {
			if (!params.id) {
				return
			}

			// Map the UI property type to the database field name
			const dbField = (() => {
				switch (propertyType) {
					case "problem":
						return "problemId"
					case "assignee":
						return "assignedToClerkId"
					default:
						return propertyType
				}
			})()

			try {
				// Optimistically update UI
				onChangeProperty(value)
				onClose()

				// Update database with correct field type
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
					<DialogTitle>{getDialogTitle()}</DialogTitle>
				</DialogHeader>
				<Command className="rounded-lg border shadow-md">
					<CommandInput
						placeholder={getPlaceholder()}
						value={searchText}
						onValueChange={setSearchText}
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{getOptions().map((option) => {
								const IconComponent = option.icon
								return (
									<CommandItem
										key={option.value}
										onSelect={() => handleSelect(option.value)}
										className={cn(
											option.value === currentValue &&
												"bg-accent text-accent-foreground"
										)}
									>
										{typeof IconComponent === "function" ? (
											<IconComponent />
										) : (
											// @ts-expect-error
											<IconComponent className="mr-2 h-4 w-4" />
										)}
										<span className="ml-2">{option.label}</span>
									</CommandItem>
								)
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	)
}
