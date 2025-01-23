import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Add the Supabase webhook endpoint to public routes
const isPublicRoute = createRouteMatcher([
	"/",
	"/api/(.*)", // This will match all routes that start with /api/
	"/sign-in(.*)", // This will match all sign-in related routes
	"/sign-up(.*)" // This will match all sign-up related routes
])

export default clerkMiddleware(async (auth, request) => {
	if (!isPublicRoute(request)) {
		await auth.protect()
	}
})

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)"
	]
}
