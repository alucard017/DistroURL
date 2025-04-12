import { Request, Response, NextFunction } from "express";
import AppError from "../common/error/AppError";
import config from "../config";

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || "Something went wrong";

  config.Logger.error(message);
  res.status(statusCode).json({ status: "error", message });
};
