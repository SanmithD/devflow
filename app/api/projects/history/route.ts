import { getAllHistory } from "@/app/controllers/history.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await getAllHistory(req);
}