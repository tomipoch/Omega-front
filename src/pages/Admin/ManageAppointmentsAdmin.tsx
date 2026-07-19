import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { useConfirm } from '../../hooks/useConfirm';
import {
  createAppointmentAdmin,
  deleteAppointmentAdmin,
  getAllAppointmentsAdmin,
  getServices,
} from '../../services/appointmentsService';
import { getAvailabilitiesAdmin } from '../../services/availabilityService';
import { getAllUsers, type Usuario } from '../../services/usersService';
import { AppointmentCard } from '../../features/appointments/AppointmentCard';
import { AdminAppointmentForm } from '../../features/appointments/AdminAppointmentForm';
import type { AppointmentFormValues } from '../../features/appointments/appointmentFormSchema';
import { EmptyState } from '../../components/EmptyState';
import { QueryBoundary } from '../../components/QueryBoundary';
import type { Cita, Servicio, Disponibilidad } from '../../types';

const ManageCitasAdmin = () => {
  const { isAuthenticated } = useUser();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const citasQuery = useQuery<Cita[]>({
    queryKey: ['appointments-admin'],
    queryFn: getAllAppointmentsAdmin,
  });
  const usuariosQuery = useQuery<Usuario[]>({
    queryKey: ['users-admin'],
    queryFn: () => getAllUsers(),
  });
  const disponibilidadesQuery = useQuery<Disponibilidad[]>({
    queryKey: ['availabilities-admin'],
    queryFn: () => getAvailabilitiesAdmin(),
  });
  const serviciosQuery = useQuery<Servicio[]>({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments-admin'] });
    queryClient.invalidateQueries({ queryKey: ['availabilities-admin'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: AppointmentFormValues) => createAppointmentAdmin(data),
    onSuccess: () => {
      invalidateAll();
      setShowCreateForm(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (citaId: number) => deleteAppointmentAdmin(citaId),
    onSuccess: invalidateAll,
    onError: (err: Error) => setError(err.message),
  });

  const usuarios = useMemo<Usuario[]>(() => usuariosQuery.data ?? [], [usuariosQuery.data]);
  const disponibilidades = useMemo<Disponibilidad[]>(
    () => disponibilidadesQuery.data ?? [],
    [disponibilidadesQuery.data],
  );
  const servicios = useMemo<Servicio[]>(() => serviciosQuery.data ?? [], [serviciosQuery.data]);
  const loading =
    citasQuery.isLoading ||
    usuariosQuery.isLoading ||
    disponibilidadesQuery.isLoading ||
    serviciosQuery.isLoading;

  const handleDelete = async (citaId: number) => {
    const ok = await confirm({
      title: 'Eliminar cita',
      message: '¿Estás seguro de que deseas eliminar esta cita?',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(citaId);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestión de Citas (Administrador)
        </h1>

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
          >
            {showCreateForm ? 'Cancelar' : 'Nueva Cita'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            {error}
          </div>
        )}

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">Nueva Cita</h2>
              <AdminAppointmentForm
                servicios={servicios}
                usuarios={usuarios}
                disponibilidades={disponibilidades}
                onSubmit={(values) => createMutation.mutate(values)}
                onCancel={() => {
                  setShowCreateForm(false);
                  setError('');
                }}
                isSubmitting={createMutation.isPending}
                errorMessage={error}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <QueryBoundary
          query={citasQuery}
          empty={(d) => d.length === 0}
          emptyState={
            <EmptyState
              message="No hay citas registradas."
              action={
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
                >
                  Crear la primera cita
                </button>
              }
            />
          }
        >
          {(data) => (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.map((cita) => (
                <AppointmentCard
                  key={cita.cita_id}
                  cita={cita}
                  isAdmin
                  onDelete={(c) => handleDelete(c.cita_id)}
                  canCancel={!deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </QueryBoundary>
      </div>
    </section>
  );
};

export default ManageCitasAdmin;