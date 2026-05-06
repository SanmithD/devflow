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

        const abortSignal = req.signal;
        const userId = session.user.id;
        const body = await req.json();
        const { message, projectId } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ message: "Invalid Message" }, { status: 400 });
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        let currentProjectId = projectId;

        if (!projectId) {
            const projectTitle = message.split(" ").slice(0, 4).join(" ");
            const newProject = await prisma.project.create({
                data: {
                    userId: Number(userId),
                    name: message,
                    ipAddress: ip,
                    status: 1,
                    title: projectTitle,
                },
            });
            currentProjectId = newProject.id;
        }

        const encoder = new TextEncoder();
        let fullResponse = "";

        const stream = new ReadableStream({
            async start(controller) {
                let isClosed = false;

                const safeClose = () => {
                    if (!isClosed) {
                        isClosed = true;
                        controller.close();
                    }
                };

                const safeEnqueue = (data: Uint8Array) => {
                    if (!isClosed) {
                        controller.enqueue(data);
                    }
                };

                try {
                    const agentStream = await runAgent(
                        message,
                        String(currentProjectId),
                        abortSignal
                    );

                    if (!agentStream) {
                        safeEnqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ text: "Failed" })}\n\n`
                            )
                        );
                        safeEnqueue(encoder.encode("data: [DONE]\n\n"));
                        safeClose();
                        return;
                    }

                    const reader = agentStream.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        if (abortSignal.aborted) {
                            reader.cancel();
                            safeClose();
                            return;
                        }

                        const { done, value } = await reader.read();
                        if (done) break;

                        const text = decoder.decode(value, { stream: true });
                        fullResponse += text;

                        safeEnqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    text,
                                    id: currentProjectId,
                                })}\n\n`
                            )
                        );
                    }

                    if (!abortSignal.aborted && fullResponse) {
                        await prisma.aILog.create({
                            data: {
                                userId: Number(userId),
                                input: message,
                                projectId: currentProjectId,
                                ipAddress: ip,
                                response: fullResponse,
                            },
                        });
                    }

                    safeEnqueue(encoder.encode("data: [DONE]\n\n"));
                    safeClose();
                } catch (error) {
                    if ((error as Error).name === "AbortError") {
                        safeClose();
                        return;
                    }

                    console.error("Stream error:", error);

                    safeEnqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ text: "Error occurred" })}\n\n`
                        )
                    );
                    safeEnqueue(encoder.encode("data: [DONE]\n\n"));
                    safeClose();
                }
            },
        });

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
};