import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../../services/availabilityService';
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  normalizeAppointmentStatus,
} from '../../constants/appointmentStatus';
import type { Cita } from '../../types';

interface AppointmentCardProps {
  cita: Cita;
  isAdmin: boolean;
  onEdit?: (cita: Cita) => void;
  onSelect?: (cita: Cita) => void;
  onDelete?: (cita: Cita) => void;
  canCancel?: boolean;
}

export const AppointmentCard = ({
  cita,
  isAdmin,
  onEdit,
  onSelect,
  onDelete,
  canCancel = true,
}: AppointmentCardProps) => {
  const status = normalizeAppointmentStatus(cita.estado_nombre);
  const statusColors = APPOINTMENT_STATUS_COLORS[status];
  const statusLabel = APPOINTMENT_STATUS_LABELS[status];

  return (
    <motion.article
      layout
      className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect?.(cita)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-800">{cita.servicio_nombre}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors}`}>{statusLabel}</span>
      </div>

      <dl className="space-y-2 mb-4 text-sm text-gray-600">
        {isAdmin && cita.usuario_nombre && (
          <div>
            <dt className="font-medium inline">Cliente: </dt>
            <dd className="inline">{`${cita.usuario_nombre} ${cita.usuario_apellido ?? ''}`}</dd>
          </div>
        )}
        {isAdmin && cita.usuario_email && (
          <div>
            <dt className="font-medium inline">Email: </dt>
            <dd className="inline">{cita.usuario_email}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium inline">Fecha: </dt>
          <dd className="inline">{formatDate(cita.fecha)}</dd>
        </div>
        <div>
          <dt className="font-medium inline">Hora: </dt>
          <dd className="inline">
            {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)}
          </dd>
        </div>
        {cita.servicio_precio != null && (
          <div>
            <dt className="font-medium inline">Precio: </dt>
            <dd className="inline">${cita.servicio_precio}</dd>
          </div>
        )}
        {cita.notas && (
          <div>
            <dt className="font-medium inline">Notas: </dt>
            <dd className="inline text-xs text-gray-500">{cita.notas}</dd>
          </div>
        )}
      </dl>

      {(onEdit || onDelete) && (
        <div
          className="flex justify-between space-x-2"
          onClick={(e) => e.stopPropagation()}
          role="group"
          aria-label="Acciones de la cita"
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(cita)}
              className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(cita)}
              disabled={!canCancel}
              className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdmin ? 'Eliminar' : 'Cancelar'}
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
};

export default AppointmentCard;