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
	const [searchText, setSearchText] = useState("")

	const statusOptions = [
		{ value: "open", label: "Open", icon: Mail },
		{ value: "closed", label: "Closed", icon: CheckCircle },
		{ value: "spam", label: "Spam", icon: AlertTriangle }
	]

	const priorityOptions = [
		{ value: "urgent", label: "Urgent", icon: AlertCircle },
		{ value: "non-urgent", label: "Non-Urgent", icon: Clock }
	]

	const problemOptions = [
		{ value: "password-reset", label: "Password Reset", icon: Hash },
		{ value: "billing-issue", label: "Billing Issue", icon: Hash },
		{ value: "account-access", label: "Account Access", icon: Hash },
		{ value: "feature-request", label: "Feature Request", icon: Hash }
	]

	const getOptions = () => {
		switch (propertyType) {
			case "status":
				return statusOptions
			case "priority":
				return priorityOptions
			case "problem":
				return problemOptions
			default:
				return []
		}
	}

	const handleSelect = useCallback(
		(value: string) => {
			onChangeProperty(value)
			onClose()
		},
		[onChangeProperty, onClose]
	)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change {propertyType}</DialogTitle>
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
