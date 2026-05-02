import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "../ai/agents/smaple.agent";

export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session?.user.id;
        const body = await req.json();
        const { message, projectId } = body;

        if (!message || typeof message !== 'string' || message === "") {
            return NextResponse.json({ message: 'Invalid Message Request' }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

        let currentProjectId = projectId;

        // Create project if needed
        if (!projectId) {
            const projectTitle = message.split(" ").slice(0, 4).join(" ");
            const newProject = await prisma.project.create({
                data: {
                    userId: Number(userId),
                    name: message,
                    ipAddress: ip,
                    status: 1,
                    title: projectTitle
                }
            });
            currentProjectId = newProject.id;
        }

        const encoder = new TextEncoder();
        let fullResponse = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const agentStream = await runAgent(message, String(currentProjectId));

                    if (!agentStream) {
                        const errorMsg = "Failed to generate response";
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMsg })}\n\n`));
                        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                        controller.close();
                        return;
                    }

                    const reader = agentStream.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const text = decoder.decode(value, { stream: true });
                        fullResponse += text;

                        // ✅ Send properly formatted SSE
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                        );
                    }

                    // Save to DB
                    await prisma.aILog.create({
                        data: {
                            userId: Number(userId),
                            input: message,
                            projectId: currentProjectId,
                            ipAddress: ip,
                            response: fullResponse
                        }
                    });

                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text: "Error occurred" })}\n\n`)
                    );
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}