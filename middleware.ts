import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Tools have been moved to admin portal (admin.zynra.studio/tools).
// No tools subdomain restrictions on portfolio.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- middleware signature requires request
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
