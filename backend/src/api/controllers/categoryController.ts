import { Request, Response } from 'express';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  updateCategoryActiveStatus,
} from '../../services/categoryService';
import { ValidationError } from '../errors/AppError';
import { sendSuccessResponse } from '../utils/apiResponse';

function requireOrganizationId(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ValidationError('organizationId is required', ['organizationId']);
  }
  return value;
}

export async function listCategoriesController(req: Request, res: Response): Promise<void> {
  const organizationId = requireOrganizationId(req.query.organizationId);
  const categories = await listCategories(organizationId);
  sendSuccessResponse(res, categories);
}

export async function createCategoryController(req: Request, res: Response): Promise<void> {
  const organizationId = requireOrganizationId(req.body?.organizationId);
  const { name, slug } = req.body ?? {};

  const missing = ['name', 'slug'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const category = await createCategory(organizationId, { name, slug });
  sendSuccessResponse(res, category, 'Category created', 201);
}

export async function updateCategoryController(req: Request, res: Response): Promise<void> {
  const organizationId = requireOrganizationId(req.query.organizationId);
  const { name, slug } = req.body ?? {};

  if (!name && !slug) {
    throw new ValidationError('At least one field is required', ['name', 'slug']);
  }

  const id = String(req.params.id);
  const category = await updateCategory(organizationId, id, { name, slug });
  sendSuccessResponse(res, category, 'Category updated');
}

export async function deleteCategoryController(req: Request, res: Response): Promise<void> {
  const organizationId = requireOrganizationId(req.query.organizationId);
  const id = String(req.params.id);
  await deleteCategory(organizationId, id);
  sendSuccessResponse(res, null, 'Category deleted');
}

export async function updateCategoryActiveStatusController(req: Request, res: Response): Promise<void> {
  const organizationId = requireOrganizationId(req.query.organizationId);
  const { isActive } = req.body ?? {};

  if (typeof isActive !== 'boolean') {
    throw new ValidationError('isActive must be a boolean', ['isActive']);
  }

  const id = String(req.params.id);
  const category = await updateCategoryActiveStatus(organizationId, id, isActive);
  sendSuccessResponse(res, category, 'Category active status updated');
}
