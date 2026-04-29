import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
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

        const messages = await prisma.project.groupBy({
            by: ['id'],
            where: {
                userId: Number(userId),
            },
            _max: {
                createdAt: true,
            },
            orderBy: {
                _max: {
                    createdAt: 'desc'
                }
            },
            take: Number(limit)
        });

        // retrun latest messages oldest -> newest
        messages.reverse();

        const nextCursor = messages.length === limit ? messages[0].id : null;

        return NextResponse.json({ messages, nextCursor, hasMore: !!nextCursor }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}