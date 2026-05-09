import { deleteArchive, getAllArchive } from "@/app/controllers/archive.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await getAllArchive(req);
}

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await deleteArchive(req, Number(id));
}