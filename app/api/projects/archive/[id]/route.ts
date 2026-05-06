import { deleteArchive, getAllArchive, updateArchive } from "@/app/controllers/archive.controller";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return await deleteArchive(req, Number(id));
}

export const PUT = async (req: NextRequest) => {
    return await updateArchive(req)
}

export const POST = async (req: NextRequest) => {
    return await getAllArchive(req);
}