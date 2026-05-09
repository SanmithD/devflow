import { getAllBookmark } from "@/app/controllers/bookmark.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await getAllBookmark(req);
}