import { prisma } from '../db/prisma';
import { classifyExpense } from './ai/classificationAgent';
import { extractReceiptData } from './ai/visionAgent';
import { getFileBuffer } from './storage/getFileBuffer';
import { NotFoundError, ClassificationError } from '../api/errors/AppError';

// Classifications below this confidence are routed to a human instead of auto-approved.
const AUTO_APPROVE_CONFIDENCE_THRESHOLD = 0.7;

async function withProcessingLog<T>(
  expenseId: string,
  step: string,
  fn: () => Promise<{ result: T; tokensUsed?: number }>,
): Promise<T> {
  const start = Date.now();
  try {
    const { result, tokensUsed } = await fn();
    await prisma.processingLog.create({
      data: { expenseId, step, status: 'success', duration: Date.now() - start, tokensUsed },
    });
    return result;
  } catch (err) {
    await prisma.processingLog.create({
      data: {
        expenseId,
        step,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        duration: Date.now() - start,
      },
    });
    throw err;
  }
}

export async function extractExpenseDataPipeline(organizationId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, organizationId } });
  if (!expense) throw new NotFoundError('Expense not found');

  return withProcessingLog(expense.id, 'vision_extract', async () => {
    const file = await getFileBuffer(expense.s3Key);
    const extracted = await extractReceiptData(file.buffer, file.mimeType);

    const updated = await prisma.expense.update({
      where: { id: expense.id },
      data: {
        extractedData: {
          vendor: extracted.vendor,
          amount: extracted.amount,
          currency: extracted.currency,
          date: extracted.date,
          description: extracted.description,
          confidence: extracted.confidence,
        },
        status: 'extracted',
      },
    });

    return { result: updated, tokensUsed: extracted.tokensUsed };
  });
}

export async function classifyExpensePipeline(organizationId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, organizationId } });
  if (!expense) throw new NotFoundError('Expense not found');

  const categories = await prisma.category.findMany({
    where: { organizationId, isActive: true },
  });

  const extractedData = expense.extractedData as {
    vendor: string | null;
    description: string;
    amount: number | null;
  } | null;

  return withProcessingLog(expense.id, 'classification', async () => {
    const result = await classifyExpense(
      {
        vendor: extractedData?.vendor ?? undefined,
        description: extractedData?.description ?? expense.fileName,
        amount: extractedData?.amount ?? undefined,
      },
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
        status: result.confidence >= AUTO_APPROVE_CONFIDENCE_THRESHOLD ? 'approved' : 'escalated',
      },
      include: { category: true },
    });

    return { result: updated, tokensUsed: result.tokensUsed };
  });
}

export async function processExpense(organizationId: string, expenseId: string) {
  await extractExpenseDataPipeline(organizationId, expenseId);
  return classifyExpensePipeline(organizationId, expenseId);
}
