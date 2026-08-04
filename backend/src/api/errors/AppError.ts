export class AppError extends Error {
  constructor(message: string, public statusCode = 400, public errors?: string[]) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: string[]) {
    super(message, 422, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ClassificationError extends AppError {
  constructor(message = 'Failed to classify expense') {
    super(message, 502);
  }
}

export class VisionExtractionError extends AppError {
  constructor(message = 'Failed to extract receipt data') {
    super(message, 502);
  }
}
