import { Request, Response, NextFunction } from "express";
import Core from "../common/index";

const { ApiError, Logger } = Core;

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isAppError = err instanceof ApiError;

  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";
  const success = false;
  const errors = isAppError ? err.errors : [];
  const data = isAppError ? err.data : null;

  // Log appropriately
  if (isAppError) {
    Logger.error(`[${statusCode}] ${message} - ${JSON.stringify(errors)}`);
  } else {
    Logger.error(`[${statusCode}] ${message}`);
    Logger.error(err.stack || "No stack trace available");
  }

  res.status(statusCode).json({
    success,
    message,
    errors,
    data,
  });
};
