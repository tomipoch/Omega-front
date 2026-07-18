import { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../services/authContext';
import {
  obtenerTodasLasReseñas,
  obtenerReseñasPendientes,
  aceptarReseña,
  rechazarReseña,
  eliminarReseñaAdmin,
} from '../../services/testimoniosServiceAdmin';
import { extractList } from '../../services/apiClient';
import type { EstadoTestimonio, Testimonio } from '../../types';

const ESTADO_COLORS: Record<EstadoTestimonio, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Confirmado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
};

type Tab = 'pendientes' | 'todas';

const AdminManageTestimonials = () => {
  const { token } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('pendientes');

  const fetchTestimonials = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data =
        activeTab === 'pendientes'
          ? await obtenerReseñasPendientes()
          : await obtenerTodasLasReseñas();
      setTestimonials(extractList<Testimonio>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!token) return;
    fetchTestimonials();
  }, [fetchTestimonials, token]);

  const handleConfirm = async (id: number) => {
    try {
      await aceptarReseña(id);
      setTestimonials((prev) => prev.filter((t) => t.testimonio_id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rechazarReseña(id);
      setTestimonials((prev) => prev.filter((t) => t.testimonio_id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar permanentemente esta reseña?'))
      return;
    try {
      await eliminarReseñaAdmin(id);
      setTestimonials((prev) => prev.filter((t) => t.testimonio_id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Gestionar Reseñas</h1>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('pendientes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pendientes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('todas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'todas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas las Reseñas
            </button>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando testimonios...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-500">
            {activeTab === 'pendientes' ? 'No hay testimonios pendientes.' : 'No hay testimonios.'}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
              exit={{ opacity: 0 }}
            >
              {testimonials.map((testimonial) => (
                <motion.article
                  key={testimonial.testimonio_id}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-700">
                      {`${testimonial.nombre || 'Anónimo'} ${testimonial.apellido_paterno || ''} ${testimonial.apellido_materno || ''}`}
                    </h3>
                    {activeTab === 'todas' && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ESTADO_COLORS[testimonial.nombre_estado || 'Pendiente'] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {testimonial.nombre_estado || 'Pendiente'}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs">
                    {'★'.repeat(testimonial.estrellas || 0)}
                    {'☆'.repeat(5 - (testimonial.estrellas || 0))}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                    {testimonial.contenido || 'Sin contenido disponible'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Fecha:{' '}
                    {testimonial.fecha_creacion
                      ? new Date(testimonial.fecha_creacion).toLocaleDateString()
                      : 'Sin fecha'}
                  </p>

                  <div className="flex justify-between items-center mt-4 space-x-2">
                    {activeTab === 'pendientes' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleConfirm(testimonial.testimonio_id)}
                          className="bg-green-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(testimonial.testimonio_id)}
                          className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(testimonial.testimonio_id)}
                        className="bg-red-600 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-700 transition w-full"
                      >
                        Eliminar Permanentemente
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default AdminManageTestimonials;