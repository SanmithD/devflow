import { prisma } from "@/app/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await context.params; 

        const project_id = Number(id);

        if (!project_id || isNaN(project_id)) {
            return NextResponse.json(
                { message: "Invalid projectId" },
                { status: 400 }
            );
        }

        const logs = await prisma.aILog.findMany({
            where: { projectId: project_id },
            orderBy: { createdAt: "desc" },
            include: { project: true, user: true },
        });

        return NextResponse.json({ result: logs }, { status: 200 });

    } catch (error) {
        console.log("server error", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
};