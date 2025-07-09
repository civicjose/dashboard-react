import { pool } from '../config/db.js';
import { calculateBusinessMinutes, toHHMM } from '../utils/laborTime.js';

const diffInDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

export async function getKpiData(desde, hasta) {
    const conn = await pool.getConnection();
    try {
        const daysInRange = diffInDays(desde, hasta);

        const [abiertosData] = await conn.query(`SELECT COUNT(id) AS abiertas_total, SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS abiertas_incidencias, SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS abiertas_peticiones FROM glpi_tickets WHERE is_deleted = 0 AND DATE(date) BETWEEN ? AND ?`, [desde, hasta]);
        const [cerradosData] = await conn.query(`SELECT COUNT(id) AS cerradas_total, SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS cerradas_incidencias, SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS cerradas_peticiones FROM glpi_tickets WHERE is_deleted = 0 AND status IN (5, 6) AND DATE(IFNULL(solvedate, closedate)) BETWEEN ? AND ?`, [desde, hasta]);
        const [pendientesData] = await conn.query(`SELECT SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS pendientes_incidencias, SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS pendientes_peticiones FROM glpi_tickets WHERE is_deleted = 0 AND DATE(date) BETWEEN ? AND ? AND (status NOT IN (5, 6) OR DATE(IFNULL(solvedate, closedate)) > LAST_DAY(?))`, [desde, hasta, hasta]);
        const [origen] = await conn.query(`SELECT r.name as nombre, COUNT(t.id) as total FROM glpi_tickets t JOIN glpi_requesttypes r ON t.requesttypes_id = r.id WHERE t.is_deleted = 0 AND DATE(t.date) BETWEEN ? AND ? GROUP BY r.name ORDER BY total DESC`, [desde, hasta]);

        // --- CÁLCULO DE TIEMPO MEDIO DE CIERRE (CON LÓGICA DE PAUSA MEJORADA) ---
        
        // 1. Obtenemos los tickets cerrados en el rango para analizar su tiempo de vida
        const [ticketsParaTiempo] = await conn.query(
            `SELECT id, type, date, IFNULL(solvedate, closedate) as fecha_cierre
             FROM glpi_tickets
             WHERE is_deleted = 0 AND status IN (5, 6)
               AND DATE(IFNULL(solvedate, closedate)) BETWEEN ? AND ?`,
            [desde, hasta]
        );

        const ticketIdsParaTiempo = ticketsParaTiempo.map(t => t.id);
        let logs = [];
        if (ticketIdsParaTiempo.length > 0) {
            // 2. Obtenemos el historial de estados SOLO de esos tickets
            const [logRows] = await conn.query(
                `SELECT items_id, date_mod, new_value as status_id 
                 FROM glpi_logs 
                 WHERE items_id IN (?) AND itemtype = 'Ticket' AND id_search_option = 12
                 ORDER BY items_id, date_mod ASC`,
                [ticketIdsParaTiempo]
            );
            logs = logRows;
        }

        let totalMinutesIncidencias = 0;
        let countIncidencias = 0;
        let totalMinutesPeticiones = 0;
        let countPeticiones = 0;

        for (const ticket of ticketsParaTiempo) {
            // 3. Calculamos el tiempo total en horario laboral desde la apertura al cierre
            let totalBusinessMinutes = calculateBusinessMinutes(ticket.date, ticket.fecha_cierre);
            
            const ticketLogs = logs.filter(l => l.items_id === ticket.id);
            let pausedMinutes = 0;

            // 4. Calculamos el tiempo que pasó en estado de espera (status 4)
            for (let i = 0; i < ticketLogs.length; i++) {
                const currentLog = ticketLogs[i];
                if (parseInt(currentLog.status_id, 10) === 4) { // 4 = En Espera
                    const startPause = currentLog.date_mod;
                    // El fin de la pausa es el siguiente cambio de estado o, si no hay, la fecha de cierre del ticket
                    const endPause = (i + 1 < ticketLogs.length && ticketLogs[i+1].items_id === ticket.id) 
                        ? ticketLogs[i+1].date_mod 
                        : ticket.fecha_cierre;
                    pausedMinutes += calculateBusinessMinutes(startPause, endPause);
                }
            }

            // 5. El tiempo de resolución real es el total menos las pausas
            const realResolutionMinutes = totalBusinessMinutes - pausedMinutes;
            
            if (ticket.type === 1) { // Incidencia
                totalMinutesIncidencias += realResolutionMinutes;
                countIncidencias++;
            } else if (ticket.type === 2) { // Petición
                totalMinutesPeticiones += realResolutionMinutes;
                countPeticiones++;
            }
        }

        const avgMinutesIncidencias = countIncidencias > 0 ? (totalMinutesIncidencias / countIncidencias) : 0;
        const avgMinutesPeticiones = countPeticiones > 0 ? (totalMinutesPeticiones / countPeticiones) : 0;
        
        // --- Unificamos los datos para el frontend ---
        const incidencias = {
            abiertas: abiertosData[0].abiertas_incidencias || 0,
            cerradas: cerradosData[0].cerradas_incidencias || 0,
            media_cierres_dia: daysInRange > 0 ? ((cerradosData[0].cerradas_incidencias || 0) / daysInRange).toFixed(2) : 0,
            pendientes_fin_mes: pendientesData[0].pendientes_incidencias || 0,
        };
        const solicitudes = {
            abiertas: abiertosData[0].abiertas_peticiones || 0,
            cerradas: cerradosData[0].cerradas_peticiones || 0,
            media_cierres_dia: daysInRange > 0 ? ((cerradosData[0].cerradas_peticiones || 0) / daysInRange).toFixed(2) : 0,
            pendientes_fin_mes: pendientesData[0].pendientes_peticiones || 0,
        };
        const totales = {
            total_abiertos: abiertosData[0].abiertas_total || 0,
            total_cerrados: cerradosData[0].cerradas_total || 0,
        };
        const tiempos = {
            cierre_incidencias: toHHMM(avgMinutesIncidencias),
            cierre_peticiones: toHHMM(avgMinutesPeticiones)
        };

        return {
            incidencias,
            solicitudes,
            origen,
            totales,
            tiempos,
        };
    } finally {
        conn.release();
    }
}