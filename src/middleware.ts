import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;
  
    if (token) {
      // If token exists, redirect to dashboard for specific routes
      if (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up") || url.pathname.startsWith("/verify") || url.pathname.startsWith("/")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } 
  
    // If none of the above conditions are met, return the original request
    return NextResponse.next();
  }

export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*","/verify/:path*"],
};
