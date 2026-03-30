import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;
  void req;

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue?.message ?? "Validation failed";

    return res.status(400).json({
      success: false,
      message,
      errors: err.issues,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};
