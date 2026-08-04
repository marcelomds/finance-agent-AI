import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryActiveStatusController,
  updateCategoryController,
} from '../controllers/categoryController';
import { requireAuth } from '../middleware/requireAuth';

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get('/api/categories', listCategoriesController);
categoryRouter.post('/api/categories', createCategoryController);
categoryRouter.patch('/api/categories/:id', updateCategoryController);
categoryRouter.patch('/api/categories/:id/active', updateCategoryActiveStatusController);
categoryRouter.delete('/api/categories/:id', deleteCategoryController);
