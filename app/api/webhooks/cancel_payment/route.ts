import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { razorpay } from "@/app/src/lib/razorpay";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        
        const session = await getServerSession(authOptions);

        if(!session) return NextResponse.json({ message: 'Session Not Found' },{ status: 404 });

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId: Number(session.user.id)
            },
        });

        if(!subscription){
            return NextResponse.json({ message: 'Subscription Not Found' },{ status: 404 });
        }

        await razorpay.subscriptions.cancel(
            subscription.razorpaySubscriptionId!,
            true
        );

        return NextResponse.json({ message: 'Payment Cancelled' },{ status: 200 });
    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' },{ status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        
        const session = await getServerSession(authOptions);

        if(!session) return NextResponse.json({ message: 'Session Not Found' },{ status: 404 });

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId: Number(session.user.id)
            },
        });

        if(!subscription){
            return NextResponse.json({ message: 'Subscription Not Found' },{ status: 404 });
        }

        return NextResponse.json({
            plan: subscription?.plan ?? "FREE",
            status: subscription?.status ?? "FREE"
        },{ status: 200 });
        
    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' },{ status: 500 });
    }
}