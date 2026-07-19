import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelRegistration,
  getRegistrationStatus,
  registerForEvent,
} from '../../services/eventsService';
import type { Evento } from '../../types';

interface EventDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: Evento;
  onInscripcion?: () => void;
}

const EventDetails = ({ isOpen, onClose, eventData, onInscripcion }: EventDetailsProps) => {
  const [inscriptionMessage, setInscriptionMessage] = useState('');
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['event-registration', eventData.evento_id],
    queryFn: () => getRegistrationStatus(eventData.evento_id),
    enabled: isOpen && Boolean(eventData?.evento_id),
  });

  const registerMutation = useMutation({
    mutationFn: () => registerForEvent(eventData.evento_id),
    onSuccess: () => {
      setInscriptionMessage('¡Te has inscrito exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventData.evento_id] });
      onInscripcion?.();
    },
    onError: (err: Error) =>
      setInscriptionMessage(`Error al inscribirse: ${err.message}`),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelRegistration(eventData.evento_id),
    onSuccess: () => {
      setInscriptionMessage('Has cancelado tu inscripción exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventData.evento_id] });
      onInscripcion?.();
    },
    onError: (err: Error) =>
      setInscriptionMessage(`Error al cancelar inscripción: ${err.message}`),
  });

  useEffect(() => {
    if (!isOpen) setInscriptionMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isInscrito = Boolean(statusQuery.data?.inscrito);
  const cuposLibres = (eventData.capacidad ?? 0) - (eventData.inscritos ?? 0);
  const lleno = cuposLibres <= 0;

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <h2 id="event-detail-title" className="text-3xl font-bold mb-4">
          {eventData.nombre}
        </h2>

        <p className="text-gray-600 text-sm">
          Fecha de inicio: {new Date(eventData.fecha_inicio).toLocaleString()}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Fecha de fin: {new Date(eventData.fecha_fin).toLocaleString()}
        </p>

        <p className="text-gray-600 text-sm mb-4">Cupos disponibles: {Math.max(cuposLibres, 0)}</p>

        <p className="text-gray-700 mb-4">{eventData.descripcion}</p>

        <p className="text-gray-600 text-sm mb-6">Inscritos: {eventData.inscritos ?? 0}</p>

        <div className="flex justify-between mt-4">
          {isInscrito ? (
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg shadow-md hover:bg-red-600 transition duration-300 disabled:opacity-60"
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Inscripción'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => registerMutation.mutate()}
              disabled={lleno || registerMutation.isPending}
              className={`py-2 px-4 text-sm rounded-lg shadow-md ${
                lleno || registerMutation.isPending
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {registerMutation.isPending
                ? 'Inscribiendo...'
                : lleno
                  ? 'Cupos llenos'
                  : 'Inscribirse'}
            </button>
          )}
        </div>

        {inscriptionMessage && (
          <p
            className={`text-center text-sm mt-4 ${
              inscriptionMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'
            }`}
            role="status"
          >
            {inscriptionMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;