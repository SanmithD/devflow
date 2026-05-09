import { addNewBookmark, deleteBookmarkedProject } from "@/app/controllers/bookmark.controller";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await deleteBookmarkedProject(req, Number(id));
}

export const POST = async (req: NextRequest) => {
    return await addNewBookmark(req);
}