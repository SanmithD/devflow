import { deleteArchive, insertArchive, updateArchive } from "@/app/controllers/archive.controller";
import { rateLimit } from "@/app/src/lib/ratelimit";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const { success } = await rateLimit.limit(ip);

    if (!success) return NextResponse.json({ message: 'Too many request' }, { status: 429 });

    return await deleteArchive(req, Number(id));
}

export const PUT = async (req: NextRequest) => {

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const { success } = await rateLimit.limit(ip);

    if (!success) return NextResponse.json({ message: 'Too many request' }, { status: 429 });

    return await updateArchive(req)
}

export const POST = async (req: NextRequest) => {

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const { success } = await rateLimit.limit(ip);

    if (!success) return NextResponse.json({ message: 'Too many request' }, { status: 429 });

    return await insertArchive(req);
}