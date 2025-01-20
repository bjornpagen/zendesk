import { MessageSquare, ListTodo, Users } from "lucide-react"

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
		url: "/messages",
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
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
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
