import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../services/apiClient';
import {
  createProduct,
  getProducts,
  updateProduct,
} from '../../services/productsService';
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
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const productsQuery = useQuery<Producto[]>({
    queryKey: ['products-admin'],
    queryFn: getProducts,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products-admin'] });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => createProduct({
      nombre_producto: String(data.get('nombre_producto') ?? ''),
      descripcion_producto: String(data.get('descripcion_producto') ?? ''),
      precio_producto: Number(data.get('precio_producto')),
      stock: Number(data.get('stock')),
    }).then(() => undefined),
    onSuccess: () => {
      invalidate();
      handleFormClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateProduct(id, {
      nombre_producto: String(data.get('nombre_producto') ?? ''),
      descripcion_producto: String(data.get('descripcion_producto') ?? ''),
      precio_producto: Number(data.get('precio_producto')),
      stock: Number(data.get('stock')),
    }).then(() => undefined),
    onSuccess: () => {
      invalidate();
      handleFormClose();
    },
    onError: (err: Error) => setError(err.message),
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

    const fd = new FormData();
    fd.append('nombre_producto', form.nombre_producto);
    fd.append('descripcion_producto', form.descripcion_producto);
    fd.append('precio_producto', String(precio));
    fd.append('stock', String(stock));
    if (form.imagen_producto) fd.append('imagen_producto', form.imagen_producto);

    if (isEditing && editId !== null) {
      updateMutation.mutate({ id: editId, data: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const productos = productsQuery.data ?? [];
  const loading = productsQuery.isLoading;

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Productos</h1>
      {productsQuery.error && !showForm && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {(productsQuery.error as Error).message}
        </div>
      )}
      {!showForm && (
        <>
          <button
            type="button"
            onClick={handleShowForm}
            className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition mb-4"
          >
            Agregar producto
          </button>
          {loading ? (
            <p className="text-center text-gray-500">Cargando productos…</p>
          ) : (
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
                              loading="lazy"
                              decoding="async"
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
          )}
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
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-sgreen text-white py-2 px-4 rounded-2xl disabled:opacity-60"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando…'
                : isEditing
                  ? 'Actualizar'
                  : 'Agregar'}
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