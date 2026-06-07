import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export const getUser = async () => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) return null;

        return await prisma.user.findUnique({
            where: {
                id: Number(session.user.id),
            },
            select: {
                id: true,
                email: true,
                user_name: true,
                image: true,
                role: true,
                isVerified: true,
                isUserAllowed: true,
                subscriptionPlan: true,
                subscription: true,
                createdAt: true,
                emailVerified: true,
            },
        });

    } catch (error) {
        console.log("server error", error);
        throw new Error("Server error");
    }
};