import { Router } from 'express';
import { createExpenseController, listExpensesController } from '../controllers/expenseController';

export const expenseRouter = Router();

expenseRouter.get('/api/expenses', listExpensesController);
expenseRouter.post('/api/expenses', createExpenseController);
