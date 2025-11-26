import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../services/authContext";
import Modal from "../../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  obtenerTodosLosUsuarios, 
  eliminarUsuario, 
  actualizarUsuarioAdmin, 
  actualizarRolUsuario 
} from "../../services/usuariosService";
import { Bounce, toast } from 'react-toastify';

const ManageUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    role: "all",
  });

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Nuevo estado para el formulario de edición completa
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo_electronico: "",
    telefono: "",
    direccion: "",
    rol_id: ""
  });

  // Obtener usuarios desde la API
  const fetchUsers = async () => {
    if (!token) {
      setError("No se encontró un token de autenticación.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filterParams = {};
      if (filters.name) filterParams.nombre = filters.name;
      if (filters.role !== "all") filterParams.rol = filters.role;

      const data = await obtenerTodosLosUsuarios(filterParams);
      console.log('Usuarios obtenidos:', data);
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la API cuando se actualicen los filtros
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmDelete = async () => {
    if (!token || !userToDelete) {
      setError("No se encontró un token de autenticación o usuario inválido.");
      return;
    }

    try {
      await eliminarUsuario(userToDelete);
      // Eliminar el usuario de la lista localmente
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.usuario_id !== userToDelete)
      );

      toast.success("Usuario Eliminado Correctamente", {
        position: "top-right",
        theme: "colored"
      });

    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar usuario.");
      toast.error("Error al eliminar Usuario", {
        position: "top-right",
        theme: "colored"
      });
    } finally {
      setShowModal(false);
    }
  };

  const requestDelete = (id) => {
    setUserToDelete(id);
    setShowModal(true);
  };

  // Función para abrir modal de edición completa
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      nombre: user.nombre || "",
      apellido_paterno: user.apellido_paterno || "",
      apellido_materno: user.apellido_materno || "",
      correo_electronico: user.correo_electronico || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",
      rol_id: user.rol_id || ""
    });
    setShowEditModal(true);
  };

  // Función para actualizar usuario completo
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Filtrar solo los campos que han cambiado
      const updatedFields = {};
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== (editingUser[key] || "")) {
          updatedFields[key] = editFormData[key];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        setShowEditModal(false);
        setEditingUser(null);
        return;
      }

      const response = await actualizarUsuarioAdmin(editingUser.usuario_id, updatedFields);
      
      // Actualizar el usuario en la lista local
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.usuario_id === editingUser.usuario_id
            ? { ...user, ...response.usuario }
            : user
        )
      );
      
      toast.success("Datos del Usuario Actualizado Correctamente", {
        position: "top-right",
        theme: "colored"
      });
      
      setShowEditModal(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError(err.message);
      toast.error("Error al actulizar los datos del usuario", {
        position: "top-right",
        theme: "colored"
      });
    }
  };

  // Función para manejar cambios en el formulario de edición
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para obtener el nombre del rol
  const getRoleName = (rolId) => {
    const rol = parseInt(rolId);
    switch (rol) {
      case 1:
        return "Usuario";
      case 2:
        return "Administrador";
      default:
        return "Rol desconocido"; // Se ha eliminado el "Sin rol"
    }
  };

  // Función para obtener el color del badge del rol
  const getRoleColor = (rolId) => {
    const rol = parseInt(rolId);
    switch (rol) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800"; // Se ha cambiado el color a gris para el "Rol desconocido"
    }
  };

  // Función para editar rol de usuario
  const handleEditRole = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // Función para actualizar el rol del usuario (función simplificada para compatibilidad)
  const updateUserRole = async (userId, newRole) => {
    if (!token) {
      setError("No se encontró un token de autenticación.");
      return;
    }

    try {
      await actualizarRolUsuario(userId, newRole);
      
      // Actualizar el usuario en la lista local
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.usuario_id === userId ? { ...user, rol_id: newRole } : user
        )
      );

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      setError("Error al actualizar el rol del usuario.");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

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
                <tr
                  key={user.usuario_id}
                  className="hover:bg-gray-50 border-b border-gray-300"
                >
                  <td className="px-6 py-3 text-gray-800 font-medium">
                    #{user.usuario_id}
                  </td>
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
                    <a 
                      href={`mailto:${user.correo_electronico}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {user.correo_electronico}
                    </a>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {user.telefono ? (
                      <a 
                        href={`tel:${user.telefono}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        {user.telefono}
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.rol_id)}`}>
                      {getRoleName(user.rol_id)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-green-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-green-600 transition duration-300"
                        aria-label={`Editar usuario ${user.nombre}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => requestDelete(user.usuario_id)}
                        className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-red-600 transition duration-300"
                        aria-label={`Eliminar usuario ${user.nombre}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-600 font-medium border-b border-gray-300"
                >
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para editar usuario completo */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Editar Usuario: {editingUser.nombre} {editingUser.apellido_paterno}
            </h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* Apellido Paterno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={editFormData.apellido_paterno}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Apellido Materno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={editFormData.apellido_materno}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="correo_electronico"
                    value={editFormData.correo_electronico}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
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

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Dirección completa del usuario"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para eliminar usuario */}
      <Modal
        showModal={showModal}
        toggleModal={() => setShowModal(false)}
        onConfirm={confirmDelete}
        loading={false}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageUsers;
