import { sendConatcEmail } from "@/app/controllers/contact.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return sendConatcEmail(req);
}