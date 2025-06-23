import { getDashboardData } from '../models/dashboardModel.js';

// Mapeo de perfiles a sus IDs correspondientes en GLPI.
const PROFILE_MAP = {
  all: { profileIds: [5, 10], groupIds: [] }, // 'all' muestra todos los técnicos pero no filtra por un grupo específico
  l1:  { profileIds: [5], groupIds: [2] },   // Asumo que el ID de grupo para L1 es 2
  l2:  { profileIds: [10], groupIds: [1] }  // Deduje de tu ejemplo que el ID de grupo para L2 es 1
};

export const getDashboardApi = async (req, res, next) => {
  try {
    const profileKey = req.query.perfil || 'all';
    // Obtenemos los IDs de perfil y de grupo del mapa
    const { profileIds, groupIds } = PROFILE_MAP[profileKey] || PROFILE_MAP.all;

    // Pasamos ambos juegos de IDs al modelo
    const data = await getDashboardData(profileIds, groupIds);
    res.json(data);
  } catch (error) {
    next(error);
  }
};