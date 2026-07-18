import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../hooks/useUser';
import DynamicUploadArea from '../../utils/fileUploader';
import { API_URL } from '../../services/apiClient';
import type { Servicio } from '../../types';

interface SolicitudForm {
  servicio_id: number | '';
  detalles: string;
}

const SolicitudPersonalizacion = () => {
  const { user, token } = useUser();
  const uploadAreaRef = useRef<{ reset: () => void } | null>(null);

  const [formData, setFormData] = useState<SolicitudForm>({ servicio_id: '', detalles: '' });
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/servicios`, {
          headers: { 'x-auth-token': token },
        });
        if (!res.ok) throw new Error('Error al obtener los servicios');
        const data = await res.json();
        if (!cancelled) setServicios(Array.isArray(data) ? (data as Servicio[]) : []);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!mensaje?.includes('éxito')) return undefined;
    const timer = setTimeout(() => setMensaje(''), 3000);
    return () => clearTimeout(timer);
  }, [mensaje]);

  const handleServicioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    const servicio = servicios.find((s) => s.servicio_id === id) ?? null;
    setServicioSeleccionado(servicio);
    setFormData((prev) => ({ ...prev, servicio_id: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.usuario_id) {
      setMensaje('Error: No se pudo identificar al usuario. Por favor, inicia sesión.');
      return;
    }
    if (!formData.servicio_id) {
      setMensaje('Por favor selecciona un servicio válido.');
      return;
    }

    const data = new FormData();
    data.append('usuario_id', String(user.usuario_id));
    data.append('servicio_id', String(formData.servicio_id));
    data.append('detalles', formData.detalles);
    uploadedFiles.forEach((file) => data.append('imagenes', file));

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/personalizacion`, {
        method: 'POST',
        headers: { 'x-auth-token': token ?? '' },
        body: data,
      });
      if (!res.ok) throw new Error('Error en la solicitud.');
      setMensaje('Solicitud enviada con éxito.');
      setFormData({ servicio_id: '', detalles: '' });
      setServicioSeleccionado(null);
      uploadAreaRef.current?.reset();
    } catch {
      setMensaje('Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center mb-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-semibold text-gray-800 mb-10">Solicitud de Personalización</h1>
        <p className="text-lg text-gray-700 text-left mb-8">
          En nuestra sección de Solicitud de Personalización, puedes darle un toque único y especial
          a tus productos. Ofrecemos la posibilidad de personalizar nuestras piezas para adaptarlas a
          tus gustos, necesidades y estilo personal.
        </p>
      </motion.div>

      <motion.div
        className="p-6 font-ibm bg-white rounded-2xl border border-gray-300 shadow-md mb-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700">
              Tipo de Servicio:
            </label>
            <select
              id="servicio_id"
              name="servicio_id"
              value={formData.servicio_id}
              onChange={handleServicioChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio.servicio_id} value={servicio.servicio_id}>
                  {servicio.nombre_servicio}
                </option>
              ))}
            </select>
          </div>

          {servicioSeleccionado && (
            <motion.div
              className="bg-gray-100 p-4 rounded-md shadow"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>
                <strong>Descripción:</strong> {servicioSeleccionado.descripcion}
              </p>
              <p>
                <strong>Costo:</strong> ${servicioSeleccionado.precio}
              </p>
            </motion.div>
          )}

          <div>
            <label htmlFor="detalles" className="block text-sm font-medium text-gray-700">
              Detalles:
            </label>
            <textarea
              id="detalles"
              name="detalles"
              value={formData.detalles}
              onChange={(e) => setFormData((prev) => ({ ...prev, detalles: e.target.value }))}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <DynamicUploadArea ref={uploadAreaRef} onUpload={setUploadedFiles} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              className={`mt-4 p-4 text-white rounded-md ${
                mensaje.includes('éxito') ? 'bg-green-500' : 'bg-red-500'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              role="alert"
            >
              {mensaje}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SolicitudPersonalizacion;