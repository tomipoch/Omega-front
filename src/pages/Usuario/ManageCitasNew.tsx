import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../services/authContext';
import {
  obtenerCitas,
  eliminarCita,
  crearCita,
  actualizarCita,
  obtenerTodasLasCitasAdmin,
  crearCitaAdmin,
  actualizarCitaAdmin,
  eliminarCitaAdmin,
  obtenerServicios,
} from '../../services/citasService';
import {
  obtenerDisponibilidadesPublicas,
  obtenerDisponibilidadesPublicasConCita,
  obtenerDisponibilidadesAdmin,
  formatearFecha,
  formatearHora,
  agruparPorFecha,
} from '../../services/disponibilidadService';
import { obtenerTodosLosUsuarios, type Usuario } from '../../services/usuariosService';
import Modal from '../../components/Modal';
import { extractList } from '../../services/apiClient';
import type { Cita, CitaFormData, Servicio, Disponibilidad } from '../../types';

const ESTADO_COLORS: Record<string, string> = {
  confirmado: 'bg-green-100 text-green-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-red-100 text-red-800',
};

const MS_PER_HOUR = 1000 * 60 * 60;

const esCancelable = (fechaHoraStr: string): boolean => {
  if (!fechaHoraStr || typeof fechaHoraStr !== 'string') return false;
  const fechaCita = new Date(fechaHoraStr);
  if (Number.isNaN(fechaCita.getTime())) return false;
  return (fechaCita.getTime() - Date.now()) / MS_PER_HOUR >= 24;
};

const construirFechaHora = (fecha: string, horaInicio: string): string =>
  `${fecha}T${horaInicio}`;

interface CitaFormState extends CitaFormData {
  usuario_id: number | '';
}

const emptyForm: CitaFormState = {
  usuario_id: '',
  disponibilidad_id: 0,
  servicio_id: 0,
  notas: '',
};

const isCitaIncompleta = (cita: Cita): boolean => !cita.fecha || !cita.hora_inicio;

interface CitaSeleccionada extends Cita {
  fecha_hora: string;
}

