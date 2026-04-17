import { prisma } from "@/app/src/lib/db";
import { handleErrors } from "@/app/src/lib/error";
import { generateToken } from "@/app/src/lib/jwt";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { email, password } = await req.json();

        if (typeof email !== 'string' && typeof password !== 'string') {
            return NextResponse.json({ message: 'value must be string' }, { status: 400 });
        }

        if (email === '' && password === '') {
            return NextResponse.json({ message: 'value connot be empty' }, { status: 400 });
        }

        // is user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ message: 'User does not exists' }, { status: 404 });
        }

         if (!user.isVerified) {
            return NextResponse.json({ message: 'Please verify your email' }, { status: 403 });
        }

         if (!user.isUserAllowed) {
            return NextResponse.json({ message: 'Account is blocked' }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credintial' }, { status: 403 });
        }

        // generate jwt token
        const token = generateToken({
            email: user.email,
            userId: user.id,
            role: user.role
        });

        return NextResponse.json({ message: 'Login success', token }, { status: 200 });
    } catch (error) {
        return handleErrors(error);
    }
}