import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SelectedFiltersProps {
	intext: string
	onFilterRemove: (type: "intext", value: string) => void
}

export function TeamSelectedFilters({
	intext,
	onFilterRemove
}: SelectedFiltersProps) {
	if (!intext) {
		return null
	}

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{intext && (
				<Badge
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("intext", intext)}
				>
					<Search className="h-4 w-4 mr-2" />
					<span>"{intext}"</span>
				</Badge>
			)}
		</div>
	)
}
