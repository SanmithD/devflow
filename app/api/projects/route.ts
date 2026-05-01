import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;

        const body = await req.json();
        const { message, projectId } = body;

        if (!message || typeof message !== 'string' || message === "") {
            return NextResponse.json({ message: 'Invalid Message Request' }, { status: 400 });
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        let response;
        if (projectId) {
            response = await prisma.aILog.create({
                data: {
                    userId: Number(userId) ?? 0,
                    input: message,
                    projectId,
                    response: 'Hello'
                }
            });
        } else {
            const projectTitle = message.split(" ").slice(0, 4).join(" ");

            const newProject = await prisma.project.create({
                data: {
                    userId: Number(userId),
                    name: message,
                    ipAddress: ip,
                    title: projectTitle
                }
            });
            response = await prisma.aILog.create({
                data: {
                    userId: Number(userId) ?? 0,
                    input: message,
                    projectId: newProject.id,
                    ipAddress: ip,
                    response: 'Hello'
                }
            });
        }

        return NextResponse.json({ result: response }, { status: 201 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const DELETE = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;
        const { id } = await req.json();

        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid Id' }, { status: 400 });
        }

        const response = await prisma.aILog.delete({
            where: { id, userId: Number(userId) }
        });

        if (!response) {
            return NextResponse.json({ message: 'Not Found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Chat Deleted' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session?.user.id;

        const { searchParams } = new URL(req.url);

        const chatId = Number(searchParams.get("chatId"));
        const cursor = searchParams.get("cursor"); // oldest message id
        const limit = 20;

        if (!chatId) {
            return NextResponse.json(
                { message: "chatId required" },
                { status: 400 }
            );
        }

        let messages;

        if (!cursor) {
            messages = await prisma.aILog.findMany({
                where: { id: chatId, userId: Number(userId) },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
            });

            // retrun latest messages oldest -> newest
            messages.reverse();
        } else {
            messages = await prisma.aILog.findMany({
                where: { id: chatId, userId: Number(userId) },
                orderBy: { createdAt: 'desc' },
                cursor: {
                    id: Number(cursor)
                },
                skip: 1,
                take: limit
            });

            messages.reverse();
        }

        const nextCursor = messages.length === limit ? messages[0].id : null;

        return NextResponse.json({ messages, nextCursor, hasMore: !!nextCursor }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}