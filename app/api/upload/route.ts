import { uploadFiles } from "@/app/controllers/upload.controller";
import { NextRequest } from "next/server";

export const POST = async(req: NextRequest) => {
    return await uploadFiles(req);
}