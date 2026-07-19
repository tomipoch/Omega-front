import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { isAdmin } from '../../constants/roles';
import { useConfirm } from '../../hooks/useConfirm';
import {
  getTestimonials,
  deleteTestimonial,
  updateTestimonial,
  type TestimonioFilters,
} from '../../services/testimonialsService';
import EditTestimonialModal from '../../components/TestimonialModal';
import { ROUTES } from '../../constants/routes';
import type { Testimonio } from '../../types';

const ManageTestimonials = () => {
  const { user, isAuthenticated, isAuthLoading } = useUser();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterOwn, setFilterOwn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonio | null>(null);
  const TESTIMONIALS_PER_PAGE = 5;

  const params: TestimonioFilters = { limit: TESTIMONIALS_PER_PAGE, page: currentPage };
  if (filterStars) params.stars = filterStars;
  if (filterOwn && user?.usuario_id) params.usuario_id = user.usuario_id;

  const testimonialsQuery = useQuery<Testimonio[]>({
    queryKey: ['testimonials', filterStars, filterOwn, currentPage, user?.usuario_id],
    queryFn: () => getTestimonials(params),
    enabled: !filterOwn || (isAuthenticated && Boolean(user?.usuario_id) && !isAdmin(user?.rol_id)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTestimonial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { contenido: string; estrellas: number } }) =>
      updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsModalOpen(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  if (filterOwn && !isAuthLoading && !isAuthenticated) {
    setError('Debes iniciar sesión para ver tus reseñas');
  } else if (filterOwn && isAuthenticated && isAdmin(user?.rol_id)) {
    setError('Los administradores no tienen reseñas propias');
  } else {
    setError('');
  }

  const testimonials = testimonialsQuery.data ?? [];
  const loading = testimonialsQuery.isLoading;
  const totalPages = testimonials.length < TESTIMONIALS_PER_PAGE ? currentPage : currentPage + 1;

  const handleEdit = (testimonial: Testimonio) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Eliminar reseña',
      message: '¿Estás seguro de que quieres eliminar esta reseña?',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const handleSave = (id: number, updated: { contenido: string; estrellas: number }) => {
    updateMutation.mutate({ id, data: updated });
  };

  const canSeeOwnReviews = Boolean(isAuthenticated && user && !isAdmin(user.rol_id));

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Gestionar Reseñas</h1>

        <div className="flex justify-between mb-6">
          <div className="flex space-x-4">
            <select
              value={filterStars ?? ''}
              onChange={(e) => setFilterStars(e.target.value ? Number(e.target.value) : null)}
              className="py-1 px-3 text-sm border-2 rounded-lg bg-white text-gray-700 border-gray-200"
              aria-label="Filtrar por estrellas"
            >
              <option value="">Filtrar por Estrellas</option>
              <option value={5}>★★★★★ (5 estrellas)</option>
              <option value={4}>★★★★☆ (4 estrellas)</option>
              <option value={3}>★★★☆☆ (3 estrellas)</option>
              <option value={2}>★★☆☆☆ (2 estrellas)</option>
              <option value={1}>★☆☆☆☆ (1 estrella)</option>
            </select>

            <button
              type="button"
              onClick={() => setFilterOwn((v) => !v)}
              disabled={!canSeeOwnReviews}
              className={`py-2 px-4 text-sm border-2 rounded-lg ${
                filterOwn
                  ? 'bg-sgreen text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              } ${!canSeeOwnReviews ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                !isAuthenticated
                  ? 'Debes iniciar sesión para ver tus reseñas'
                  : isAdmin(user?.rol_id)
                    ? 'Los administradores no tienen reseñas propias'
                    : ''
              }
            >
              {filterOwn ? 'Ver Todas las Reseñas' : 'Ver Solo Mis Reseñas'}
            </button>
          </div>

          {canSeeOwnReviews && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.TESTIMONIALS_NEW)}
              className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
            >
              Crear Nueva Reseña
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Cargando testimonios...</p>
        ) : error ? (
          <p className="text-center text-red-500" role="alert">
            {error}
          </p>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No se encontraron testimonios.</p>
            {filterOwn && (
              <p className="mt-2 text-sm">
                Aún no has creado ninguna reseña. ¡Crea tu primera reseña!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {testimonials.map((testimonial) => (
                <motion.article
                  key={testimonial.testimonio_id}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-lg font-medium text-gray-700">
                    {`${testimonial.nombre || 'Anónimo'} ${testimonial.apellido_paterno || ''} ${testimonial.apellido_materno || ''}`}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 text-xs">
                      {'★'.repeat(testimonial.estrellas || 0)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        testimonial.nombre_estado === 'Confirmado'
                          ? 'bg-green-100 text-green-800'
                          : testimonial.nombre_estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {testimonial.nombre_estado}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                    {testimonial.contenido || 'Sin contenido disponible'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Fecha: {new Date(testimonial.fecha_creacion).toLocaleDateString()}
                  </p>

                  {user && testimonial.usuario_id === user.usuario_id && (
                    <div className="flex justify-between items-center mt-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(testimonial)}
                        className="bg-blue-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-blue-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(testimonial.testimonio_id)}
                        className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        <nav className="flex justify-center mt-6 space-x-4" aria-label="Paginación de reseñas">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className={`py-2 px-4 text-sm border-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-sgreen text-white border-green-500 hover:bg-green-600'
            }`}
          >
            Anterior
          </button>
          <span className="text-lg text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
            className={`py-2 px-4 text-sm border-2 rounded-lg ${
              currentPage >= totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-sgreen text-white border-green-500 hover:bg-green-600'
            }`}
          >
            Siguiente
          </button>
        </nav>
      </div>

      <EditTestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonialData={selectedTestimonial}
        onSave={handleSave}
      />
    </section>
  );
};

export default ManageTestimonials;