import Queue from 'bull';
import { prisma } from '../../db/prisma';
import { processExpense } from '../expensePipeline';

export type ExpenseJobData = {
  organizationId: string;
  expenseId: string;
};

export const expenseQueue = new Queue<ExpenseJobData>('expense-processing', process.env.REDIS_URL!, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

expenseQueue.process(async (job) => {
  await processExpense(job.data.organizationId, job.data.expenseId);
});

expenseQueue.on('failed', async (job, err) => {
  console.error(`Expense job failed (expense ${job.data.expenseId}, attempt ${job.attemptsMade}):`, err.message);

  const retriesExhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
  if (!retriesExhausted) return;

  await prisma.expense.updateMany({
    where: { id: job.data.expenseId, organizationId: job.data.organizationId },
    data: { status: 'escalated' },
  });
});
