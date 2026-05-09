import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ArchiveRepository } from "../repository/archive.repository";
import { authOptions } from "../src/lib/auth";

export const insertArchive = async (req: NextRequest) => {
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

        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
        };

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const archiveRepo = new ArchiveRepository();

        const response = await archiveRepo.insertArchive({ id, userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const getAllArchive = async(req: NextRequest) => {
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

        const archiveRepo = new ArchiveRepository();
        const response = await archiveRepo.findArchive({ userId: Number(userId), limit });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        const nextCursor = response?.data?.length === limit ? response?.data?.[0].id : null;

        return NextResponse.json({ messages: response.data, nextCursor, hasMore: !!nextCursor }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const updateArchive = async (req: NextRequest) => {
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
        const status = body.status;

        console.log('id', id, 'title', title, 'userId', userId);

        if (!id || typeof id !== 'number' || id <= 0) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
        };

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const archiveRepo = new ArchiveRepository();

        const response = await archiveRepo.updateArchive({ id, userId: Number(userId), title, ip, status });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const deleteArchive = async (req: NextRequest, id: number) => {
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

        const archiveRepo = new ArchiveRepository();

        const response = await archiveRepo.deleteArchive({ id, userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const deleteAllArchive = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        const userId = session.user.id; 

        if(!userId){
            return NextResponse.json({ message: 'User not found' },{ status: 403 });
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const historyRepo = new ArchiveRepository();

        const response = await historyRepo.deleteAllSavedArchive({ userId: Number(userId), ip });

        if (!response.success) {
            return NextResponse.json({ message: response.message }, { status: 400 })
        }

        return NextResponse.json({ message: response.message }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}