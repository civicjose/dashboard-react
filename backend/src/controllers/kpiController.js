import { getKpiData } from '../models/kpiModel.js';
import { query, validationResult } from 'express-validator';

export const getKpiApi = [
  // Validación para asegurar que las fechas son correctas
  query('desde').notEmpty().withMessage('La fecha "desde" es obligatoria.').isISO8601().toDate(),
  query('hasta').notEmpty().withMessage('La fecha "hasta" es obligatoria.').isISO8601().toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { desde, hasta } = req.query;
      const data = await getKpiData(desde, hasta);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
];