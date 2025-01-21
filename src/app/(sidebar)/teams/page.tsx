import { Suspense } from "react"
import Team from "./components/team"

export default function TeamPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Team />
		</Suspense>
	)
}
