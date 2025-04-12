class AppError extends Error {
  statusCode: number;
  explanation: string;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.explanation = message;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;

    if (!isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
