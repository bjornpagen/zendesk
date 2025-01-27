"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Users } from "lucide-react"
import { type Category, deleteCategory } from "@/server/actions/categories"
import { CategoryDialog } from "./category-dialog"
import { getTeam } from "@/server/actions/teams"
import useSWR from "swr"

interface CategoryCardProps {
	category: Category
	onUpdate: (category: Category) => void
	onDelete: (id: string) => void
}

export function CategoryCard({
	category,
	onUpdate,
	onDelete
}: CategoryCardProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

	// Fetch team info if category has a team assigned
	const { data: team } = useSWR(
		category.teamId ? `team-${category.teamId}` : null,
		() => (category.teamId ? getTeam(category.teamId) : null)
	)

	const handleDelete = async () => {
		try {
			await deleteCategory(category.id)
			onDelete(category.id)
			console.log("Category deleted")
		} catch (error) {
			console.error("Failed to delete category")
		}
	}

	return (
		<Card className="p-6">
			<div className="flex justify-between items-start gap-4">
				<div>
					<h3 className="font-medium">{category.title}</h3>
					<p className="text-sm text-muted-foreground mt-1">
						{category.description}
					</p>
					{team && (
						<Badge variant="secondary" className="mt-2">
							<Users className="h-3 w-3 mr-1" />
							{team.name}
						</Badge>
					)}
				</div>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsEditDialogOpen(true)}
					>
						<Edit2 className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" onClick={handleDelete}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<CategoryDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				category={category}
				onSuccess={(updated: Category) => {
					onUpdate(updated)
					setIsEditDialogOpen(false)
				}}
			/>
		</Card>
	)
}
