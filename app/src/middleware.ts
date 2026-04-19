import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export const middleware = (req: NextRequest) => {
    try {

        const token = req.cookies.get("token")?.value;

        if (!req.nextUrl.pathname.startsWith("/dashboard")) {
            if (!token) {
                return NextResponse.redirect(new URL("/login", req.url))
            }

            const user = verifyToken(token as string);

            if (!user) {
                return NextResponse.redirect(new URL("/login", req.url))
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.log('middleware error', error);
    }
}


export const config = {
    matcher: ["/dashboard/:path*"]
}