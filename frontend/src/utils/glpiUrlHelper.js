const GLPI_BASE_URL = 'https://sistemas.macrosad.com/front/ticket.php?is_deleted=0';

const GLPI_FIELD_CODES = {
  id: 2,
  assignedTo: 5,
  technicianGroup: 8,
  status: 12,
  resolutionDate: 17,
  tag: 10500,
};

// IDs de los estados que queremos EXCLUIR en los filtros por etiqueta
const EXCLUDED_STATUS_IDS = {
    REUSUELTO: 5,
    CERRADO: 6,
};

export const generateGlpiUrl = (params = {}) => {
  let criteriaIndex = 0;
  let url = `${GLPI_BASE_URL}`;

  const addCriteria = (field, searchtype, value, link = 'AND') => {
    if (value === undefined || value === null || value === '') return;
    
    // El primer criterio (index 0) no lleva el parámetro 'link'
    if (criteriaIndex > 0) {
      url += `&criteria[${criteriaIndex}][link]=${link}`;
    }

    url += `&criteria[${criteriaIndex}][field]=${field}`;
    url += `&criteria[${criteriaIndex}][searchtype]=${searchtype}`;
    url += `&criteria[${criteriaIndex}][value]=${value}`;
    criteriaIndex++;
  };
  
  if (params.ticketIds) {
    const ticketIdArray = String(params.ticketIds || '').split('|').filter(Boolean);
    if (ticketIdArray.length === 0) {
      addCriteria(GLPI_FIELD_CODES.id, 'equals', -1);
    } else {
      ticketIdArray.forEach((id, index) => {
        // Para la búsqueda por IDs, el conector es OR
        const link = index === 0 ? undefined : 'OR';
        addCriteria(GLPI_FIELD_CODES.id, 'equals', id, link);
      });
    }
  } else {
    // --- LÓGICA DE FILTRADO CORREGIDA SEGÚN TU ANÁLISIS ---

    // 1. Añadimos la etiqueta (si existe) como primer criterio, que siempre será AND.
    addCriteria(GLPI_FIELD_CODES.tag, 'equals', params.tagId);

    // 2. Si se ha especificado una etiqueta, excluimos los estados finales.
    //    Esto crea un filtro robusto: (tag = X) AND (status != 5) AND (status != 6)
    //    Para lograr el "AND NOT" en GLPI, usamos el link 'ANDNOT' con 'equals'.
    if (params.tagId) {
        addCriteria(GLPI_FIELD_CODES.status, 'equals', EXCLUDED_STATUS_IDS.REUSUELTO, 'AND NOT');
        addCriteria(GLPI_FIELD_CODES.status, 'equals', EXCLUDED_STATUS_IDS.CERRADO, 'AND NOT');
    } else {
        // 3. Si NO hay etiqueta, usamos el filtro de estado normal (para "No asignada", etc.)
        addCriteria(GLPI_FIELD_CODES.status, 'equals', params.status);
    }

    // El resto de filtros se añaden con el AND por defecto.
    addCriteria(GLPI_FIELD_CODES.technicianGroup, 'equals', params.groupId);
    addCriteria(GLPI_FIELD_CODES.assignedTo, 'equals', params.technicianId);
    
    if (params.isToday) {
      const today = new Date().toISOString().slice(0, 10);
      addCriteria(GLPI_FIELD_CODES.resolutionDate, 'contains', today);
    }
  }

  url += '&as_map=0';
  return url;
};