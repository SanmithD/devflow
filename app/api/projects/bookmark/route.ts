import { getAllBookmark } from "@/app/controllers/bookmark.controller";
import { rateLimit } from "@/app/src/lib/ratelimit";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const { success } = await rateLimit.limit(ip);

    if (!success) return NextResponse.json({ message: 'Too many request' }, { status: 429 });

    return await getAllBookmark(req);
}