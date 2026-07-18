import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Modal from '../../components/Modal';
import { extractList, API_URL } from '../../services/apiClient';
import type { Evento } from '../../types';

const ManageEventsAdmin = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/eventos`, {
        headers: token ? { 'x-auth-token': token } : {},
      });
      if (!res.ok) throw new Error('Error al cargar eventos');
      const data = await res.json();
      setEvents(extractList<Evento>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggleModal = () => setShowModal((v) => !v);

  const confirmDelete = async () => {
    if (eventToDelete === null) return;
    try {
      const res = await fetch(`${API_URL}/eventos/${eventToDelete}`, {
        method: 'DELETE',
        headers: token ? { 'x-auth-token': token } : {},
      });
      if (!res.ok) throw new Error('No se pudo eliminar el evento');
      setEvents((prev) => prev.filter((ev) => ev.evento_id !== eventToDelete));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      toggleModal();
    }
  };

  const handleCreate = () => navigate('/admin/events/new');
  const handleEdit = (evento: Evento) =>
    navigate(`/admin/events/edit/${evento.evento_id}`, { state: { evento } });

  const requestDelete = (id: number) => {
    setEventToDelete(id);
    setShowModal(true);
  };

  if (loading) return <p>Cargando eventos...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold mb-6">Gestión de Eventos</h1>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
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
                <button type="button" onClick={() => requestDelete(ev.evento_id)} className="text-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={confirmDelete}
        title="Eliminar evento"
        message="¿Seguro que quieres eliminar este evento?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageEventsAdmin;