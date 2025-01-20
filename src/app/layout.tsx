import "@/styles/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Create T3 App",
	description: "Generated by create-t3-app",
	icons: [{ rel: "icon", url: "/favicon.ico" }]
}

export default function RootLayout({
	children
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body>{children}</body>
			</html>
		</ClerkProvider>
	)
}
