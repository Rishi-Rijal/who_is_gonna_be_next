import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;

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