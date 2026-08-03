import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../api/errors/AppError';

export type CreateExpenseInput = {
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl?: string;
};

export function listExpenses(userId: string) {
  return prisma.expense.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    return await prisma.expense.create({ data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new NotFoundError('User not found');
    }
    throw err;
  }
}
