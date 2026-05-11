import { getSystemInfo } from "@/app/controllers/system.controller";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    return await getSystemInfo(req);
}