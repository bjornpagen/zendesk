import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Sidebar from "./components/sidebar"
import { syncUser } from "@/server/actions/sync"
import { Toaster } from "@/components/ui/toaster"

export default async function Layout({
	children,
	sheet
}: {
	children: React.ReactNode
	sheet: React.ReactNode
}) {
	// Sync user data on each page load
	await syncUser()

	return (
		<SidebarProvider>
			<Sidebar />
			<main className="w-full">
				<SidebarTrigger />
				<div className="min-h-screen bg-background p-4 lg:px-8 xl:px-16 flex justify-center">
					<div className="w-full max-w-[1800px]">{children}</div>
				</div>
				{sheet}
			</main>
			<Toaster />
		</SidebarProvider>
	)
}
