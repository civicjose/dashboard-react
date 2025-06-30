import { pool } from '../config/db.js';

export async function getDashboardData(profiles) {
  const conn = await pool.getConnection();
  try {
    const [totalesRows] = await conn.query(
      `
      SELECT
        COUNT(CASE WHEN t.status = 1 AND t.is_deleted = 0 THEN t.id END) AS total_no_asignada,
        GROUP_CONCAT(CASE WHEN t.status = 1 AND t.is_deleted = 0 THEN t.id END SEPARATOR '|') AS total_no_asignada_ids,
        
        COUNT(CASE WHEN t.status = 2 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_asignada,
        GROUP_CONCAT(CASE WHEN t.status = 2 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_asignada_ids,

        COUNT(CASE WHEN t.status = 3 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_en_proceso,
        GROUP_CONCAT(CASE WHEN t.status = 3 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_en_proceso_ids,

        COUNT(CASE WHEN t.status = 4 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_en_espera,
        GROUP_CONCAT(CASE WHEN t.status = 4 AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_en_espera_ids,

        COUNT(CASE WHEN t.status = 5 AND t.is_deleted = 0 AND DATE(t.solvedate) = CURDATE() AND pu.profiles_id IN (?) THEN t.id END) AS total_resueltos_hoy,
        GROUP_CONCAT(CASE WHEN t.status = 5 AND t.is_deleted = 0 AND DATE(t.solvedate) = CURDATE() AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_resueltos_hoy_ids,

        COUNT(DISTINCT CASE WHEN tt_internos.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_internos,
        GROUP_CONCAT(DISTINCT CASE WHEN tt_internos.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_internos_ids,
        
        COUNT(DISTINCT CASE WHEN tt_pedidos.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_pedidos,
        GROUP_CONCAT(DISTINCT CASE WHEN tt_pedidos.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_pedidos_ids,

        COUNT(DISTINCT CASE WHEN tt_taller.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END) AS total_taller,
        GROUP_CONCAT(DISTINCT CASE WHEN tt_taller.plugin_tag_tags_id IS NOT NULL AND t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?) THEN t.id END SEPARATOR '|') AS total_taller_ids

      FROM glpi_tickets t
      LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2
      LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id
      LEFT JOIN glpi_plugin_tag_tagitems tt_internos ON tt_internos.items_id = t.id AND tt_internos.itemtype = 'Ticket' AND tt_internos.plugin_tag_tags_id = 5
      LEFT JOIN glpi_plugin_tag_tagitems tt_pedidos ON tt_pedidos.items_id = t.id AND tt_pedidos.itemtype = 'Ticket' AND tt_pedidos.plugin_tag_tags_id = 1
      LEFT JOIN glpi_plugin_tag_tagitems tt_taller ON tt_taller.items_id = t.id AND tt_taller.itemtype = 'Ticket' AND tt_taller.plugin_tag_tags_id = 4
      WHERE t.is_deleted = 0
      `,
      [profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles, profiles]
    );

    const [tecnicoRows] = await conn.query(
      `
      SELECT
        u.id AS user_id, u.firstname, u.realname AS lastname,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 2 THEN t.id END SEPARATOR '|') AS asignada_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 3 THEN t.id END SEPARATOR '|') AS en_proceso_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 4 THEN t.id END SEPARATOR '|') AS en_espera_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END SEPARATOR '|') AS resueltos_hoy_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS internos_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS pedidos_ids,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS taller_ids,
        COUNT(DISTINCT CASE WHEN t.status = 2 THEN t.id END) AS asignada,
        COUNT(DISTINCT CASE WHEN t.status = 3 THEN t.id END) AS en_proceso,
        COUNT(DISTINCT CASE WHEN t.status = 4 THEN t.id END) AS en_espera,
        COUNT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END) AS resueltos_hoy,
        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END) AS internos,
        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END) AS pedidos,
        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END) AS taller
      FROM glpi_users u
      JOIN glpi_profiles_users pu ON pu.users_id = u.id
      LEFT JOIN glpi_tickets_users tu ON tu.users_id = u.id AND tu.type = 2
      LEFT JOIN glpi_tickets t ON t.id = tu.tickets_id AND t.is_deleted = 0
      LEFT JOIN glpi_plugin_tag_tagitems tt ON tt.items_id = t.id AND tt.itemtype = 'Ticket'
      WHERE u.is_active = 1 AND pu.profiles_id IN (?)
      GROUP BY u.id, u.firstname, u.realname
      ORDER BY u.firstname ASC
      `,
      [profiles]
    );

    return { totales: totalesRows[0], tecnicos: tecnicoRows };
  } finally {
    conn.release();
  }
}