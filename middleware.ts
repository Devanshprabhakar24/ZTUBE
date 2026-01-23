import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


export default clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url);
    const isAccessingDashboard = currentUrl.pathname === "/home";
    const isApiRequest = currentUrl.pathname.startsWith("/api");
    // Optionally, you can add debug logs here for local debugging

    if (userId && currentUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/home", req.url));
    }
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url));
    }
    if (!userId) {
        if (currentUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
    }
    return NextResponse.next();
});

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up"
]);
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])



export const config = {
    matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/", "/(api|trpc)(.*)"],
};
