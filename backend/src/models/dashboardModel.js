import { pool } from '../config/db.js';

export async function getDashboardData(profiles) {
  const conn = await pool.getConnection();
  try {
    const [totalesRows] = await conn.query(
      `
      SELECT
        (SELECT COUNT(id) FROM glpi_tickets WHERE status = 1 AND is_deleted = 0) AS total_no_asignada,
        (SELECT COUNT(t.id) FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status = 2 AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_asignada,
        (SELECT COUNT(t.id) FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status = 3 AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_en_proceso,
        (SELECT COUNT(t.id) FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status = 4 AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_en_espera,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 5 JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_internos,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status = 5 AND DATE(t.solvedate) = CURDATE() AND pu.profiles_id IN (?)) AS total_resueltos_hoy,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 1 JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_pedidos,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' AND tt.plugin_tag_tags_id = 4 JOIN glpi_tickets_users tu ON tu.tickets_id = t.id AND tu.type = 2 JOIN glpi_profiles_users pu ON pu.users_id = tu.users_id WHERE t.status IN (1,2,3,4) AND t.is_deleted = 0 AND pu.profiles_id IN (?)) AS total_instalaciones_pendientes
      `,
      Array(7).fill(profiles)
    );

    // --- CONSULTA DE TÉCNICOS MEJORADA CON TODOS LOS KPIs INDIVIDUALES ---
    const [tecnicoRows] = await conn.query(
      `
      SELECT
        u.id AS user_id, u.name AS username, u.firstname, u.realname AS lastname, u.picture AS profile_image,
        (SELECT COUNT(t.id) FROM glpi_tickets_users tu JOIN glpi_tickets t ON t.id = tu.tickets_id WHERE tu.users_id = u.id AND tu.type = 2 AND t.status = 2 AND t.is_deleted = 0) AS asignada,
        (SELECT COUNT(t.id) FROM glpi_tickets_users tu JOIN glpi_tickets t ON t.id = tu.tickets_id WHERE tu.users_id = u.id AND tu.type = 2 AND t.status = 3 AND t.is_deleted = 0) AS en_proceso,
        (SELECT COUNT(t.id) FROM glpi_tickets_users tu JOIN glpi_tickets t ON t.id = tu.tickets_id WHERE tu.users_id = u.id AND tu.type = 2 AND t.status = 4 AND t.is_deleted = 0) AS en_espera,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2 AND tu.users_id = u.id WHERE t.status = 5 AND DATE(t.solvedate) = CURDATE()) AS resueltos_hoy,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t INNER JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2 AND tu.users_id = u.id INNER JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE tt.plugin_tag_tags_id = 5 AND t.status IN (1,2,3,4) AND t.is_deleted = 0) AS internos,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t INNER JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2 AND tu.users_id = u.id INNER JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE tt.plugin_tag_tags_id = 1 AND t.status IN (1,2,3,4) AND t.is_deleted = 0) AS pedidos,
        (SELECT COUNT(DISTINCT t.id) FROM glpi_tickets t INNER JOIN glpi_tickets_users tu ON t.id = tu.tickets_id AND tu.type = 2 AND tu.users_id = u.id INNER JOIN glpi_plugin_tag_tagitems tt ON t.id = tt.items_id AND tt.itemtype = 'Ticket' WHERE tt.plugin_tag_tags_id = 4 AND t.status IN (1,2,3,4) AND t.is_deleted = 0) AS instalaciones
      FROM glpi_users u
      JOIN glpi_profiles_users pu ON pu.users_id = u.id
      WHERE u.is_active = 1 AND pu.profiles_id IN (?)
      ORDER BY u.firstname ASC
      `,
      [profiles]
    );

    return { totales: totalesRows[0], tecnicos: tecnicoRows };
  } finally {
    conn.release();
  }
}