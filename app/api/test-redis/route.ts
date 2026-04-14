import { redis } from "@/app/src/lib/redis";

export const GET = async() => {
    await redis.set("test", "redis connected");

    const value = await redis.get("test");

    return Response.json({ value })
}