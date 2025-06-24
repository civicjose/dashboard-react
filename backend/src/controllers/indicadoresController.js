import { getIndicadores, getTecnicoDetalle } from '../models/indicadoresModel.js';
import { query, validationResult, param } from 'express-validator';

const PROFILE_MAP = {
  all: { profileIds: [5, 10], groupIds: [] },
  l1:  { profileIds: [5], groupIds: [2] },
  l2:  { profileIds: [10], groupIds: [1] }
};

export const getIndicadoresApi = [
  query('desde').notEmpty().isISO8601(),
  query('hasta').notEmpty().isISO8601(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { desde, hasta, perfil } = req.query;
      const profileKey = perfil || 'all';
      const { profileIds, groupIds } = PROFILE_MAP[profileKey] || PROFILE_MAP.all;
      const data = await getIndicadores(desde, hasta, profileIds, groupIds);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
];

// NUEVO: Controlador para el detalle del técnico
export const getTecnicoDetalleApi = [
  param('id').isInt(),
  query('desde').notEmpty().isISO8601(),
  query('hasta').notEmpty().isISO8601(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { desde, hasta } = req.query;
        const data = await getTecnicoDetalle(id, desde, hasta);
        res.json(data);
    } catch (error) {
        next(error);
    }
  }
];