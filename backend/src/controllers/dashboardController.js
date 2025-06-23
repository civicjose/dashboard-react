import { getDashboardData } from '../models/dashboardModel.js';

export const getDashboardApi = async (req, res, next) => {
  try {
    const profile = req.query.perfil || 'all';
    const profiles = profile === 'all' ? [5, 10] : (profile === 'l1' ? [5] : [10]);
    const data = await getDashboardData(profiles);
    res.json(data);
  } catch (error) {
    next(error);
  }
};