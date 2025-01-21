import { Suspense } from "react"
import Thread from "./components/thread"

export default function ThreadPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Thread />
		</Suspense>
	)
}
