import { generateAIResponse } from "@/app/services/ai.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { prompt, projectId } = await req.json();

    const result = await generateAIResponse(prompt);

    return NextResponse.json({ result });
}