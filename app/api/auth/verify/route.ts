import { prisma } from "@/app/src/lib/db";
import { generateToken } from "@/app/src/lib/jwt";
import { verifyOtp } from "@/app/src/lib/mail";
import { redis } from "@/app/src/lib/redis";
import { validateRequest } from "@/app/src/lib/validate";
import { VerifyType } from "@/app/src/types/auth.type";
import { verifySchema } from "@/app/src/validators/auth.schema";
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {

        const body = await req.json();

        const validate = await validateRequest(verifySchema, body);

        if (!validate.success) {
            return NextResponse.json({ message: validate.message }, { status: 400 });
        }

        const { email, otp }: VerifyType = validate.message as VerifyType;

        const isValid = await verifyOtp(email, otp)

        if (!isValid) {
            return NextResponse.json({ message: 'Invalid Otp' }, { status: 400 })
        }

        const { user_name, password } = body;

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                user_name,
                isVerified: true,
                ipAddress: ip
            }
        });

        if (!newUser) {
            return NextResponse.json({ message: 'Fail to create account' }, { status: 400 });
        }

        // removing opt and data from redis
        await redis.del(`signup:${email}`);
        await redis.del(`signup-otp:${email}`);

        // generate jwt token
        const token = generateToken({
            email: newUser.email,
            userId: newUser.id,
            role: newUser.role
        });

        const response = NextResponse.json({ message: 'signup success', token }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // set for 7 days
        });

        return response
    } catch (error) {
        console.log('error', error);
        return NextResponse.json({ message: 'Internal Server error' }, { status: 500 });
    }
}