import { getAllChat } from "@/app/controllers/project.controller";
import { rateLimit } from "@/app/src/lib/ratelimit";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await context.params;

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const { success } = await rateLimit.limit(ip);

        if (!success) return NextResponse.json({ message: 'Too many request' }, { status: 429 });

        return await getAllChat(req, Number(id));

    } catch (error) {
        console.log("server error", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
};