
export interface UserType {
    id: number;
    email: string;
    isUserAllowed: boolean;
    createdAt: Date;
    isVerified: boolean;
    role: string;
    user_name?: string | null;
    emailVerified: boolean | null | Date;
    image?: string | null;
    subscriptionPlan?: string | null;
}
