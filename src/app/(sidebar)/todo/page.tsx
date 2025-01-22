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
			title: "Support Organizations",
			description:
				"Add support for organizations to the app, allowing users to manage multiple teams within a single account",
			priority: "high"
		},
		{
			title: "Team User Management",
			description:
				"Implement functionality to add and remove users from teams, including role assignment and permissions management",
			priority: "medium"
		},
		{
			title: "File Attachment System",
			description:
				"Implement complete file upload, storage, preview and download functionality with S3 integration",
			priority: "high"
		},
		{
			title: "Problem Categories System",
			description:
				"Implement problem category management, routing rules, and analytics",
			priority: "medium"
		},
		{
			title: "Assignment System",
			description:
				"Build auto-assignment logic with load balancing and rotation features",
			priority: "medium"
		},
		{
			title: "Support Multiple File Attachments",
			description:
				"Update messages schema and UI to allow multiple file attachments per message",
			priority: "medium"
		},
		{
			title: "Add Build Widget Script",
			description:
				"Implement functionality to generate and customize widget installation script",
			priority: "medium"
		},
		{
			title: "Analytics Dashboard",
			description:
				"Add simple metrics page showing response times and ticket statistics",
			priority: "medium"
		},
		{
			title: "Convert Widget to iframe",
			description:
				"Transform the current widget implementation into an iframe-based solution for better isolation and compatibility",
			priority: "low"
		},
		{
			title: "Notifications Panel",
			description: "Implement basic notification system for updates",
			priority: "low"
		}
	] as Todo[]

	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Project Requirements Todo</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{todos.map((todo) => (
					<Card key={todo.title} className="h-full">
						<CardHeader>
							<CardTitle className="flex items-center justify-between gap-3">
								<span className="text-lg">{todo.title}</span>
								<span
									className={`text-sm px-2 py-1 rounded whitespace-nowrap ${
										priorityStyles[todo.priority]
									}`}
								>
									{todo.priority}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								{todo.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
