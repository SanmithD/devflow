import { prisma } from "../src/lib/db";
import { UserType } from "../src/types/profile.type";

export class ProfileRepository {

    private extractUserDetail = async(user: UserType): Promise<UserType> => {
        return {
            id: user.id,
            email: user.email,
            user_name: user.user_name,
            image: user.image,
            emailVerified: user.emailVerified,
            ipAddress: user.ipAddress,
            isUserAllowed: user.isUserAllowed,
            isVerified: user.isVerified,
            subscription_plan: user.subscription_plan,
            role: user.role,
            createdAt: user.createdAt,
        }
    }

    getUserProfileDetail = async (
        {
            userId
        }: {
            userId: number;
        }
    ): Promise<{ data: UserType | null; message: string; success: boolean }> => {
        try {
            if (!userId) {
                return {
                    data: null,
                    success: false,
                    message: 'ID not found'
                }
            }

            const response = await prisma.user.findFirst({
                where: { id: userId },
            });

            if (!response) {
                return {
                    data: null,
                    success: false,
                    message: 'Not found'
                }
            }

            const result = await this.extractUserDetail(response as UserType);

            return {
                data: result,
                success: true,
                message: 'profile'
            }
        } catch (error) {
            console.log('repo server error', error);
            return {
                data: null,
                success: false,
                message: 'Server error'
            }
        }
    }
}