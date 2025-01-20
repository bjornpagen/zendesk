import { Shield, Lock, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TeamSelectedFiltersProps {
	teams: string[]
	intext: string
	onFilterRemove: (type: "team" | "intext", value: string) => void
}

const teamIcons: { [key: string]: React.ReactNode } = {
	security: <Shield className="h-4 w-4 mr-2" />,
	privacy: <Lock className="h-4 w-4 mr-2" />
}

const teamLabels: { [key: string]: string } = {
	security: "Security Team",
	privacy: "Privacy Team"
}

export function TeamSelectedFilters({
	teams,
	intext,
	onFilterRemove
}: TeamSelectedFiltersProps) {
	if (teams.length === 0 && !intext) {
		return null
	}

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{teams.map((team) => (
				<Badge
					key={team}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("team", team)}
				>
					{teamIcons[team]}
					<span>{teamLabels[team]}</span>
				</Badge>
			))}
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
