"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
import {
	type Category,
	createCategory,
	updateCategory
} from "@/server/actions/categories"
import { getTeamMembers } from "@/server/actions/teams"
import useSWR from "swr"

interface CategoryDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	category?: Category
	onSuccess: (category: Category) => void
}

export function CategoryDialog({
	open,
	onOpenChange,
	category,
	onSuccess
}: CategoryDialogProps) {
	const [title, setTitle] = useState(category?.title ?? "")
	const [description, setDescription] = useState(category?.description ?? "")
	const [teamId, setTeamId] = useState(category?.teamId ?? null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Fetch teams for the dropdown
	const { data: teamMembers = [] } = useSWR("team-members", getTeamMembers)
	const teams = Array.from(
		new Map(
			teamMembers.map((m) => [m.teamId, { id: m.teamId, name: m.team }])
		).values()
	)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data = { title, description, teamId }
			const result = category
				? await updateCategory(category.id, data)
				: await createCategory(data)

			onSuccess(result)
			console.log(category ? "Category updated" : "Category created")
		} catch (error) {
			console.error(
				category ? "Failed to update category" : "Failed to create category"
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{category ? "Edit Category" : "New Category"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Input
							placeholder="Title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Textarea
							placeholder="Description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Select
							value={teamId ?? undefined}
							onValueChange={(value) => setTeamId(value || null)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Team (Optional)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">No Team</SelectItem>
								{teams.map((team) => (
									<SelectItem key={team.id} value={team.id}>
										{team.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{category ? "Save Changes" : "Create Category"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
