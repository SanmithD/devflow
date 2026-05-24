import { runAgent } from "../api/ai/agents/smaple.agent";
import { prisma } from "../src/lib/db";

export class AgentChatRepository {

    createNewProject = async ({
        userId,
        message,
        ip,
    }: {
        userId: number;
        message: string;
        ip: string;
    }) => {
        try {
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

            if (!newProject) {
                return {
                    success: false,
                    data: null,
                    message: 'fail to create new projetc'
                }
            }

            return {
                success: true,
                data: newProject,
                message: 'create new project'
            }
        } catch (error) {
            console.log('server error', error);
            return {
                success: false,
                data: null,
                message: 'server error'
            }
        }
    }

    getStreamResponse = async ({
        userId,
        message,
        ip,
        currentProjectId,
        abortSignal,
        media_metadata

    }: {
        userId: number;
        message: string;
        ip: string;
        currentProjectId: number;
        abortSignal: AbortSignal;
        media_metadata
    }) => {
        try {

            const encoder = new TextEncoder();
            let fullResponse = "";

            const stream = new ReadableStream({
                start: async (controller) => {
                    let isClosed = false;

                    const safeClose = () => {
                        if (isClosed) return;

                        try {
                            isClosed = true;
                            controller.close();
                        } catch { }
                    };

                    const safeEnqueue = (data: Uint8Array) => {
                        if (isClosed || abortSignal.aborted) return;

                        try {
                            controller.enqueue(data);
                        } catch (err) {
                            isClosed = true;
                            console.log(err);
                            console.log("enqueue skipped");
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

                        while (!abortSignal.aborted) {
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
                            await this.saveAgentChatResponse({
                                userId: Number(userId),
                                ip,
                                currentProjectId,
                                fullResponse,
                                message,
                                media_metadata
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
                                `data: ${JSON.stringify({
                                    text: "Error occurred",
                                })}\n\n`
                            )
                        );

                        safeEnqueue(encoder.encode("data: [DONE]\n\n"));
                        safeClose();
                    }
                },
            });

            return {
                success: true,
                data: stream,
                message: 'stream response'
            }
        } catch (error) {
            console.log('server error', error);
            return {
                success: false,
                data: null,
                message: 'server error'
            }
        }
    }

    saveAgentChatResponse = async ({
        userId,
        message,
        ip,
        currentProjectId,
        fullResponse,
        media_metadata
    }: {
        userId: number;
        message: string;
        ip: string;
        fullResponse: string;
        currentProjectId: number;
        media_metadata: any;
    }) => {
        try {

            const newChat = await prisma.aILog.create({
                data: {
                    userId: Number(userId),
                    input: message,
                    projectId: currentProjectId,
                    ipAddress: ip,
                    response: fullResponse,
                },
            });

            if (media_metadata) {
                const { format, size, url, name, type } = media_metadata;
                await this.uploadMediaFilesInDB({
                    userId: Number(userId),
                    chatId: newChat.id,
                    format,
                    size: String(size),
                    url,
                    name,
                    type,
                });
            }

            return {
                success: true,
                message: 'created'
            }
        } catch (error) {
            console.log('server error', error);
            return {
                success: false,
                message: 'server error'
            }
        }
    }

    isUserAllowed = async ({ userId }: { userId: number }): Promise<{ message: string; success: boolean }> => {
        try {

            if (!userId) {
                return {
                    message: 'Invalid Id',
                    success: false
                }
            }

            const response = await prisma.user.findFirst({
                where: { id: Number(userId) }
            });

            if (!response) {
                return {
                    message: 'User not found',
                    success: false
                }
            }

            if (!response.isUserAllowed) {
                return {
                    message: 'User not allowed',
                    success: false
                }
            }

            if (!response.isVerified) {
                return {
                    message: 'User Acount is not verified',
                    success: false
                }
            }

            return {
                message: 'Authorzied user',
                success: true
            }
        } catch (error) {
            console.log('server error', error);
            return {
                message: 'Server error',
                success: false
            };
        }
    }

    uploadMediaFilesInDB = async (
        {
            userId,
            chatId,
            format,
            name,
            url,
            type,
            size
        }: {
            userId: number;
            chatId: number;
            format: string;
            name: string;
            url: string;
            type: string;
            size: string;
        }
    ): Promise<{ data: any | null; success: boolean; message: string }> => {
        try {

            const response = await prisma.chatMedia.create({
                data: {
                    userId,
                    chatId,
                    format,
                    name,
                    url,
                    type,
                    size
                }
            });

            if (!response) {
                return {
                    data: null,
                    success: false,
                    message: 'fail to save metadata'
                }
            }

            return {
                data: response,
                success: true,
                message: 'Meta data saved'
            }
        } catch (error) {
            console.log('server error', error);
            return {
                data: null,
                success: false,
                message: 'server error'
            }
        }
    }

    getAllAgentChat = async ({ userId, limit = 20, id }: { userId: number; limit: number, id: number }) => {
        try {

            if (!limit || !userId) {
                return {
                    success: false,
                    data: null,
                    message: 'Limit and userId is required',
                }
            }

            const res = await prisma.aILog.findMany({
                where: {
                    userId: Number(userId),
                    projectId: id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            if (!res) {
                return {
                    success: false,
                    data: null,
                    message: 'Project not found'
                }
            }

            return {
                success: true,
                data: res,
                message: 'Project found'
            }

        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }
}