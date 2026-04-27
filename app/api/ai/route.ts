import { generateAIResponse } from "@/app/services/ai.service";
import { prisma } from "@/app/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { prompt, projectId } = await req.json();

    const result = await generateAIResponse(prompt);

    await prisma.aILog.create({
        data: {
            userId: 0,
            projectId: Number(projectId),
            input: prompt,
            response: result || ""
        }
    })

    return NextResponse.json({ result });
}