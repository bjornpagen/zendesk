import { MessageSquare, ListTodo, Users, BarChart, Hash } from "lucide-react"
import Link from "next/link"
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarFooter
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { UserNameDisplay } from "./user-name-display"

// Menu items.
const items = [
	{
		title: "Messages",
		url: "/messages?status=open&needsResponse=true",
		icon: MessageSquare
	},
	{
		title: "Teams",
		url: "/teams",
		icon: Users
	},
	{
		title: "Categories",
		url: "/categories",
		icon: Hash
	},
	{
		title: "Todo",
		url: "/todo",
		icon: ListTodo
	},
	{
		title: "Analytics",
		url: "/analytics",
		icon: BarChart
	}
]

export default function Sidebar() {
	return (
		<ShadcnSidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Card className="p-4 flex items-center justify-between">
					<UserNameDisplay className="flex-1 mr-2" />
					<UserButton afterSignOutUrl="/" />
				</Card>
			</SidebarFooter>
		</ShadcnSidebar>
	)
}
