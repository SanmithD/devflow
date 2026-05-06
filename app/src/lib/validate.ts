import { ZodSchema } from 'zod';
import { SignupType } from '../types/auth.type';

export const validateRequest = async(schema: ZodSchema, body: SignupType) => {
    try {
        const result = schema.safeParse(body);

        if(!result.success){
            return {
                success: false,
                message: result.error.flatten().fieldErrors,
            }
        }

        return {
            success: true,
            message: result.data
        }
    } catch (error) {
        console.log('type error', error);
        return {
            success: false,
            message: 'Internal server error'
        }
    }
}