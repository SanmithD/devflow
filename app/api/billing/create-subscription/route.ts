import { authOptions } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/db";
import { razorpay } from "@/app/src/lib/razorpay";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({ message: 'Session Not Found' },{ status: 404 })
        }

        const { plan } = await req.json();

        const subscription = await razorpay.subscriptions.create({
            plan_id: plan === 'pro' ? process.env.RAZORPAY_PRO_PLAN_ID! : process.env.RAZORPAY_ENTERPRISE_PLAN_ID!,
            total_count: 120,
            customer_notify: 1
        });

        void prisma.subscription.upsert({
            where: {
                userId: Number(session.user.id)
            },

            create: {
                userId: Number(session.user.id),    
                plan,
                status: "CREATED",
                razorpaySubscriptionId: subscription.id
            },

            update: {
                razorpaySubscriptionId: subscription.id,
                plan,
                status: "CREATED"
            }
        });

        return NextResponse.json({ message: 'subscription created', subscription },{ status: 201 });
    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Server Error' },{ status : 500 });
    }
}