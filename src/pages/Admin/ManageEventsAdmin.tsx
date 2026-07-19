import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteEvent, getEvents } from '../../services/eventsService';
import { useConfirm } from '../../hooks/useConfirm';
import type { Evento } from '../../types';

const ManageEventsAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  const eventsQuery = useQuery<Evento[]>({
    queryKey: ['events-admin'],
    queryFn: getEvents,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events-admin'] }),
  });

  const handleCreate = () => navigate('/admin/events/new');
  const handleEdit = (evento: Evento) =>
    navigate(`/admin/events/edit/${evento.evento_id}`, { state: { evento } });

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Eliminar evento',
      message: '¿Seguro que quieres eliminar este evento?',
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (eventsQuery.isLoading) return <p>Cargando eventos...</p>;

  const events = eventsQuery.data ?? [];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold mb-6">Gestión de Eventos</h1>
      {eventsQuery.error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {(eventsQuery.error as Error).message}
        </div>
      )}
      <button
        type="button"
        onClick={handleCreate}
        className="bg-sgreen text-white px-4 py-2 rounded mb-4"
      >
        Crear Evento
      </button>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Ubicación</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.evento_id} className="border-t">
              <td>{ev.nombre}</td>
              <td>{new Date(ev.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(ev.fecha_fin).toLocaleDateString()}</td>
              <td>{ev.ubicacion}</td>
              <td>{ev.capacidad}</td>
              <td>
                <button type="button" onClick={() => handleEdit(ev)} className="text-blue-500 mr-2">
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(ev.evento_id)} className="text-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEventsAdmin;