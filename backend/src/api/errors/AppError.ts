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
