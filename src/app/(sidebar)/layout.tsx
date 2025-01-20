import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({
	children,
	sheet
}: {
	children: React.ReactNode
	sheet: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				{children}
			</main>
			{sheet}
		</SidebarProvider>
	)
}
