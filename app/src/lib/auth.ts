import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export const getUserFromRequest = (req: NextRequest) => {
    try {
        
        const authHeader = req.headers.get('authorization');

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return null;
        }

        const token = authHeader.split(" ")[1];

        return verifyToken(token);
    } catch (error) {
        console.log('middleware error', error);
        return null;
    }
} 