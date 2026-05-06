import { z } from 'zod';

export const AgentDecisionSchema = z.object({
    action: z.enum(["tool", "final"]),
    tool: z.string().nullable().optional(),
    input: z.string().nullable().optional(),
    finalAnswer: z.string().nullable().optional()
});

export type AgentDecision = z.infer<typeof AgentDecisionSchema>;