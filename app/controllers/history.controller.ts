import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { HistoryRepository } from "../repository/history.repository";
import { authOptions } from "../src/lib/auth";
import { redis } from "../src/lib/redis";

export const getAllHistory = async (req: NextRequest) => {
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

        if (!limit) {
            return NextResponse.json({ message: 'Limit is missing' }, { status: 400 });
        }

        const cacheKey = `history:${userId}:${limit}`;
        const cached = await redis.get<typeof response>(cacheKey);

        if (cached) {
            return NextResponse.json(cached);
        }

        const historyRepo = new HistoryRepository();

        const response = await historyRepo.findHistory({ userId: Number(userId), limit });

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

export const updateChatHistory = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        const userId = session?.user.id;

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const id = Number(body.id);
        const title = body.title;

        console.log('id', id, 'title', title, 'userId', userId);

        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
        };

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        await redis.del(`history:${userId}:*`);

        const historyRepo = new HistoryRepository();

        const response = await historyRepo.updateHistory({ id, userId: Number(userId), title, ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const deleteChatHistory = async (req: NextRequest, id: number) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        const userId = session.user.id;

        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
        };

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const historyRepo = new HistoryRepository();

        const response = await historyRepo.deleteHistory({ id, userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        await redis.del(`history:${userId}:*`);

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const deleteAllChatHistory = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ message: 'User not found' }, { status: 403 });
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const historyRepo = new HistoryRepository();

        const response = await historyRepo.deleteAllHistory({ userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        await redis.del(`history:${userId}:*`);

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}