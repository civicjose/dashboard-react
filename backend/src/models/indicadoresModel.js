import { pool } from '../config/db.js';
import { calculateBusinessMinutes, toHHMM } from '../utils/laborTime.js';

export async function getIndicadores(desde, hasta, profileIds, groupIds) {
  const conn = await pool.getConnection();
  const effectiveGroupIds = groupIds.length > 0 ? groupIds : [-1];

  try {
    // Consulta 1: Tickets Creados
    const [statsCreados] = await conn.query(
      `SELECT COUNT(id) AS creados_total, SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS creados_incidencias, SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS creados_peticiones FROM glpi_tickets WHERE DATE(date) BETWEEN ? AND ? AND is_deleted = 0`,
      [desde, hasta]
    );

    // Consulta 2: Tickets Resueltos
    const [statsResueltos] = await conn.query(
      `SELECT COUNT(t.id) AS resueltos_total, SUM(CASE WHEN t.type = 1 THEN 1 ELSE 0 END) AS resueltos_incidencias, SUM(CASE WHEN t.type = 2 THEN 1 ELSE 0 END) AS resueltos_peticiones FROM glpi_tickets t LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id WHERE DATE(t.solvedate) BETWEEN ? AND ? AND t.is_deleted = 0 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?))`,
      [desde, hasta, profileIds, effectiveGroupIds]
    );

    const statsTickets = { ...statsCreados[0], ...statsResueltos[0] };

    // Consulta 3: Resueltos por Técnico (con ID)
    const [resueltosPorTecnico] = await conn.query(
      `SELECT u.id, u.firstname, u.realname, COUNT(t.id) as total FROM glpi_tickets t JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2 JOIN glpi_users u ON tu.users_id = u.id JOIN glpi_profiles_users pu ON u.id = pu.users_id WHERE DATE(t.solvedate) BETWEEN ? AND ? AND t.is_deleted = 0 AND pu.profiles_id IN (?) GROUP BY u.id, u.firstname, u.realname ORDER BY total DESC`,
      [desde, hasta, profileIds]
    );
    
    // Consultas y Lógica para Tiempos de Resolución
    const [ticketsResueltos] = await conn.query(
      `SELECT t.id, t.type, t.date as date_creation, t.solvedate FROM glpi_tickets t LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id WHERE DATE(t.solvedate) BETWEEN ? AND ? AND t.is_deleted = 0 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?))`,
      [desde, hasta, profileIds, effectiveGroupIds]
    );
    
    const ticketIds = ticketsResueltos.map(t => t.id);
    let logs = [];
    if (ticketIds.length > 0) {
      const [logRows] = await conn.query(
        `SELECT items_id as ticket_id, date_mod as timestamp, new_value as status_id FROM glpi_logs WHERE items_id IN (?) AND itemtype = 'Ticket' AND id_search_option = 12 ORDER BY items_id, date_mod ASC`,
        [ticketIds]
      );
      logs = logRows;
    }

    let totalMinutesIncidencias = 0, countIncidencias = 0, totalMinutesPeticiones = 0, countPeticiones = 0;
    for (const ticket of ticketsResueltos) {
        const ticketLogs = logs.filter(l => l.ticket_id === ticket.id);
        let totalBusinessMinutes = calculateBusinessMinutes(ticket.date_creation, ticket.solvedate);
        let pausedMinutes = 0;
        for (let i = 0; i < ticketLogs.length; i++) {
            const currentLog = ticketLogs[i];
            const currentStatus = parseInt(currentLog.status_id, 10);
            if (currentStatus === 4) {
                const startPause = currentLog.timestamp;
                const endPause = (i + 1 < ticketLogs.length) ? ticketLogs[i+1].timestamp : ticket.solvedate;
                pausedMinutes += calculateBusinessMinutes(startPause, endPause);
            }
        }
        const realResolutionMinutes = totalBusinessMinutes - pausedMinutes;
        if (ticket.type === 1) { totalMinutesIncidencias += realResolutionMinutes; countIncidencias++; } 
        else if (ticket.type === 2) { totalMinutesPeticiones += realResolutionMinutes; countPeticiones++; }
    }
    const avgIncidencias = countIncidencias > 0 ? totalMinutesIncidencias / countIncidencias : NaN;
    const avgPeticiones = countPeticiones > 0 ? totalMinutesPeticiones / countPeticiones : NaN;
    const avgTotal = (countIncidencias + countPeticiones) > 0 ? (totalMinutesIncidencias + totalMinutesPeticiones) / (countIncidencias + countPeticiones) : NaN;
    const tiemposFormateados = { tiempo_medio_total: toHHMM(avgTotal), tiempo_medio_incidencias: toHHMM(avgIncidencias), tiempo_medio_peticiones: toHHMM(avgPeticiones) };

    // Consultas para Reabiertos
    const [reopenedLogs] = await conn.query(`SELECT DISTINCT l.items_id FROM glpi_logs l JOIN glpi_tickets t ON t.id = l.items_id LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_users u ON u.id = tu.users_id LEFT JOIN glpi_profiles_users pu ON pu.users_id = u.id WHERE l.itemtype = 'Ticket' AND l.id_search_option = 12 AND l.old_value IN ('5', '6') AND l.new_value IN ('1','2','3','4') AND DATE(l.date_mod) BETWEEN ? AND ? AND (pu.profiles_id IN (?) OR tu.users_id IS NULL)`, [desde, hasta, profileIds]);
    const reopenedTicketIds = reopenedLogs.map(r => r.items_id);
    let reabiertos = [], reabiertosPorTecnico = [];
    if (reopenedTicketIds.length > 0) {
      [reabiertos] = await conn.query(`SELECT t.id, t.name as titulo, t.status, u.firstname, u.realname FROM glpi_tickets t LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_users u ON u.id = tu.users_id WHERE t.id IN (?)`, [reopenedTicketIds]);
      [reabiertosPorTecnico] = await conn.query(`SELECT u.id, u.firstname, u.realname, COUNT(t.id) as total FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_users u ON u.id = tu.users_id WHERE t.id IN (?) GROUP BY u.id, u.firstname, u.realname ORDER BY total DESC`, [reopenedTicketIds]);
    }
    
    // Consultas para Categorías y Etiquetas (con IDs)
    const [porCategoria] = await conn.query(`SELECT c.id, c.completename as nombre, COUNT(t.id) as total FROM glpi_tickets t JOIN glpi_itilcategories c ON t.itilcategories_id = c.id LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id WHERE DATE(t.solvedate) BETWEEN ? AND ? AND t.is_deleted = 0 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) GROUP BY c.id, c.completename ORDER BY total DESC`, [desde, hasta, profileIds, effectiveGroupIds]);
    const [porEtiqueta] = await conn.query(`SELECT tag.id, tag.name as nombre, COUNT(t.id) as total FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems ti ON t.id = ti.items_id AND ti.itemtype = 'Ticket' JOIN glpi_plugin_tag_tags tag ON ti.plugin_tag_tags_id = tag.id LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 LEFT JOIN glpi_profiles_users pu ON tu.users_id = tu.users_id LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id WHERE DATE(t.solvedate) BETWEEN ? AND ? AND t.is_deleted = 0 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) GROUP BY tag.id, tag.name ORDER BY total DESC`, [desde, hasta, profileIds, effectiveGroupIds]);

    return {
      statsTickets,
      resueltosPorTecnico,
      tiempos: tiemposFormateados,
      reabiertos,
      reabiertosPorTecnico,
      porCategoria,
      porEtiqueta,
    };
  } finally {
    conn.release();
  }
}

export async function getTecnicoDetalle(tecnicoId, desde, hasta) {
  const conn = await pool.getConnection();
  try {
    const [detalle] = await conn.query(
      `
      SELECT 
        SUM(CASE WHEN t.type = 1 THEN 1 ELSE 0 END) AS incidencias,
        SUM(CASE WHEN t.type = 2 THEN 1 ELSE 0 END) AS peticiones
      FROM glpi_tickets t
      JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2
      WHERE tu.users_id = ?
        AND DATE(t.solvedate) BETWEEN ? AND ?
        AND t.is_deleted = 0
      `,
      [tecnicoId, desde, hasta]
    );
    return detalle[0];
  } finally {
    conn.release();
  }
}