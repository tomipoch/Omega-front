import { useMemo } from 'react';
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  normalizeAppointmentStatus,
} from '../../constants/appointmentStatus';
import type { Cita } from '../../types';

interface ServiceRequestsTableProps {
  requests: Cita[];
  onRefresh: () => void;
}

export const ServiceRequestsTable = ({ requests, onRefresh }: ServiceRequestsTableProps) => {
  const sorted = useMemo(
    () => [...requests].sort((a, b) => b.cita_id - a.cita_id),
    [requests],
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No hay solicitudes de servicios.</p>
        <p className="mt-2 text-sm">Las citas solicitadas aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Solicitudes de Servicios</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Actualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((request) => {
              const status = normalizeAppointmentStatus(request.estado_nombre);
              return (
                <tr key={request.cita_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.usuario_nombre || 'N/A'} {request.usuario_apellido || ''}
                    </div>
                    <div className="text-sm text-gray-500">ID: {request.usuario_id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.servicio_nombre || 'Servicio no especificado'}
                    </div>
                    <div className="text-sm text-gray-500">${request.servicio_precio || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.fecha ? new Date(request.fecha).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.hora_inicio ? `${request.hora_inicio} - ${request.hora_fin}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${APPOINTMENT_STATUS_COLORS[status]}`}
                    >
                      {APPOINTMENT_STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.usuario_email ? (
                      <a
                        href={`mailto:${request.usuario_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {request.usuario_email}
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin contacto</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceRequestsTable;