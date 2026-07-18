import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../services/authContext';
import {
  obtenerTodasLasCitasAdmin,
  crearCitaAdmin,
  actualizarCitaAdmin,
  eliminarCitaAdmin,
  obtenerServicios,
} from '../../services/citasService';
import {
  obtenerDisponibilidadesAdmin,
  formatearFecha,
  formatearHora,
} from '../../services/disponibilidadService';
import { obtenerTodosLosUsuarios, type Usuario } from '../../services/usuariosService';
import { extractList } from '../../services/apiClient';
import type { Cita, CitaFormData, Servicio, Disponibilidad } from '../../types';

const ESTADO_COLORS: Record<string, string> = {
  confirmado: 'bg-green-100 text-green-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-red-100 text-red-800',
};

interface CitaFormState extends CitaFormData {
  usuario_id: number | '';
}

const emptyForm: CitaFormState = {
  usuario_id: '',
  disponibilidad_id: 0,
  servicio_id: 0,
  notas: '',
};

const ManageCitasAdmin = () => {
  const { token, user } = useContext(AuthContext);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [formData, setFormData] = useState<CitaFormState>(emptyForm);

  const fetchData = useCallback(async () => {
    const [citasData, usuariosData, disponibilidadesData, serviciosData] = await Promise.all([
      obtenerTodasLasCitasAdmin(),
      obtenerTodosLosUsuarios(),
      obtenerDisponibilidadesAdmin(),
      obtenerServicios(),
    ]);
    setCitas(extractList<Cita>(citasData));
    setUsuarios(extractList<Usuario>(usuariosData));
    setDisponibilidades(extractList<Disponibilidad>(disponibilidadesData));
    setServicios(extractList<Servicio>(serviciosData));
  }, []);

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await fetchData();
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, fetchData]);

  const opcionesDisponibilidad = useMemo(() => {
    return disponibilidades
      .filter((d) => d.estado === 'disponible' || d.es_actual)
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        return a.hora_inicio.localeCompare(b.hora_inicio);
      })
      .map((d) => (
        <option key={d.disponibilidad_id} value={d.disponibilidad_id}>
          {formatearFecha(d.fecha)} - {formatearHora(d.hora_inicio)} a {formatearHora(d.hora_fin)}
          {d.es_actual ? ' (Horario Actual)' : ''}
          {d.estado === 'ocupada' && !d.es_actual ? ' (Ocupado)' : ''}
        </option>
      ));
  }, [disponibilidades]);

  const resetForm = async () => {
    setFormData(emptyForm);
    setShowCreateForm(false);
    setEditingCita(null);
    setError('');
    try {
      const data = await obtenerDisponibilidadesAdmin();
      setDisponibilidades(extractList<Disponibilidad>(data));
    } catch (err) {
      console.error('Error al recargar disponibilidades:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.usuario_id || !formData.disponibilidad_id || !formData.servicio_id) {
      setError('Todos los campos son requeridos.');
      return;
    }

    const payload: CitaFormData = {
      usuario_id: Number(formData.usuario_id),
      disponibilidad_id: formData.disponibilidad_id,
      servicio_id: formData.servicio_id,
      notas: formData.notas,
    };

    try {
      if (editingCita) await actualizarCitaAdmin(editingCita.cita_id, payload);
      else await crearCitaAdmin(payload);
      await resetForm();
      await fetchData();
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = async (cita: Cita) => {
    setFormData({
      usuario_id: cita.usuario_id || '',
      disponibilidad_id: cita.disponibilidad_id || 0,
      servicio_id: cita.servicio_id || 0,
      notas: cita.notas || '',
    });
    setEditingCita(cita);
    await fetchDisponibilidadesConActual(cita);
    setShowCreateForm(true);
  };

  const fetchDisponibilidadesConActual = async (citaActual: Cita) => {
    try {
      const data = await obtenerDisponibilidadesAdmin();
      const inicial = extractList<Disponibilidad>(data);

      if (!citaActual.disponibilidad_id) {
        setDisponibilidades(inicial);
        return;
      }

      const existe = inicial.some(
        (d) => String(d.disponibilidad_id) === String(citaActual.disponibilidad_id),
      );

const lista = existe
            ? inicial.map((d) =>
                String(d.disponibilidad_id) === String(citaActual.disponibilidad_id)
                  ? { ...d, es_actual: true }
                  : d,
              )
            : [
                ...inicial,
                {
                  disponibilidad_id: citaActual.disponibilidad_id,
                  fecha: citaActual.fecha,
                  hora_inicio: citaActual.hora_inicio,
                  hora_fin: citaActual.hora_fin,
                  estado: 'ocupada' as const,
                  es_actual: true,
                },
              ];

      setDisponibilidades(lista);
    } catch (err) {
      console.error('Error al cargar disponibilidades para edición:', err);
      setError((err as Error).message);
    }
  };

  const handleDelete = async (citaId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) return;
    try {
      await eliminarCitaAdmin(citaId);
      await fetchData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

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
              <h2 className="text-xl font-semibold mb-4">
                {editingCita ? 'Editar Cita' : 'Nueva Cita'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                        {u.nombre} {u.apellido_paterno} - {u.correo_electronico}
                      </option>
                    ))}
                  </select>
                </div>

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
                        {s.nombre_servicio} - ${s.precio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="disponibilidad_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Horario disponible *
                  </label>
                  <select
                    id="disponibilidad_id"
                    value={formData.disponibilidad_id}
                    onChange={(e) =>
                      setFormData({ ...formData, disponibilidad_id: Number(e.target.value) })
                    }
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Seleccionar horario</option>
                    {opcionesDisponibilidad}
                  </select>
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
                    className="py-2 px-4 text-sm border-2 rounded-lg bg-sgreen text-white border-green-500 hover:bg-green-600"
                  >
                    {editingCita ? 'Actualizar Cita' : 'Crear Cita'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {citas.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No hay citas registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {citas.map((cita) => (
              <motion.article
                key={cita.cita_id}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">{cita.servicio_nombre}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      ESTADO_COLORS[(cita.estado_nombre || '').toLowerCase()] ||
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cita.estado_nombre}
                  </span>
                </div>

                <dl className="space-y-2 mb-4 text-sm text-gray-600">
                  <div>
                    <dt className="font-medium inline">Cliente: </dt>
                    <dd className="inline">
                      {cita.usuario_nombre} {cita.usuario_apellido}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Email: </dt>
                    <dd className="inline">{cita.usuario_email}</dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Fecha: </dt>
                    <dd className="inline">{formatearFecha(cita.fecha)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Hora: </dt>
                    <dd className="inline">
                      {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
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
                    className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cita.cita_id)}
                    className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageCitasAdmin;