import { Widget } from "@/components/widget"

export default function TestPage() {
	return (
		<main className="min-h-screen p-8">
			<h1 className="text-2xl font-bold mb-4">Widget Test Page</h1>
			<p className="mb-4">
				This is a test page to demonstrate the widget functionality.
			</p>
			<p>Try clicking the chat button in the bottom right corner!</p>

			<Widget />
		</main>
	)
}
