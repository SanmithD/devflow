
export interface UserType {
    id: number;
    email: string;
    isUserAllowed: boolean;
    ipAddress: string;
    createdAt: Date;
    isVerified: boolean;
    role: string;
    user_name: string;
    emailVerified: boolean | null;
    image?: string;
    subscription_plan?: string;
}
