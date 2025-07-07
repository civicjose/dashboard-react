import { pool } from '../config/db.js';

export async function getDashboardData(profileIds, groupIds) {
    const conn = await pool.getConnection();
    const effectiveGroupIds = groupIds.length > 0 ? groupIds : [-1];
    try {
        const [totalesRows] = await conn.query(
            `
            SELECT
                COUNT(DISTINCT CASE WHEN t.status = 2 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_asignada,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 2 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR ',') AS total_asignada_ids,
                
                COUNT(DISTINCT CASE WHEN t.status = 3 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_en_proceso,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 3 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR ',') AS total_en_proceso_ids,
                
                COUNT(DISTINCT CASE WHEN t.status = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_en_espera,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR ',') AS total_en_espera_ids,

                COUNT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_resueltos_hoy,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR ',') AS total_resueltos_hoy_ids,
                
                (SELECT COUNT(id) FROM glpi_tickets WHERE status = 1 AND is_deleted = 0) AS total_no_asignada,
                (SELECT GROUP_CONCAT(id SEPARATOR ',') FROM glpi_tickets WHERE status = 1 AND is_deleted = 0) AS total_no_asignada_ids,
                (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 5) AS total_internos,
                (SELECT GROUP_CONCAT(DISTINCT t.id SEPARATOR ',') FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 5) AS total_internos_ids,
                (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 1) AS total_pedidos,
                (SELECT GROUP_CONCAT(DISTINCT t.id SEPARATOR ',') FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 1) AS total_pedidos_ids,
                (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 4) AS total_taller,
                (SELECT GROUP_CONCAT(DISTINCT t.id SEPARATOR ',') FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND tt.plugin_tag_tags_id = 4) AS total_taller_ids
            FROM glpi_tickets t
            LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2
            LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id
            LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id
            WHERE t.is_deleted = 0
            `,
            [
              profileIds, effectiveGroupIds, profileIds, effectiveGroupIds,
              profileIds, effectiveGroupIds, profileIds, effectiveGroupIds,
              profileIds, effectiveGroupIds, profileIds, effectiveGroupIds,
              profileIds, effectiveGroupIds, profileIds, effectiveGroupIds,
            ]
        );

        const [tecnicoRows] = await conn.query(
            `
            SELECT
                u.id AS user_id, u.firstname, u.realname AS lastname, u.picture AS profile_image,
                u.phone, ue.email, -- Se añaden el teléfono y el email
                COUNT(DISTINCT CASE WHEN t.status = 2 THEN t.id END) AS asignada,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 2 THEN t.id END SEPARATOR ',') AS asignada_ids,
                COUNT(DISTINCT CASE WHEN t.status = 3 THEN t.id END) AS en_proceso,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 3 THEN t.id END SEPARATOR ',') AS en_proceso_ids,
                COUNT(DISTINCT CASE WHEN t.status = 4 THEN t.id END) AS en_espera,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 4 THEN t.id END SEPARATOR ',') AS en_espera_ids,
                COUNT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END) AS resueltos_hoy,
                GROUP_CONCAT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END SEPARATOR ',') AS resueltos_hoy_ids,
                COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END) AS internos,
                GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR ',') AS internos_ids,
                COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END) AS pedidos,
                GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR ',') AS pedidos_ids,
                COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END) AS taller,
                GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR ',') AS taller_ids
            FROM glpi_users u
            JOIN glpi_profiles_users pu ON pu.users_id = u.id
            LEFT JOIN glpi_tickets_users tu ON tu.users_id = u.id AND tu.type = 2
            LEFT JOIN glpi_tickets t ON t.id = tu.tickets_id AND t.is_deleted = 0
            LEFT JOIN glpi_plugin_tag_tagitems tt ON tt.items_id = t.id AND tt.itemtype = 'Ticket'
            LEFT JOIN glpi_useremails ue ON ue.users_id = u.id AND ue.is_default = 1 -- Se añade el JOIN a la tabla de emails
            WHERE u.is_active = 1 AND pu.profiles_id IN (?)
            GROUP BY u.id, u.firstname, u.realname, u.picture, u.phone, ue.email
            ORDER BY u.firstname ASC
            `,
            [profileIds]
        );

        return { totales: totalesRows[0], tecnicos: tecnicoRows };
    } finally {
        conn.release();
    }
}

