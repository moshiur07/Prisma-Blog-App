import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // PrismaClientValidationError

  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "You provided invalid or missing data.";
  }

  res.status(statusCode);
  res.json({
    message: message,
    error: errorDetails,
  });
}
export default errorHandler;
