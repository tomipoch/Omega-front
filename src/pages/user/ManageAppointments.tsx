import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { isAdmin as isAdminRole } from '../../constants/roles';
import { useConfirm } from '../../hooks/useConfirm';
import {
  getAppointments,
  deleteAppointment,
  createAppointment,
  updateAppointment,
  getAllAppointmentsAdmin,
  createAppointmentAdmin,
  updateAppointmentAdmin,
  deleteAppointmentAdmin,
  getServices,
} from '../../services/appointmentsService';
import {
  getPublicAvailabilities,
  getPublicAvailabilitiesWithAppointment,
  getAvailabilitiesAdmin,
} from '../../services/availabilityService';
import { getAllUsers, type Usuario } from '../../services/usersService';
import Modal from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { QueryBoundary } from '../../components/QueryBoundary';
import { AppointmentCard } from '../../features/appointments/AppointmentCard';
import { AppointmentForm } from '../../features/appointments/AppointmentForm';
import type { AppointmentFormValues } from '../../features/appointments/appointmentFormSchema';
import type { Cita, Servicio, Disponibilidad } from '../../types';

const MS_PER_HOUR = 1000 * 60 * 60;

const esCancelable = (fechaHoraStr: string): boolean => {
  if (!fechaHoraStr || typeof fechaHoraStr !== 'string') return false;
  const fechaCita = new Date(fechaHoraStr);
  if (Number.isNaN(fechaCita.getTime())) return false;
  return (fechaCita.getTime() - Date.now()) / MS_PER_HOUR >= 24;
};

const construirFechaHora = (fecha: string, horaInicio: string): string =>
  `${fecha}T${horaInicio}`;

interface CitaSeleccionada extends Cita {
  fecha_hora: string;
}