export async function getTicketDetailsByIds(ticketIds) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      SELECT 
        t.id, 
        t.name AS titulo, 
        t.status,
        t.date AS fecha_creacion,
        t.date_mod AS fecha_modificacion,
        g.completename AS grupo_asignado,
        (SELECT GROUP_CONCAT(DISTINCT u.firstname SEPARATOR ', ') 
         FROM glpi_tickets_users tu 
         JOIN glpi_users u ON tu.users_id = u.id 
         WHERE tu.tickets_id = t.id AND tu.type = 2) AS tecnico_asignado,
        (SELECT GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') 
         FROM glpi_plugin_tag_tagitems ti 
         JOIN glpi_plugin_tag_tags tags ON ti.plugin_tag_tags_id = tags.id 
         WHERE ti.items_id = t.id AND ti.itemtype = 'Ticket') AS etiquetas
      FROM glpi_tickets t
      LEFT JOIN glpi_groups_tickets gt ON t.id = gt.tickets_id
      LEFT JOIN glpi_groups g ON gt.groups_id = g.id
      WHERE t.id IN (?) AND t.is_deleted = 0
      GROUP BY t.id
      ORDER BY t.id DESC
      `,
      [ticketIds]
    );
    return rows;
  } finally {
    conn.release();
  }
}

export async function getTecnicoDetails(tecnicoId) {
    const conn = await pool.getConnection();
    try {
        // 1. Cola de Trabajo
        const [colaTrabajo] = await conn.query(
          `SELECT COUNT(t.id) as total FROM glpi_tickets t
           JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2
           WHERE tu.users_id = ? AND t.status IN (2, 3, 4) AND t.is_deleted = 0`,
          [tecnicoId]
        );

        // 2. Último ticket resuelto
        const [lastSolved] = await conn.query(
          `SELECT id, solvedate FROM glpi_tickets
           WHERE users_id_recipient = ? AND status IN (5, 6)
           ORDER BY solvedate DESC LIMIT 1`,
          [tecnicoId]
        );

        // 3. Tickets resueltos para buscar reaperturas
        const [resolvedTickets] = await conn.query(
          `SELECT t.id FROM glpi_tickets t
           JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2
           WHERE tu.users_id = ? AND t.status IN (5, 6)`,
          [tecnicoId]
        );
        const resolvedTicketIds = resolvedTickets.map(t => t.id);
        
        let reopenedData = { count: 0, ids: null };
        if (resolvedTicketIds.length > 0) {
          const [reopenedRows] = await conn.query(
            `SELECT COUNT(DISTINCT l.items_id) as count, GROUP_CONCAT(DISTINCT l.items_id SEPARATOR ',') as ids
             FROM glpi_logs l
             WHERE l.itemtype = 'Ticket' AND l.id_search_option = 12
               AND l.old_value IN ('5', '6') AND l.new_value IN ('1','2','3','4')
               AND l.items_id IN (?)`,
            [resolvedTicketIds]
          );
          if (reopenedRows.length > 0) {
            reopenedData = reopenedRows[0];
          }
        }

        // 4. Tendencia de resueltos en los últimos 7 días
        const [dailyTrend] = await conn.query(
            `SELECT DATE_FORMAT(t.solvedate, '%Y-%m-%d') as dia, COUNT(t.id) as total
             FROM glpi_tickets t
             JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2
             WHERE tu.users_id = ? AND DATE(t.solvedate) >= CURDATE() - INTERVAL 7 DAY
             GROUP BY dia ORDER BY dia ASC`,
             [tecnicoId]
        );

        return {
            cola_actual: colaTrabajo[0].total || 0,
            ultimo_resuelto: lastSolved[0] || null,
            reabiertos: reopenedData,
            dailyTrend,
        };
    } finally {
        conn.release();
    }
}