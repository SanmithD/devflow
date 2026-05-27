import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { parseMediaFiles } from "../api/ai/rag/ingestion/parse_media_files";
import { AgentChatRepository } from "../repository/project.repository";
import { authOptions } from "../src/lib/auth";
import { redis } from "../src/lib/redis";

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

            const { format, url } = media_metadata;

            await parseMediaFiles(url, format, currentProjectId);
        }

        const data = await chatRepo.getStreamResponse({
            userId: Number(userId),
            ip,
            message,
            abortSignal,
            currentProjectId,
            media_metadata
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

export const getAllChat = async (req: NextRequest, id: number) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session?.user.id;

        const body = await req.json();

        const { limit } = body;

        const project_id = Number(id);

        if (!project_id || isNaN(project_id)) {
            return NextResponse.json(
                { message: "Invalid projectId" },
                { status: 400 }
            );
        }

        const cacheKey = `chat:${userId}:${id}:${limit}`;
        const cached = await redis.get<typeof response>(cacheKey);

        if (cached) {
            return NextResponse.json(cached);
        }

        const chatRepo = new AgentChatRepository();
        const response = await chatRepo.getAllAgentChat({ userId: Number(userId), limit, id });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        const nextCursor = response?.data?.length === limit ? response?.data?.[0].id : null;

        await redis.set(cacheKey, response, { ex: 60 });

        return NextResponse.json({ messages: response.data, nextCursor, hasMore: !!nextCursor }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}