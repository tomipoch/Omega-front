import { motion } from 'framer-motion';
import type { Servicio } from '../../types';

interface ServiceCardProps {
  servicio: Servicio;
  onEdit: (servicio: Servicio) => void;
  onDelete: (servicio: Servicio) => void;
}

export const ServiceCard = ({ servicio, onEdit, onDelete }: ServiceCardProps) => (
  <motion.article
    layout
    className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-lg font-medium text-gray-800">{servicio.nombre_servicio}</h3>
      <span className="text-lg font-bold text-green-600">${servicio.precio}</span>
    </div>

    <p className="text-gray-600 text-sm mb-3">{servicio.descripcion}</p>

    {servicio.duracion_estimada && (
      <p className="text-gray-500 text-xs mb-4">
        <span className="font-medium">Duración:</span> {servicio.duracion_estimada} minutos
      </p>
    )}

    <div className="flex justify-between">
      <button
        type="button"
        onClick={() => onEdit(servicio)}
        className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(servicio)}
        className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition"
      >
        Eliminar
      </button>
    </div>
  </motion.article>
);

export default ServiceCard;