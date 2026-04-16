import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import nodemailer from "nodemailer";
import path from "path";
import { redis } from '../lib/redis';

// const transporter = nodemailer.createTransport({
//   host: "smtp.sendgrid.net",
//   port: 587,
//   auth: {
//     user: "apikey",
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpMail = async ({ email, otp }: { email: string; otp: string; }) => {
    try {
        const filePath = path.join(process.cwd(), 'app/src/templates/otp.hbs');
        const source = readFileSync(filePath, "utf-8");

        const template = handlebars.compile(source)
        const html = template({ otp });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'DevFlow - Verification Otp',
            html
        });
    } catch (error) {
        console.log('fail to send opt', error)
    }
};

export const optGenerator = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// opt save in redis for 5 minutes
export const saveOtpInRedis = async (email: string, otp: string) => {
    const hashedOtp = await bcrypt.hash(otp, 10);
    await redis.set(`signup-otp:${email}`, hashedOtp, { ex: 120 });
}

export const verifyOtp = async (email: string, otp: string) => {

    if (!otp) return false;
    const storedOtp = await redis.get(`signup-otp:${email}`);

    if (!storedOtp || typeof storedOtp !== "string") {
        return false;
    }

    const isValid = await bcrypt.compare(otp, storedOtp as string);

    if (!isValid) return false;

    await redis.del(`signup-otp:${email}`);
    return true;
};