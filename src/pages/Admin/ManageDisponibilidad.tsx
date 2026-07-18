import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../services/authContext';
import { getTodayDateString } from '../../utils/dateUtils';
import {
  obtenerDisponibilidadesAdmin,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  formatearFecha,
  formatearHora,
  agruparPorFecha,
} from '../../services/disponibilidadService';
import { eliminarCitaAdmin } from '../../services/citasService';
import { extractList } from '../../services/apiClient';
import type { Disponibilidad, DisponibilidadEstado, DisponibilidadPayload } from '../../types';

const ESTADO_COLORS: Record<DisponibilidadEstado, string> = {
  disponible: 'bg-green-100 text-green-800',
  ocupada: 'bg-yellow-100 text-yellow-800',
  cancelada: 'bg-gray-100 text-gray-800',
};

const buildPayload = (form: DisponibilidadForm): DisponibilidadPayload => ({
  fecha: form.fecha,
  hora_inicio: form.horaInicio,
  hora_fin: form.horaFin,
  estado: form.estado,
});

interface DisponibilidadForm {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: DisponibilidadEstado;
}

const emptyForm: DisponibilidadForm = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  estado: 'disponible',
};

const ManageDisponibilidad = () => {
  // AuthContext retained for future permission gating.
  useContext(AuthContext);

  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDisponibilidad, setEditingDisponibilidad] = useState<Disponibilidad | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<DisponibilidadEstado | ''>('');
  const [formData, setFormData] = useState<DisponibilidadForm>(emptyForm);

  const fetchDisponibilidades = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filtroEstado) params.estado = filtroEstado;
      const data = await obtenerDisponibilidadesAdmin(params);
      setDisponibilidades(extractList<Disponibilidad>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    fetchDisponibilidades();
  }, [fetchDisponibilidades]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingDisponibilidad(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = buildPayload(formData);
      if (editingDisponibilidad) {
        await actualizarDisponibilidad(editingDisponibilidad.disponibilidad_id, payload);
      } else {
        await crearDisponibilidad(payload);
      }
      resetForm();
      await fetchDisponibilidades();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (disponibilidad: Disponibilidad) => {
    setFormData({
      fecha: disponibilidad.fecha,
      horaInicio: disponibilidad.hora_inicio,
      horaFin: disponibilidad.hora_fin,
      estado: disponibilidad.estado,
    });
    setEditingDisponibilidad(disponibilidad);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta disponibilidad?')) return;
    try {
      await eliminarDisponibilidad(id);
      await fetchDisponibilidades();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEliminarCita = async (citaId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cita? Esto liberará el horario.'))
      return;
    try {
      await eliminarCitaAdmin(citaId);
      await fetchDisponibilidades();
    } catch (err) {
      setError(`Error al eliminar cita: ${(err as Error).message}`);
    }
  };

  const disponibilidadesAgrupadas = useMemo(
    () => agruparPorFecha(disponibilidades),
    [disponibilidades],
  );

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestión de Disponibilidades
        </h1>

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
          >
            {showForm ? 'Cancelar' : 'Nueva Disponibilidad'}
          </button>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as DisponibilidadEstado | '')}
            className="py-1 px-3 text-sm border-2 rounded-lg bg-white text-gray-700 border-gray-200"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
          </select>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingDisponibilidad ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    min={getTodayDateString()}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    id="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {editingDisponibilidad && (
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value as DisponibilidadEstado })
                      }
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupada">Ocupada</option>
                    </select>
                  </div>
                )}

                <div
                  className={`${
                    editingDisponibilidad ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2 lg:col-span-3'
                  } flex justify-end space-x-4`}
                >
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
                    {editingDisponibilidad ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando disponibilidades...</p>
        ) : Object.keys(disponibilidadesAgrupadas).length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No hay disponibilidades configuradas.</p>
            <p className="mt-2 text-sm">Crea la primera disponibilidad para empezar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(disponibilidadesAgrupadas)
              .sort()
              .map((fecha) => (
                <div key={fecha} className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {formatearFecha(fecha)}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disponibilidadesAgrupadas[fecha]
                      .filter((d) => d.estado !== 'cancelada')
                      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                      .map((d) => (
                        <motion.div
                          key={d.disponibilidad_id}
                          className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-lg font-medium text-gray-800">
                              {formatearHora(d.hora_inicio)} - {formatearHora(d.hora_fin)}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                ESTADO_COLORS[d.estado] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {d.estado}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            Creada por: {d.admin_nombre} {d.admin_apellido}
                          </p>

                          {d.estado === 'ocupada' && d.cita_id && (
                            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
                              <h4 className="text-sm font-semibold text-orange-800 mb-2">Cita Reservada:</h4>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Cliente: </span>
                                {d.cliente_nombre} {d.cliente_apellido}
                              </p>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Email: </span>
                                {d.cliente_email}
                              </p>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Servicio: </span>
                                {d.servicio_nombre} (${d.servicio_precio})
                              </p>
                              {d.cita_notas && (
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Notas: </span>
                                  {d.cita_notas}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between space-x-2">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(d)}
                                className="bg-blue-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-blue-600 transition"
                              >
                                Editar
                              </button>
                              {d.estado === 'ocupada' && d.cita_id && (
                                <button
                                  type="button"
                                  onClick={() => handleEliminarCita(d.cita_id ?? 0)}
                                  className="bg-orange-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-orange-600 transition"
                                >
                                  Liberar
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDelete(d.disponibilidad_id)}
                              disabled={d.estado === 'ocupada'}
                              className={`py-1 px-3 text-sm rounded-lg transition ${
                                d.estado === 'ocupada'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              Eliminar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageDisponibilidad;