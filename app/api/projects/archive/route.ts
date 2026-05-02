import { insertArchive } from "@/app/controllers/archive.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await insertArchive(req);
}