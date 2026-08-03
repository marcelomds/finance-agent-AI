import { Request, Response } from 'express';
import { createExpense, listExpenses } from '../../services/expenseService';
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
