import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>; // or Promise<void>

const asyncHandler = (requestHandler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
