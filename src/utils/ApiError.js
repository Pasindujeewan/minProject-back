class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    code = "INTERNAL_SERVER_ERROR",
    errors = [],
  ) {
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
