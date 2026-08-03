import { Request, Response } from 'express';
import { createExpense, getExpenseById, listExpenses } from '../../services/expenseService';
import { classifyExpensePipeline } from '../../services/expensePipeline';
import { uploadToS3 } from '../../services/storage/uploadFile';
import { getSignedFileUrl } from '../../services/storage/getFileUrl';
import { ValidationError } from '../errors/AppError';
import { sendSuccessResponse } from '../utils/apiResponse';

export async function listExpensesController(req: Request, res: Response): Promise<void> {
  const organizationId = req.query.organizationId;

  if (typeof organizationId !== 'string' || organizationId.length === 0) {
    throw new ValidationError('organizationId is required', ['organizationId']);
  }

  const expenses = await listExpenses(organizationId);
  sendSuccessResponse(res, expenses);
}

export async function createExpenseController(req: Request, res: Response): Promise<void> {
  const { organizationId, userId, fileName, s3Key, originalFileUrl } = req.body ?? {};

  const missing = ['organizationId', 'userId', 'fileName', 's3Key'].filter(
    (field) => !req.body?.[field],
  );
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const expense = await createExpense({ organizationId, userId, fileName, s3Key, originalFileUrl });
  sendSuccessResponse(res, expense, 'Expense created', 201);
}

export async function processExpenseController(req: Request, res: Response): Promise<void> {
  const organizationId = req.query.organizationId;

  if (typeof organizationId !== 'string' || organizationId.length === 0) {
    throw new ValidationError('organizationId is required', ['organizationId']);
  }

  const id = String(req.params.id);
  const description = typeof req.body?.description === 'string' ? req.body.description : undefined;

  const expense = await classifyExpensePipeline(organizationId, id, description);
  sendSuccessResponse(res, expense, 'Expense classified');
}

export async function uploadExpenseController(req: Request, res: Response): Promise<void> {
  const { organizationId, userId } = req.body ?? {};

  const missing = ['organizationId', 'userId'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  if (!req.file) {
    throw new ValidationError('File is required', ['file']);
  }

  const s3Key = await uploadToS3({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
    organizationId,
    folder: 'receipts',
  });

  const expense = await createExpense({
    organizationId,
    userId,
    fileName: req.file.originalname,
    s3Key,
  });

  sendSuccessResponse(res, expense, 'Expense uploaded', 201);
}

export async function getExpenseFileUrlController(req: Request, res: Response): Promise<void> {
  const organizationId = req.query.organizationId;

  if (typeof organizationId !== 'string' || organizationId.length === 0) {
    throw new ValidationError('organizationId is required', ['organizationId']);
  }

  const id = String(req.params.id);
  const expense = await getExpenseById(organizationId, id);
  const url = await getSignedFileUrl(expense.s3Key);

  sendSuccessResponse(res, { url });
}
