import { prisma } from '@/app/src/lib/db';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

function verifySignature(
    body: string,
    signature: string
) {
    try {
        const execpted = crypto.createHmac(
            "sha256",
            process.env.RAZORPAY_WEBHOOK_SECRET!
        ).update(
            body
        ).digest(
            "hex"
        );

        return execpted === signature;
    } catch (error) {
        console.log('server error', error);
        throw new Error('Server Error')
    }
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.text();

        const signature = req.headers.get("x-razorpay-signature");

        if (!signature || !verifySignature(body, signature)) {
            return new NextResponse(
                "Invalid signature",
                { status: 400 }
            );
        }

        const event = JSON.parse(body);

        switch(event.event){
            case "subscription.activated": {
                const sub = event.payload.subscription.entity;

                await prisma.subscription.update({
                    where: {
                        razorpaySubscriptionId: String(sub.id)
                    },

                    data: {
                        status: "ACTIVE",
                        currentPeriodStart: new Date(sub.current_start * 1000),
                        currentPeriodEnd: new Date(sub.current_end * 1000)
                    },
                });

                break;
            }
            case "subscription.charged": {

                const payment = event.payload.payment.entity;

                const subscriptionId = payment.subscription_id;

                const subscription = await prisma.subscription.findUnique({
                    where: {
                        razorpaySubscriptionId: String(subscriptionId)
                    },
                });

                if(!subscription) break;


                await prisma.payment.create({
                    data: {
                        userId: subscription.userId,
                        amount: payment.amount,
                        currency: payment.currency,
                        razorpayPaymentId: payment.id,
                        razorpaySubscriptionId: subscriptionId,
                        status: "CAPTURED"
                    }
                });

                await prisma.subscription.update({
                    where: {
                        id: subscription.id
                    },

                    data: {
                        status: "ACTIVE",
                        razorpayPaymentId: payment.id
                    }
                });

                await prisma.user.update({
                    where: {
                        id: Number(subscription.userId)
                    },

                    data: {
                        subscriptionPlan: subscription.plan
                    }
                });

                break;
            }
                
            case "subscription.cancelled": {
                
                const sub = event.payload.subscription.entity;

                const subscription = await prisma.subscription.findUnique({
                    where: {
                        razorpaySubscriptionId: String(sub.id)
                    }
                });

                if(!subscription) break;

                await prisma.subscription.update({
                    where: {
                        id: Number(subscription.id)
                    },

                    data: {
                        status: "CANCELLED"
                    }
                });

                await prisma.user.update({
                    where: {
                        id: Number(subscription.userId)
                    },

                    data: {
                        subscriptionPlan: "FREE"
                    }
                });

                break;
            }
            case "payment.failed":
                break;
        }

        return NextResponse.json({ success: true },{ status: 200 });
    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}