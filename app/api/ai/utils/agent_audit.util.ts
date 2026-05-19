import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { getServerSession } from "next-auth";

export const createAgentAuditLog = async(
    {
        projectId,
        chatId,
        input,
        response,
        model
    }: {
        projectId?: number;
        chatId?: number;
        input: string;
        response: string;
        model: string;
    }
): Promise<boolean> => {
    try {
        
        const session = await getServerSession(authOptions);

        if(!session){
            return false;
        }

        const userId = session?.user.id
        if(!userId){
            return false;
        }

        const res = await prisma.agentAudit.create({
            data: {
                userId: Number(userId),
                projectId: 0,
                chatId: 0,
                input,
                response,
                model
            }
        });

        if(!res){
            return false
        }

        return true;
    } catch (error) {
        console.log('error', error);
        return false;
    }
}