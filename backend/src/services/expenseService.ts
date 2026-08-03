import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../api/errors/AppError';

export type CreateExpenseInput = {
  organizationId: string;
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl?: string;
};

export function listExpenses(organizationId: string) {
  return prisma.expense.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}

export async function createExpense(input: CreateExpenseInput) {
  try {
    return await prisma.expense.create({ data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new NotFoundError('User or organization not found');
    }
    throw err;
  }
}

export async function getExpenseById(organizationId: string, id: string) {
  const expense = await prisma.expense.findFirst({ where: { id, organizationId } });
  if (!expense) throw new NotFoundError('Expense not found');
  return expense;
}
