import { prisma } from "@/app/src/lib/db";
import { optGenerator, saveOtpInRedis, sendOtpMail } from "@/app/src/lib/mail";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req: NextRequest) => {
    try {
        
        const { email } = await req.json();

        if(!email || email === ''){
            return NextResponse.json({ message: 'Email is required' },{ status: 400 })
        }

        const isEmailExits = await prisma.user.findUnique({
            where: { email }
        });

        if(isEmailExits) return NextResponse.json({ message: 'Email Already exists' })

        const otp = optGenerator();

        await sendOtpMail({ email, otp });
        await saveOtpInRedis(email, otp);

        await prisma.mailRecord.create({
            data: {
                userId: 0,
                table: 'Mail Record',
                value: otp
            }
        })

        return NextResponse.json({ message: 'Opt sent' }, { status: 200 })
    } catch (error) {
        console.log('Internal Server error', error);
        return NextResponse.json({ message: 'Internal Server Error' },{ status: 500 })
    }
}