import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email('Invalid email'),
    user_name: z.string().min(3, "Name must be more then 3 characters").max(14, "Name should be less then 14 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const verifySchema = z.object({
    email: z.string().email('Invalid email'),
    otp: z.string().min(6, "Otp must be at least 6 characters")
});