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
			title: "Customer Support Widget",
			description:
				"Implement live chat widget for real-time customer support and assistance",
			priority: "high"
		},
		{
			title: "Add Assignee to Threads",
			description:
				"Implement functionality to assign team members to support threads",
			priority: "high"
		},
		{
			title: "Analytics Dashboard",
			description:
				"Add simple metrics page showing response times and ticket statistics",
			priority: "medium"
		},
		{
			title: "Notifications Panel",
			description: "Implement basic notification system for updates",
			priority: "low"
		}
	] as Todo[]

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold mb-6">Project Requirements Todo</h1>
			{todos.map((todo) => (
				<Card key={todo.title}>
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
