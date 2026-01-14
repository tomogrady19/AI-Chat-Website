import { z } from "zod";
import { MAX_MESSAGES } from "../config/constants.js";

export const askSchema = z.object({
    conversation: z.array(
        z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string().min(0).max(4000), // 0 to 4000 characters per message
        })
    )
    .min(1)
    .max(MAX_MESSAGES),
});
