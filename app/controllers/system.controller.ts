import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { SystemInfoRepository } from "../repository/system.repository";
import { authOptions } from "../src/lib/auth";
import { redis } from "../src/lib/redis";

export const getSystemInfo = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 404 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 404 });
        }

        const cacheKey = `system:${userId}`;
        const cached = await redis.get<typeof response>(cacheKey);

        if (cached) {
            return NextResponse.json(cached);
        }

        const systemRepo = new SystemInfoRepository();
        const response = await systemRepo.getSystemConfiguration();

        if (response.success === false) {
            return NextResponse.json({ message: response.message }, { status: 404 });
        }

        await redis.set(cacheKey, response, { ex: 60 });

        return NextResponse.json({ message: response.message, data: response.data }, { status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'server error' }, { status: 500 });
    }
}