import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../services/authContext';
import { extractList, API_URL } from '../../services/apiClient';
import type { Producto } from '../../types';

interface ProductForm {
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: string;
  stock: string;
  imagen_producto: File | null;
}

const initialForm: ProductForm = {
  nombre_producto: '',
  descripcion_producto: '',
  precio_producto: '',
  stock: '',
  imagen_producto: null,
};

const parsePrecio = (raw: string): number => {
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  return Number(normalized);
};

const ProductosAdmin = () => {
  const { token } = useContext(AuthContext);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos`, {
        headers: token ? { 'x-auth-token': token } : {},
      });
      if (!res.ok) throw new Error('Error al cargar los productos');
      const data = await res.json();
      setProductos(extractList<Producto>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imagen_producto: file }));
  };

  const handleShowForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (producto: Producto) => {
    setForm({
      nombre_producto: producto.nombre_producto || '',
      descripcion_producto: producto.descripcion_producto || '',
      precio_producto: producto.precio_producto != null ? String(producto.precio_producto) : '',
      stock: producto.stock != null ? String(producto.stock) : '',
      imagen_producto: null,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parsePrecio(form.precio_producto);
    if (Number.isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0');
      return;
    }
    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setError('El stock debe ser un número entero mayor o igual a 0');
      return;
    }

    const url = isEditing && editId !== null ? `${API_URL}/productos/${editId}` : `${API_URL}/productos`;
    const method = isEditing ? 'PUT' : 'POST';

    const fd = new FormData();
    fd.append('nombre_producto', form.nombre_producto);
    fd.append('descripcion_producto', form.descripcion_producto);
    fd.append('precio_producto', String(precio));
    fd.append('stock', String(stock));
    if (form.imagen_producto) fd.append('imagen_producto', form.imagen_producto);

    try {
      const res = await fetch(url, {
        method,
        headers: token ? { 'x-auth-token': token } : {},
        body: fd,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { message?: string }).message || 'Error al guardar el producto',
        );
      }
      await fetchProductos();
      handleFormClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Productos</h1>
      {!showForm && (
        <>
          <button
            type="button"
            onClick={handleShowForm}
            className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition mb-4"
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
                        {producto.imagen_producto ? (
                          <img
                            src={`${API_URL}/${String(producto.imagen_producto).replace(/\\/g, '/')}`}
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
                          type="button"
                          onClick={() => handleEdit(producto)}
                          className="bg-white text-sgreen py-2 px-3 rounded-2xl border border-gray-300 hover:bg-gray-200 transition mr-2"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-600 font-medium">
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
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre_producto" className="block font-medium mb-1 text-gray-700">
              Nombre
            </label>
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
            <label htmlFor="descripcion_producto" className="block font-medium mb-1 text-gray-700">
              Descripción
            </label>
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
            <label htmlFor="precio_producto" className="block font-medium mb-1 text-gray-700">
              Precio
            </label>
            <input
              id="precio_producto"
              name="precio_producto"
              type="number"
              min={0}
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
              min={0}
              value={form.stock}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label htmlFor="imagen_producto" className="block font-medium mb-1 text-gray-700">
              Imagen
            </label>
            <input
              id="imagen_producto"
              name="imagen_producto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="bg-sgreen text-white py-2 px-4 rounded-2xl">
              {isEditing ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={handleFormClose}
              className="bg-gray-400 text-white py-2 px-4 rounded-2xl"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductosAdmin;