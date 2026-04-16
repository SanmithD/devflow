import { verifyOtp } from "@/app/src/lib/mail";
import { NextResponse, NextRequest } from "next/server";

export const POST = async(req: NextRequest) => {
    try {
        
        const { email, otp } = await req.json();

        if(typeof email !== 'string' && typeof opt !== "string"){
            return NextResponse.json({ message: "Value must be string" },{ status: 400 })
        }

        const isValid = await verifyOtp(email, otp)

        if(!isValid) {
            return NextResponse.json({ message: 'Invalid Otp' },{ status: 400 })
        }

        return NextResponse.json({ message: 'Verify successfull' },{ status: 200 })
    } catch (error) {
        console.log('Internal Server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}