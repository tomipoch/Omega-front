import { useState, useEffect } from 'react';
import { X } from 'react-feather';
import { apiFetch } from '../../services/apiClient';
import type { Evento, InscripcionEstado } from '../../types';

interface EventDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: Evento;
  token: string | null;
  onInscripcion?: () => void;
}

const EventDetails = ({ isOpen, onClose, eventData, token, onInscripcion }: EventDetailsProps) => {
  const [inscriptionMessage, setInscriptionMessage] = useState('');
  const [isInscrito, setIsInscrito] = useState(false);

  useEffect(() => {
    if (!isOpen || !eventData?.evento_id) return undefined;

    let cancelled = false;

    const checkInscripcion = async () => {
      try {
        const data = await apiFetch<InscripcionEstado>(
          `/eventos/${eventData.evento_id}/inscripcion`,
          { token },
        );
        if (!cancelled) setIsInscrito(Boolean(data?.inscrito));
      } catch (error) {
        if (!cancelled) {
          setInscriptionMessage(`Error al verificar inscripción: ${(error as Error).message}`);
        }
      }
    };

    checkInscripcion();
    return () => {
      cancelled = true;
    };
  }, [isOpen, eventData, token]);

  const handleInscription = async () => {
    try {
      await apiFetch('/eventos/inscripcion', {
        method: 'POST',
        body: { evento_id: eventData.evento_id },
        token,
      });
      setInscriptionMessage('¡Te has inscrito exitosamente!');
      setIsInscrito(true);
      onInscripcion?.();
    } catch (error) {
      setInscriptionMessage(`Error al inscribirse: ${(error as Error).message}`);
    }
  };

  const handleCancelInscription = async () => {
    try {
      await apiFetch(`/eventos/inscripcion/${eventData.evento_id}`, {
        method: 'DELETE',
        token,
      });
      setInscriptionMessage('Has cancelado tu inscripción exitosamente.');
      setIsInscrito(false);
      onInscripcion?.();
    } catch (error) {
      setInscriptionMessage(`Error al cancelar inscripción: ${(error as Error).message}`);
    }
  };

  if (!isOpen) return null;

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
              onClick={handleCancelInscription}
              className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
              Cancelar Inscripción
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInscription}
              disabled={lleno}
              className={`py-2 px-4 text-sm rounded-lg shadow-md ${
                lleno ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {lleno ? 'Cupos llenos' : 'Inscribirse'}
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