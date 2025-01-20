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
			<main className="w-full">
				<SidebarTrigger />
				<div className="min-h-screen bg-background p-4 lg:px-8 xl:px-16 flex justify-center">
					<div className="w-full max-w-[1800px]">{children}</div>
				</div>
				{sheet}
			</main>
		</SidebarProvider>
	)
}
