import { Suspense } from "react"
import UserSheet from "./components/user-sheet"

export default function UserPage() {
	return (
		<Suspense fallback={<div>Loading user details...</div>}>
			<UserSheet />
		</Suspense>
	)
}
