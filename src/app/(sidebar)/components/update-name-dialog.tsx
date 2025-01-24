"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserName } from "@/server/actions/user"

export function UpdateNameDialog() {
	const [name, setName] = useState("")
	const [open, setOpen] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await updateUserName(name)
			setOpen(false)
		} catch (error) {
			console.error("Failed to update name:", error)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Change Name</Button>
			</DialogTrigger>
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
	)
}
