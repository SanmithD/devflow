import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { BookmarkRepository } from "../repository/bookmark.repository";
import { authOptions } from "../src/lib/auth";
import { redis } from "../src/lib/redis";

export const addNewBookmark = async (req: NextRequest) => {
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

        // project id
        const id = Number(body.id);

        await redis.del(`bookmarks:${userId}:*`);
        
        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
        };

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const bookRepo = new BookmarkRepository();

        const response = await bookRepo.insertToBookmark({ id, userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const getAllBookmark = async(req: NextRequest) => {
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

        const cacheKey = `bookmarks:${userId}:${limit}`;
        const cached = await redis.get<typeof response>(cacheKey);

        if (cached) {
            return NextResponse.json(cached);
        }

        const bookRepo = new BookmarkRepository();
        const response = await bookRepo.getAllBookmarked({ userId: Number(userId), limit });

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

export const deleteBookmarkedProject = async (req: NextRequest, id: number) => {
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

        const bookRepo = new BookmarkRepository();

        const response = await bookRepo.removeProjectFromBookmark({ id, userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        await redis.del(`bookmarks:${userId}:*`);

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}