const ManageCitasNew = () => {
  const { token, user, isLoading: authLoading } = useContext(AuthContext);
  const isAdmin = Number(user?.rol_id) === 2;

  const [citas, setCitas] = useState<Cita[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCitaId, setDeletingCitaId] = useState<number | null>(null);
  const [selectedCita, setSelectedCita] = useState<CitaSeleccionada | null>(null);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [formData, setFormData] = useState<CitaFormState>(emptyForm);

  const disponibilidadesAgrupadas = useMemo(
    () => agruparPorFecha(disponibilidades),
    [disponibilidades],
  );

  const fetchCitas = useCallback(async () => {
    const data = isAdmin ? await obtenerTodasLasCitasAdmin() : await obtenerCitas();
    setCitas(extractList<Cita>(data));
  }, [isAdmin]);

  const fetchUsuarios = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await obtenerTodosLosUsuarios();
      setUsuarios(extractList<Usuario>(data));
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    }
  }, [isAdmin]);

  const fetchDisponibilidades = useCallback(
    async (citaEditando: Cita | null = null) => {
      try {
        if (isAdmin) {
          const data = await obtenerDisponibilidadesAdmin();
          const inicial = extractList<Disponibilidad>(data);

          if (!citaEditando?.disponibilidad_id) {
            setDisponibilidades(inicial);
            return;
          }

          const existe = inicial.some(
            (d) => String(d.disponibilidad_id) === String(citaEditando.disponibilidad_id),
          );

          const lista = existe
            ? inicial
            : [
                ...inicial,
                {
                  disponibilidad_id: citaEditando.disponibilidad_id,
                  fecha: citaEditando.fecha,
                  hora_inicio: citaEditando.hora_inicio,
                  hora_fin: citaEditando.hora_fin,
                  estado: 'ocupada' as const,
                },
              ];

          setDisponibilidades(lista);
        } else if (citaEditando?.cita_id) {
          const data = await obtenerDisponibilidadesPublicasConCita(citaEditando.cita_id);
          setDisponibilidades(extractList<Disponibilidad>(data));
        } else {
          const data = await obtenerDisponibilidadesPublicas();
          setDisponibilidades(extractList<Disponibilidad>(data));
        }
      } catch (err) {
        console.error('Error al obtener disponibilidades:', err);
        setDisponibilidades([]);
      }
    },
    [isAdmin],
  );

  const fetchServicios = useCallback(async () => {
    try {
      const data = await obtenerServicios();
      setServicios(extractList<Servicio>(data));
    } catch (err) {
      console.error('Error al obtener servicios:', err);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!token || !user) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([
          fetchDisponibilidades(),
          fetchServicios(),
          fetchCitas(),
          isAdmin ? fetchUsuarios() : Promise.resolve(),
        ]);
      } catch (err) {
        if (!cancelled) setError((err as Error).message || 'Error al cargar datos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    token,
    user,
    isAdmin,
    fetchCitas,
    fetchUsuarios,
    fetchServicios,
    fetchDisponibilidades,
  ]);

  const resetForm = () => {
    setFormData(emptyForm);
    setShowCreateForm(false);
    setEditingCita(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.disponibilidad_id || !formData.servicio_id) {
      setError('Selecciona una disponibilidad y un servicio.');
      return;
    }
    if (isAdmin && !formData.usuario_id) {
      setError('Selecciona un usuario para la cita.');
      return;
    }

    const payload: CitaFormData = {
      disponibilidad_id: formData.disponibilidad_id,
      servicio_id: formData.servicio_id,
      notas: formData.notas,
      usuario_id: isAdmin ? Number(formData.usuario_id) : undefined,
    };

    try {
      if (editingCita) {
        if (isAdmin) await actualizarCitaAdmin(editingCita.cita_id, payload);
        else await actualizarCita(editingCita.cita_id, payload);
      } else if (isAdmin) {
        await crearCitaAdmin(payload);
      } else {
        await crearCita(payload);
      }

      resetForm();
      await Promise.all([
        fetchCitas(),
        fetchDisponibilidades(isAdmin ? null : null),
      ]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (cita: Cita) => {
    if (!isAdmin) {
      const fechaHora = construirFechaHora(cita.fecha, cita.hora_inicio);
      if (!esCancelable(fechaHora)) {
        setError('Solo puedes modificar citas con más de 24 horas de anticipación.');
        return;
      }
    }

    setEditingCita(cita);
    setFormData({
      usuario_id: cita.usuario_id || '',
      disponibilidad_id: cita.disponibilidad_id || 0,
      servicio_id: cita.servicio_id || 0,
      notas: cita.notas || '',
    });
    fetchDisponibilidades(cita);
    setShowCreateForm(true);
    setError('');
  };

  const handleDelete = async () => {
    if (!deletingCitaId) return;
    try {
      if (isAdmin) await eliminarCitaAdmin(deletingCitaId);
      else await eliminarCita(deletingCitaId);
      setIsDeleteModalOpen(false);
      setSelectedCita(null);
      setDeletingCitaId(null);
      await Promise.all([
        fetchCitas(),
        fetchDisponibilidades(isAdmin ? null : null),
      ]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const opcionesDisponibilidad = useMemo(() => {
    const opciones: React.ReactElement[] = [];
    if (editingCita) {
      opciones.push(
        <option
          key="actual"
          value={editingCita.disponibilidad_id}
          className="bg-blue-50 text-blue-800 font-semibold"
        >
          {`🕒 Mantener horario actual: ${formatearFecha(editingCita.fecha)} de ${formatearHora(
            editingCita.hora_inicio,
          )} a ${formatearHora(editingCita.hora_fin)}`}
        </option>,
      );
    }
    Object.keys(disponibilidadesAgrupadas)
      .sort()
      .forEach((fecha) => {
        const slots = disponibilidadesAgrupadas[fecha]
          .filter(
            (d) =>
              d.estado === 'disponible' &&
              (!editingCita || String(d.disponibilidad_id) !== String(editingCita.disponibilidad_id)),
          )
          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        if (!slots.length) return;
        opciones.push(
          <optgroup key={fecha} label={`📅 ${formatearFecha(fecha)}`}>
            {slots.map((d) => (
              <option key={d.disponibilidad_id} value={d.disponibilidad_id}>
                {`${formatearHora(d.hora_inicio)} - ${formatearHora(d.hora_fin)}`}
              </option>
            ))}
          </optgroup>,
        );
      });
    return opciones;
  }, [disponibilidadesAgrupadas, editingCita]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Debes iniciar sesión para ver tus citas.</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {isAdmin ? 'Gestión de Citas (Administrador)' : 'Mis Citas'}
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
              <h2 className="text-xl font-semibold mb-4">
                {editingCita ? 'Editar Cita' : 'Nueva Cita'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isAdmin && (
                  <div>
                    <label htmlFor="usuario_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario *
                    </label>
                    <select
                      id="usuario_id"
                      value={formData.usuario_id}
                      onChange={(e) =>
                        setFormData({ ...formData, usuario_id: Number(e.target.value) })
                      }
                      required
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecciona un usuario</option>
                      {usuarios.map((u) => (
                        <option key={u.usuario_id} value={u.usuario_id}>
                          {`${u.nombre} ${u.apellido_paterno} - ${u.correo_electronico}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    id="servicio_id"
                    value={formData.servicio_id}
                    onChange={(e) =>
                      setFormData({ ...formData, servicio_id: Number(e.target.value) })
                    }
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Selecciona un servicio</option>
                    {servicios.map((s) => (
                      <option key={s.servicio_id} value={s.servicio_id}>
                        {`${s.nombre_servicio} - $${s.precio} - ${s.descripcion}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="disponibilidad_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora Disponible *
                  </label>
                  {editingCita && (
                    <p className="text-sm text-blue-600 mb-2">
                      {`Tu horario actual: ${formatearFecha(editingCita.fecha)} de ${formatearHora(
                        editingCita.hora_inicio,
                      )} a ${formatearHora(editingCita.hora_fin)}. Puedes mantenerlo o elegir uno nuevo.`}
                    </p>
                  )}
                  <select
                    id="disponibilidad_id"
                    value={formData.disponibilidad_id}
                    onChange={(e) =>
                      setFormData({ ...formData, disponibilidad_id: Number(e.target.value) })
                    }
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Selecciona fecha y hora</option>
                    {opcionesDisponibilidad}
                  </select>
                  {disponibilidades.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No hay disponibilidades en este momento. El administrador debe crear horarios
                      disponibles.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="notas"
                    value={formData.notas ?? ''}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2 px-4 text-sm border-2 rounded-lg bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !formData.disponibilidad_id ||
                      !formData.servicio_id ||
                      (isAdmin && !formData.usuario_id)
                    }
                    className="py-2 px-4 text-sm border-2 rounded-lg bg-sgreen text-white border-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingCita ? 'Actualizar Cita' : 'Crear Cita'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-center text-gray-600">Cargando citas...</p>
        ) : citas.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>{isAdmin ? 'No hay citas en el sistema.' : 'No tienes citas programadas.'}</p>
            <p className="mt-2 text-sm">
              {isAdmin ? 'Crea la primera cita para un usuario.' : '¡Programa tu primera cita!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {citas.filter((c) => !isCitaIncompleta(c)).map((cita) => {
              const fechaHora = construirFechaHora(cita.fecha, cita.hora_inicio);
              const cancelable = esCancelable(fechaHora);
              const puedeEditar = isAdmin || cancelable;

              return (
                <motion.article
                  key={cita.cita_id}
                  className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{cita.servicio_nombre}</h3>
                      {isAdmin && cita.usuario_nombre && (
                        <p className="text-sm text-blue-600 font-medium">
                          {`${cita.usuario_nombre} ${cita.usuario_apellido} (${cita.usuario_email})`}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        ESTADO_COLORS[(cita.estado_nombre || '').toLowerCase()] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cita.estado_nombre || 'Pendiente'}
                    </span>
                  </div>

                  <dl className="space-y-2 mb-4 text-sm text-gray-600">
                    <div>
                      <dt className="font-medium inline">Fecha: </dt>
                      <dd className="inline">{formatearFecha(cita.fecha)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium inline">Hora: </dt>
                      <dd className="inline">
                        {`${formatearHora(cita.hora_inicio)} - ${formatearHora(cita.hora_fin)}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium inline">Precio: </dt>
                      <dd className="inline">${cita.servicio_precio}</dd>
                    </div>
                    {cita.notas && (
                      <div>
                        <dt className="font-medium inline">Notas: </dt>
                        <dd className="inline text-xs text-gray-500">{cita.notas}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="flex justify-between space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(cita)}
                      disabled={!puedeEditar}
                      className={`py-2 px-4 text-sm rounded-lg transition duration-300 ${
                        puedeEditar
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={puedeEditar ? 'Editar cita' : 'No se puede editar (menos de 24h)'}
                    >
                      {puedeEditar ? 'Editar' : 'No editable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!cita.fecha || !cita.hora_inicio) return;
                        setDeletingCitaId(cita.cita_id);
                        setSelectedCita({
                          ...cita,
                          fecha_hora: construirFechaHora(cita.fecha, cita.hora_inicio),
                        });
                        setIsDeleteModalOpen(true);
                      }}
                      disabled={!puedeEditar}
                      className={`py-2 px-4 text-sm rounded-lg transition duration-300 ${
                        puedeEditar
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={puedeEditar ? 'Cancelar cita' : 'No se puede cancelar (menos de 24h)'}
                    >
                      {puedeEditar ? (isAdmin ? 'Eliminar' : 'Cancelar') : 'No cancelable'}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        showModal={isDeleteModalOpen}
        toggleModal={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={false}
        title="Cancelar Cita"
        message={
          isAdmin || esCancelable(selectedCita?.fecha_hora ?? '')
            ? '¿Estás seguro de que deseas cancelar esta cita? Esta acción liberará el horario para otros usuarios.'
            : 'No puedes cancelar esta cita porque faltan menos de 24 horas. Si necesitas ayuda, contáctanos.'
        }
        confirmText={
          isAdmin || esCancelable(selectedCita?.fecha_hora ?? '') ? 'Cancelar Cita' : 'Cerrar'
        }
        cancelText="Mantener Cita"
      />
    </section>
  );
};

export default ManageCitasNew;