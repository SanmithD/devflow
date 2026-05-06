import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { DynamicTool } from "@langchain/core/tools";
import { getServerSession } from "next-auth";

export const userInfoTool = new DynamicTool({
    name: 'user_info',
    description: 'Use this tool get user information, and greet user',
    
    func: async(input: string) => {
        try {
            const session = await getServerSession(authOptions);

            if(!session){
                return 'Unauthorized session'
            }

            const userId = session?.user.id;

            if(!userId){
                return 'Id not found'
            }
            
            const response = await prisma.user.findFirst({
                where: {
                    id: Number(userId)
                },
                select: {
                    user_name: true
                }
            });

            if(!response){
                return 'Id not found'
            }

            return response.user_name;
            
        } catch (error) {
            console.log('user info tool server error', error);
            return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
})