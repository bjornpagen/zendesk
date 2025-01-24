"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserName, updateUserName } from "@/server/actions/user"
import { cn } from "@/lib/utils"
import useSWR from "swr"

interface UserNameDisplayProps {
	className?: string
}

export function UserNameDisplay({ className }: UserNameDisplayProps) {
	const { user } = useUser()
	const [isEditing, setIsEditing] = useState(false)
	const [name, setName] = useState("")

	const { data: dbName } = useSWR("userName", getUserName)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await updateUserName(name)
			setIsEditing(false)
		} catch (error) {
			console.error("Failed to update name:", error)
		}
	}

	if (!user) {
		return null
	}

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setName(dbName || "")
					setIsEditing(true)
				}}
				className={cn(
					"text-sm font-medium hover:text-foreground/80 transition-colors text-left",
					className
				)}
			>
				{dbName || "Loading..."}
			</button>

			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Update Name</DialogTitle>
						<DialogDescription>
							Enter your new name below. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Name
								</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="col-span-3"
									autoComplete="name"
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}
