import { pool } from '../config/db.js';

export async function getDashboardData(profileIds, groupIds) {
  const conn = await pool.getConnection();
  const effectiveGroupIds = groupIds.length > 0 ? groupIds : [-1];

  try {
    // La consulta de totales ya es correcta y devuelve los IDs, no necesita cambios.
    const [totalesRows] = await conn.query(
      `
      SELECT
        COUNT(DISTINCT CASE WHEN t.status = 1 THEN t.id END) AS total_no_asignada,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 1 THEN t.id END SEPARATOR '|') AS total_no_asignada_ids,
        COUNT(DISTINCT CASE WHEN t.status = 2 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_asignada,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 2 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_asignada_ids,
        COUNT(DISTINCT CASE WHEN t.status = 3 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_en_proceso,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 3 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_en_proceso_ids,
        COUNT(DISTINCT CASE WHEN t.status = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_en_espera,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_en_espera_ids,
        COUNT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_resueltos_hoy,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_resueltos_hoy_ids,
        COUNT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 5 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_internos,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 5 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_internos_ids,
        COUNT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 1 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_pedidos,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 1 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_pedidos_ids,
        COUNT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END) AS total_taller,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status IN (1,2,3,4) AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 4 AND (pu.profiles_id IN (?) OR gt.groups_id IN (?)) THEN t.id END SEPARATOR '|') AS total_taller_ids
      FROM glpi_tickets t
      LEFT JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2
      LEFT JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id
      LEFT JOIN glpi_groups_tickets gt ON gt.tickets_id = t.id
      LEFT JOIN glpi_plugin_tag_tagitems tt ON tt.items_id = t.id
      WHERE t.is_deleted = 0
      `,
      [ /* ... Parámetros duplicados ... */
        profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds, profileIds, effectiveGroupIds,
      ]
    );

    // CAMBIO FINAL: La consulta de técnicos ahora también devuelve las listas de IDs
    const [tecnicoRows] = await conn.query(
      `
      SELECT
        u.id AS user_id, u.name AS username, u.firstname, u.realname AS lastname,
        
        COUNT(DISTINCT CASE WHEN t.status = 2 THEN t.id END) AS asignada,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 2 THEN t.id END SEPARATOR '|') AS asignada_ids,
        
        COUNT(DISTINCT CASE WHEN t.status = 3 THEN t.id END) AS en_proceso,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 3 THEN t.id END SEPARATOR '|') AS en_proceso_ids,
        
        COUNT(DISTINCT CASE WHEN t.status = 4 THEN t.id END) AS en_espera,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 4 THEN t.id END SEPARATOR '|') AS en_espera_ids,

        COUNT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END) AS resueltos_hoy,
        GROUP_CONCAT(DISTINCT CASE WHEN t.status = 5 AND DATE(t.solvedate) = CURDATE() THEN t.id END SEPARATOR '|') AS resueltos_hoy_ids,
        
        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END) AS internos,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS internos_ids,

        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END) AS pedidos,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS pedidos_ids,

        COUNT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END) AS taller,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) THEN t.id END SEPARATOR '|') AS taller_ids

      FROM glpi_users u
      JOIN glpi_profiles_users pu ON pu.users_id = u.id
      LEFT JOIN glpi_tickets_users tu ON tu.users_id = u.id AND tu.type = 2
      LEFT JOIN glpi_tickets t ON t.id = tu.tickets_id AND t.is_deleted = 0
      LEFT JOIN glpi_plugin_tag_tagitems tt ON tt.items_id = t.id AND tt.itemtype = 'Ticket'
      WHERE u.is_active = 1 AND pu.profiles_id IN (?)
      GROUP BY u.id, u.firstname, u.realname
      ORDER BY u.firstname ASC
      `,
      [profileIds]
    );

    return { totales: totalesRows[0] || {}, tecnicos: tecnicoRows };
  } finally {
    conn.release();
  }
}