const ManageCitasNew = () => {
  const { user } = useUser();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const userIsAdmin = isAdminRole(user?.rol_id);

  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCitaId, setDeletingCitaId] = useState<number | null>(null);
  const [selectedCita, setSelectedCita] = useState<CitaSeleccionada | null>(null);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);

  const citasQuery = useQuery<Cita[]>({
    queryKey: userIsAdmin ? ['appointments-admin'] : ['appointments'],
    queryFn: () => (userIsAdmin ? getAllAppointmentsAdmin() : getAppointments()),
  });

  const servicesQuery = useQuery<Servicio[]>({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const usersQuery = useQuery<Usuario[]>({
    queryKey: ['users-admin'],
    queryFn: () => getAllUsers(),
    enabled: userIsAdmin,
  });

  const availabilitiesAdminQuery = useQuery<Disponibilidad[]>({
    queryKey: ['availabilities-admin'],
    queryFn: () => getAvailabilitiesAdmin(),
    enabled: userIsAdmin,
  });

  const availabilitiesPublicQuery = useQuery<Disponibilidad[]>({
    queryKey: ['availabilities-public'],
    queryFn: () => getPublicAvailabilities(),
    enabled: !userIsAdmin,
  });

  const availabilitiesWithCitaQuery = useQuery<Disponibilidad[]>({
    queryKey: ['availabilities-public', editingCita?.cita_id],
    queryFn: () => getPublicAvailabilitiesWithAppointment(editingCita?.cita_id ?? null),
    enabled: !userIsAdmin && Boolean(editingCita?.cita_id),
  });

  const invalidateCitas = () =>
    queryClient.invalidateQueries({
      queryKey: userIsAdmin ? ['appointments-admin'] : ['appointments'],
    });

  const deleteMutation = useMutation({
    mutationFn: ({ id, admin }: { id: number; admin: boolean }) =>
      admin ? deleteAppointmentAdmin(id) : deleteAppointment(id),
    onSuccess: () => {
      invalidateCitas();
      setIsDeleteModalOpen(false);
      setDeletingCitaId(null);
      setSelectedCita(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, admin }: { data: AppointmentFormValues; admin: boolean }) =>
      admin ? createAppointmentAdmin(data) : createAppointment(data),
    onSuccess: () => {
      invalidateCitas();
      setShowCreateForm(false);
      setEditingCita(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, admin }: { id: number; data: AppointmentFormValues; admin: boolean }) =>
      admin ? updateAppointmentAdmin(id, data) : updateAppointment(id, data),
    onSuccess: () => {
      invalidateCitas();
      setShowCreateForm(false);
      setEditingCita(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const usuarios: Usuario[] = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const servicios: Servicio[] = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);

  const disponibilidades: Disponibilidad[] = useMemo(() => {
    const base = userIsAdmin
      ? (availabilitiesAdminQuery.data ?? [])
      : (availabilitiesPublicQuery.data ?? availabilitiesWithCitaQuery.data ?? []);
    if (!editingCita?.disponibilidad_id || userIsAdmin) return base;
    const existe = base.some(
      (d) => String(d.disponibilidad_id) === String(editingCita.disponibilidad_id),
    );
    if (existe) return base;
    return [
      ...base,
      {
        disponibilidad_id: editingCita.disponibilidad_id,
        fecha: editingCita.fecha,
        hora_inicio: editingCita.hora_inicio,
        hora_fin: editingCita.hora_fin,
        estado: 'ocupada',
      },
    ];
  }, [
    userIsAdmin,
    availabilitiesAdminQuery.data,
    availabilitiesPublicQuery.data,
    availabilitiesWithCitaQuery.data,
    editingCita,
  ]);

  const _loading =
    citasQuery.isLoading ||
    servicesQuery.isLoading ||
    (userIsAdmin
      ? availabilitiesAdminQuery.isLoading || usersQuery.isLoading
      : (availabilitiesPublicQuery.isLoading || availabilitiesWithCitaQuery.isLoading));
void _loading;

  const handleSelectCita = (cita: Cita) => {
    const fechaHora = construirFechaHora(cita.fecha, cita.hora_inicio);
    setSelectedCita({ ...cita, fecha_hora: fechaHora });
  };

  const handleEdit = (cita: Cita) => {
    if (!userIsAdmin) {
      const fechaHora = construirFechaHora(cita.fecha, cita.hora_inicio);
      if (!esCancelable(fechaHora)) {
        setError('Solo puedes modificar citas con más de 24 horas de anticipación.');
        return;
      }
    }
    setEditingCita(cita);
    setShowCreateForm(true);
    setSelectedCita(null);
    setError('');
  };

  const handleDelete = async () => {
    if (!deletingCitaId) return;
    const ok = await confirm({
      title: 'Cancelar cita',
      message: '¿Estás seguro de que deseas cancelar esta cita?',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate({ id: deletingCitaId, admin: userIsAdmin });
  };

  const handleSubmit = (values: AppointmentFormValues) => {
    setError('');
    if (editingCita) {
      updateMutation.mutate({ id: editingCita.cita_id, data: values, admin: userIsAdmin });
    } else {
      createMutation.mutate({ data: values, admin: userIsAdmin });
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingCita(null);
    setError('');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Debes iniciar sesión para ver tus citas.</p>
      </div>
    );
  }

  const submitInFlight = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {userIsAdmin ? 'Gestión de Citas (Administrador)' : 'Mis Citas'}
        </h1>

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => {
              if (showCreateForm) resetForm();
              else {
                setShowCreateForm(true);
                setEditingCita(null);
              }
            }}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
          >
            {showCreateForm ? 'Cancelar' : 'Nueva Cita'}
          </button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingCita ? 'Editar Cita' : 'Nueva Cita'}
              </h2>
              <AppointmentForm
                editingCita={editingCita}
                servicios={servicios}
                usuarios={usuarios}
                disponibilidades={disponibilidades}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                isSubmitting={submitInFlight}
                isAdmin={userIsAdmin}
                errorMessage={error}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && !showCreateForm && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            {error}
          </div>
        )}

        <QueryBoundary
          query={citasQuery}
          loadingMessage="Cargando citas..."
          empty={(data) => data.length === 0}
          emptyState={
            <EmptyState
              message={userIsAdmin ? 'No hay citas en el sistema.' : 'No tienes citas programadas.'}
              action={
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
                >
                  {userIsAdmin ? 'Crear la primera cita' : '¡Programa tu primera cita!'}
                </button>
              }
            />
          }
        >
          {(data) => (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.map((cita) => {
                const cancelable =
                  userIsAdmin ||
                  esCancelable(construirFechaHora(cita.fecha, cita.hora_inicio));
                return (
                  <AppointmentCard
                    key={cita.cita_id}
                    cita={cita}
                    isAdmin={userIsAdmin}
                    onSelect={handleSelectCita}
                    onEdit={handleEdit}
                    onDelete={(c) => {
                      setDeletingCitaId(c.cita_id);
                      setIsDeleteModalOpen(true);
                    }}
                    canCancel={cancelable}
                  />
                );
              })}
            </div>
          )}
        </QueryBoundary>

        {selectedCita && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 max-w-2xl relative">
              <h2 className="text-2xl font-bold mb-4">{selectedCita.servicio_nombre}</h2>
              <p className="text-gray-600 mb-2">
                {selectedCita.usuario_nombre} {selectedCita.usuario_apellido}
              </p>
              <p className="text-gray-700 mb-4">
                {selectedCita.notas || 'Sin notas adicionales.'}
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedCita(null)}
                  className="py-2 px-4 bg-gray-200 rounded-lg"
                >
                  Cerrar
                </button>
                {userIsAdmin || esCancelable(selectedCita.fecha_hora) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCitaId(selectedCita.cita_id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    {userIsAdmin ? 'Eliminar' : 'Cancelar Cita'}
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 self-center">No cancelable</span>
                )}
              </div>
            </div>
          </div>
        )}

        <Modal
          showModal={isDeleteModalOpen}
          toggleModal={() => {
            setIsDeleteModalOpen(false);
            setDeletingCitaId(null);
          }}
          onConfirm={handleDelete}
          loading={deleteMutation.isPending}
          title="Eliminar cita"
          message="¿Estás seguro de que deseas cancelar esta cita?"
          confirmText="Eliminar"
          cancelText="Cerrar"
        />
      </div>
    </section>
  );
};

export default ManageCitasNew;