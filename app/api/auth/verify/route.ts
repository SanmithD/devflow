import { prisma } from "@/app/src/lib/db";
import { handleErrors } from "@/app/src/lib/error";
import { verifyOtp } from "@/app/src/lib/mail";
import { redis } from "@/app/src/lib/redis";
import { validateRequest } from "@/app/src/lib/validate";
import { VerifyType } from "@/app/src/types/auth.type";
import { verifySchema } from "@/app/src/validators/auth.schema";
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

        const data = await redis.get(`signup:${email}`);

        const { user_name, password } = JSON.parse(data as string);

        const newUser = await prisma.user.create({
            data: {
                email,
                password,
                user_name,
                isVerified: true,
            }
        });

        if (!newUser) {
            return NextResponse.json({ message: 'Fail to create account' }, { status: 400 });
        }

        // removing opt and data from redis
        await redis.del(`signup:${email}`);
        await redis.del(`otp:${email}`);

        return NextResponse.json({ message: 'Verify successfull' }, { status: 201 });
    } catch (error) {
        return handleErrors(error);
    }
}