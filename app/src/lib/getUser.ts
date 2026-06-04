import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export const getUser = async () => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) throw new Error("Session not found");

        const user_id = session.user.id;

        if (!user_id) throw new Error("Invalid ID");

        const user = await prisma.user.findUnique({
            where: {
                id: Number(user_id),
            },
            select: {
                id: true,
                email: true,
                user_name: true,
                image: true,
                role: true,
                isVerified: true,
                isUserAllowed: true,
                subscription_plan: true,
                createdAt: true,
                ipAddress: true,
                emailVerified: true,
            },
        });

        return user;
    } catch (error) {
        console.log("server error", error);
        throw new Error("Server error");
    }
};