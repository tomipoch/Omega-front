import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../hooks/useUser';
import { ADMIN_ROL } from '../../types';
import { obtenerServicios, obtenerTodasLasCitasAdmin } from '../../services/citasService';
import { extractList, apiFetch } from '../../services/apiClient';
import type { Cita, Servicio } from '../../types';

interface ServicioForm {
  nombre_servicio: string;
  descripcion: string;
  precio: string;
  duracion_estimada: string;
}

const emptyServicioForm: ServicioForm = {
  nombre_servicio: '',
  descripcion: '',
  precio: '',
  duracion_estimada: '',
};

const formatPrecio = (raw: string): number => {
  if (raw === '' || raw === null || raw === undefined) return Number.NaN;
  const normalized = String(raw).replace(/\./g, '').replace(',', '.');
  return Number(normalized);
};

interface ValidationResult {
  ok: boolean;
  payload?: {
    nombre_servicio: string;
    descripcion: string;
    precio: number;
    duracion_estimada: number | null;
  };
  error?: string;
}

const validateServicio = (form: ServicioForm): ValidationResult => {
  if (!form.nombre_servicio.trim()) return { ok: false, error: 'El nombre del servicio es obligatorio' };
  if (!form.descripcion.trim()) return { ok: false, error: 'La descripción es obligatoria' };

  const precio = formatPrecio(form.precio);
  if (Number.isNaN(precio) || precio <= 0) return { ok: false, error: 'El precio debe ser un número mayor a 0' };

  let duracion: number | null = null;
  if (form.duracion_estimada.trim() !== '') {
    const parsed = parseInt(form.duracion_estimada, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return { ok: false, error: 'La duración debe ser un número entero mayor a 0' };
    }
    duracion = parsed;
  }

  return {
    ok: true,
    payload: {
      nombre_servicio: form.nombre_servicio.trim(),
      descripcion: form.descripcion.trim(),
      precio,
      duracion_estimada: duracion,
    },
  };
};

const ManageServicios = () => {
  const { token, user } = useUser();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<Cita[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [formData, setFormData] = useState<ServicioForm>(emptyServicioForm);

  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) throw new Error('No hay token de autenticación');
      const data = await obtenerServicios();
      setServicios(extractList<Servicio>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchServiceRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      if (!token) throw new Error('No hay token de autenticación');
      const data = await obtenerTodasLasCitasAdmin();
      setServiceRequests(extractList<Cita>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setError('Debes iniciar sesión como administrador para acceder a esta página');
      setLoading(false);
      return;
    }
    if (Number(user.rol_id) !== ADMIN_ROL) {
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
      return;
    }
    fetchServicios();
  }, [token, user, fetchServicios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
      e.nativeEvent.preventDefault();
    }

    const validation = validateServicio(formData);
    if (!validation.ok || !validation.payload) {
      setError(validation.error ?? 'Datos inválidos');
      return;
    }

    try {
      const url = editingServicio
        ? `/servicios/${editingServicio.servicio_id}`
        : '/servicios';
      const method = editingServicio ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: validation.payload,
        token,
      });

      await fetchServicios();
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre_servicio: servicio.nombre_servicio || '',
      descripcion: servicio.descripcion || '',
      precio: servicio.precio != null ? String(servicio.precio) : '',
      duracion_estimada: servicio.duracion_estimada != null ? String(servicio.duracion_estimada) : '',
    });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (servicioId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;
    try {
      await apiFetch(`/servicios/${servicioId}`, { method: 'DELETE', token });
      await fetchServicios();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleInputChange = (field: keyof ServicioForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const resetForm = () => {
    setFormData(emptyServicioForm);
    setShowForm(false);
    setEditingServicio(null);
    setError('');
  };

  const hasAccess = Boolean(token && user && Number(user.rol_id) === ADMIN_ROL);

  const solicitudesOrdenadas = useMemo(
    () => [...serviceRequests].sort((a, b) => b.cita_id - a.cita_id),
    [serviceRequests],
  );

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
                fetchServiceRequests();
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

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label htmlFor="nombre_servicio" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Servicio *
                      </label>
                      <input
                        id="nombre_servicio"
                        type="text"
                        value={formData.nombre_servicio}
                        onChange={(e) => handleInputChange('nombre_servicio', e.target.value)}
                        maxLength={255}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Reparación de reloj"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                        Precio ($) *
                      </label>
                      <input
                        id="precio"
                        type="text"
                        value={formData.precio}
                        onChange={(e) => handleInputChange('precio', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                        autoComplete="off"
                        inputMode="decimal"
                      />
                    </div>

                    <div>
                      <label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700 mb-1">
                        Duración (minutos)
                      </label>
                      <input
                        id="duracion_estimada"
                        type="text"
                        value={formData.duracion_estimada}
                        onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="60"
                        autoComplete="off"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Describe el servicio en detalle..."
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.descripcion.length}/1000 caracteres
                      </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-4">
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
                        {editingServicio ? 'Actualizar' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <p className="text-center text-gray-600">Cargando servicios...</p>
            ) : servicios.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No hay servicios configurados.</p>
                <p className="mt-2 text-sm">Crea el primer servicio para empezar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map((servicio) => (
                  <motion.article
                    key={servicio.servicio_id}
                    className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-gray-800">{servicio.nombre_servicio}</h3>
                      <span className="text-lg font-bold text-green-600">${servicio.precio}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{servicio.descripcion}</p>

                    {servicio.duracion_estimada && (
                      <p className="text-gray-500 text-xs mb-4">
                        <span className="font-medium">Duración:</span> {servicio.duracion_estimada} minutos
                      </p>
                    )}

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => handleEdit(servicio)}
                        className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(servicio.servicio_id)}
                        className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Solicitudes de Servicios</h2>
              <button
                type="button"
                onClick={fetchServiceRequests}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Actualizar
              </button>
            </div>

            {loadingRequests ? (
              <p className="text-center text-gray-600 py-8">Cargando solicitudes...</p>
            ) : solicitudesOrdenadas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No hay solicitudes de servicios.</p>
                <p className="mt-2 text-sm">Las citas solicitadas aparecerán aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solicitudesOrdenadas.map((request) => (
                      <tr key={request.cita_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.usuario_nombre || 'N/A'} {request.usuario_apellido || ''}
                          </div>
                          <div className="text-sm text-gray-500">ID: {request.usuario_id}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.servicio_nombre || 'Servicio no especificado'}
                          </div>
                          <div className="text-sm text-gray-500">${request.servicio_precio || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.fecha ? new Date(request.fecha).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.hora_inicio ? `${request.hora_inicio} - ${request.hora_fin}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.estado_nombre === 'confirmada'
                                ? 'bg-green-100 text-green-800'
                                : request.estado_nombre === 'pendiente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.estado_nombre === 'cancelada'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.estado_nombre || 'pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.usuario_email && (
                            <a href={`mailto:${request.usuario_email}`} className="text-blue-600 hover:text-blue-800">
                              {request.usuario_email}
                            </a>
                          )}
                          {!request.usuario_email && (
                            <span className="text-gray-400">Sin contacto</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageServicios;