import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import {
  getAllUsers,
  deleteUser,
  updateUserAdmin,
  type UserFilters,
  type Usuario,
} from '../../services/usersService';

interface EditFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  telefono: string;
  direccion: string;
  rol_id: string;
}

const ROLE_NAMES: Record<number, string> = {
  1: 'Usuario',
  2: 'Administrador',
};

const ROLE_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-green-100 text-green-800',
};

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ name: string; role: 'all' | '1' | '2' }>({
    name: '',
    role: 'all',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo_electronico: '',
    telefono: '',
    direccion: '',
    rol_id: '',
  });

  const usersQuery = useQuery<Usuario[]>({
    queryKey: ['users-admin', filters],
    queryFn: () => {
      const params: UserFilters = {};
      if (filters.name) params.nombre = filters.name;
      if (filters.role !== 'all') params.rol = filters.role;
      return getAllUsers(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Usuario> }) =>
      updateUserAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
      setShowEditModal(false);
      setEditingUser(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete);
  };

  const requestDelete = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setEditFormData({
      nombre: user.nombre || '',
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      correo_electronico: user.correo_electronico || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      rol_id: user.rol_id != null ? String(user.rol_id) : '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated: Record<string, unknown> = {};
    Object.keys(editFormData).forEach((key) => {
      const k = key as keyof EditFormData;
      const incoming = editFormData[k];
      const original = (editingUser as unknown as EditFormData)[k] ?? '';
      if (incoming !== original) {
        updated[key] = incoming;
      }
    });

    if (Object.keys(updated).length === 0) {
      setShowEditModal(false);
      setEditingUser(null);
      return;
    }

    updateMutation.mutate({ id: editingUser.usuario_id, data: updated as Partial<Usuario> });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (usersQuery.isLoading) return <div className="text-center mt-10">Cargando usuarios...</div>;

  const users = usersQuery.data ?? [];
  if (error)
    return (
      <div className="text-center text-red-500 mt-10" role="alert">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Usuarios</h1>
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          name="name"
          placeholder="Buscar por nombre o apellido"
          value={filters.name}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los roles</option>
          <option value="1">Usuarios</option>
          <option value="2">Administradores</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-300">
        <table className="min-w-full table-auto border-collapse bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Correo Electrónico</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.usuario_id} className="hover:bg-gray-50 border-b border-gray-300">
                  <td className="px-6 py-3 text-gray-800 font-medium">#{user.usuario_id}</td>
                  <td className="px-6 py-3 text-gray-800">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.nombre || 'N/A'} {user.apellido_paterno || ''}
                      </span>
                      {user.apellido_materno && (
                        <span className="text-sm text-gray-500">{user.apellido_materno}</span>
                      )}
                      {user.direccion && (
                        <span className="text-xs text-gray-400">{user.direccion}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    <a href={`mailto:${user.correo_electronico}`} className="text-blue-600 hover:text-blue-800">
                      {user.correo_electronico}
                    </a>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {user.telefono ? (
                      <a href={`tel:${user.telefono}`} className="text-green-600 hover:text-green-800">
                        {user.telefono}
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ROLE_COLORS[Number(user.rol_id)] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ROLE_NAMES[Number(user.rol_id)] || 'Rol desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditUser(user)}
                        className="bg-green-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-green-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(user.usuario_id)}
                        className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-600 font-medium">
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Editar Usuario: {editingUser.nombre} {editingUser.apellido_paterno}
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    id="edit-nombre"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-apellido_paterno" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Paterno
                  </label>
                  <input
                    id="edit-apellido_paterno"
                    name="apellido_paterno"
                    value={editFormData.apellido_paterno}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-apellido_materno" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Materno
                  </label>
                  <input
                    id="edit-apellido_materno"
                    name="apellido_materno"
                    value={editFormData.apellido_materno}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-correo_electronico" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    id="edit-correo_electronico"
                    type="email"
                    name="correo_electronico"
                    value={editFormData.correo_electronico}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="edit-telefono"
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-rol_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    id="edit-rol_id"
                    name="rol_id"
                    value={editFormData.rol_id}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="1">Usuario</option>
                    <option value="2">Administrador</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="edit-direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  id="edit-direccion"
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        showModal={showDeleteModal}
        toggleModal={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageUsers;