import { Suspense } from "react"
import { Messages } from "./components/messages"

export default function MessagesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Messages />
		</Suspense>
	)
}
