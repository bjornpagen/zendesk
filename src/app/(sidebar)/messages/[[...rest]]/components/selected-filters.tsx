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
import useSWR from "swr"
import { getProblems, type Problem } from "@/server/actions/problems"
import { getAssignableUsers, type AssignableUser } from "@/server/actions/users"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface SelectedFiltersProps {
	statuses: string[]
	problems: string[]
	priorities: string[]
	visibility: string[]
	needsResponse: string[]
	assignees: string[]
	intext: string
	onFilterRemove: (
		type:
			| "status"
			| "problem"
			| "priority"
			| "intext"
			| "visibility"
			| "needsResponse"
			| "assignee",
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
	assignees,
	intext,
	onFilterRemove
}: SelectedFiltersProps) {
	const { data: problemsList = [] } = useSWR<Problem[]>("problems", getProblems)
	const { data: assignableUsers = [] } = useSWR<AssignableUser[]>(
		"assignableUsers",
		getAssignableUsers
	)
	const userMap = Object.fromEntries(
		assignableUsers.map((u) => [u.clerkId, { name: u.name, avatar: u.avatar }])
	)

	// Create a map of problem IDs to their titles
	const problemTitles = Object.fromEntries(
		problemsList.map((p) => [p.id, p.title])
	)

	if (
		statuses.length === 0 &&
		problems.length === 0 &&
		priorities.length === 0 &&
		visibility.length === 0 &&
		needsResponse.length === 0 &&
		assignees.length === 0 &&
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
			{problems.map((problemId) => (
				<Badge
					key={problemId}
					variant="secondary"
					className="flex items-center cursor-pointer"
					onClick={() => onFilterRemove("problem", problemId)}
				>
					<Hash className="h-4 w-4 mr-2" />
					<span className="capitalize">
						{problemTitles[problemId] || problemId}
					</span>
				</Badge>
			))}
			{assignees.map((clerkId) => {
				const user = userMap[clerkId]
				return (
					<Badge
						key={clerkId}
						variant="secondary"
						className="flex items-center gap-2 cursor-pointer"
						onClick={() => onFilterRemove("assignee", clerkId)}
					>
						<Avatar className="h-4 w-4">
							<AvatarImage src={user?.avatar} />
							<AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
						</Avatar>
						<span>{user?.name || clerkId}</span>
					</Badge>
				)
			})}
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
