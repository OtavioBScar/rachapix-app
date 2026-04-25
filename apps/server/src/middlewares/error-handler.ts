import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  console.error(error);

  response.status(500).json({
    error: {
      message,
    },
  });
};
