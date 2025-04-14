class ApiError extends Error {
  statusCode: number;
  errors: unknown[];
  success: boolean;
  data: null;

  constructor(
    message: string,
    statusCode: number,
    errors: unknown[] = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = this.constructor.name;
  }
}

export default ApiError;
