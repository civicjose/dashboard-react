import { Router } from 'express';
import { getDashboardApi } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();
dashboardRouter.get('/', getDashboardApi);