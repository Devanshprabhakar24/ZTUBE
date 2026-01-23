import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// DEBUG: Log middleware execution in deployment
export const middleware = (auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url);
    const isAccessingDashboard = currentUrl.pathname === "/home";
    const isApiRequest = currentUrl.pathname.startsWith("/api");
    console.log("[MIDDLEWARE] userId:", userId, "path:", currentUrl.pathname);

    if (userId && currentUrl.pathname === "/") {
        console.log("[MIDDLEWARE] Authenticated user at /, redirecting to /home");
        return NextResponse.redirect(new URL("/home", req.url));
    }
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        console.log("[MIDDLEWARE] Authenticated user at public route, redirecting to /home");
        return NextResponse.redirect(new URL("/home", req.url));
    }
    if (!userId) {
        if (currentUrl.pathname === "/") {
            console.log("[MIDDLEWARE] Unauthenticated user at /, redirecting to /sign-in");
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            console.log("[MIDDLEWARE] Unauthenticated user at protected route, redirecting to /sign-in");
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        if (isApiRequest && !isPublicApiRoute(req)) {
            console.log("[MIDDLEWARE] Unauthenticated user at protected API, redirecting to /sign-in");
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
    }
    return NextResponse.next();
};

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up"
]);
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])


export default clerkMiddleware(middleware);

export const config = {
    matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/", "/(api|trpc)(.*)"],
};
