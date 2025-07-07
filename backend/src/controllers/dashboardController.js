// CAMBIO: Importamos la nueva función del modelo
import { getDashboardData, getTicketDetailsByIds, getTecnicoDetails } from '../models/dashboardModel.js';
import { param, validationResult } from 'express-validator';

const PROFILE_MAP = {
  all: { profileIds: [5, 10], groupIds: [1, 2] },
  l1:  { profileIds: [5], groupIds: [2] },
  l2:  { profileIds: [10], groupIds: [1] }
};

export const getDashboardApi = async (req, res, next) => {
  try {
    const profileKey = req.query.perfil || 'all';
    const { profileIds, groupIds } = PROFILE_MAP[profileKey] || PROFILE_MAP.all;
    const data = await getDashboardData(profileIds, groupIds);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// NUEVO: Controlador para la nueva ruta de detalles
export const getTicketDetailsApi = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Se requiere un array de IDs de tickets.' });
        }
        const data = await getTicketDetailsByIds(ids);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

export const getTecnicoDetailsApi = [
  param('id').isInt().withMessage('El ID del técnico debe ser un número.'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const data = await getTecnicoDetails(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
];