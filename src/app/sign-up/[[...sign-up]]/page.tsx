import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-sm text-gray-600">Sign up to get started</p>
				</div>

				<div className="mt-8">
					<SignUp
						appearance={{
							elements: {
								rootBox: "w-full",
								card: "shadow-lg rounded-lg bg-white p-6",
								headerTitle: "text-2xl font-semibold text-gray-900",
								headerSubtitle: "text-gray-600",
								formButtonPrimary:
									"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							}
						}}
					/>
				</div>
			</div>
		</div>
	)
}
