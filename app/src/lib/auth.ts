import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export const getCurrentUser = (req: NextRequest) => {
    try {
        
        const token = req.cookies.get("token")?.value;

        if(!token){
            return null;
        }

        return verifyToken(token as string);
    } catch (error) {
        console.log('middleware error', error);
        return null;
    }
} 