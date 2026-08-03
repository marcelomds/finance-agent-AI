import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ConflictError, NotFoundError } from '../api/errors/AppError';

export type CategoryInput = {
  name: string;
  slug: string;
};

export function listCategories(organizationId: string) {
  return prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(organizationId: string, input: CategoryInput) {
  try {
    return await prisma.category.create({ data: { ...input, organizationId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictError('Category name or slug already exists');
    }
    throw err;
  }
}

async function findCategoryOrThrow(organizationId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, organizationId } });
  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function updateCategory(organizationId: string, id: string, input: Partial<CategoryInput>) {
  await findCategoryOrThrow(organizationId, id);

  try {
    return await prisma.category.update({ where: { id }, data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictError('Category name or slug already exists');
    }
    throw err;
  }
}

export async function deleteCategory(organizationId: string, id: string): Promise<void> {
  await findCategoryOrThrow(organizationId, id);
  await prisma.category.delete({ where: { id } });
}

export async function updateCategoryActiveStatus(organizationId: string, id: string, isActive: boolean) {
  await findCategoryOrThrow(organizationId, id);
  return prisma.category.update({ where: { id }, data: { isActive } });
}
