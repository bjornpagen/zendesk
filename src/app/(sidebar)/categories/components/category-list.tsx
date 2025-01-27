"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Category } from "@/server/actions/categories"
import { CategoryDialog } from "./category-dialog"
import { CategoryCard } from "./category-card"

interface CategoryListProps {
	initialCategories: Category[]
}

export function CategoryList({ initialCategories }: CategoryListProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [categories, setCategories] = useState(initialCategories)

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div className="text-sm text-muted-foreground">
					{categories.length} categories
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					New Category
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						category={category}
						onUpdate={(updated: Category) => {
							setCategories(
								categories.map((c) => (c.id === updated.id ? updated : c))
							)
						}}
						onDelete={(id: string) => {
							setCategories(categories.filter((c) => c.id !== id))
						}}
					/>
				))}
			</div>

			<CategoryDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSuccess={(newCategory: Category) => {
					setCategories([newCategory, ...categories])
					setIsCreateDialogOpen(false)
				}}
			/>
		</div>
	)
}
