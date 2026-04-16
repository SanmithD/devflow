import { prisma } from "@/app/src/lib/db";
import { verifyOtp } from "@/app/src/lib/mail";
import { redis } from "@/app/src/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req: NextRequest) => {
    try {
        
        const { email, otp } = await req.json();

        if(typeof email !== 'string' && typeof otp !== "string"){
            return NextResponse.json({ message: "Value must be string" },{ status: 400 })
        }

        const isValid = await verifyOtp(email, otp)

        if(!isValid) {
            return NextResponse.json({ message: 'Invalid Otp' },{ status: 400 })
        }

        const data = await redis.get(`signup:${email}`);

        const { password } = JSON.parse(data as string);

        const newUser = await prisma.user.create({
            data: {
                email,
                password,
                isVerified: true,
            }
        });

        if(!newUser){
            return NextResponse.json({ message: 'Fail to create account' },{ status: 400 });
        }

        // removing opt and data from redis
        await redis.del(`signup:${email}`);
        await redis.del(`otp:${email}`);

        return NextResponse.json({ message: 'Verify successfull' },{ status: 201 });
    } catch (error) {
        console.log('Internal Server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}