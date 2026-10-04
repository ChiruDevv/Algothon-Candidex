import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes are protected. 
// We want to protect the recruiter routes but leave the landing page and candidate portal public.
const isProtectedRoute = createRouteMatcher([
  '/analyze(.*)',
  '/results(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/__clerk/(.*)',
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
