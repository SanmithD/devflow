import { agentChat } from "@/app/controllers/project.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await agentChat(req);
};