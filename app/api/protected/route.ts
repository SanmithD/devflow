import { getUserFromRequest } from "@/app/src/lib/auth";
import { handleErrors } from "@/app/src/lib/error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest) => {
    try {
        
        const user = getUserFromRequest(req);

        if(!user){
            return NextResponse.json({ message: 'UnAuthorized access' },{ status: 401 });
        }

        return NextResponse.json({ message: 'Authorized access', user },{ status: 200 });
    } catch (error) {
        console.log(error);
        return handleErrors(error);
    }
}