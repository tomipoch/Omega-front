import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { isAdmin as isAdminRole } from '../../constants/roles';
import { useConfirm } from '../../hooks/useConfirm';
import { getServices, getAllAppointmentsAdmin } from '../../services/appointmentsService';
import { apiFetch } from '../../services/apiClient';
import { ServiceForm } from '../../features/services/ServiceForm';
import { ServiceCard } from '../../features/services/ServiceCard';
import { ServiceRequestsTable } from '../../features/services/ServiceRequestsTable';
import type { ServiceFormValues } from '../../features/services/serviceFormSchema';
import { EmptyState } from '../../components/EmptyState';
import { QueryBoundary } from '../../components/QueryBoundary';
import type { Cita, Servicio } from '../../types';

const ManageServicios = () => {
  const { user } = useUser();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [showRequests, setShowRequests] = useState(false);

  const servicesQuery = useQuery<Servicio[]>({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const requestsQuery = useQuery<Cita[]>({
    queryKey: ['service-requests'],
    queryFn: () => getAllAppointmentsAdmin(),
    enabled: showRequests,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: number; data: ServiceFormValues }) => {
      const url = payload.id ? `/servicios/${payload.id}` : '/servicios';
      const method = payload.id ? 'PUT' : 'POST';
      return apiFetch(url, { method, body: payload.data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/servicios/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
    onError: (err: Error) => setError(err.message),
  });

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (servicioId: number) => {
    const ok = await confirm({
      title: 'Eliminar servicio',
      message: '¿Estás seguro de que deseas eliminar este servicio?',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(servicioId);
  };

  const handleSubmit = (values: ServiceFormValues) => {
    const payload = {
      nombre_servicio: values.nombre_servicio.trim(),
      descripcion: values.descripcion.trim(),
      precio: values.precio,
      duracion_estimada: values.duracion_estimada ?? null,
    };
    saveMutation.mutate(
      editingServicio
        ? { id: editingServicio.servicio_id, data: payload }
        : { data: payload },
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingServicio(null);
    setError('');
  };

  const hasAccess = Boolean(user && isAdminRole(user.rol_id));

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Gestión de Servicios</h1>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              type="button"
              onClick={() => {
                setShowRequests(false);
                setShowForm(false);
              }}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                !showRequests ? 'bg-sgreen text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Gestionar Servicios
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRequests(true);
                setShowForm(false);
                requestsQuery.refetch();
              }}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                showRequests ? 'bg-sgreen text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ver Solicitudes
            </button>
          </div>
        </div>

        {!hasAccess ? (
          <div className="text-center text-red-600">
            <p>No tienes permisos para acceder a esta página.</p>
          </div>
        ) : !showRequests ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
              >
                {showForm ? 'Cancelar' : 'Nuevo Servicio'}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                {error}
              </div>
            )}

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-sm mb-6"
                >
                  <h2 className="text-xl font-semibold mb-4">
                    {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </h2>
                  <ServiceForm
                    initialValues={
                      editingServicio
                        ? {
                            nombre_servicio: editingServicio.nombre_servicio,
                            descripcion: editingServicio.descripcion ?? '',
                            precio: editingServicio.precio,
                            duracion_estimada: editingServicio.duracion_estimada ?? null,
                          }
                        : undefined
                    }
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                    isSubmitting={saveMutation.isPending}
                    submitLabel={editingServicio ? 'Actualizar' : 'Crear'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <QueryBoundary
              query={servicesQuery}
              loadingMessage="Cargando servicios..."
              empty={(d) => d.length === 0}
              emptyState={
                <EmptyState
                  message="No hay servicios configurados."
                  action={
                    <span className="text-sm text-gray-500">Crea el primer servicio para empezar.</span>
                  }
                />
              }
            >
              {(data) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((servicio) => (
                    <ServiceCard
                      key={servicio.servicio_id}
                      servicio={servicio}
                      onEdit={handleEdit}
                      onDelete={(s) => handleDelete(s.servicio_id)}
                    />
                  ))}
                </div>
              )}
            </QueryBoundary>
          </>
        ) : (
          <ServiceRequestsTable
            requests={requestsQuery.data ?? []}
            onRefresh={() => requestsQuery.refetch()}
          />
        )}
      </div>
    </section>
  );
};

export default ManageServicios;