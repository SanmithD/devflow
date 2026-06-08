import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
// import nodemailer from "nodemailer";
import path from "path";
import { Resend } from 'resend';
import { redis } from '../lib/redis';

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMail = async ({ email, otp }: { email: string; otp: string; }) => {
    try {
        const filePath = path.join(process.cwd(), 'app/src/templates/otp.hbs');
        const source = readFileSync(filePath, "utf-8");

        const template = handlebars.compile(source)
        const html = template({ otp });

        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: 'DevFlow - Verification Otp',
        //     html
        // });

        await resend.emails.send({
            from: "DevFlow <onboarding@resend.dev>",
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
    await redis.set(`signup-otp:${email}`, hashedOtp, { ex: 300 });
}

export const verifyOtp = async (email: string, otp: string) => {
  console.log("Incoming OTP:", otp);

  const storedOtp = await redis.get(`signup-otp:${email}`);
  console.log("Stored OTP:", storedOtp);

  if (!storedOtp || typeof storedOtp !== "string") {
    console.log("No OTP found in Redis");
    return false;
  }

  const isValid = await bcrypt.compare(otp, storedOtp);
  console.log("Match result:", isValid);

  if (!isValid) return false;

  await redis.del(`signup-otp:${email}`);
  return true;
};