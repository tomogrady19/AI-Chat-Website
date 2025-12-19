export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Your conversation is too long. Try clearing chat and try again.",
      details: result.error.errors,
    });
  }

  req.body = result.data; // always trusted from here on
  next();
};
