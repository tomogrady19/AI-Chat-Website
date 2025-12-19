import { z } from "zod";

export const askSchema = z.object({
  conversation: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(4000), // 1 to 4000 characters per message
      })
    )
    .min(1)
    .max(50), // 1 to 50 messages
});
