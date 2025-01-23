"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveSankey } from "@nivo/sankey"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveLine } from "@nivo/line"
import { ResponsiveBar } from "@nivo/bar"

// Sample data - In production, this would come from your API
const sankeyData = {
	nodes: [
		{ id: "customers", label: "Customers" },
		{ id: "urgent", label: "Urgent" },
		{ id: "non-urgent", label: "Non-Urgent" },
		{ id: "ai-assigned", label: "AI Assigned" },
		{ id: "manual-assigned", label: "Manually Assigned" },
		{ id: "resolved", label: "Resolved" }
	],
	links: [
		{ source: "customers", target: "urgent", value: 20 },
		{ source: "customers", target: "non-urgent", value: 80 },
		{ source: "urgent", target: "ai-assigned", value: 15 },
		{ source: "urgent", target: "manual-assigned", value: 5 },
		{ source: "non-urgent", target: "ai-assigned", value: 60 },
		{ source: "non-urgent", target: "manual-assigned", value: 20 },
		{ source: "ai-assigned", target: "resolved", value: 70 },
		{ source: "manual-assigned", target: "resolved", value: 25 }
	]
}

const responseTimeData = [
	{
		id: "response_time",
		data: [
			{ x: "Mon", y: 45 },
			{ x: "Tue", y: 38 },
			{ x: "Wed", y: 42 },
			{ x: "Thu", y: 35 },
			{ x: "Fri", y: 40 },
			{ x: "Sat", y: 50 },
			{ x: "Sun", y: 55 }
		]
	}
]

const problemCategoriesData = [
	{ id: "Technical", value: 35 },
	{ id: "Billing", value: 25 },
	{ id: "Account", value: 20 },
	{ id: "Feature", value: 15 },
	{ id: "Other", value: 5 }
]

const aiPerformanceData = [
	{
		month: "Jan",
		"Correct Assignments": 85,
		"Incorrect Assignments": 15
	},
	{
		month: "Feb",
		"Correct Assignments": 88,
		"Incorrect Assignments": 12
	},
	{
		month: "Mar",
		"Correct Assignments": 92,
		"Incorrect Assignments": 8
	}
]

export default function AnalyticsPage() {
	return (
		<div className="space-y-6 p-6">
			<h1 className="text-2xl font-bold">Analytics Dashboard</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Ticket Flow Sankey */}
				<Card className="col-span-2">
					<CardHeader>
						<CardTitle>Ticket Flow</CardTitle>
					</CardHeader>
					<CardContent className="h-[400px]">
						<ResponsiveSankey
							data={sankeyData}
							margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
							align="justify"
							colors={{ scheme: "category10" }}
							nodeOpacity={1}
							nodeThickness={18}
							nodeInnerPadding={3}
							nodeSpacing={24}
							nodeBorderWidth={0}
							linkOpacity={0.5}
							linkHoverOpacity={0.8}
							enableLinkGradient={true}
						/>
					</CardContent>
				</Card>

				{/* Response Time Trends */}
				<Card>
					<CardHeader>
						<CardTitle>Average Response Time (minutes)</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveLine
							data={responseTimeData}
							margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
							yScale={{ type: "linear" }}
							axisLeft={{
								tickSize: 5,
								tickPadding: 5,
								tickRotation: 0
							}}
							pointSize={10}
							useMesh={true}
							enableArea={true}
							areaOpacity={0.15}
						/>
					</CardContent>
				</Card>

				{/* Problem Categories */}
				<Card>
					<CardHeader>
						<CardTitle>Problem Categories</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsivePie
							data={problemCategoriesData}
							margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
							innerRadius={0.5}
							padAngle={0.7}
							cornerRadius={3}
							activeOuterRadiusOffset={8}
							colors={{ scheme: "nivo" }}
							arcLinkLabelsSkipAngle={10}
							arcLinkLabelsTextColor="#333333"
						/>
					</CardContent>
				</Card>

				{/* AI Performance */}
				<Card className="col-span-2">
					<CardHeader>
						<CardTitle>AI Assignment Accuracy</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveBar
							data={aiPerformanceData}
							keys={["Correct Assignments", "Incorrect Assignments"]}
							indexBy="month"
							margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
							padding={0.3}
							valueScale={{ type: "linear" }}
							colors={{ scheme: "nivo" }}
							labelSkipWidth={12}
							labelSkipHeight={12}
							legends={[
								{
									dataFrom: "keys",
									anchor: "bottom-right",
									direction: "column",
									translateX: 120,
									itemWidth: 100,
									itemHeight: 20
								}
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
