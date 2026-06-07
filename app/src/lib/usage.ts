import { prisma } from "./db";

export const getUserPlan = async ({ userId }: { userId: number }) => {
    try {
        const sub = await prisma.subscription.findUnique({
            where: {
                userId
            }
        });

        if (
            sub?.status === "ACTIVE"
        ) {
            return sub.plan;
        }

        return "FREE";
    } catch (error) {
        console.log('server error', error);
        return false;
    }
}