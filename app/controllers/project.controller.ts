import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { parseMediaFiles } from "../api/ai/rag/ingestion/parse_media_files";
import { AgentChatRepository } from "../repository/project.repository";
import { authOptions } from "../src/lib/auth";

export const agentChat = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const abortSignal = req.signal;
        const userId = session.user.id;

        const body = await req.json();

        const { message, projectId, media_metadata } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ message: "Invalid Message" }, { status: 400 });
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        let currentProjectId = projectId;

        const chatRepo = new AgentChatRepository();

        const isAuthorizedUser = await chatRepo.isUserAllowed({ userId: Number(userId) });

        if (!isAuthorizedUser.success) {
            return NextResponse.json({ message: isAuthorizedUser.message }, { status: 400 })
        }

        if (!projectId) {
            const newProject = await chatRepo.createNewProject({
                userId: Number(userId),
                ip,
                message
            });

            currentProjectId = newProject.data?.id;
        }

        if (media_metadata) {

            console.log('meta data 2', JSON.stringify(media_metadata))

            const { format, size, url, name, type } = media_metadata;

            const res = await chatRepo.uploadMediaFilesInDB({
                userId: Number(userId),
                chatId: currentProjectId,
                format,
                size: String(size),
                url,
                name,
                type
            });

            if (!res.success) {
                return NextResponse.json({ message: res.message }, { status: 400 })
            }

            await parseMediaFiles(url, format, currentProjectId);
        }

        const data = await chatRepo.getStreamResponse({
            userId: Number(userId),
            ip,
            message,
            abortSignal,
            currentProjectId
        });

        const stream = data.data;

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}