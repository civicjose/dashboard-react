const GLPI_BASE_URL = 'https://sistemas.macrosad.com/front/ticket.php?is_deleted=0';

export const generateGlpiUrl = (params = {}) => {
  let criteriaIndex = 0;
  let url = `${GLPI_BASE_URL}`;

  const addCriteria = (field, searchtype, value) => {
    if (criteriaIndex > 0) {
      url += `&criteria[${criteriaIndex}][link]=AND`;
    }
    url += `&criteria[${criteriaIndex}][field]=${field}`;
    url += `&criteria[${criteriaIndex}][searchtype]=${searchtype}`;
    url += `&criteria[${criteriaIndex}][value]=${value}`;
    criteriaIndex++;
  };

  if (params.technicianId) {
    addCriteria(4, 'equals', params.technicianId); // Asignado a - Técnico
  }
  if (params.status) {
    // Permite múltiples estados separados por | como en tu lógica original
    addCriteria(12, 'equals', params.status); // Estado
  }
  if (params.tagId) {
    // CORRECCIÓN: El campo para buscar por ID de etiqueta en glpi_plugin_tag_tagitems es 71
    addCriteria(71, 'equals', params.tagId); // Etiquetas
  }
  if (params.isToday) {
    const today = new Date().toISOString().slice(0, 10);
    addCriteria(17, 'contains', today); // Fecha de resolución contiene hoy
  }

  // Añadimos el parámetro para forzar la vista de lista
  url += '&as_map=0';

  return url;
};