import { Request, Response } from 'express';
import { createExpense, listExpenses } from '../../services/expenseService';
import { ValidationError } from '../errors/AppError';
import { sendSuccessResponse } from '../utils/apiResponse';

export async function listExpensesController(req: Request, res: Response): Promise<void> {
  const userId = req.query.userId;

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new ValidationError('userId is required', ['userId']);
  }

  const expenses = await listExpenses(userId);
  sendSuccessResponse(res, expenses);
}

export async function createExpenseController(req: Request, res: Response): Promise<void> {
  const { userId, fileName, s3Key, originalFileUrl } = req.body ?? {};

  const missing = ['userId', 'fileName', 's3Key'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const expense = await createExpense({ userId, fileName, s3Key, originalFileUrl });
  sendSuccessResponse(res, expense, 'Expense created', 201);
}
