import { MAX_MESSAGES } from "../config/constants.js";

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const tooLarge = result.error.errors.some(
            err => err.code === "too_big" && err.path[0] === "conversation"
        );
        if (tooLarge) {
            return res.status(413).json({
              error: "Conversation too long. Please clear the chat.",
              maxMessages: MAX_MESSAGES
            });
        }

        return res.status(400).json({
            error: "Invalid request",
            details: result.error.errors,
            issues: result.error.format() //TODO Not for deployment?
        });
    }

    req.body = result.data; // always trusted from here on
    next();
};

// result.error.errors.map(e => ({
//     path: e.path.join("."),
//     message: e.message
//   }))
//TODO consider reformatting error like this?
