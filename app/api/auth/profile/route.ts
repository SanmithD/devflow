import { getUserProfile } from '@/app/controllers/profile.controller';
import { NextRequest } from 'next/server';

export const GET = async(req: NextRequest) => {
    return await getUserProfile();
}