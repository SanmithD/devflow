import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ProfileRepository } from "../repository/profile.repository";
import { authOptions } from "../src/lib/auth";

export const getUserProfile = async() => {
    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({ message: 'Session Not Found' },{ status: 400 });
        }

        const userId = session.user.id;

        console.log('user id', userId, typeof userId);

        if(!userId){
            return NextResponse.json({ message: 'Unauthorized' },{ status: 403 })
        }

        const profileRepo = new ProfileRepository();
        const result = await profileRepo.getUserProfileDetail({ userId: Number(userId) });

        if(result.success === false){
            return NextResponse.json({ message: result.message },{ status: 400 })
        }

        return NextResponse.json({ data: result.data, message: 'User detail' },{ status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Server Error' },{ status: 500 });
    }
}