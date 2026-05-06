import { redis } from "./redis";

export const storeSignupData = async (email: string, user_name: string, password: string, otp: string) => {
    try {

        if (typeof email !== 'string' && typeof password !== 'string' && typeof otp !== 'string') {
            return {
                success: false,
                message: 'value must be string'
            }
        }

        if (email === '' && password === '' && otp === '' && user_name === '') {
            return {
                success: false,
                message: 'value connot be empty'
            }
        }

        const data = JSON.stringify({ email, user_name, password });

        // active for 2 minute
        await redis.set(`signup:${email}`, data, { ex: 120 });
        await redis.set(`otp:${email}`, otp, { ex: 120 })
    } catch (error) {
        console.log('server error', error);
        return {
            success: false,
            message: 'Fail to store data'
        }
    }
}