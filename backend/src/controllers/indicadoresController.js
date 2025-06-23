import { getIndicadores } from '../models/indicadoresModel.js';

export const getIndicadoresApi = async (req, res, next) => {
  try {
    const { perfil = 'all', desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Fechas `desde` y `hasta` son obligatorias' });
    }
    const profiles = perfil === 'all' ? [5, 10] : (perfil === 'l1' ? [5] : [10]);
    const data = await getIndicadores(desde, hasta, profiles);
    res.json(data);
  } catch (error) {
    next(error);
  }
};