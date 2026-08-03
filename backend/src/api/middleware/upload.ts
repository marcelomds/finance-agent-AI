import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ValidationError } from '../errors/AppError';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, JPG, PNG.`));
      return;
    }
    cb(null, true);
  },
}).single('file');

export function uploadReceipt(req: Request, res: Response, next: NextFunction): void {
  multerUpload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError('File too large. Max 10MB.', ['file']));
      return;
    }

    next(new ValidationError(err instanceof Error ? err.message : 'Invalid file', ['file']));
  });
}
