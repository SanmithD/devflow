import { prisma } from "@/app/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

export default async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const project_id = params.id;
        const logs = await prisma.aILog.findMany({
            where: { id: Number(project_id) },
            orderBy: { createdAt: "desc" },
            include: { project: true, user: true }
        });

        return NextResponse.json({ result: logs }, { status: 200 })

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Internal Server Error' },{ status: 500 });
    }
}