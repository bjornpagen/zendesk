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
			title: "Track AI Agent Metrics",
			description:
				"Implement comprehensive AI metrics tracking system for monitoring success rates, accuracy, latency, and error rates. Track agent interventions, customer satisfaction correlation, and model drift. Integrate with LangSmith/LangFuse for visualization and alerting. Target >95% success rate for actions and <2s average response time.",
			priority: "high"
		},
		{
			title: "Parse Inbound Emails: AI",
			description:
				"Implement advanced email parsing system using AI to handle complex email threads. Features: clean formatting of top-posted replies, signature removal, attachment handling, quoted text identification, and key information extraction. Should support multiple email formats and languages while maintaining conversation context.",
			priority: "high"
		},
		{
			title: "AI Response Agent",
			description:
				"Implement AI agent for automated ticket response and escalation. System should handle initial response generation, intent classification, common issue resolution, and smart escalation to human agents. Include multi-language support, quality assurance checks, and safety guardrails. Must integrate with existing knowledge base and maintain detailed interaction logs.",
			priority: "high"
		},
		{
			title: "Add Build Widget Script",
			description:
				"Implement functionality to generate and customize widget installation script. Include options for theme customization, initial message configuration, custom fields, language localization, and mobile responsiveness. Provide live preview and validation of configuration options.",
			priority: "medium"
		},
		{
			title: "Support Multiple File Attachments",
			description:
				"Update messages schema and UI to allow multiple file attachments per message. Implement drag-and-drop upload, preview capabilities, automatic image compression, virus scanning, and progress indicators. Add support for max file size limits and bulk download options.",
			priority: "medium"
		},
		{
			title: "Message Property Change Tracking",
			description:
				"Add comprehensive schema support for tracking message property changes. Track modifications to status, categories, priority levels, assignments, and custom fields. Implement audit log UI showing change history with timestamps and user attribution.",
			priority: "medium"
		},
		{
			title: "Support Organizations",
			description:
				"Add multi-organization support to enable enterprise features. Include organization-level settings, team management, role-based access control, custom branding, SSO integration options, and billing management. Implement data isolation between organizations while allowing controlled sharing.",
			priority: "low"
		},
		{
			title: "Analytics Dashboard",
			description:
				"Create comprehensive analytics dashboard showing key performance metrics including response times, ticket volume trends, resolution rates, customer satisfaction scores, agent performance metrics, and AI system effectiveness. Include data export and automated reporting features.",
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
