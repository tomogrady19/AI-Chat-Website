import { MAX_MESSAGES } from "../config/constants.js";

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        // check if any of the errors are caused by the conversation being too large
        let tooLarge = false;
        for (const err of result.error.errors) {
            if (err.code === "too_big" && err.path[0] === "conversation") {
                tooLarge = true;
                break;
            }
        }

        if (tooLarge) {
            return res.status(400).json({
              error: "Conversation too long. Please clear the chat.",
              maxMessages: MAX_MESSAGES
            });
        }

        return res.status(400).json({
            error: "Invalid request",
            issues: result.error.format()
        });
    }

    req.body = result.data; // always trusted from here on
    next();
};
