import { pool } from '../config/db.js';
import { laborMinutes, toHHMM } from '../utils/laborTime.js';

export async function getIndicadores(fiStart, ffEnd, profiles) {
  const db = await pool.getConnection();
  try {
    const GLPI = 'https://sistemas.macrosad.com/front/ticket.php?reset=reset';
    const rangeCre = (fi, ff) => `&criteria[0][field]=15&criteria[0][searchtype]=morethan&criteria[0][value]=${fi}&criteria[1][link]=AND&criteria[1][field]=15&criteria[1][searchtype]=lessthan&criteria[1][value]=${ff}`;
    const rangeSolvClos = (fi, ff) => `&criteria[0][field]=12&criteria[0][searchtype]=equals&criteria[0][value]=5&criteria[1][link]=AND&criteria[1][field]=17&criteria[1][searchtype]=morethan&criteria[1][value]=${fi}&criteria[2][link]=AND&criteria[2][field]=17&criteria[2][searchtype]=lessthan&criteria[2][value]=${ff}&criteria[3][link]=OR&criteria[3][field]=12&criteria[3][searchtype]=equals&criteria[3][value]=6&criteria[4][link]=AND&criteria[4][field]=17&criteria[4][searchtype]=morethan&criteria[4][value]=${fi}&criteria[5][link]=AND&criteria[5][field]=17&criteria[5][searchtype]=lessthan&criteria[5][value]=${ff}`;

    const [cre] = await db.query(`SELECT COUNT(*) AS total, SUM(type=1) AS incid, SUM(type=2) AS pet FROM glpi_tickets WHERE is_deleted=0 AND date BETWEEN ? AND ?`, [fiStart, ffEnd]);
    const creados = { total_creadas: cre[0].total, incidencias_creadas: cre[0].incid, peticiones_creadas: cre[0].pet, url_total: GLPI + rangeCre(fiStart, ffEnd), url_incid: GLPI + rangeCre(fiStart, ffEnd) + '&criteria[2][link]=AND&criteria[2][field]=14&criteria[2][searchtype]=equals&criteria[2][value]=1', url_pet: GLPI + rangeCre(fiStart, ffEnd) + '&criteria[2][link]=AND&criteria[2][field]=14&criteria[2][searchtype]=equals&criteria[2][value]=2' };

    const [res] = await db.query(`SELECT COUNT(DISTINCT t.id) AS total, COUNT(DISTINCT CASE WHEN t.type=1 THEN t.id END) AS incid, COUNT(DISTINCT CASE WHEN t.type=2 THEN t.id END) AS pet FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id=t.id AND tu.type=2 JOIN glpi_profiles_users pu ON pu.users_id=tu.users_id WHERE t.is_deleted=0 AND pu.profiles_id IN (?) AND t.status IN (5,6) AND IFNULL(t.solvedate,t.closedate) BETWEEN ? AND ?`, [profiles, fiStart, ffEnd]);
    const [tecRows] = await db.query(`SELECT u.firstname AS tec, tu.users_id AS id, COUNT(DISTINCT t.id) AS tot FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id=t.id AND tu.type=2 JOIN glpi_users u ON u.id=tu.users_id JOIN glpi_profiles_users pu ON pu.users_id=u.id WHERE t.is_deleted=0 AND pu.profiles_id IN (?) AND t.status IN (5,6) AND IFNULL(t.solvedate,t.closedate) BETWEEN ? AND ? GROUP BY tu.users_id`, [profiles, fiStart, ffEnd]);
    const tecSum = tecRows.reduce((s, r) => s + r.tot, 0);
    const porTec = tecRows.map(r => ({ tecnico: r.tec, total: r.tot, porcentaje: tecSum ? +(r.tot * 100 / tecSum).toFixed(1) : 0, url: GLPI + rangeSolvClos(fiStart, ffEnd) + `&criteria[6][link]=AND&criteria[6][field]=5&criteria[6][searchtype]=equals&criteria[6][value]=${r.id}` }));
    const resueltos = { total_resueltos: res[0].total, incidencias_resueltas: res[0].incid, peticiones_resueltas: res[0].pet, resueltos_por_tecnico: porTec, url_total: GLPI + rangeSolvClos(fiStart, ffEnd), url_incid: GLPI + rangeSolvClos(fiStart, ffEnd) + '&criteria[6][link]=AND&criteria[6][field]=14&criteria[6][searchtype]=equals&criteria[6][value]=1', url_pet: GLPI + rangeSolvClos(fiStart, ffEnd) + '&criteria[6][link]=AND&criteria[6][field]=14&criteria[6][searchtype]=equals&criteria[2][value]=2' };

    const [timeRows] = await db.query(`SELECT t.type, t.date, IFNULL(t.solvedate,t.closedate) AS fin FROM glpi_tickets t JOIN glpi_tickets_users tu ON tu.tickets_id=t.id AND tu.type=2 JOIN glpi_profiles_users pu ON pu.users_id=tu.users_id WHERE t.is_deleted=0 AND pu.profiles_id IN (?) AND t.status IN (5,6) AND IFNULL(t.solvedate,t.closedate) BETWEEN ? AND ?`, [profiles, fiStart, ffEnd]);
    let sT=0,sI=0,sP=0,cT=0,cI=0,cP=0;
    for (const r of timeRows) {
      const m = laborMinutes(r.date, r.fin);
      sT += m; ++cT;
      if (r.type === 1) { sI += m; ++cI; }
      if (r.type === 2) { sP += m; ++cP; }
    }
    const tiempos = { tiempo_medio_total: cT ? toHHMM(Math.round(sT / cT)) : '-', tiempo_medio_incidencias: cI ? toHHMM(Math.round(sI / cI)) : '-', tiempo_medio_peticiones: cP ? toHHMM(Math.round(sP / cP)) : '-' };

    const [reab] = await db.query(`SELECT DISTINCT t.id, t.name, t.status, (SELECT u.firstname FROM glpi_tickets_users tu JOIN glpi_users u ON u.id=tu.users_id WHERE tu.tickets_id=t.id AND tu.type=2 LIMIT 1) AS tec FROM glpi_tickets t JOIN glpi_logs l ON l.itemtype='Ticket' AND l.items_id=t.id WHERE t.is_deleted=0 AND l.date_mod BETWEEN ? AND ? AND l.id_search_option=12 AND l.old_value IN ('5','6') AND l.new_value IN ('1','2','3','4')`, [fiStart, ffEnd]);
    const reabiertos = { total_reabiertos: reab.length, detalle: reab.map(r => ({ id: r.id, titulo: r.name, estado: r.status, tecnico: r.tec, url: `/front/ticket.form.php?id=${r.id}` })) };

    const [catRows] = await db.query(`SELECT c.id, c.completename AS cat, COUNT(*) AS qty FROM glpi_tickets t JOIN glpi_itilcategories c ON c.id=t.itilcategories_id JOIN glpi_tickets_users tu ON tu.tickets_id=t.id AND tu.type=2 JOIN glpi_profiles_users pu ON pu.users_id=tu.users_id WHERE t.is_deleted=0 AND pu.profiles_id IN (?) AND t.status IN (5,6) AND IFNULL(t.solvedate,t.closedate) BETWEEN ? AND ? GROUP BY c.id`, [profiles, fiStart, ffEnd]);
    const catTotal = catRows.reduce((s, r) => s + r.qty, 0);
    const por_categoria = catRows.map(r => ({ categoria: r.cat || 'Sin categoría', cantidad: r.qty, porcentaje: catTotal ? +(r.qty * 100 / catTotal).toFixed(1) : 0, url: GLPI + rangeSolvClos(fiStart, ffEnd) + `&criteria[6][link]=AND&criteria[6][field]=7&criteria[6][searchtype]=equals&criteria[6][value]=${r.id}` }));

    const [tagRows] = await db.query(`SELECT tg.id, tg.name AS tag, COUNT(DISTINCT t.id) AS qty FROM glpi_tickets t JOIN glpi_plugin_tag_tagitems ti ON ti.itemtype='Ticket' AND ti.items_id=t.id JOIN glpi_plugin_tag_tags tg ON tg.id=ti.plugin_tag_tags_id JOIN glpi_tickets_users tu ON tu.tickets_id=t.id AND tu.type=2 JOIN glpi_profiles_users pu ON pu.users_id=tu.users_id WHERE t.is_deleted=0 AND pu.profiles_id IN (?) AND t.status IN (5,6) AND IFNULL(t.solvedate,t.closedate) BETWEEN ? AND ? GROUP BY tg.id ORDER BY qty DESC`, [profiles, fiStart, ffEnd]);
    const tagTotal = tagRows.reduce((s, r) => s + r.qty, 0);
    const por_etiqueta = tagRows.map(r => ({ etiqueta: r.tag || 'Sin etiqueta', cantidad: r.qty, porcentaje: tagTotal ? +(r.qty * 100 / tagTotal).toFixed(1) : 0, url: GLPI + rangeSolvClos(fiStart, ffEnd) + `&criteria[6][link]=AND&criteria[6][field]=10500&criteria[6][searchtype]=equals&criteria[6][value]=${r.id}` }));

    return { tickets_creados: creados, tickets_resueltos: resueltos, tiempos_resolucion: tiempos, reabiertos, por_categoria, por_etiqueta };
  } finally {
    db.release();
  }
}