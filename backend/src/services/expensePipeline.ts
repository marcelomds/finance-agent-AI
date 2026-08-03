import { prisma } from '../db/prisma';
import { classifyExpense } from './ai/classificationAgent';
import { NotFoundError, ClassificationError } from '../api/errors/AppError';

export async function classifyExpensePipeline(
  organizationId: string,
  expenseId: string,
  descriptionOverride?: string,
) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, organizationId } });
  if (!expense) throw new NotFoundError('Expense not found');

  const categories = await prisma.category.findMany({
    where: { organizationId, isActive: true },
  });

  const start = Date.now();

  try {
    const result = await classifyExpense(
      { description: descriptionOverride ?? expense.fileName },
      categories.map((c) => ({ slug: c.slug, name: c.name })),
    );

    const category = categories.find((c) => c.slug === result.categorySlug);
    if (!category) {
      throw new ClassificationError(`Model returned unknown category slug: ${result.categorySlug}`);
    }

    const updated = await prisma.expense.update({
      where: { id: expense.id },
      data: {
        categoryId: category.id,
        categoryConfidence: result.confidence,
        status: 'classified',
      },
      include: { category: true },
    });

    await prisma.processingLog.create({
      data: {
        expenseId: expense.id,
        step: 'classification',
        status: 'success',
        duration: Date.now() - start,
        tokensUsed: result.tokensUsed,
      },
    });

    return updated;
  } catch (err) {
    await prisma.processingLog.create({
      data: {
        expenseId: expense.id,
        step: 'classification',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        duration: Date.now() - start,
      },
    });
    throw err;
  }
}
