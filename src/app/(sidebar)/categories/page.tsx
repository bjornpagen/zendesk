import { getCategories } from "@/server/actions/categories"
import { CategoryList } from "./components/category-list"

export default async function CategoriesPage() {
	const categories = await getCategories()

	return (
		<div className="container py-8">
			<h1 className="text-2xl font-semibold mb-8">Categories</h1>
			<CategoryList initialCategories={categories} />
		</div>
	)
}
