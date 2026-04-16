import { optGenerator, sendOtpMail } from "@/app/src/lib/mail";
import { redis } from "@/app/src/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req: NextRequest) => {
    try {
        const { email } = await req.json();

        if (typeof email !== 'string') {
            return NextResponse.json({ message: 'value must be string' },{ status: 400 });
        }

        if (email === '') {
            return NextResponse.json({ message: 'value connot be empty' },{ status: 400 });
        }

        const cooldown = await redis.get(`otp_cooldown:${email}`);

        if(cooldown){
            return NextResponse.json({ message: 'Please wait for some time' },{ status: 429 });
        }

        const key = `otp_req:${email}`;

        const count = await redis.incr(key);

        if(count === 1){
            await redis.expire(key, 120)
        }

        if(count > 3){
            return NextResponse.json({ message: 'Too many request' },{ status: 429 });
        }

        const otp = optGenerator();

        // overide old cache
        await redis.set(`otp:${email}`, otp, { ex: 120 });

        // set new 60s 
        await redis.set(`otp_cooldown:${email}`, otp, { ex: 60 });

        // send new otp
        await sendOtpMail({email, otp});

        return NextResponse.json({ message: 'Otp send to email' },{ status: 200 });
    } catch (error) {
        console.log('Server error', error);
        return NextResponse.json({ message: 'Internal Server Error' },{ status: 500 });
    }
}