import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// 10 req per minute
export const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m")
});