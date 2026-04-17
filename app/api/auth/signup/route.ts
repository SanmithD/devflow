import { storeSignupData } from "@/app/src/lib/authStore";
import { prisma } from "@/app/src/lib/db";
import { handleErrors } from "@/app/src/lib/error";
import { optGenerator, sendOtpMail } from "@/app/src/lib/mail";
import { redis } from "@/app/src/lib/redis";
import { validateRequest } from "@/app/src/lib/validate";
import { SignupType } from "@/app/src/types/auth.type";
import { signupSchema } from "@/app/src/validators/auth.schema";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const validate = await validateRequest(signupSchema, body);

        if (!validate.success) {
            return NextResponse.json({ message: validate.message }, { status: 400 });
        }

        const { email, user_name, password }: SignupType = validate.message as SignupType;

        const key = `otp_req:${email}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 120)
        }

        if (count > 3) {
            return NextResponse.json({ message: 'Too many request' }, { status: 429 });
        }

        const isUserExists = await prisma.user.findUnique({ where: { email } });

        if (isUserExists) {
            return NextResponse.json({ message: 'User already exits' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = optGenerator();

        await storeSignupData(email, user_name, hashedPassword, otp);
        await sendOtpMail({ email, otp });

        return NextResponse.json({ message: 'Otp send to email' }, { status: 200 });
    } catch (error) {
        return handleErrors(error);
    }
}