import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { createEvent, getEventById, updateEvent } from '../../services/eventsService';
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
  const [error, setError] = useState('');

  const eventQuery = useQuery<Evento>({
    queryKey: ['events', id],
    queryFn: () => getEventById(id ?? ''),
    enabled: isEditing && !initialFromState,
  });

  useEffect(() => {
    if (!eventQuery.data) return;
    setForm({
      nombre: eventQuery.data.nombre ?? '',
      descripcion: eventQuery.data.descripcion ?? '',
      fecha_inicio: eventQuery.data.fecha_inicio ?? '',
      fecha_fin: eventQuery.data.fecha_fin ?? '',
      ubicacion: eventQuery.data.ubicacion ?? '',
      capacidad: eventQuery.data.capacidad != null ? String(eventQuery.data.capacidad) : '',
    });
  }, [eventQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        ubicacion: form.ubicacion,
        capacidad: Number(form.capacidad),
      };
      return isEditing && id
        ? updateEvent(Number(id), payload)
        : createEvent(payload);
    },
    onSuccess: () => navigate('/admin/events'),
    onError: (err: Error) =>
      setError(err.message || 'Error al guardar el evento'),
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate();
  };

  const textFields: Array<{ name: keyof EventoForm; label: string }> = [
    { name: 'nombre', label: 'Nombre del evento' },
    { name: 'descripcion', label: 'Descripción' },
    { name: 'ubicacion', label: 'Ubicación' },
  ];

  const loading = saveMutation.isPending;

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