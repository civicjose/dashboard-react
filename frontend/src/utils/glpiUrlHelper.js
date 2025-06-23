const GLPI_BASE_URL = 'https://sistemas.macrosad.com/front/ticket.php?is_deleted=0';

// Códigos de campo de GLPI para facilitar la lectura
const GLPI_FIELD_CODES = {
  id: 2,               // ID del Ticket
  // CAMBIO: Usamos los IDs de tu último ejemplo para mayor precisión contextual.
  assignedTo: 5,       // Asignado a (Técnico)
  technicianGroup: 8,  // Asignado a (Grupo)
  status: 12,          // Estado
  resolutionDate: 17,  // Fecha de resolución
  tag: 10500,          // Etiqueta (según tu último ejemplo de URL)
};

export const generateGlpiUrl = (params = {}) => {
  let criteriaIndex = 0;
  let url = `${GLPI_BASE_URL}`;

  const addCriteria = (field, searchtype, value, link = 'AND') => {
    if (value === undefined || value === null || value === '') return;
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
        const link = index === 0 ? undefined : 'OR';
        addCriteria(GLPI_FIELD_CODES.id, 'equals', id, link);
      });
    }
  } else {
    // Esta lógica ahora construirá el enlace con los nuevos IDs de campo
    addCriteria(GLPI_FIELD_CODES.status, 'equals', params.status);
    addCriteria(GLPI_FIELD_CODES.tag, 'equals', params.tagId);
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