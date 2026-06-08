import { NextRequest, NextResponse } from "next/server";
import { ContactRepository } from "../repository/contact.repository";

export const sendConatcEmail = async(req: NextRequest) => {
    try {
        const body = await req.json();

        const { email, subject, message } = body;

        const contactRepo = new ContactRepository();
        const res = await contactRepo.sendContactEmailToAdmin({ email, subject, message });

        return NextResponse.json({ data: res },{ status: 200 });
    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Server Error' },{ status: 500 });
    }
}