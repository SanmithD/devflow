import { deleteChatHistory, updateChatHistory } from "@/app/controllers/history.controller";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {

    const { id } = await context.params;
    return await deleteChatHistory(req, Number(id));
}

export const PUT = async (req: NextRequest) => {
    return await updateChatHistory(req)
}