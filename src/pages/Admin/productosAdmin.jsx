import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../services/authContext';
import { Bounce, toast } from 'react-toastify';


const initialForm = {
  nombre_producto: '',
  descripcion_producto: '',
  precio_producto: '',
  stock: '',
  imagen_producto: null, // Nuevo campo para la imagen
};

const ProductosAdmin = () => {
  const { token } = useContext(AuthContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/productos/catalogo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, imagen_producto: e.target.files[0] });
  };

  const handleShowForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (producto) => {
    setForm({
      nombre_producto: producto.nombre_producto,
      descripcion_producto: producto.descripcion_producto,
      precio_producto: producto.precio_producto,
      stock: producto.stock,
    });
    setEditId(producto.producto_id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setForm(initialForm);
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:4000/productos/${editId}`
      : 'http://localhost:4000/productos';
    const method = isEditing ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('nombre_producto', form.nombre_producto);
    formData.append('descripcion_producto', form.descripcion_producto);
    // Normaliza el precio: elimina puntos de miles y usa punto decimal
    const precio = String(form.precio_producto).replace(/\./g, '').replace(',', '.');
    formData.append('precio_producto', precio);
    formData.append('stock', parseInt(form.stock, 10));
    if (form.imagen_producto) {
      formData.append('imagen_producto', form.imagen_producto);
    }

    try {

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar el producto');
      }

      fetchProductos();
      handleFormClose();

      toast.success("Producto Agregado Correctamente", {
        position: "top-right",
        theme: "colored"
      });

    } catch (err) {
      alert(err.message || 'Error al guardar el producto');
      toast.error("Error al guardar el producto", {
        position: "top-right",
        theme: "colored"
      });
    }

  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Productos</h1>
      {!showForm && (
        <>
          <button
            onClick={handleShowForm}
            className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mb-4"
          >
            Agregar producto
          </button>
          <div className="overflow-x-auto rounded-2xl border border-gray-300">
            <table className="min-w-full table-auto border-collapse bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Imagen</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Precio</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length > 0 ? (
                  productos.map((producto) => (
                    <tr key={producto.producto_id} className="hover:bg-gray-50 border-b border-gray-300">
                      <td className="px-6 py-3">
                        {(() => { console.log('imagen_producto:', producto.imagen_producto); return null; })()}
                        {producto.imagen_producto ? (
                          <img
                            src={`http://localhost:4000/${producto.imagen_producto.replace(/\\/g, '/')}`}
                            alt={producto.nombre_producto}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">Sin imagen</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-800">{producto.nombre_producto}</td>
                      <td className="px-6 py-3 text-gray-600">{producto.descripcion_producto}</td>
                      <td className="px-6 py-3 text-gray-600">${producto.precio_producto}</td>
                      <td className="px-6 py-3 text-gray-600">{producto.stock}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {producto.stock > 0 ? (
                          <span className="text-green-600 font-semibold">En stock</span>
                        ) : (
                          <span className="text-red-500 font-semibold">Sin stock</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="bg-white text-sgreen py-2 px-3 rounded-2xl border border-gray-300 hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-600 font-medium border-b border-gray-300">
                      No hay productos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showForm && (
        <div>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label htmlFor="nombre_producto" className="block font-medium mb-1 text-gray-700">Nombre</label>
              <input
                id="nombre_producto"
                name="nombre_producto"
                type="text"
                value={form.nombre_producto}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="descripcion_producto" className="block font-medium mb-1 text-gray-700">Descripción</label>
              <textarea
                id="descripcion_producto"
                name="descripcion_producto"
                value={form.descripcion_producto}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="precio_producto" className="block font-medium mb-1 text-gray-700">Precio</label>
              <input
                id="precio_producto"
                name="precio_producto"
                type="number"
                min="0"
                step="0.01"
                value={form.precio_producto}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block font-medium mb-1 text-gray-700">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="imagen_producto" className="block font-medium mb-1 text-gray-700">Imagen</label>
              <input
                id="imagen_producto"
                name="imagen_producto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <button type="submit" className="bg-sgreen text-white py-2 px-4 rounded-2xl">
              {isEditing ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={handleFormClose}
              className="ml-4 bg-gray-400 text-white py-2 px-4 rounded-2xl"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductosAdmin;
