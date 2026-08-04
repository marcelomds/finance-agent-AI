import { Router } from 'express';
import {
  createExpenseController,
  getExpenseFileUrlController,
  listExpensesController,
  processExpenseController,
  uploadExpenseController,
} from '../controllers/expenseController';
import { uploadReceipt } from '../middleware/upload';
import { requireAuth } from '../middleware/requireAuth';

export const expenseRouter = Router();

expenseRouter.use(requireAuth);

expenseRouter.get('/api/expenses', listExpensesController);
expenseRouter.post('/api/expenses', createExpenseController);
expenseRouter.post('/api/expenses/upload', uploadReceipt, uploadExpenseController);
expenseRouter.get('/api/expenses/:id/file-url', getExpenseFileUrlController);
expenseRouter.post('/api/expenses/:id/process', processExpenseController);
