import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryActiveStatusController,
  updateCategoryController,
} from '../controllers/categoryController';

export const categoryRouter = Router();

categoryRouter.get('/api/categories', listCategoriesController);
categoryRouter.post('/api/categories', createCategoryController);
categoryRouter.patch('/api/categories/:id', updateCategoryController);
categoryRouter.patch('/api/categories/:id/active', updateCategoryActiveStatusController);
categoryRouter.delete('/api/categories/:id', deleteCategoryController);
