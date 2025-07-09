import { Router } from 'express';
import { getKpiApi } from '../controllers/kpiController.js';

export const kpiRouter = Router();

// Todas las peticiones GET a /api/kpi usarán este controlador
kpiRouter.get('/', getKpiApi);