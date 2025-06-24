import { Router } from 'express';
// CAMBIO: Importamos los dos controladores que usaremos
import { getIndicadoresApi, getTecnicoDetalleApi } from '../controllers/indicadoresController.js';

export const indicadoresRouter = Router();

// Ruta principal que ya teníamos
indicadoresRouter.get('/', getIndicadoresApi);

// NUEVO: Ruta para obtener el detalle de un técnico específico
indicadoresRouter.get('/tecnico/:id', getTecnicoDetalleApi);