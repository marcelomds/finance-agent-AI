import { Request, Response } from 'express';
import { createExpense, getExpenseById, listExpenses } from '../../services/expenseService';
import { hasActiveCategories } from '../../services/categoryService';
import { processExpense } from '../../services/expensePipeline';
import { expenseQueue } from '../../services/queue/expenseQueue';
import { uploadToS3 } from '../../services/storage/uploadFile';
import { getSignedFileUrl } from '../../services/storage/getFileUrl';
import { ValidationError } from '../errors/AppError';
import { sendSuccessResponse } from '../utils/apiResponse';
import { getAuthUser } from '../utils/authContext';

export async function listExpensesController(req: Request, res: Response): Promise<void> {
  const { organizationId } = getAuthUser(req);
  const expenses = await listExpenses(organizationId);
  sendSuccessResponse(res, expenses);
}

export async function createExpenseController(req: Request, res: Response): Promise<void> {
  const { organizationId, userId } = getAuthUser(req);
  const { fileName, s3Key, originalFileUrl } = req.body ?? {};

  const missing = ['fileName', 's3Key'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const expense = await createExpense({ organizationId, userId, fileName, s3Key, originalFileUrl });
  sendSuccessResponse(res, expense, 'Expense created', 201);
}

export async function processExpenseController(req: Request, res: Response): Promise<void> {
  const { organizationId } = getAuthUser(req);
  const id = String(req.params.id);
  const expense = await processExpense(organizationId, id);
  sendSuccessResponse(res, expense, 'Expense processed');
}

export async function uploadExpenseController(req: Request, res: Response): Promise<void> {
  const { organizationId, userId } = getAuthUser(req);

  if (!req.file) {
    throw new ValidationError('File is required', ['file']);
  }

  if (!(await hasActiveCategories(organizationId))) {
    throw new ValidationError(
      'Create at least one category before uploading expenses',
      ['categories'],
    );
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

  await expenseQueue.add({ organizationId, expenseId: expense.id });

  sendSuccessResponse(res, expense, 'Expense uploaded', 201);
}

export async function getExpenseFileUrlController(req: Request, res: Response): Promise<void> {
  const { organizationId } = getAuthUser(req);
  const id = String(req.params.id);
  const expense = await getExpenseById(organizationId, id);
  const url = await getSignedFileUrl(expense.s3Key);

  sendSuccessResponse(res, { url });
}
