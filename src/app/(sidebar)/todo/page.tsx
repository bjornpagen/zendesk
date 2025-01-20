"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Priority = "high" | "medium" | "low"

const priorityStyles = Object.freeze({
	high: "bg-red-100 text-red-700",
	medium: "bg-yellow-100 text-yellow-700",
	low: "bg-blue-100 text-blue-700"
})

interface Todo {
	title: string
	description: string
	priority: Priority
}

export default function TodoPage() {
	const todos = [
		{
			title: "Admin/Settings Screen",
			description:
				"Create basic settings page for team management, roles, and schedules",
			priority: "high"
		},
		{
			title: "Analytics Dashboard",
			description:
				"Add simple metrics page showing response times and ticket statistics",
			priority: "medium"
		},
		{
			title: "Knowledge Base",
			description:
				"Create basic article listing and placeholder for FAQ system",
			priority: "medium"
		},
		{
			title: "Customer Portal",
			description: "Build customer-facing view for ticket management",
			priority: "medium"
		},
		{
			title: "Feedback System",
			description: "Add rating and comment functionality for resolved tickets",
			priority: "low"
		},
		{
			title: "Notifications Panel",
			description: "Implement basic notification system for updates",
			priority: "low"
		},
		{
			title: "Bulk Operations",
			description:
				"Add multi-select functionality to dashboard for bulk actions (close, mark as spam, etc.)",
			priority: "low"
		}
	] as Todo[]

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold mb-6">Project Requirements Todo</h1>
			{todos.map((todo, index) => (
				<Card key={index}>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>{todo.title}</span>
							<span
								className={`text-sm px-2 py-1 rounded ${priorityStyles[todo.priority]}`}
							>
								{todo.priority}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">{todo.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
