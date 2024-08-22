import User from "../models/user.model.js";

export const test = (req, res) => {
  res.json({
    message: `Congratulations your first api route is working!!`,
    success: true,
  });
};
