import OpenAI from 'openai';
import { logger } from '../utils/logger.util';

if (!process.env.OPENAI_API_KEY) {
    logger.error("❌ Missing OPENAI_API_KEY in .env");
    process.exit(1);
}

export const ai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});