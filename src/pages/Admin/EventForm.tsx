import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { API_URL } from '../../services/apiClient';
import { getToken } from '../../services/authService';
import type { Evento } from '../../types';

interface EventoForm {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  capacidad: string;
}

const emptyEvento: EventoForm = {
  nombre: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  ubicacion: '',
  capacidad: '',
};

const toLocalInput = (value: string): string => (value ? String(value).slice(0, 16) : '');

interface LocationState {
  evento?: Partial<Evento>;
}

const EventForm = () => {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditing = Boolean(id);

  const initialFromState = ((location.state as LocationState | null)?.evento ?? {}) as Partial<Evento>;
  const [form, setForm] = useState<EventoForm>({
    ...emptyEvento,
    ...initialFromState,
    capacidad: initialFromState.capacidad != null ? String(initialFromState.capacidad) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing || (location.state as LocationState | null)?.evento) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/eventos/${id}`, {
          headers: { 'x-auth-token': getToken() ?? '' },
        });
        if (!res.ok) throw new Error('Error al cargar el evento');
        const data = (await res.json()) as Partial<Evento>;
        if (!cancelled) {
          setForm({
            nombre: data.nombre ?? '',
            descripcion: data.descripcion ?? '',
            fecha_inicio: data.fecha_inicio ?? '',
            fecha_fin: data.fecha_fin ?? '',
            ubicacion: data.ubicacion ?? '',
            capacidad: data.capacidad != null ? String(data.capacidad) : '',
          });
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, location.state]);

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white mt-8 mb-8">
        <p className="text-red-600">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isEditing ? `${API_URL}/eventos/${id}` : `${API_URL}/eventos`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken() ?? '',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || 'Error al guardar el evento');
      }
      navigate('/admin/events');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const textFields: Array<{ name: keyof EventoForm; label: string }> = [
    { name: 'nombre', label: 'Nombre del evento' },
    { name: 'descripcion', label: 'Descripción' },
    { name: 'ubicacion', label: 'Ubicación' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white mt-8 mb-8">
      <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Editar Evento' : 'Crear Evento'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {textFields.map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={name} className="block font-medium mb-1 text-gray-700">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type="text"
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        ))}

        <div>
          <label htmlFor="fecha_inicio" className="block font-medium mb-1 text-gray-700">
            Fecha y hora de inicio
          </label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="datetime-local"
            value={toLocalInput(form.fecha_inicio)}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="fecha_fin" className="block font-medium mb-1 text-gray-700">
            Fecha y hora de finalización
          </label>
          <input
            id="fecha_fin"
            name="fecha_fin"
            type="datetime-local"
            value={toLocalInput(form.fecha_fin)}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="capacidad" className="block font-medium mb-1 text-gray-700">
            Capacidad
          </label>
          <input
            id="capacidad"
            name="capacidad"
            type="number"
            min={1}
            value={form.capacidad}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-sgreen text-white py-2 px-4 rounded disabled:opacity-60"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;