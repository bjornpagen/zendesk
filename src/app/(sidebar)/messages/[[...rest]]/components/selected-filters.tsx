import {
	Mail,
	CheckCircle,
	AlertTriangle,
	Eye,
	EyeOff,
	Hash,
	Search,
	AlertCircle,
	Clock,
	MessageCircle,
	MessageCircleOff
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SelectedFiltersProps {
	statuses: string[]
	problems: string[]
	priorities: string[]
	visibility: string[]
	needsResponse: string[]
	intext: string
	onFilterRemove: (
		type:
			| "status"
			| "problem"
			| "priority"
			| "intext"
			| "visibility"
			| "needsResponse",
		value: string
	) => void
}

const statusIcons: { [key: string]: React.ReactNode } = {
	open: <Mail className="h-4 w-4 mr-2" />,
	closed: <CheckCircle className="h-4 w-4 mr-2" />,
	spam: <AlertTriangle className="h-4 w-4 mr-2" />,
	read: <Eye className="h-4 w-4 mr-2" />,
	unread: <EyeOff className="h-4 w-4 mr-2" />
}

const priorityIcons: { [key: string]: React.ReactNode } = {
	urgent: <AlertCircle className="h-4 w-4 mr-2" />,
	default: <Clock className="h-4 w-4 mr-2" />
}

const visibilityIcons: { [key: string]: React.ReactNode } = {
	read: <Eye className="h-4 w-4 mr-2" />,
	unread: <EyeOff className="h-4 w-4 mr-2" />,
	all: <Hash className="h-4 w-4 mr-2" />
}

const responseIcons: { [key: string]: React.ReactNode } = {
	true: <MessageCircle className="h-4 w-4 mr-2" />,
	false: <MessageCircleOff className="h-4 w-4 mr-2" />
}

const responseLabels: { [key: string]: string } = {
	true: "Needs Response",
	false: "Responded"
}

export function MessagesSelectedFilters({
	statuses,
	problems,
	priorities,
	visibility,
	needsResponse,
	intext,
	onFilterRemove
}: SelectedFiltersProps) {
	if (
		statuses.length === 0 &&
		problems.length === 0 &&
		priorities.length === 0 &&
		visibility.length === 0 &&
		needsResponse.length === 0 &&
		!intext
	) {
		return null
	}

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{statuses.map((status) => (
				<Badge
					key={status}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("status", status)}
				>
					{statusIcons[status]}
					<span className="capitalize">{status}</span>
				</Badge>
			))}
			{needsResponse.map((value) => (
				<Badge
					key={`response-${value}`}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("needsResponse", value)}
				>
					{responseIcons[value]}
					<span>{responseLabels[value]}</span>
				</Badge>
			))}
			{visibility.map((v) => (
				<Badge
					key={v}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("visibility", v)}
				>
					{visibilityIcons[v]}
					<span className="capitalize">{v}</span>
				</Badge>
			))}
			{priorities.map((priority) => (
				<Badge
					key={priority}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("priority", priority)}
				>
					{priorityIcons[priority]}
					<span className="capitalize">{priority}</span>
				</Badge>
			))}
			{problems.map((problem) => (
				<Badge
					key={problem}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("problem", problem)}
				>
					<Hash className="h-4 w-4 mr-2" />
					<span>
						{problem
							.split("-")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" ")}
					</span>
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
