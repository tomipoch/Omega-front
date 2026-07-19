import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import EventDetails from './EventDetail';
import { getEvents } from '../../services/eventsService';
import type { Evento } from '../../types';

const ManageEvents = () => {
  const { isAuthenticated } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  const eventsQuery = useQuery<Evento[]>({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const events = eventsQuery.data ?? [];
  const loading = eventsQuery.isLoading;

  return (
    <section className="mt-20 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-5xl font-semibold text-gray-800 text-center mb-10">Eventos y Talleres</h1>
        <p className="text-lg text-gray-700 text-left mb-8">
          En nuestra tienda, ofrecemos una variedad de eventos diseñados para que nuestros clientes
          disfruten y aprendan más sobre el fascinante mundo de la relojería y la joyería. Explora
          los próximos eventos y talleres que tenemos disponibles, cada uno dirigido por expertos en
          el sector.
        </p>

        {loading ? (
          <p className="text-center text-gray-600">Cargando eventos...</p>
        ) : !isAuthenticated ? (
          <p className="text-center text-gray-500">Inicia sesión para ver los eventos.</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">No se encontraron eventos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => (
              <motion.article
                key={event.evento_id}
                className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-medium text-gray-700">{event.nombre}</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Fecha: {new Date(event.fecha_inicio).toLocaleDateString()} -{' '}
                  {new Date(event.fecha_fin).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{event.descripcion}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition w-full"
                  >
                    Ver Más
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {isModalOpen && selectedEvent && (
          <EventDetails
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventData={selectedEvent}
            onInscripcion={() => eventsQuery.refetch()}
          />
        )}
      </div>
    </section>
  );
};

export default ManageEvents;