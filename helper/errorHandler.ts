import { ZodError, ZodIssue } from "zod";
import { Response } from "express";

export function handleError(res: Response, error: unknown) {
  const timestamp = new Date().toISOString();

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err: ZodIssue) => {
      const isTypeError = "expected" in err && "received" in err;

      return {
        field: err.path.join("."),
        message: err.message,
        code: err.code,
        ...(isTypeError && {
          expectedType: err.expected,
          receivedType: err.received,
        }),
        errorType: isTypeError ? "type_validation" : "generic_validation", 
      };
    });

    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      timestamp, 
      errors: formattedErrors,
    });
  }

  return res.status(500).json({
    status: "error",
    message:
      error instanceof Error ? error.message : "An unknown error occurred",
    timestamp, 
    errorCode: "INTERNAL_SERVER_ERROR", 
  });
}
