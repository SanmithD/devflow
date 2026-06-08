import { resend } from "../src/lib/mail";

export class ContactRepository {

    sendContactEmailToAdmin = async (
        {
            email,
            subject,
            message
        }: {
            email: string;
            subject: string;
            message: string;
        }
    ) => {
        try {

            await resend.emails.send({
                from: email,
                to: "devflow.org.ai@gmail.com",
                subject,
                html: message
            });
        } catch (error) {
            console.log('server error', error);
            throw new Error('Server Error');
        }
    }
}