import { MessageSquare, ListTodo, Users, BarChart } from "lucide-react"
import Link from "next/link"
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from "@/components/ui/sidebar"

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

export function Sidebar() {
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
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</ShadcnSidebar>
	)
}
