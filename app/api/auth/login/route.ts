import { prisma } from "@/app/src/lib/db";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { email, password } = await req.json();

        if (typeof email !== 'string' && typeof password !== 'string') {
            return NextResponse.json({ message: 'value must be string' },{ status: 400 });
        }

        if (email === '' && password === '') {
            return NextResponse.json({ message: 'value connot be empty' },{ status: 400 });
        }

        // is user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user){
            return NextResponse.json({ message: 'User does not exists' },{ status: 404 });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return NextResponse.json({ message: 'Invalid credintial' },{ status: 403 });
        }

        return NextResponse.json({ message: 'Login success' },{ status: 200 });
    } catch (error) {
        console.log('Internal Server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}