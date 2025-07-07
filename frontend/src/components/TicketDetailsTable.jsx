import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const STATUS_MAP = { 1: { text: 'Nuevo', color: 'bg-gray-500' }, 2: { text: 'Asignado', color: 'bg-blue-500' }, 3: { text: 'En Proceso', color: 'bg-blue-500' }, 4: { text: 'En Espera', color: 'bg-orange-500' }, 5: { text: 'Resuelto', color: 'bg-green-600' }, 6: { text: 'Cerrado', color: 'bg-black' }};
const StatusBadge = ({ statusId }) => { const status = STATUS_MAP[statusId] || { text: 'Desconocido', color: 'bg-gray-400' }; return (<span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color} text-white`}>{status.text}</span>);};
const TagBadge = ({ tagName }) => ( <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{tagName}</span> );

export const TicketDetailsTable = ({ ticketIds }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

  useEffect(() => {
    if (!ticketIds || ticketIds.length === 0) { setLoading(false); setTickets([]); return; }
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiService.getTicketDetails(ticketIds);
        setTickets(response.data);
      } catch (err) { setError('No se pudieron cargar los detalles de los tickets.'); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [ticketIds]);

  const processedTickets = useMemo(() => {
    let sortableItems = [...tickets];

    if (searchTerm) {
      sortableItems = sortableItems.filter(ticket => {
        const term = searchTerm.toLowerCase();
        return (
          String(ticket.id).includes(term) ||
          ticket.titulo.toLowerCase().includes(term) ||
          (ticket.tecnico_asignado || '').toLowerCase().includes(term) ||
          (ticket.grupo_asignado || '').toLowerCase().includes(term) ||
          (ticket.etiquetas || '').toLowerCase().includes(term) ||
          (STATUS_MAP[ticket.status]?.text || '').toLowerCase().includes(term)
        );
      });
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Tratamiento especial para fechas
        if (sortConfig.key === 'fecha_creacion' || sortConfig.key === 'fecha_modificacion') {
            const dateA = new Date(a[sortConfig.key]);
            const dateB = new Date(b[sortConfig.key]);
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tickets, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleRowClick = (ticketId) => { window.open(`https://sistemas.macrosad.com/front/ticket.form.php?id=${ticketId}`, '_blank'); };

  const SortableHeader = ({ columnKey, label }) => {
    const isSorting = sortConfig.key === columnKey;
    return (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(columnKey)}>
            <div className="flex items-center gap-2">
                <span>{label}</span>
                {isSorting && ( sortConfig.direction === 'ascending' ? <FiArrowUp size={14}/> : <FiArrowDown size={14}/> )}
            </div>
        </th>
    );
  };

  if (loading) return <div className="text-center p-8">Cargando detalles...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="space-y-4">
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FiSearch className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Buscar en todas las columnas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 p-2 text-sm text-gray-800 dark:text-gray-200" />
        </div>
        {processedTickets.length === 0 ? (
            <div className="text-center p-8">No se encontraron tickets.</div>
        ) : (
            <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg" style={{maxHeight: '60vh'}}>
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">#</th>
                        <SortableHeader columnKey="id" label="ID" />
                        <SortableHeader columnKey="titulo" label="Título" />
                        <SortableHeader columnKey="fecha_creacion" label="Creado" />
                        <SortableHeader columnKey="fecha_modificacion" label="Modificado" />
                        <SortableHeader columnKey="tecnico_asignado" label="Técnico(s)" />
                        <SortableHeader columnKey="grupo_asignado" label="Grupo" />
                        <SortableHeader columnKey="etiquetas" label="Etiquetas" />
                        <SortableHeader columnKey="status" label="Estado" />
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {processedTickets.map((ticket, index) => (
                        <tr key={ticket.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer group" onClick={() => handleRowClick(ticket.id)}>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                            <td className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">#{ticket.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 max-w-xs truncate">{ticket.titulo}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{new Date(ticket.fecha_creacion).toLocaleDateString('es-ES')}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{new Date(ticket.fecha_modificacion).toLocaleDateString('es-ES')}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{ticket.tecnico_asignado || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{ticket.grupo_asignado || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                    {ticket.etiquetas ? ticket.etiquetas.split(', ').map(tag => <TagBadge key={tag} tagName={tag} />) : '-'}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-sm"><StatusBadge statusId={ticket.status} /></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};