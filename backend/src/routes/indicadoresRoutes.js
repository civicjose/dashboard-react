import { Router } from 'express';
import { getIndicadoresApi } from '../controllers/indicadoresController.js';

export const indicadoresRouter = Router();
indicadoresRouter.get('/', getIndicadoresApi);