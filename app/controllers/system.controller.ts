import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { SystemInfoRepository } from "../repository/system.repository";
import { authOptions } from "../src/lib/auth";

export const getSystemInfo = async(req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({ message: 'Session not found' },{ status: 404 });
        }

        const userId = session.user.id;

        if(!userId){
            return NextResponse.json({ message: 'Unauthorized' },{ status: 404 });
        }

        const systemRepo = new SystemInfoRepository();
        const response = await systemRepo.getSystemConfiguration();

        if(response.success === false){
            return NextResponse.json({ message: response.message },{ status: 404 });
        }

        return NextResponse.json({ message: response.message, data: response.data },{ status: 200 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'server error' },{ status: 500 });
    }
}