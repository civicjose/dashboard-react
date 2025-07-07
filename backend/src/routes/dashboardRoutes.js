import { Router } from 'express';
import { getDashboardApi, getTicketDetailsApi, getTecnicoDetailsApi } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();
dashboardRouter.get('/', getDashboardApi);
dashboardRouter.post('/ticket-details', getTicketDetailsApi);
dashboardRouter.get('/tecnico/:id', getTecnicoDetailsApi);